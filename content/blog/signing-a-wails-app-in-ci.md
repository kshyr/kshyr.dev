---
title: "Signing a Wails app in CI, 25 commits later"
slug: signing-a-wails-app-in-ci
excerpt: "What 25 'ci: macos signing' commits on flower actually changed, and why notarization is still commented out at the end of them."
date: 2026-08-06
tags: [Wails, macOS, GitHub Actions, Code signing]
featured: false
links:
  - label: GitHub
    url: https://github.com/kshyr/flower
---

flower's desktop app is built with Wails v2. In September 2024 I set up a GitHub Actions workflow that builds it for macOS, signs it, packages it as a DMG and attaches it to a release whenever I push a `flower/v*` tag. The history has 25 consecutive commits titled `ci: macos signing(n)`, spread over three evenings.

Reading them back, almost none of those commits are about code signing. They fix working directories, relative paths, a script name, environment variable names and a missing backslash. The one decision that is about signing, which certificate to use, is the reason the notarization step at the end is still commented out.

## The loop that made 25 commits

The workflow only runs on tags, so every attempt costs a commit and a tag push. `scripts/bump_ci_test.sh` automated that from the start, and by the sixth signing commit it also numbered the commit messages:

```bash
get_updated_commit_message() {
    local last_message=$(git log -1 --pretty=%B)
    if [[ $last_message =~ \(([0-9]+)\)$ ]]; then
        local num=${BASH_REMATCH[1]}
        local new_num=$((num + 1))
        echo "${last_message%(*)}($new_num)"
    else
        echo "$last_message (1)"
    fi
}
# ...
new_commit_message=$(get_updated_commit_message)
git add .
git commit -m "$new_commit_message"

commit_hash=$(git rev-parse HEAD)
git push

wait_for_push $commit_hash

new_tag="flower/v0.1.2-dev.$new_dev_number"
git tag "$new_tag"
git push origin "$new_tag"
```

It reads the `(n)` off the last commit message, increments it, commits everything with `git add .`, polls `git fetch` until the remote branch contains the commit (an earlier version just ran `sleep 10`), and pushes the next `-dev.N` tag.

It made each iteration one command, which made it easy to run 25 of them. The cost is in the repo for good: 25 noise commits and 25 `flower/v0.1.2-dev.*` tags. A `workflow_dispatch` trigger would have allowed reruns without either. Most of the path bugs below would also have shown up by running `scripts/build_macos.sh` from a terminal on my own Mac before pushing anything.

## Getting the certificate onto the runner

A hosted macOS runner starts with no signing identity. The workflow imports one from two secrets, a base64-encoded `.p12` and its password, and installs `gon` to drive `codesign` and notarization:

```yaml
- name: Import Code Signing Certificates for MacOS
  uses: apple-actions/import-codesign-certs@v3
  with:
    p12-file-base64: ${{ secrets.CERTIFICATES_P12 }}
    p12-password: ${{ secrets.CERTIFICATES_P12_PASSWORD }}

- name: MacOS download gon for code signing and app notarization
  run: |
    brew install Bearer/tap/gon

- name: Build and Sign MacOS Binaries
  env:
    AC_USERNAME: ${{ secrets.APPLE_USERNAME }}
    AC_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
    AC_PROVIDER: ${{ secrets.APPLE_TEAM_ID }}
  working-directory: ./desktop
  run: |
    npm install -g appdmg
    chmod +x ../scripts/build_macos.sh
    ../scripts/build_macos.sh
```

The import action puts the identity into a keychain on the runner, where `codesign` can find it. Everything after that is about telling `gon` which identity to use and where the files are.

The first attempt kept the whole gon config in a secret and wrote it to disk with `echo '${{ secrets.GON_CONFIG }}' > gon-sign.json`. That works until the JSON contains a single quote. The `${{ }}` expression is pasted into the script text before bash parses it, so the secret's content becomes shell syntax. It also hid the config from review. By commit 4 the configs were committed files, with gon's `@env:` references pulling credentials from the step's environment:

```json
{
  "source": ["./build/bin/flower.app"],
  "bundle_id": "com.kshyr.flower",
  "apple_id": {
    "username": "@env:AC_USERNAME",
    "password": "@env:AC_PASSWORD"
  },
  "sign": {
    "application_identity": "Apple Development: $NAME ($TEAM_ID)"
  },
  "dmg": {
    "output_path": "../bin/flower.dmg",
    "volume_name": "flower"
  }
}
```

