// tauri window controls
import { getCurrentWindow } from "@tauri-apps/api/window";

// create window controls that work in both tauri and web mode
const createWindowControls = () => {
  try {
    const window = getCurrentWindow();
    return {
      minimize: () => window.minimize(),
      maximize: async () => {
        const isMaximized = await window.isMaximized();
        if (isMaximized) {
          await window.unmaximize();
        } else {
          await window.maximize();
        }
      },
      close: () => window.close(),
    };
  } catch (e) {
    // running in web mode, return no-ops
    return {
      minimize: () => console.log("minimize (web mode)"),
      maximize: () => console.log("maximize (web mode)"),
      close: () => console.log("close (web mode)"),
    };
  }
};

export const quartzApp = createWindowControls();

// expose to window for compatibility
if (typeof window !== "undefined") {
  (window as any).quartzApp = quartzApp;
}
