# desktop app setup

this frontend runs as a **desktop application** using tauri - a framework that wraps your web code (react/next.js) in a native window. think of it like packaging a website into an .exe that runs locally on your machine.

**why desktop instead of web?** real-time trading data, direct system access, way faster, runs offline.

**what's tauri?** lightweight alternative to electron. same idea (web tech → desktop app) but 95% smaller and uses 1/4 the ram. uses your system's browser engine instead of bundling chromium.

## one-time setup (windows)

**1. install rust** (tauri's backend language)

```bash
winget install Rustlang.Rustup
```

**2. use gnu toolchain** (avoids needing visual studio)

```bash
rustup toolchain install stable-gnu
rustup default stable-gnu
```

**3. install msys2** (build tools for windows)

```bash
winget install MSYS2.MSYS2
```

**4. install mingw toolchain** (fixes "dlltool not found" build error)

```bash
C:\msys64\msys2_shell.cmd -mingw64 -defterm -here -no-start -c "pacman -S --noconfirm mingw-w64-x86_64-toolchain"
```

this is critical - without it you'll get `error: linker 'cc' not found` or `dlltool not found` when tauri tries to compile.

**5. install tauri api package** (critical - app won't compile without this)

```bash
cd frontend
npm install @tauri-apps/api
```

yeah it's a few steps but you only do this once ever. after that you're good.

## running the app

from the root quartz directory:

```bash
.\start_quartz.bat
```

first compile takes ~1min, after that it's cached and takes ~5 seconds. hot reload works just like web dev.

## what you get

- **5mb app** vs electron's 120mb
- **50mb ram** vs 200mb - actually usable alongside your trading platform
- **zero npm warnings** - clean modern deps
- **rust backend** - blazing fast for calculations
- **native performance** - direct system calls, no browser overhead
- **same web stack** - all your react/next.js/tailwind code works exactly the same

## building for users

when you're ready to ship, run `npm run tauri build` to create:

- standalone .exe (users just double-click, no install)
- msi installer (adds to start menu, proper uninstaller)
- nsis installer (alternative installer format)

users don't need any of this setup. they just download the .exe and run it. this whole guide is only for devs building the app.

---

**back to:** [frontend readme](./README.md)
