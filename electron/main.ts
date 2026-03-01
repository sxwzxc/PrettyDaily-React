import { app, BrowserWindow, ipcMain, nativeTheme, shell } from "electron"
import path from "path"
import fs from "fs"

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    titleBarStyle: "hiddenInset",
    vibrancy: "under-window",
    visualEffectState: "followWindow",
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "../assets/icon.png"),
  })

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173")
    mainWindow.webContents.openDevTools({ mode: "detach" })
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"))
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

// IPC: App data directory
const getDataPath = () => {
  const userDataPath = app.getPath("userData")
  return path.join(userDataPath, "prettydaily-data.json")
}

// IPC: Read app data
ipcMain.handle("read-data", () => {
  try {
    const dataPath = getDataPath()
    if (!fs.existsSync(dataPath)) return null
    return fs.readFileSync(dataPath, "utf-8")
  } catch {
    return null
  }
})

// IPC: Write app data
ipcMain.handle("write-data", (_event, data: string) => {
  try {
    const dataPath = getDataPath()
    fs.writeFileSync(dataPath, data, "utf-8")
    return true
  } catch {
    return false
  }
})

// IPC: Get system theme
ipcMain.handle("get-theme", () => {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light"
})

// IPC: Set window title bar overlay (for custom title bar)
ipcMain.handle("set-title-bar-overlay", (_event, isDark: boolean) => {
  if (mainWindow && process.platform === "win32") {
    mainWindow.setTitleBarOverlay({
      color: isDark ? "#1a1a1a" : "#f5f5f5",
      symbolColor: isDark ? "#ffffff" : "#000000",
      height: 40,
    })
  }
})

// IPC: Minimize/maximize/close window
ipcMain.handle("window-minimize", () => mainWindow?.minimize())
ipcMain.handle("window-maximize", () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.handle("window-close", () => mainWindow?.close())

// IPC: Show notification (desktop notification via Electron)
ipcMain.handle("show-notification", (_event, title: string, body: string) => {
  const { Notification } = require("electron")
  if (Notification.isSupported()) {
    const n = new Notification({
      title,
      body,
      icon: path.join(__dirname, "../assets/icon.png"),
    })
    n.show()
  }
})

// Listen for native theme changes and notify renderer
nativeTheme.on("updated", () => {
  mainWindow?.webContents.send("theme-changed", nativeTheme.shouldUseDarkColors ? "dark" : "light")
})
