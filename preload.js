const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('quartzInstaller', {
    start: () => ipcRenderer.invoke('installer/start'),
});
