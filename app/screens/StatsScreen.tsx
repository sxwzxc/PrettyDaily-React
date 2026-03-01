import React from "react"
import { useAppStore } from "../data/store"
import { t } from "../data/i18n"
import { GlassCard } from "../components/GlassUI"

export function StatsScreen() {
  const { state } = useAppStore()
  const { schedules, todos, settings } = state
  const lang = settings.language

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  monthEnd.setHours(23, 59, 59)

  // This week's schedules
  const weekSchedules = schedules.filter((s) => s.startTimeMillis >= weekStart.getTime() && s.startTimeMillis < weekEnd.getTime())
  const weekCompleted = weekSchedules.filter((s) => s.isCompleted)
  const weekCompletionRate = weekSchedules.length > 0 ? Math.round((weekCompleted.length / weekSchedules.length) * 100) : 0

  // This month's schedules
  const monthSchedules = schedules.filter((s) => s.startTimeMillis >= monthStart.getTime() && s.startTimeMillis <= monthEnd.getTime())
  const monthCompleted = monthSchedules.filter((s) => s.isCompleted)

  // All todos
  const allTodos = todos
  const completedTodos = todos.filter((t) => t.isCompleted)
  const todoCompletionRate = allTodos.length > 0 ? Math.round((completedTodos.length / allTodos.length) * 100) : 0

  // Pending by priority
  const pendingByPriority = [0, 1, 2, 3].map((p) => ({
    priority: p,
    count: schedules.filter((s) => !s.isCompleted && s.priority === p).length,
  }))

  // Weekly activity data (last 7 days)
  const weekdays = lang === "zh"
    ? ["日", "一", "二", "三", "四", "五", "六"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    const nextD = new Date(d)
    nextD.setDate(nextD.getDate() + 1)
    const daySchedules = schedules.filter((s) => s.startTimeMillis >= d.getTime() && s.startTimeMillis < nextD.getTime())
    return {
      label: weekdays[d.getDay()],
      total: daySchedules.length,
      completed: daySchedules.filter((s) => s.isCompleted).length,
    }
  })

  const maxBar = Math.max(...last7Days.map((d) => d.total), 1)

  const PRIORITY_LABELS = lang === "zh"
    ? ["无", "低", "中", "高"]
    : ["None", "Low", "Med", "High"]
  const PRIORITY_COLORS = ["rgba(255,255,255,0.2)", "#34d399", "#fbbf24", "#f87171"]

  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 100px" }}>
      {/* Header */}
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.95)", marginBottom: 20 }}>
        {t("stats.title", lang)}
      </h1>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <StatCard
          label={t("stats.this_week", lang)}
          value={`${weekCompleted.length}/${weekSchedules.length}`}
          sub={`${weekCompletionRate}%`}
          accentColor="#0088ff"
        />
        <StatCard
          label={t("stats.this_month", lang)}
          value={`${monthCompleted.length}/${monthSchedules.length}`}
          sub={lang === "zh" ? `${monthSchedules.length} 个日程` : `${monthSchedules.length} events`}
          accentColor="#00c896"
        />
      </div>

      {/* Todo stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <StatCard
          label={t("stats.total_todos", lang)}
          value={String(allTodos.length)}
          sub={lang === "zh" ? `${completedTodos.length} 已完成` : `${completedTodos.length} done`}
          accentColor="#a78bfa"
        />
        <StatCard
          label={t("stats.total_events", lang)}
          value={String(schedules.length)}
          sub={lang === "zh" ? `${schedules.filter((s) => s.isCompleted).length} 已完成` : `${schedules.filter((s) => s.isCompleted).length} done`}
          accentColor="#fbbf24"
        />
      </div>

      {/* Weekly activity bar chart */}
      <GlassCard style={{ padding: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
          {t("stats.weekly_activity", lang)}
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {last7Days.map((day, i) => {
            const pct = day.total / maxBar
            const completedPct = day.total > 0 ? day.completed / day.total : 0
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 60 }}>
                  <div style={{ width: "100%", borderRadius: 4, overflow: "hidden", height: `${Math.max(pct * 60, day.total > 0 ? 6 : 0)}px`, background: "rgba(255,255,255,0.1)" }}>
                    <div style={{ width: "100%", height: `${completedPct * 100}%`, background: "#0088ff", borderRadius: 4 }} />
                  </div>
                </div>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{day.label}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "#0088ff", display: "block" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{t("stats.completed", lang)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.1)", display: "block" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{t("stats.pending", lang)}</span>
          </div>
        </div>
      </GlassCard>

      {/* Completion ring */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <CompletionRing label={t("stats.schedule_completion", lang)} rate={weekCompletionRate} color="#0088ff" />
        <CompletionRing label={t("stats.todo_completion", lang)} rate={todoCompletionRate} color="#a78bfa" />
      </div>

      {/* Pending by priority */}
      <GlassCard style={{ padding: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
          {t("stats.pending_by_priority", lang)}
        </p>
        {pendingByPriority.map(({ priority, count }) => (
          <div key={priority} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_COLORS[priority], display: "block", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", flex: 1 }}>{PRIORITY_LABELS[priority]}</span>
            <div style={{ flex: 2, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${schedules.filter((s) => !s.isCompleted).length > 0 ? (count / schedules.filter((s) => !s.isCompleted).length) * 100 : 0}%`, background: PRIORITY_COLORS[priority], borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", minWidth: 24, textAlign: "right" }}>{count}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

function StatCard({ label, value, sub, accentColor }: { label: string; value: string; sub: string; accentColor: string }) {
  return (
    <GlassCard style={{ padding: 16 }} accentColor={0}>
      <div style={{ borderTop: `3px solid ${accentColor}`, paddingTop: 12 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 8, fontWeight: 600, letterSpacing: "0.04em" }}>{label.toUpperCase()}</p>
        <p style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.95)", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{sub}</p>
      </div>
    </GlassCard>
  )
}

function CompletionRing({ label, rate, color }: { label: string; rate: number; color: string }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (rate / 100) * circumference

  return (
    <GlassCard style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <svg width={80} height={80} viewBox="0 0 80 80">
          <circle cx={40} cy={40} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
          <circle
            cx={40}
            cy={40}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>{rate}%</span>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center", fontWeight: 600 }}>{label}</p>
    </GlassCard>
  )
}
