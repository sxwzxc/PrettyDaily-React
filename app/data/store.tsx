import React, { createContext, useCallback, useContext, useEffect, useReducer } from "react"
import type { ScheduleItem, TodoItem } from "./types"
import type { AccountSettings, AppSettings } from "./settings"
import { DEFAULT_ACCOUNT, DEFAULT_SETTINGS } from "./settings"
import type { Language } from "./i18n"
import { setLanguage } from "./i18n"

// ─── State ──────────────────────────────────────────────────────────────────
interface AppState {
  schedules: ScheduleItem[]
  todos: TodoItem[]
  settings: AppSettings
  account: AccountSettings
  isSyncing: boolean
  lastSyncError: string | null
  isDarkTheme: boolean
}

const initialState: AppState = {
  schedules: [],
  todos: [],
  settings: DEFAULT_SETTINGS,
  account: DEFAULT_ACCOUNT,
  isSyncing: false,
  lastSyncError: null,
  isDarkTheme: true,
}

// ─── Actions ─────────────────────────────────────────────────────────────────
type Action =
  | { type: "LOAD_DATA"; schedules: ScheduleItem[]; todos: TodoItem[]; settings: AppSettings; account: AccountSettings }
  | { type: "ADD_SCHEDULE"; item: ScheduleItem }
  | { type: "UPDATE_SCHEDULE"; item: ScheduleItem }
  | { type: "DELETE_SCHEDULE"; id: number }
  | { type: "ADD_TODO"; item: TodoItem }
  | { type: "UPDATE_TODO"; item: TodoItem }
  | { type: "DELETE_TODO"; id: number }
  | { type: "UPDATE_SETTINGS"; settings: Partial<AppSettings> }
  | { type: "UPDATE_ACCOUNT"; account: Partial<AccountSettings> }
  | { type: "SET_SYNCING"; syncing: boolean }
  | { type: "SET_SYNC_ERROR"; error: string | null }
  | { type: "SET_THEME"; isDark: boolean }
  | { type: "REPLACE_ALL"; schedules: ScheduleItem[]; todos: TodoItem[] }

// ─── Reducer ─────────────────────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_DATA":
      return {
        ...state,
        schedules: action.schedules,
        todos: action.todos,
        settings: action.settings,
        account: action.account,
      }
    case "ADD_SCHEDULE":
      return { ...state, schedules: [...state.schedules, action.item] }
    case "UPDATE_SCHEDULE":
      return {
        ...state,
        schedules: state.schedules.map((s) => (s.id === action.item.id ? action.item : s)),
      }
    case "DELETE_SCHEDULE":
      return { ...state, schedules: state.schedules.filter((s) => s.id !== action.id) }
    case "ADD_TODO":
      return { ...state, todos: [...state.todos, action.item] }
    case "UPDATE_TODO":
      return {
        ...state,
        todos: state.todos.map((t) => (t.id === action.item.id ? action.item : t)),
      }
    case "DELETE_TODO":
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) }
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } }
    case "UPDATE_ACCOUNT":
      return { ...state, account: { ...state.account, ...action.account } }
    case "SET_SYNCING":
      return { ...state, isSyncing: action.syncing }
    case "SET_SYNC_ERROR":
      return { ...state, lastSyncError: action.error }
    case "SET_THEME":
      return { ...state, isDarkTheme: action.isDark }
    case "REPLACE_ALL":
      return { ...state, schedules: action.schedules, todos: action.todos }
    default:
      return state
  }
}

// ─── Persistence ─────────────────────────────────────────────────────────────
interface PersistedData {
  schedules: ScheduleItem[]
  todos: TodoItem[]
  settings: AppSettings
  account: AccountSettings
  version: number
}

const STORAGE_KEY = "prettydaily_data"
const DATA_VERSION = 1

