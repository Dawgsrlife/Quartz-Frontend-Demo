# building the .exe

**prerequisites:** make sure you've done the full [DESKTOP_SETUP.md](DESKTOP_SETUP.md) first, especially the mingw toolchain install (step 4). without it you'll get dlltool errors during build.

when you're ready to ship, run:

```bash
cd frontend
npm run tauri build
```

this creates:

- **installer:** `src-tauri/target/release/bundle/msi/Quartz Terminal_0.1.0_x64_en-US.msi`
- **standalone exe:** `src-tauri/target/release/app.exe` (~5MB)
- **nsis installer:** `src-tauri/target/release/bundle/nsis/Quartz Terminal_0.1.0_x64-setup.exe`

the standalone exe is portable - users just run it, no install needed. the msi/nsis are proper installers that add to start menu, etc.

**note:** standalone .exe requires [WebView2 Runtime](https://go.microsoft.com/fwlink/p/?LinkId=2124703) installed on user's PC. The MSI/NSIS installers automatically download and install it if missing.

## build takes longer

first build: ~5-10min (release mode with optimizations)
rebuilds: ~2-3min (cached)

way smaller than electron though - ~5mb vs 120mb+
