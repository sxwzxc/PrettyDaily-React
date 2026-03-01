import { contextBridge, ipcRenderer } from "electron"

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Data persistence
  readData: () => ipcRenderer.invoke("read-data"),
  writeData: (data: string) => ipcRenderer.invoke("write-data", data),

  // Theme
  getTheme: () => ipcRenderer.invoke("get-theme"),
  onThemeChanged: (callback: (theme: "dark" | "light") => void) => {
    const listener = (_: unknown, theme: "dark" | "light") => callback(theme)
    ipcRenderer.on("theme-changed", listener)
    return () => ipcRenderer.removeListener("theme-changed", listener)
  },

  // Window controls
  minimize: () => ipcRenderer.invoke("window-minimize"),
  maximize: () => ipcRenderer.invoke("window-maximize"),
  close: () => ipcRenderer.invoke("window-close"),
  setTitleBarOverlay: (isDark: boolean) => ipcRenderer.invoke("set-title-bar-overlay", isDark),

  // Notifications
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke("show-notification", title, body),
})
