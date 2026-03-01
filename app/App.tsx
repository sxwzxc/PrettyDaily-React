import React, { useState, useEffect } from "react"
import { useAppStore } from "./data/store"
import { t } from "./data/i18n"
import type { TabId } from "./components/LiquidBottomTabs"
import { LiquidBottomTabs } from "./components/LiquidBottomTabs"
import { TodayScreen } from "./screens/TodayScreen"
import { CalendarScreen } from "./screens/CalendarScreen"
import { TodoScreen } from "./screens/TodoScreen"
import { StatsScreen } from "./screens/StatsScreen"
import { SettingsScreen } from "./screens/SettingsScreen"
import { EditScheduleScreen } from "./screens/EditScheduleScreen"
import { EditTodoScreen } from "./screens/EditTodoScreen"
import type { ScheduleItem, TodoItem } from "./data/types"

type ScreenMode =
  | { type: "main" }
  | { type: "editSchedule"; id?: number; initialStartMillis?: number }
  | { type: "editTodo"; id?: number }

const TABS: Array<{ id: TabId; icon: string; labelKey: string }> = [
  { id: "today", icon: "📅", labelKey: "tab.today" },
  { id: "todo", icon: "✅", labelKey: "tab.todo" },
  { id: "calendar", icon: "🗓", labelKey: "tab.calendar" },
  { id: "stats", icon: "📊", labelKey: "tab.stats" },
  { id: "settings", icon: "⚙️", labelKey: "tab.settings" },
]

export function App() {
  const { state, addSchedule, updateSchedule, deleteSchedule, addTodo, updateTodo, deleteTodo } = useAppStore()
  const lang = state.settings.language

  const [activeTab, setActiveTab] = useState<TabId>("today")
  const [screen, setScreen] = useState<ScreenMode>({ type: "main" })

  const goEditSchedule = (id?: number, initialStartMillis?: number) =>
    setScreen({ type: "editSchedule", id, initialStartMillis })
  const goEditTodo = (id?: number) => setScreen({ type: "editTodo", id })
  const goMain = () => setScreen({ type: "main" })

  const handleSaveSchedule = (item: ScheduleItem) => {
    if (state.schedules.some((s) => s.id === item.id)) {
      updateSchedule(item)
    } else {
      addSchedule(item)
    }
    goMain()
  }

  const handleDeleteSchedule = (id: number) => {
    deleteSchedule(id)
    goMain()
  }

  const handleSaveTodo = (item: TodoItem) => {
    if (state.todos.some((td) => td.id === item.id)) {
      updateTodo(item)
    } else {
      addTodo(item)
    }
    goMain()
  }

  const handleDeleteTodo = (id: number) => {
    deleteTodo(id)
    goMain()
  }

  // Edit schedule screen
  if (screen.type === "editSchedule") {
    return (
      <AppShell>
        <EditScheduleScreen
          existingId={screen.id ?? null}
          initialStartMillis={screen.initialStartMillis ?? null}
          onSave={handleSaveSchedule}
          onDelete={handleDeleteSchedule}
          onBack={goMain}
        />
      </AppShell>
    )
  }

  // Edit todo screen
  if (screen.type === "editTodo") {
    return (
      <AppShell>
        <EditTodoScreen
          existingId={screen.id ?? null}
          onSave={handleSaveTodo}
          onDelete={handleDeleteTodo}
          onBack={goMain}
        />
      </AppShell>
    )
  }

  // Main tabbed shell
  const tabs = TABS.map((tab) => ({ id: tab.id, label: t(tab.labelKey, lang), icon: tab.icon }))

  return (
    <AppShell>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <TabPanel active={activeTab === "today"}>
          <TodayScreen
            onAddSchedule={() => goEditSchedule()}
            onEditSchedule={(id) => goEditSchedule(id)}
            onAddTodo={() => goEditTodo()}
            onEditTodo={(id) => goEditTodo(id)}
          />
        </TabPanel>
        <TabPanel active={activeTab === "todo"}>
          <TodoScreen onAddTodo={() => goEditTodo()} onEditTodo={(id) => goEditTodo(id)} />
        </TabPanel>
        <TabPanel active={activeTab === "calendar"}>
          <CalendarScreen
            onAddScheduleForDay={(startMillis) => goEditSchedule(undefined, startMillis)}
            onEditSchedule={(id) => goEditSchedule(id)}
          />
        </TabPanel>
        <TabPanel active={activeTab === "stats"}>
          <StatsScreen />
        </TabPanel>
        <TabPanel active={activeTab === "settings"}>
          <SettingsScreen />
        </TabPanel>
      </div>

      <LiquidBottomTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        settings={state.settings}
      />
    </AppShell>
  )
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function AppShell({ children }: { children: React.ReactNode }) {
  const { state } = useAppStore()
  const { backgroundImagePath, backgroundImageOpacity, windowTransparency, windowTransparencyOverlay } =
    state.settings

  const [bgDataUrl, setBgDataUrl] = useState<string | null>(null)

  // Load background image as base64 data URL via IPC
  useEffect(() => {
    const api = (window as any).electronAPI
    if (!backgroundImagePath || !api) {
      setBgDataUrl(null)
      return
    }
    api.getImageDataUrl(backgroundImagePath).then((url: string | null) => {
      setBgDataUrl(url)
    })
  }, [backgroundImagePath])

  // Apply / remove native window transparency effect
  useEffect(() => {
    const api = (window as any).electronAPI
    if (!api) return
    // Enable native effect only when transparency is on AND no image is set
    const enable = windowTransparency && !backgroundImagePath
    api.setWindowEffect(enable)
  }, [windowTransparency, backgroundImagePath])

  const hasImage = !!bgDataUrl
  const useTransparency = windowTransparency && !hasImage

  // Sync data-transparency attribute on <html> so CSS can target it
  useEffect(() => {
    document.documentElement.dataset.transparency = useTransparency ? "true" : "false"
  }, [useTransparency])

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          hasImage || useTransparency
            ? "transparent"
            : "linear-gradient(135deg, #0a0a14 0%, #0d0d1a 50%, #0a0f1a 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        color: "rgba(255,255,255,0.9)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background image layer */}
      {hasImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${bgDataUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: backgroundImageOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Dark scrim overlay (image mode or transparency mode) */}
      {(hasImage || useTransparency) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            background: `rgba(0,0,0,${
              hasImage
                ? Math.min(0.7, (1 - backgroundImageOpacity) * 0.8)
                : windowTransparencyOverlay
            })`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Ambient background blobs (default gradient mode only) */}
      {!hasImage && !useTransparency && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,100,255,0.06) 0%, transparent 70%)",
              top: "-100px",
              left: "-100px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(120,0,255,0.05) 0%, transparent 70%)",
              bottom: "0",
              right: "0",
            }}
          />
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  )
}

function TabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: active ? 1 : 0,
        pointerEvents: active ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
    >
      {children}
    </div>
  )
}
