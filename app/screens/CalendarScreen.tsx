import React, { useState, useCallback } from "react"
import { useAppStore } from "../data/store"
import { t } from "../data/i18n"
import { argbToHex } from "../data/types"
import type { ScheduleItem } from "../data/types"
import { GlassCard } from "../components/GlassUI"

interface CalendarScreenProps {
  onEditSchedule: (id: number) => void
  onAddScheduleForDay: (startMillis: number) => void
}

const WEEKDAYS_ZH = ["日", "一", "二", "三", "四", "五", "六"]
const WEEKDAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS_ZH = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const MONTHS_SHORT_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Check if a recurring schedule occurs on a given day
function recurringMatchesDay(schedule: ScheduleItem, dayYear: number, dayMonth: number, dayOfMonth: number): boolean {
  if (!schedule.recurrenceRule) return false
  const orig = new Date(schedule.startTimeMillis)
  const testDate = new Date(dayYear, dayMonth, dayOfMonth, orig.getHours(), orig.getMinutes())
  if (testDate.getTime() <= schedule.startTimeMillis) return false
  switch (schedule.recurrenceRule) {
    case "daily": return true
    case "weekly": return testDate.getDay() === orig.getDay()
    case "monthly": return testDate.getDate() === orig.getDate()
    case "yearly": return testDate.getMonth() === orig.getMonth() && testDate.getDate() === orig.getDate()
    default: return false
  }
}

export function CalendarScreen({ onEditSchedule, onAddScheduleForDay }: CalendarScreenProps) {
  const { state, updateSchedule } = useAppStore()
  const { schedules, settings } = state
  const lang = settings.language

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [dialogDay, setDialogDay] = useState<number | null>(null)
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(today.getFullYear())
  const [pickerMonth, setPickerMonth] = useState(today.getMonth())

  const weekdays = lang === "zh" ? WEEKDAYS_ZH : WEEKDAYS_EN
  const months = lang === "zh" ? MONTHS_ZH : MONTHS_EN
  const monthsShort = lang === "zh" ? MONTHS_ZH : MONTHS_SHORT_EN

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  // Events for a given day (including recurring)
  const eventsOnDay = useCallback(
    (day: number): ScheduleItem[] => {
      const dayStart = new Date(viewYear, viewMonth, day, 0, 0, 0, 0).getTime()
      const dayEnd = dayStart + 86400000
      return schedules
        .filter((s) => {
          if (!settings.showCompletedInCalendar && s.isCompleted) return false
          // direct
          if (s.startTimeMillis >= dayStart && s.startTimeMillis < dayEnd) return true
          // recurring
          if (s.recurrenceRule && s.startTimeMillis < dayEnd) {
            return recurringMatchesDay(s, viewYear, viewMonth, day)
          }
          return false
        })
        .sort((a, b) => a.startTimeMillis - b.startTimeMillis)
    },
    [schedules, viewYear, viewMonth, settings.showCompletedInCalendar]
  )

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  const monthTitle = lang === "zh"
    ? `${viewYear}年${months[viewMonth]}`
    : `${months[viewMonth]} ${viewYear}`

  // ── Day-detail modal ──────────────────────────────────────────────────────
  const dialogEvents = dialogDay !== null ? eventsOnDay(dialogDay) : []
  const dialogDateStr = dialogDay !== null
    ? (lang === "zh"
        ? `${viewYear}年${viewMonth + 1}月${dialogDay}日`
        : `${MONTHS_EN[viewMonth]} ${dialogDay}, ${viewYear}`)
    : ""

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "24px 16px 80px", overflowY: "auto" }}>
      {/* ── Month navigation header ───────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 26, padding: "4px 10px" }}>‹</button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => { setPickerYear(viewYear); setPickerMonth(viewMonth); setShowYearMonthPicker(true) }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.95)", fontSize: 20, fontWeight: 800, padding: 0 }}
          >
            {monthTitle}
          </button>
          <button
            onClick={goToday}
            style={{ background: "rgba(0,136,255,0.15)", border: "1px solid rgba(0,136,255,0.4)", borderRadius: 12, padding: "2px 10px", color: "#0088ff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
          >
            {t("calendar.today", lang)}
          </button>
        </div>
        <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 26, padding: "4px 10px" }}>›</button>
      </div>

      {/* ── Weekday labels ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {weekdays.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.32)", padding: "4px 0" }}>{w}</div>
        ))}
      </div>

      {/* ── Calendar grid ─────────────────────────────────────────────────── */}
      <GlassCard style={{ padding: "8px 4px", flex: "none" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`e-${idx}`} style={{ height: 52 }} />
            const events = eventsOnDay(day)
            const dotColors = events.slice(0, 3).map((e) => argbToHex(e.colorArgb))
            const hasRecurring = events.some((e) => e.recurrenceRule)
            const todayCell = isToday(day)

            return (
              <button
                key={day}
                onClick={() => setDialogDay(day)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: "5px 2px 4px",
                  borderRadius: 10,
                  background: todayCell ? "rgba(0,136,255,0.18)" : "transparent",
                  border: todayCell ? "1px solid rgba(0,136,255,0.38)" : "1px solid transparent",
                  cursor: "pointer",
                  minHeight: 52,
                  minWidth: 0,
                  gap: 3,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: todayCell ? 700 : 400, color: todayCell ? "#4db8ff" : "rgba(255,255,255,0.82)", lineHeight: 1.3 }}>
                  {day}
                </span>
                {dotColors.length > 0 && (
                  <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                    {dotColors.map((c, i) => (
                      <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: c, display: "block" }} />
                    ))}
                    {events.length > 3 && (
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1 }}>+{events.length - 3}</span>
                    )}
                  </div>
                )}
                {hasRecurring && dotColors.length === 0 && (
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>↻</span>
                )}
              </button>
            )
          })}
        </div>
      </GlassCard>

      {/* ── Upcoming events preview (next 7 days) ─────────────────────────── */}
      <UpcomingPreview schedules={schedules} settings={settings} lang={lang} onEditSchedule={onEditSchedule} updateSchedule={updateSchedule} />

      {/* ── Day Detail Dialog ─────────────────────────────────────────────── */}
      {dialogDay !== null && (
        <DayDetailDialog
          dateStr={dialogDateStr}
          events={dialogEvents}
          lang={lang}
          onClose={() => setDialogDay(null)}
          onAdd={() => {
            const dayStart = new Date(viewYear, viewMonth, dialogDay!, 9, 0).getTime()
            setDialogDay(null)
            onAddScheduleForDay(dayStart)
          }}
          onEdit={(id) => { setDialogDay(null); onEditSchedule(id) }}
          onToggle={(item) => updateSchedule({ ...item, isCompleted: !item.isCompleted })}
        />
      )}

      {/* ── Year/Month Picker Dialog ──────────────────────────────────────── */}
      {showYearMonthPicker && (
        <YearMonthPickerDialog
          year={pickerYear}
          month={pickerMonth}
          lang={lang}
          monthsShort={monthsShort}
          onYearChange={setPickerYear}
          onMonthChange={setPickerMonth}
          onCancel={() => setShowYearMonthPicker(false)}
          onConfirm={() => {
            setViewYear(pickerYear)
            setViewMonth(pickerMonth)
            setShowYearMonthPicker(false)
          }}
        />
      )}
    </div>
  )
}