function saveToStorage(state: AppState): void {
  try {
    const data: PersistedData = {
      schedules: state.schedules,
      todos: state.todos,
      settings: state.settings,
      account: state.account,
      version: DATA_VERSION,
    }
    const json = JSON.stringify(data)

    // Use Electron IPC if available, else fall back to localStorage
    if (typeof window !== "undefined" && (window as unknown as { electronAPI?: { writeData: (s: string) => void } }).electronAPI) {
      ;(window as unknown as { electronAPI: { writeData: (s: string) => void } }).electronAPI.writeData(json)
    } else {
      localStorage.setItem(STORAGE_KEY, json)
    }
  } catch (e) {
    console.error("Failed to save data", e)
  }
}

async function loadFromStorage(): Promise<PersistedData | null> {
  try {
    let json: string | null = null

    if (typeof window !== "undefined" && (window as unknown as { electronAPI?: { readData: () => Promise<string | null> } }).electronAPI) {
      json = await (window as unknown as { electronAPI: { readData: () => Promise<string | null> } }).electronAPI.readData()
    } else {
      json = localStorage.getItem(STORAGE_KEY)
    }

    if (!json) return null
    return JSON.parse(json) as PersistedData
  } catch (e) {
    console.error("Failed to load data", e)
    return null
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState
  // Schedules
  addSchedule: (item: ScheduleItem) => void
  updateSchedule: (item: ScheduleItem) => void
  deleteSchedule: (id: number) => void
  // Todos
  addTodo: (item: TodoItem) => void
  updateTodo: (item: TodoItem) => void
  deleteTodo: (id: number) => void
  // Settings
  updateSettings: (settings: Partial<AppSettings>) => void
  // Account
  login: (token: string, username: string) => void
  logout: () => void
  updateServerUrl: (url: string) => void
  setSyncEnabled: (enabled: boolean) => void
  // Sync
  pushToCloud: () => Promise<void>
  pullFromCloud: () => Promise<void>
  // Data
  exportData: () => string
  importData: (json: string) => boolean
}

const AppContext = createContext<AppContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load data on mount
  useEffect(() => {
    loadFromStorage().then((data) => {
      if (data) {
        const settings = { ...DEFAULT_SETTINGS, ...data.settings }
        const account = { ...DEFAULT_ACCOUNT, ...data.account }
        setLanguage(settings.language as Language)
        dispatch({
          type: "LOAD_DATA",
          schedules: data.schedules ?? [],
          todos: data.todos ?? [],
          settings,
          account,
        })
      }
    })

    // Detect system theme
    const updateTheme = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      dispatch({ type: "SET_THEME", isDark })
    }
    updateTheme()
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", updateTheme)

    // Listen for theme changes from Electron
    const electronAPI = (window as unknown as { electronAPI?: { onThemeChanged?: (cb: (t: "dark" | "light") => void) => () => void } }).electronAPI
    let removeThemeListener: (() => void) | undefined
    if (electronAPI?.onThemeChanged) {
      removeThemeListener = electronAPI.onThemeChanged((theme) => {
        dispatch({ type: "SET_THEME", isDark: theme === "dark" })
      })
    }

    return () => {
      mq.removeEventListener("change", updateTheme)
      removeThemeListener?.()
    }
  }, [])

  // Persist whenever state changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => saveToStorage(state), 300)
    return () => clearTimeout(timer)
  }, [state])

  // Sync language
  useEffect(() => {
    setLanguage(state.settings.language as Language)
  }, [state.settings.language])

  // ── Actions ──

  const addSchedule = useCallback((item: ScheduleItem) => {
    dispatch({ type: "ADD_SCHEDULE", item })
    scheduleNotification(item)
  }, [])

  const updateSchedule = useCallback((item: ScheduleItem) => {
    dispatch({ type: "UPDATE_SCHEDULE", item })
  }, [])

  const deleteSchedule = useCallback((id: number) => {
    dispatch({ type: "DELETE_SCHEDULE", id })
  }, [])

  const addTodo = useCallback((item: TodoItem) => {
    dispatch({ type: "ADD_TODO", item })
  }, [])

  const updateTodo = useCallback((item: TodoItem) => {
    dispatch({ type: "UPDATE_TODO", item })
  }, [])

  const deleteTodo = useCallback((id: number) => {
    dispatch({ type: "DELETE_TODO", id })
  }, [])

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: "UPDATE_SETTINGS", settings })
  }, [])

  const login = useCallback((token: string, username: string) => {
    dispatch({ type: "UPDATE_ACCOUNT", account: { isLoggedIn: true, token, username } })
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: "UPDATE_ACCOUNT", account: { isLoggedIn: false, token: "", username: "", syncEnabled: false } })
  }, [])

  const updateServerUrl = useCallback((url: string) => {
    dispatch({ type: "UPDATE_ACCOUNT", account: { serverUrl: url } })
  }, [])

  const setSyncEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: "UPDATE_ACCOUNT", account: { syncEnabled: enabled } })
  }, [])

  const pushToCloud = useCallback(async () => {
    if (!state.account.isLoggedIn) return
    dispatch({ type: "SET_SYNCING", syncing: true })
    try {
      const resp = await fetch(`${state.account.serverUrl}/api/sync/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${state.account.token}` },
        body: JSON.stringify({ schedules: state.schedules, todos: state.todos }),
      })
      if (!resp.ok) throw new Error(await resp.text())
      dispatch({ type: "SET_SYNC_ERROR", error: null })
    } catch (e) {
      dispatch({ type: "SET_SYNC_ERROR", error: String(e) })
    } finally {
      dispatch({ type: "SET_SYNCING", syncing: false })
    }
  }, [state.account, state.schedules, state.todos])

  const pullFromCloud = useCallback(async () => {
    if (!state.account.isLoggedIn) return
    dispatch({ type: "SET_SYNCING", syncing: true })
    try {
      const resp = await fetch(`${state.account.serverUrl}/api/sync/pull`, {
        headers: { Authorization: `Bearer ${state.account.token}` },
      })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      dispatch({ type: "REPLACE_ALL", schedules: data.schedules ?? [], todos: data.todos ?? [] })
      dispatch({ type: "SET_SYNC_ERROR", error: null })
    } catch (e) {
      dispatch({ type: "SET_SYNC_ERROR", error: String(e) })
    } finally {
      dispatch({ type: "SET_SYNCING", syncing: false })
    }
  }, [state.account])

  const exportData = useCallback((): string => {
    return JSON.stringify({ schedules: state.schedules, todos: state.todos }, null, 2)
  }, [state.schedules, state.todos])

  const importData = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json)
      dispatch({ type: "REPLACE_ALL", schedules: data.schedules ?? [], todos: data.todos ?? [] })
      return true
    } catch {
      return false
    }
  }, [])

  const value: AppContextValue = {
    state,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    addTodo,
    updateTodo,
    deleteTodo,
    updateSettings,
    login,
    logout,
    updateServerUrl,
    setSyncEnabled,
    pushToCloud,
    pullFromCloud,
    exportData,
    importData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppStore must be used within AppProvider")
  return ctx
}

// ─── Notification helper ──────────────────────────────────────────────────────
function scheduleNotification(item: ScheduleItem) {
  if (item.reminderMinutesBefore == null) return
  const notifyAt = item.startTimeMillis - item.reminderMinutesBefore * 60 * 1000
  const delay = notifyAt - Date.now()
  if (delay <= 0) return

  const electronAPI = (window as unknown as { electronAPI?: { showNotification?: (title: string, body: string) => void } }).electronAPI
  if (electronAPI?.showNotification) {
    setTimeout(() => {
      const start = new Date(item.startTimeMillis)
      electronAPI.showNotification!(
        item.title,
        `提醒：${start.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
      )
    }, delay)
  } else if ("Notification" in window && Notification.permission === "granted") {
    setTimeout(() => {
      const start = new Date(item.startTimeMillis)
      new Notification(item.title, {
        body: `提醒：${start.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`,
      })
    }, delay)
  }
}
