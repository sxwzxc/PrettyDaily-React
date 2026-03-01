"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose safe APIs to the renderer process
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // Data persistence
    readData: () => electron_1.ipcRenderer.invoke("read-data"),
    writeData: (data) => electron_1.ipcRenderer.invoke("write-data", data),
    // Theme
    getTheme: () => electron_1.ipcRenderer.invoke("get-theme"),
    onThemeChanged: (callback) => {
        const listener = (_, theme) => callback(theme);
        electron_1.ipcRenderer.on("theme-changed", listener);
        return () => electron_1.ipcRenderer.removeListener("theme-changed", listener);
    },
    // Window controls
    minimize: () => electron_1.ipcRenderer.invoke("window-minimize"),
    maximize: () => electron_1.ipcRenderer.invoke("window-maximize"),
    close: () => electron_1.ipcRenderer.invoke("window-close"),
    setTitleBarOverlay: (isDark) => electron_1.ipcRenderer.invoke("set-title-bar-overlay", isDark),
    // Notifications
    showNotification: (title, body) => electron_1.ipcRenderer.invoke("show-notification", title, body),
    // Background image
    pickImage: () => electron_1.ipcRenderer.invoke("pick-image"),
    getImageDataUrl: (filePath) => electron_1.ipcRenderer.invoke("get-image-data-url", filePath),
    // Window transparency effect
    setWindowEffect: (enabled) => electron_1.ipcRenderer.invoke("set-window-effect", enabled),
    getPlatform: () => electron_1.ipcRenderer.invoke("get-platform"),
});