// ── Upcoming preview ──────────────────────────────────────────────────────────
function UpcomingPreview({ schedules, settings, lang, onEditSchedule, updateSchedule }: {
  schedules: ScheduleItem[], settings: any, lang: "zh" | "en",
  onEditSchedule: (id: number) => void, updateSchedule: (s: ScheduleItem) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in7 = today.getTime() + 7 * 86400000

  const upcoming = schedules
    .filter((s) => {
      if (!settings.showCompletedInCalendar && s.isCompleted) return false
      return s.startTimeMillis >= today.getTime() && s.startTimeMillis < in7
    })
    .sort((a, b) => a.startTimeMillis - b.startTimeMillis)
    .slice(0, 8)

  if (upcoming.length === 0) return null

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 8 }}>
        {lang === "zh" ? "近 7 天日程" : "NEXT 7 DAYS"}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {upcoming.map((item) => (
          <CalendarEventCard
            key={item.id}
            item={item}
            lang={lang}
            onEdit={() => onEditSchedule(item.id)}
            onToggle={() => updateSchedule({ ...item, isCompleted: !item.isCompleted })}
          />
        ))}
      </div>
    </div>
  )
}

// ── Day Detail Dialog ─────────────────────────────────────────────────────────
function DayDetailDialog({ dateStr, events, lang, onClose, onAdd, onEdit, onToggle }: {
  dateStr: string, events: ScheduleItem[], lang: "zh" | "en",
  onClose: () => void, onAdd: () => void,
  onEdit: (id: number) => void, onToggle: (item: ScheduleItem) => void
}) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: "min(480px, 92vw)",
        maxHeight: "70vh",
        background: "rgba(18,18,28,0.92)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{dateStr}</span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button onClick={onAdd} style={{ background: "none", border: "none", cursor: "pointer", color: "#0088ff", fontSize: 24, fontWeight: 700, padding: 0, lineHeight: 1 }}>+</button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", fontSize: 18, padding: 0, lineHeight: 1 }}>✕</button>
          </div>
        </div>
        {/* Event list */}
        <div style={{ overflowY: "auto", padding: "0 14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          {events.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 14, padding: "24px 0" }}>
              {t("calendar.no_events", lang)}
            </p>
          ) : (
            events.map((item) => (
              <CalendarEventCard
                key={item.id}
                item={item}
                lang={lang}
                onEdit={() => onEdit(item.id)}
                onToggle={() => onToggle(item)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── Year/Month Picker Dialog ──────────────────────────────────────────────────
function YearMonthPickerDialog({ year, month, lang, monthsShort, onYearChange, onMonthChange, onCancel, onConfirm }: {
  year: number, month: number, lang: "zh" | "en", monthsShort: string[],
  onYearChange: (y: number) => void, onMonthChange: (m: number) => void,
  onCancel: () => void, onConfirm: () => void
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
      <div style={{
        width: "min(360px, 88vw)",
        background: "rgba(18,18,28,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        {/* Year row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => onYearChange(year - 1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 20 }}>‹</button>
          <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>{year}</span>
          <button onClick={() => onYearChange(year + 1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 20 }}>›</button>
        </div>
        {/* Month grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {monthsShort.map((name, m) => (
            <button
              key={m}
              onClick={() => onMonthChange(m)}
              style={{
                padding: "8px 4px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: m === month ? 700 : 400,
                background: m === month ? "rgba(0,136,255,0.55)" : "rgba(255,255,255,0.06)",
                color: m === month ? "#fff" : "rgba(255,255,255,0.7)",
              }}
            >
              {name}
            </button>
          ))}
        </div>
        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", fontSize: 14, cursor: "pointer" }}>
            {t("common.cancel", lang)}
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "10px 0", borderRadius: 14, border: "none", background: "rgba(0,136,255,0.75)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {t("common.confirm", lang)}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Event card (used in dialog and upcoming preview) ──────────────────────────
function CalendarEventCard({ item, lang, onEdit, onToggle }: {
  item: ScheduleItem, lang: "zh" | "en",
  onEdit: () => void, onToggle: () => void
}) {
  const accentColor = argbToHex(item.colorArgb)
  const locale = lang === "zh" ? "zh-CN" : "en-US"
  const start = new Date(item.startTimeMillis)
  const end = new Date(item.endTimeMillis)
  const timeStr = `${start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`

  const priorityLabel = item.priority === 1 ? "↓" : item.priority === 2 ? "●" : item.priority === 3 ? "↑" : null
  const priorityColor = item.priority === 1 ? "#34C759" : item.priority === 2 ? "#FF9500" : "#FF3B30"

  return (
    <div
      onClick={onEdit}
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 10,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "11px 12px",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.09)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)")}
    >
      {/* Color bar */}
      <div style={{ width: 3, borderRadius: 2, background: accentColor, flexShrink: 0 }} />

      {/* Checkbox */}
      <div
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        style={{
          width: 20, height: 20, borderRadius: 5, flexShrink: 0, alignSelf: "center", cursor: "pointer",
          background: item.isCompleted ? "#34C759" : "transparent",
          border: item.isCompleted ? "none" : `1.5px solid ${accentColor}60`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {item.isCompleted && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{
            fontSize: 14, fontWeight: 600,
            color: item.isCompleted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
            textDecoration: item.isCompleted ? "line-through" : "none",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
          }}>
            {item.title}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", flexShrink: 0, textDecoration: item.isCompleted ? "line-through" : "none" }}>{timeStr}</span>
        </div>
        {item.description ? (
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.description}
          </span>
        ) : null}
        {/* Badges */}
        {(item.priority > 0 || item.recurrenceRule || item.reminderMinutesBefore != null) && (
          <div style={{ display: "flex", gap: 5, marginTop: 1, flexWrap: "wrap" }}>
            {priorityLabel && (
              <span style={{ fontSize: 10, color: priorityColor, fontWeight: 700 }}>{priorityLabel}</span>
            )}
            {item.reminderMinutesBefore != null && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>🔔</span>
            )}
            {item.recurrenceRule && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>🔁</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

