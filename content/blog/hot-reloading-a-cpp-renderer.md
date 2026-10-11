---
title: "Hot-reloading a C++ renderer through a C ABI"
slug: hot-reloading-a-cpp-renderer
excerpt: "Hot reloading is mostly about ownership: what the host keeps, what the library rebuilds, and the three C functions between them."
date: 2026-07-22
tags: [C++, OpenGL, GLFW, CMake]
featured: false
---

regnie is a small OpenGL renderer split in two: a host executable that owns the window, and a shared library that owns the drawing. The host can drop the library and load a freshly built copy without closing the window. Most of the work there isn't loading code. It's deciding what belongs to whom. Anything inside the library dies on every reload, so the useful question isn't how to keep that state alive but how to make the library cheap to throw away.

## The split

The host (`src/main.cpp`) creates the GLFW window and the GL context, loads GL function pointers for itself, and runs the loop: tick, swap, poll. It never calls renderer code directly. The library (`lib/regnie.cpp`) holds what I actually change while iterating: shaders, vertex data, the transform, the draw call.

That split follows lifetimes. The context has to outlive every copy of the renderer, so it can't belong to the renderer. The shaders change on every edit, so they can't belong to the host.

## The boundary is three C functions

Inside the library everything is C++: a `Renderer` class, `std::unique_ptr`, GLM. The host sees none of that. It sees three symbols:

```cpp
static std::unique_ptr<Renderer> g_renderer;

extern "C" {

void regnie_init() {
    if (!g_renderer) {
        g_renderer = std::make_unique<Renderer>();
    }
    if (!g_renderer->init(glfwGetCurrentContext())) {
        std::cerr << "Failed to initialize renderer" << std::endl;
    }
}

void regnie_tick(GLFWwindow* window) {
    if (g_renderer) {
        g_renderer->render((float)glfwGetTime());
    }
}

void regnie_reload() { regnie_init(); }
}
```

`extern "C"` is there for the loader. `dlsym` looks a function up by string, and C++ names are mangled in compiler-specific ways. C names aren't. Keeping the arguments to plain pointers matters for the same reason: an opaque `GLFWwindow*` means the same thing on both sides, while a `std::string` or a class with a vtable only works if both sides happened to be built with the same compiler, standard library and flags. Keep the boundary narrow and dumb, and it stays stable while the code behind it changes.

## Loading per platform

On Linux and macOS the host uses `dlopen`/`dlsym`. On Windows it uses `LoadLibrary`/`GetProcAddress`. The POSIX version, trimmed:

```cpp
static void* regnie_handle;
static void (*regnie_init)();
static void (*regnie_tick)(GLFWwindow* window);
static void (*regnie_reload)();

static void load_libregnie() {
    std::string libname = "build/lib/libregnie.";
#if defined(__linux__)
    libname += "so";
#elif defined(__MACH__)
    libname += "dylib";
#endif

    regnie_handle = dlopen(libname.data(), RTLD_NOW);
    if (!regnie_handle) {
        fprintf(stderr, "Failed to load plugin: %s\n", dlerror());
        exit(EXIT_FAILURE);
    }

    regnie_tick = (void (*)(GLFWwindow*))dlsym(regnie_handle, "regnie_tick");
    // ... same for regnie_init and regnie_reload
}

static void key_callback(GLFWwindow* window, int key, int scancode, int action,
                         int mods) {
    if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
        glfwSetWindowShouldClose(window, GLFW_TRUE);
    else if (key == GLFW_KEY_F && action == GLFW_PRESS) {
        dlclose(regnie_handle);
        load_libregnie();
        regnie_reload();
    }
}
```

`RTLD_NOW` resolves all of the library's undefined symbols at load time, so a library with a missing symbol fails inside `dlopen` instead of halfway through a frame. The reload runs from a GLFW key callback, and key callbacks fire from inside `glfwPollEvents`, after the buffer swap. A reload therefore always lands between frames, never in the middle of a draw.

