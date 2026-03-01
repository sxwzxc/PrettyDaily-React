import React, { useState } from "react"
import { useAppStore } from "../data/store"
import { t } from "../data/i18n"
import { argbToHex } from "../data/types"
import type { ScheduleItem } from "../data/types"
import { GlassCard, GlassCheckbox, ColorDot, PriorityBadge } from "../components/GlassUI"

interface CalendarScreenProps {
  onEditSchedule: (id: number) => void
  onAddScheduleForDay: (startMillis: number) => void
}

const WEEKDAYS_ZH = ["日", "一", "二", "三", "四", "五", "六"]
const WEEKDAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS_ZH = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function CalendarScreen({ onEditSchedule, onAddScheduleForDay }: CalendarScreenProps) {
  const { state, updateSchedule } = useAppStore()
  const { schedules, settings } = state
  const lang = settings.language

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  const weekdays = lang === "zh" ? WEEKDAYS_ZH : WEEKDAYS_EN
  const months = lang === "zh" ? MONTHS_ZH : MONTHS_EN

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  // Events for each day
  const eventsOnDay = (day: number): ScheduleItem[] => {
    const dayStart = new Date(viewYear, viewMonth, day)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    return schedules.filter((s) => {
      if (!settings.showCompletedInCalendar && s.isCompleted) return false
      return s.startTimeMillis >= dayStart.getTime() && s.startTimeMillis < dayEnd.getTime()
    })
  }

  const selectedDayEvents = eventsOnDay(selectedDay).sort((a, b) => a.startTimeMillis - b.startTimeMillis)
  const isToday = (day: number) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
  const isSelected = (day: number) => day === selectedDay

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
    setSelectedDay(1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
    setSelectedDay(1)
  }

  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDay(today.getDate())
  }

  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 100px" }}>
      {/* Month header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: 24, opacity: 0.7, padding: "4px 8px" }}>‹</button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.95)" }}>
            {lang === "zh" ? `${viewYear}年${months[viewMonth]}` : `${months[viewMonth]} ${viewYear}`}
          </h2>
          <button
            onClick={goToday}
            style={{
              background: "rgba(0,136,255,0.15)",
              border: "1px solid rgba(0,136,255,0.4)",
              borderRadius: 12,
              padding: "2px 10px",
              color: "#0088ff",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("calendar.today", lang)}
          </button>
        </div>
        <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: 24, opacity: 0.7, padding: "4px 8px" }}>›</button>
      </div>

      {/* Weekday labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
        {weekdays.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)", padding: "4px 0" }}>
            {w}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <GlassCard style={{ padding: 8, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />
            const events = eventsOnDay(day)
            const dotColors = events.slice(0, 3).map((e) => argbToHex(e.colorArgb))
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "6px 2px",
                  borderRadius: 12,
                  background: isSelected(day)
                    ? "rgba(0,136,255,0.25)"
                    : isToday(day)
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                  border: isSelected(day) ? "1px solid rgba(0,136,255,0.5)" : isToday(day) ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                  cursor: "pointer",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: isToday(day) || isSelected(day) ? 700 : 400,
                    color: isSelected(day) ? "#0088ff" : isToday(day) ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
                    lineHeight: 1.4,
                  }}
                >
                  {day}
                </span>
                {dotColors.length > 0 && (
                  <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                    {dotColors.map((c, i) => (
                      <span key={i} style={{ width: 4, height: 4, borderRadius: 2, background: c, display: "block" }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </GlassCard>

      {/* Selected day events */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
          {lang === "zh" ? `${viewMonth + 1}月${selectedDay}日` : `${months[viewMonth]} ${selectedDay}`}
        </h3>
        <button
          onClick={() => {
            const dayStart = new Date(viewYear, viewMonth, selectedDay, 9, 0)
            onAddScheduleForDay(dayStart.getTime())
          }}
          style={{
            background: "rgba(0,136,255,0.15)",
            border: "1px solid rgba(0,136,255,0.4)",
            borderRadius: 12,
            padding: "5px 12px",
            color: "#0088ff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + {t("calendar.add_event", lang)}
        </button>
      </div>

      {selectedDayEvents.length === 0 ? (
        <div style={{ textAlign: "center", opacity: 0.45, padding: "32px 0" }}>
          <p style={{ fontSize: 14 }}>{t("calendar.no_events", lang)}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {selectedDayEvents.map((item) => (
            <CalendarEventRow
              key={item.id}
              item={item}
              lang={lang}
              onToggle={(v) => updateSchedule({ ...item, isCompleted: v })}
              onEdit={() => onEditSchedule(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CalendarEventRow({ item, lang, onToggle, onEdit }: { item: ScheduleItem; lang: "zh" | "en"; onToggle: (v: boolean) => void; onEdit: () => void }) {
  const start = new Date(item.startTimeMillis)
  const end = new Date(item.endTimeMillis)
  const locale = lang === "zh" ? "zh-CN" : "en-US"
  const timeStr = `${start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`

  return (
    <GlassCard style={{ padding: "12px 14px", cursor: "pointer" }} onClick={onEdit} accentColor={item.colorArgb}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <GlassCheckbox checked={item.isCompleted} onChange={onToggle} color={argbToHex(item.colorArgb)} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: item.isCompleted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)", textDecoration: item.isCompleted ? "line-through" : "none" }}>
              {item.title}
            </p>
            <PriorityBadge priority={item.priority} lang={lang} />
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{timeStr}</p>
        </div>
        <ColorDot colorArgb={item.colorArgb} size={8} />
      </div>
    </GlassCard>
  )
}
