import React, { useState } from "react"
import { useAppStore } from "../data/store"
import { t } from "../data/i18n"
import { argbToHex } from "../data/types"
import type { ScheduleItem, TodoItem } from "../data/types"
import { GlassCard, GlassCheckbox, ColorDot, PriorityBadge, SectionHeader, EmptyState, FAB } from "../components/GlassUI"

interface TodayScreenProps {
  onEditSchedule: (id: number) => void
  onAddSchedule: () => void
  onEditTodo: (id: number) => void
  onAddTodo: () => void
}

export function TodayScreen({ onEditSchedule, onAddSchedule, onEditTodo, onAddTodo }: TodayScreenProps) {
  const { state, updateSchedule, updateTodo } = useAppStore()
  const { schedules, todos, settings } = state
  const lang = settings.language

  const [searchQuery, setSearchQuery] = useState("")
  const [showFabMenu, setShowFabMenu] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Today's schedules
  const todaySchedules = schedules.filter((s) => {
    const start = new Date(s.startTimeMillis)
    start.setHours(0, 0, 0, 0)
    return start.getTime() === today.getTime() || isRecurringToday(s, today)
  })

  // Search filter
  const filteredSchedules = searchQuery
    ? schedules.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : todaySchedules

  const filteredTodos = searchQuery
    ? todos.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const pendingSchedules = filteredSchedules.filter((s) => !s.isCompleted).sort((a, b) => a.startTimeMillis - b.startTimeMillis)
  const completedSchedules = filteredSchedules.filter((s) => s.isCompleted).sort((a, b) => a.startTimeMillis - b.startTimeMillis)

  const pendingTodos = todos.filter((t) => !t.isCompleted).sort((a, b) => b.priority - a.priority)
  const completedTodos = todos.filter((t) => t.isCompleted)

  const dateStr = today.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 100px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.95)", marginBottom: 4 }}>
          {t("today.title", lang)}
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>{dateStr}</p>
      </div>

      {/* Search bar */}
      <GlassCard style={{ marginBottom: 16, padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, opacity: 0.5 }}>🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("today.search_placeholder", lang)}
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              flex: 1,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 18 }}
            >
              ×
            </button>
          )}
        </div>
      </GlassCard>

      {searchQuery ? (
        /* Search results */
        <div>
          {filteredSchedules.length === 0 && filteredTodos.length === 0 ? (
            <EmptyState icon="🔍" title={t("todo.no_match", lang)} />
          ) : (
            <>
              {filteredSchedules.map((item) => (
                <ScheduleRow key={item.id} item={item} lang={lang} onToggle={(v) => updateSchedule({ ...item, isCompleted: v })} onEdit={() => onEditSchedule(item.id)} />
              ))}
              {filteredTodos.map((item) => (
                <TodoRow key={item.id} item={item} lang={lang} onToggle={(v) => updateTodo({ ...item, isCompleted: v })} onEdit={() => onEditTodo(item.id)} />
              ))}
            </>
          )}
        </div>
      ) : (
        /* Normal today view */
        <div>
          {/* Pending schedules */}
          <SectionHeader title={t("today.pending", lang)} count={pendingSchedules.length} />
          {pendingSchedules.length === 0 ? (
            <div style={{ marginBottom: 16 }}>
              <EmptyState icon="📅" title={t("today.no_pending", lang)} hint={t("today.add_hint", lang)} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {pendingSchedules.map((item) => (
                <ScheduleRow key={item.id} item={item} lang={lang} onToggle={(v) => updateSchedule({ ...item, isCompleted: v })} onEdit={() => onEditSchedule(item.id)} />
              ))}
            </div>
          )}

          {/* Pending todos */}
          {pendingTodos.length > 0 && (
            <>
              <SectionHeader title={t("todo.pending", lang)} count={pendingTodos.length} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {pendingTodos.map((item) => (
                  <TodoRow key={item.id} item={item} lang={lang} onToggle={(v) => updateTodo({ ...item, isCompleted: v })} onEdit={() => onEditTodo(item.id)} />
                ))}
              </div>
            </>
          )}

          {/* Completed schedules */}
          {completedSchedules.length > 0 && (
            <>
              <SectionHeader title={t("today.completed", lang)} count={completedSchedules.length} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {completedSchedules.map((item) => (
                  <ScheduleRow key={item.id} item={item} lang={lang} onToggle={(v) => updateSchedule({ ...item, isCompleted: v })} onEdit={() => onEditSchedule(item.id)} />
                ))}
              </div>
            </>
          )}

          {/* Completed todos */}
          {completedTodos.length > 0 && (
            <>
              <SectionHeader title={t("todo.completed", lang)} count={completedTodos.length} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {completedTodos.map((item) => (
                  <TodoRow key={item.id} item={item} lang={lang} onToggle={(v) => updateTodo({ ...item, isCompleted: v })} onEdit={() => onEditTodo(item.id)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB with menu */}
      {showFabMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => setShowFabMenu(false)}
        />
      )}
      {showFabMenu && (
        <div style={{ position: "fixed", bottom: 166, right: 24, zIndex: 101, display: "flex", flexDirection: "column", gap: 8 }}>
          <GlassCard
            style={{ padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap" }}
            onClick={() => { setShowFabMenu(false); onAddSchedule() }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>📅 {t("edit.add_event", lang)}</span>
          </GlassCard>
          <GlassCard
            style={{ padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap" }}
            onClick={() => { setShowFabMenu(false); onAddTodo() }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>✅ {t("todo.edit.add", lang)}</span>
          </GlassCard>
        </div>
      )}
      <FAB onClick={() => setShowFabMenu(!showFabMenu)} label={t("common.add", lang)} />
    </div>
  )
}

// ─── Helper: is schedule recurring on given day ───────────────────────────────────────────
function isRecurringToday(s: ScheduleItem, today: Date): boolean {
  if (!s.recurrenceRule) return false
  const start = new Date(s.startTimeMillis)
  start.setHours(0, 0, 0, 0)
  if (start > today) return false

  switch (s.recurrenceRule) {
    case "daily":
      return true
    case "weekly":
      return start.getDay() === today.getDay()
    case "monthly":
      return start.getDate() === today.getDate()
    case "yearly":
      return start.getMonth() === today.getMonth() && start.getDate() === today.getDate()
    default:
      return false
  }
}

// ─── Schedule row ─────────────────────────────────────────────────────────────
function ScheduleRow({ item, lang, onToggle, onEdit }: { item: ScheduleItem; lang: "zh" | "en"; onToggle: (v: boolean) => void; onEdit: () => void }) {
  const start = new Date(item.startTimeMillis)
  const end = new Date(item.endTimeMillis)
  const timeStr = `${start.toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit" })}`

  return (
    <GlassCard
      style={{ padding: "12px 14px", cursor: "pointer" }}
      onClick={onEdit}
      accentColor={item.colorArgb}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <GlassCheckbox checked={item.isCompleted} onChange={onToggle} color={argbToHex(item.colorArgb)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: item.isCompleted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
                textDecoration: item.isCompleted ? "line-through" : "none",
              }}
            >
              {item.title}
            </p>
            <PriorityBadge priority={item.priority} lang={lang} />
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{timeStr}</p>
          {item.description && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.description}
            </p>
          )}
        </div>
        <ColorDot colorArgb={item.colorArgb} size={8} />
      </div>
    </GlassCard>
  )
}

// ─── Todo row ─────────────────────────────────────────────────────────────────
function TodoRow({ item, lang, onToggle, onEdit }: { item: TodoItem; lang: "zh" | "en"; onToggle: (v: boolean) => void; onEdit: () => void }) {
  return (
    <GlassCard style={{ padding: "12px 14px", cursor: "pointer" }} onClick={onEdit}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <GlassCheckbox checked={item.isCompleted} onChange={onToggle} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: item.isCompleted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
                textDecoration: item.isCompleted ? "line-through" : "none",
              }}
            >
              {item.title}
            </p>
            <PriorityBadge priority={item.priority + 1} lang={lang} />
          </div>
          {item.description && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.description}
            </p>
          )}
          {item.dueDateMillis && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              📅 {new Date(item.dueDateMillis).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US")}
            </p>
          )}
        </div>
        <span style={{ fontSize: 12, opacity: 0.3 }}>✓</span>
      </div>
    </GlassCard>
  )
}