Those casts are the weak spot. The compiler takes `dlsym`'s `void*` and believes whatever function type I give it. The Windows branch in regnie shows the result: it still declares `regnie_tick` as `void (*)()`, left over from before the function took a window, while the library expects a `GLFWwindow*`. Nothing catches that at compile time. The fix is to declare the function-pointer typedefs once in a header that both sides include.

## What survives a reload

The context survives because the host owns it. GL objects live in the context, not in the library, so a program or buffer name would technically stay valid after the code that made it is gone. The library's record of those names doesn't survive, though. It lives in the library's own statics, and those go away with it. That leaves two options: hand the names to the host before unloading, or delete everything and rebuild. For a triangle, rebuilding is the obvious choice.

RAII is what makes the rebuild clean:

```cpp
struct GLResources {
    GLuint program{0};
    GLuint vao{0};
    GLuint vbo{0};
    GLint mvpLocation{-1};

    ~GLResources() { cleanup(); }
    void cleanup();
};

void Renderer::GLResources::cleanup() {
    if (program) {
        glDeleteProgram(program);
        program = 0;
    }
    // ... same for vao and vbo
}
```

When the library really is unloaded, `dlclose` runs its termination routines, including destructors for its static objects. `g_renderer` goes out of scope, `~GLResources` runs, and the GL objects are deleted. That happens inside the key callback on the main thread with the host's context still current, so the delete calls are legal. Without the destructor, every reload would leak a program, a VAO and a buffer.

One more thing doesn't survive: GL function pointers. The library compiles its own copy of GLAD, and GLAD's pointers are globals in that copy. A freshly loaded library starts with all of them null, which is why `Renderer::init` calls `gladLoadGL()` even though the host already did. The host's pointers belong to the host's copy of GLAD.

## The rebuild loop

The watcher is a few lines of shell:

```bash
SRC="lib/regnie.cpp"

compile() {
	make lib -B
}

compile

while true; do
	inotifywait -e close_write "$SRC"
	compile
done
```

`close_write` fires when the editor closes the file after writing it, so the build doesn't start on a half-saved file. The reload itself stays manual: the watcher rebuilds, and I press F once the build has finished. A library that's still being written never gets loaded by accident.

This loop has rotted a bit. The `lib` target used to be a single `clang++ -shared` command. After the library moved into CMake, it only runs `cmake -S lib -B build/lib`, which configures and doesn't build. The loop needs `cmake --build build --target regnie` to be closed again. `inotifywait` is also Linux-only, so on macOS the watcher needs a different file-event tool.

## Pitfalls

**The library has to actually unload.** `dlclose` only drops a reference count. The macOS man page lists the cases where a library is never unloaded, and regnie's macOS build hits two of them. The CMake file links the executable against `regnie` (`otool -L` lists `@rpath/libregnie.dylib` as a regular dependency), and the dylib statically links GLFW, whose Cocoa backend contains Objective-C classes. In that state `dlopen` hands back the same image and the "reload" runs the old code. The executable must not link against the library it means to reload.

**Two copies of GLFW.** The same static link has a quieter effect. GLFW calls made from inside the library go to the library's own copy of GLFW, which was never initialized. In that copy, `glfwGetCurrentContext()` returns `NULL` and `glfwGetTime()` returns `0.0`. `regnie_init` asks GLFW for the window instead of receiving it, so the renderer ends up holding a null window, and `render()` returns early when the window is null. Anything the library needs from the platform layer should come in through the boundary, the way `regnie_tick` already takes the window.

**Writing over a loaded library.** On Windows a loaded DLL is locked, so the build can't replace it. On Linux, writing into a mapped `.so` in place, rather than replacing the file, can crash the process. The usual fix is to copy the build output to a unique name and load the copy. That also solves the next problem.

**A failed reload kills the host.** `load_libregnie` calls `exit(EXIT_FAILURE)` on any error, and by then the old library is already closed. The safer order is to load the new copy first and close the old one only once the new one has resolved all three symbols. That requires the new copy to have a different path, which the copy-to-unique-name step provides.
