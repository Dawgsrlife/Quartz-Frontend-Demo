# quartz frontend

desktop trading terminal built with next.js + tauri.

## quick start

**first time setup:** follow [DESKTOP_SETUP.md](DESKTOP_SETUP.md) to install rust, tauri, and build tools.

**run the app:**

```bash
cd ..  # go to root quartz directory
.\start_quartz.bat
```

**build for production:**
see [BUILD_EXE.md](BUILD_EXE.md) for creating distributable .exe files.

## what's here

- **app/** - next.js pages and routes
- **components/** - react components (terminal ui, charts, etc)
- **lib/** - utilities and tauri window controls
- **services/** - api clients and websocket connections
- **src-tauri/** - rust backend for desktop app
- **public/** - static assets

## tech stack

- **next.js 16** - react framework with turbopack
- **react 19** - ui library
- **tailwind 4** - styling
- **tauri 2** - desktop framework (wraps web app in native window)
- **rust** - tauri backend
- **zustand** - state management
- **lightweight-charts** - trading charts
- **socket.io** - real-time data

## dev notes

- app runs at http://localhost:3000 in dev mode
- hot reload works for both react and tauri
- frameless window with custom minimize/maximize/close buttons
- deployed to vercel at https://frontend-dawgsrlifes-projects.vercel.app

## deployment

- **desktop:** `npm run tauri build` creates .exe + installers
- **web:** auto-deploys to vercel on push to main

---

**back to:** [root readme](../README.md)
