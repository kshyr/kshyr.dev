---
title: "Daemonizing a Go program without a supervisor"
slug: daemonizing-go-without-a-supervisor
excerpt: "Re-exec, setsid, a PID file and a signal handler: how pact daemonizes itself in Go, where each piece leaks, and what a supervisor does instead."
date: 2026-08-20
tags: [Go, Unix, Linux, Daemons]
featured: false
links:
  - label: GitHub
    url: https://github.com/kshyr/pact
---

pact is a small script scheduler I wrote in Go. It runs shell scripts on cron schedules, which means something has to stay alive in the background. I didn't want to generate systemd or launchd units, so `pact demon start` turns the process into a daemon on its own.

My argument here is that self-daemonizing in Go comes to about a hundred lines and works on the first try. Each of those lines, though, re-implements something a supervisor already does, and gets an edge case slightly wrong. pact's code is a good specimen because it hits most of them.

## Go can't fork, so it re-executes

The classic Unix recipe is fork, `setsid`, fork again, `chdir /`, close file descriptors. Go can't follow it. The runtime is multithreaded before `main` runs, and `fork(2)` copies only the calling thread, so a forked Go child would be missing the threads its scheduler and garbage collector depend on. The standard library doesn't expose a bare fork for that reason.

The workaround is to start a fresh copy of your own binary and tell it which role it plays. Here is pact's `demon start` command, trimmed:

```go
exePath, err := os.Executable()
// ...
cmd := exec.Command(exePath)
cmd.SysProcAttr = &syscall.SysProcAttr{
	Setsid: true,
}

logFilePath, err := logger.CreateLogFile("demon")
// ...
file, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
// ...
cmd.Env = append(os.Environ(), "DEMON=1")
cmd.Stdout = file
cmd.Stderr = file

if err := cmd.Start(); err != nil {
	// ...
}

if err = demon.WritePIDFile(cmd.Process.Pid); err != nil {
	// ...
}

os.Exit(0)
```

At the top of `main`, `demon.IsDemonExecutable()` checks `os.Getenv("DEMON") == "1"` and takes the daemon path before Cobra ever runs.

A few details here matter:

- `os.Executable()` rather than `os.Args[0]`. `Args[0]` can be a bare name resolved through `PATH`, or a relative path.
- `Setsid: true` makes the child the leader of a new session with no controlling terminal. Closing the terminal sends `SIGHUP` to the old session, and the daemon is no longer in it.
- `Stdout` and `Stderr` are set explicitly. With them left `nil`, `os/exec` connects the child to `/dev/null`, and every panic trace disappears.
- The parent calls `Start`, never `Wait`, and exits. The child is reparented and carries on.

The environment variable as a role marker is convenient: nothing shows up in `ps`, and Cobra doesn't need a hidden command. But environment is inherited. The invoker runs scripts with `exec.Command("/bin/sh", ...)` and no explicit `Env`, so every script sees `DEMON=1` too. A script that calls `pact invoke something` would start a second daemon instead of invoking. Calling `os.Unsetenv("DEMON")` first thing in the daemon branch closes that hole.

The log file has its own surprises. The logrus logger writes to `io.MultiWriter(file, os.Stdout)`, and in the daemon `os.Stdout` is that same file, so every line lands twice. `CreateLogFile` also calls `os.Create`, which truncates, and the `status` and `stop` commands construct a `Demon` that calls it. Running `pact demon status` wipes the daemon's log.

## PID files: a promise nobody enforces

The CLI and the daemon share state through `$XDG_CACHE_HOME/pact/demon.pid`. Liveness is checked like this:

```go
func IsRunning() bool {
	pid, err := ReadPID()
	if err != nil {
		return false
	}

	process, err := os.FindProcess(pid)
	if err != nil {
		RemovePIDFile()
		return false
	}

	err = process.Signal(syscall.Signal(0))
	return err == nil
}
```

On Unix, `os.FindProcess` always succeeds, so the cleanup branch is dead code. The real check is signal 0, which runs the kernel's permission and existence checks without delivering anything. That leaves the usual PID-file holes:

- **Stale files.** After a `SIGKILL` or a reboot, the file survives. If the number is reused by another of my processes, `IsRunning` says yes and `demon start` refuses. If it's reused by another user's process, `kill` fails with `EPERM`, so the function returns false, which happens to be the right answer.
- **Races.** Two `demon start` calls at the same moment both see no file and both spawn.
- **Location.** PIDs belong in `$XDG_RUNTIME_DIR`, which is cleared at logout. Moving there would fix most stale files for free. `adrg/xdg` exposes `RuntimeFile` next to `CacheFile`.