The identity went through three forms: a certificate SHA-1 hash, then `@env:AC_APP_ID` (reverted five minutes later), then the certificate's common name. `codesign` accepts either a hash or a name. The common name is easier to read in a diff.

Two smaller fixes belong here. Wails' `Info.plist` template ships with `com.wails.{{.Name}}` as the bundle identifier, so I changed it to match gon's `bundle_id` in the first commit. `Info.dev.plist` didn't get the same change until commit 16. The first config and build script were also adapted from another Wails project and still pointed at `RiftShare.app`, so for a few commits gon was signing an app that didn't exist.

## Most of the commits were paths

Wails has to run from `desktop/`, where `wails.json` lives. gon's relative paths follow the current directory. Workflow steps start in the repo root. Commits 11 through 15 are all about that mismatch:

- 11 rewrote the build script to `cd` into `desktop/` and changed gon's paths to match.
- 12 set `working-directory: ./desktop` on the step, which broke the script path.
- 13 changed the call to `../scripts/build_macos.sh`.
- 14 fixed the gon config path inside the script (`../build/darwin` to `./build/darwin`).
- 15 fixed the zip output (`../../bin` to `../bin`).

Others in the same category: commit 2 removed an `if: matrix.platform == 'macos-latest'` copied from a matrix workflow. This job has no matrix, so that step had been silently skipped. Commit 5 fixed `build-macos.sh` versus `build_macos.sh`, and commit 6 added a `chmod +x` that a later file-mode change made redundant.

The script now locates itself, so the `working-directory` from commit 12 isn't needed anymore:

```bash
build_for_platform() {
    local platform=$1
    local output_suffix=$2

    echo "Building for $platform"
    wails build -platform $platform -clean

    echo "Signing Package"
    gon -log-level=info ./build/darwin/gon-sign.json

    echo "Zipping Package"
    appdmg ./build/appdmg.json ../bin/flower_$output_suffix.dmg
}

cd "$(dirname "$0")/../desktop" || exit

mkdir -p ../bin

build_for_platform "darwin/amd64" "amd64"
build_for_platform "darwin/arm64" "arm64"

#echo "Notarizing Dmg?"
#gon -log-level=info ./build/darwin/gon-notarize.json
```

The lesson is to pick one working directory, make every path in every config relative to it, and have the script `cd` there itself.

## Per-arch builds and too many DMGs

The workflow before signing built one `darwin/universal` binary. The signing version builds `amd64` and `arm64` separately. Because `-clean` wipes `build/bin`, signing and packaging have to happen inside each iteration, before the next build deletes the app.

Packaging went from `ditto` zips to `appdmg` (its config still titles the volume "Test Application"). A `create-dmg` action was added on top, building `bin/flower.dmg` from whatever `.app` is left in `build/bin`, which after the loop is the arm64 build. gon's own `dmg` block writes to that same path. The release ends up with three DMGs, one of which duplicates another. A universal build would mean one artifact, one signature and one notarization submission, at the cost of a bigger download.

The last four commits only touch the release step: replacing a release action with a multi-line `gh release create`, merging two jobs into one, `permissions: write-all`, and adding the trailing backslashes the multi-line command forgot. Without them, bash runs `gh release create ... bin/flower_amd64.dmg` and then tries to execute `bin/flower_arm64.dmg` as a command.

## Why notarization is commented out

`gon-notarize.json` exists and lists both DMGs with the bundle ID and the Apple ID credentials, including `AC_PROVIDER` for the team. The script just never calls it, and wiring it up wouldn't help yet. The identity in use is an **Apple Development** certificate. Apple's notary service only accepts software signed with a **Developer ID Application** certificate, with the hardened runtime enabled and a secure timestamp. A development certificate is meant for running builds on your own registered machines. A correctly wired notarize step would be rejected, and an un-notarized download won't open cleanly under Gatekeeper on someone else's Mac.

The entitlements have the same problem. `entitlements.plist` (app sandbox, user-selected and Downloads read-write) was added in the very first signing commit, but nothing references it: not Wails, and not gon's `sign` block, which takes an `entitlements_file` key for this.

What's left is short and mostly not code: a Developer ID Application certificate in the `.p12` secret, `entitlements_file` in the gon config, an app-specific password in `AC_PASSWORD`, and the two commented lines turned back on, ideally with stapling so the ticket ships inside the DMG.
