"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const isDev = process.env.NODE_ENV === "development" || !electron_1.app.isPackaged;
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
        icon: path_1.default.join(__dirname, "../assets/icon.png"),
    });
    if (isDev) {
        mainWindow.loadURL("http://localhost:5173");
        mainWindow.webContents.openDevTools({ mode: "detach" });
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, "../dist/index.html"));
    }
    mainWindow.once("ready-to-show", () => {
        mainWindow?.show();
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: "deny" };
    });
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
// App lifecycle
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
// IPC: App data directory
const getDataPath = () => {
    const userDataPath = electron_1.app.getPath("userData");
    return path_1.default.join(userDataPath, "prettydaily-data.json");
};
// IPC: Read app data
electron_1.ipcMain.handle("read-data", () => {
    try {
        const dataPath = getDataPath();
        if (!fs_1.default.existsSync(dataPath))
            return null;
        return fs_1.default.readFileSync(dataPath, "utf-8");
    }
    catch {
        return null;
    }
});
// IPC: Write app data
electron_1.ipcMain.handle("write-data", (_event, data) => {
    try {
        const dataPath = getDataPath();
        fs_1.default.writeFileSync(dataPath, data, "utf-8");
        return true;
    }
    catch {
        return false;
    }
});
// IPC: Get system theme
electron_1.ipcMain.handle("get-theme", () => {
    return electron_1.nativeTheme.shouldUseDarkColors ? "dark" : "light";
});
// IPC: Set window title bar overlay (for custom title bar)
electron_1.ipcMain.handle("set-title-bar-overlay", (_event, isDark) => {
    if (mainWindow && process.platform === "win32") {
        mainWindow.setTitleBarOverlay({
            color: isDark ? "#1a1a1a" : "#f5f5f5",
            symbolColor: isDark ? "#ffffff" : "#000000",
            height: 40,
        });
    }
});
// IPC: Minimize/maximize/close window
electron_1.ipcMain.handle("window-minimize", () => mainWindow?.minimize());
electron_1.ipcMain.handle("window-maximize", () => {
    if (mainWindow?.isMaximized())
        mainWindow.unmaximize();
    else
        mainWindow?.maximize();
});
electron_1.ipcMain.handle("window-close", () => mainWindow?.close());
// IPC: Show notification (desktop notification via Electron)
electron_1.ipcMain.handle("show-notification", (_event, title, body) => {
    const { Notification } = require("electron");
    if (Notification.isSupported()) {
        const n = new Notification({
            title,
            body,
            icon: path_1.default.join(__dirname, "../assets/icon.png"),
        });
        n.show();
    }
});
// Listen for native theme changes and notify renderer
electron_1.nativeTheme.on("updated", () => {
    mainWindow?.webContents.send("theme-changed", electron_1.nativeTheme.shouldUseDarkColors ? "dark" : "light");
});