The real fix is to hold an `flock` on the PID file for the daemon's whole lifetime. The kernel releases the lock when the process dies, so "file locked" means "daemon alive", whatever number is written inside. Both parent and child currently write the PID (the same value). The parent's write only covers the moment before the child gets going.

## Signals and the loop around them

The daemon's run loop, from `demon.go`:

```go
sigs := make(chan os.Signal, 1)
signal.Notify(sigs, syscall.SIGTERM, syscall.SIGINT)

for {
	select {
	case sig := <-sigs:
		d.Log.Infof("Received signal: %v. Shutting down.", sig)
		if err := RemovePIDFile(); err != nil {
			return err
		}
		os.Exit(0)
	default:
		callback()
	}
}
```

The buffered channel is correct, since `signal.Notify` never blocks and drops signals on a full channel. The `default` branch isn't. The callback passed in from `main` is an empty `demonLoop`, and the scheduled work runs on `robfig/cron`'s own goroutines, so this `select` never blocks and keeps a core busy doing nothing. There is also a bare `for {}` after `Run` returns in `main`. The main goroutine's only job is to wait, so `<-sigs` on its own is the whole loop.

`os.Exit` also skips deferred calls, and `main` has `defer tk.Stop()`. The cron scheduler is never stopped, and scripts that are mid-run get killed with the process. `cron.Stop()` returns a context that is done once running jobs finish, and graceful shutdown means waiting on it, with a timeout, before exiting.

The stop side has a race of its own. `pact demon stop` sends `SIGTERM` and then removes the PID file itself, while the daemon's handler removes it too. Whichever gets there second hits `ENOENT`, so `stop` can report an error after it succeeded. Only the daemon should remove the file. The CLI should poll signal 0 until the process is gone and fall back to `SIGKILL` after a deadline.

`SIGHUP` isn't handled. After `setsid` the daemon won't get a terminal hangup, which frees the signal for its conventional meaning, "reload config". That is exactly the open question on pact's whiteboard about picking up changes to `scripts.toml` at runtime.

## Naming the process, per platform

To make the daemon easy to spot in `ps`, it renames itself on Linux. Two files define the same function under opposite build constraints:

```go
// demon/process_linux.go
//go:build linux

package demon

// ...

func setProcessName() error {
	name := "demon"
	if len(name) > 15 {
		name = name[:15]
	}

	nameBytes := make([]byte, 16)
	copy(nameBytes, name)

	err := unix.Prctl(unix.PR_SET_NAME, uintptr(unsafe.Pointer(&nameBytes[0])), 0, 0, 0)
	// ...
}

// demon/process_other.go
//go:build !linux

package demon

// no-op on non-Linux systems
func setProcessName() error {
	return nil
}
```

The kernel's `comm` field is 16 bytes including the terminating NUL, hence the 15-character cap and the zeroed buffer. Splitting by build tag keeps `golang.org/x/sys/unix`'s Linux-only `Prctl` out of the macOS build, and callers never see a platform check. (The files also carry the old `// +build` line, which only Go versions before 1.17 need. With `go 1.23.1` in `go.mod`, it can go.)

The edge case: `PR_SET_NAME` renames the calling *thread*, while `ps` and `top` show the name of the main thread. A goroutine can run on any OS thread, so nothing guarantees this call happens on the main one. The usual fix is `runtime.LockOSThread()` in an `init` function, which keeps the main goroutine on the main thread. It also changes only `comm`, not the command line, so `ps -o args` still shows the full path to `pact`.

## What a supervisor does instead

Everything above is what a systemd user unit or a launchd agent provides without any code. The process runs in the foreground, the supervisor tracks it (systemd through cgroups, with no PID file to go stale), captures stdout into the journal, sends `SIGTERM`, waits, then `SIGKILL`s, and restarts on crash. It also starts the process at login. pact's own user story asks for exactly that ("background activity will continue after startup"), and the self-daemonizing version doesn't do it at all.

What self-daemonizing buys is real but narrow: one binary, one command, the same behavior on Linux and macOS, and no unit files to install. The better split is to run in the foreground by default, keep `demon start` as a convenience wrapper with a locked PID file, and add a command that writes the systemd unit or launchd plist, so the supervisor handles everything in this post.
