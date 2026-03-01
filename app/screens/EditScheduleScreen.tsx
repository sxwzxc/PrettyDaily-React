import React, { useState } from "react"
import { useAppStore } from "../data/store"
import { t } from "../data/i18n"
import { createScheduleItem, SCHEDULE_COLORS, argbToHex, hexToArgb, RECURRENCE_OPTIONS, REMINDER_OPTIONS } from "../data/types"
import type { ScheduleItem } from "../data/types"
import { GlassCard, GlassInput, GlassTextarea, GlassButton, GlassCheckbox, GlassToggle } from "../components/GlassUI"

interface EditScheduleScreenProps {
  existingId?: number | null
  initialStartMillis?: number | null
  onSave: (item: ScheduleItem) => void
  onDelete: (id: number) => void
  onBack: () => void
}

function formatDatetimeLocal(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function parseDatetimeLocal(s: string): number {
  return new Date(s).getTime()
}

export function EditScheduleScreen({ existingId, initialStartMillis, onSave, onDelete, onBack }: EditScheduleScreenProps) {
  const { state } = useAppStore()
  const { schedules, settings } = state
  const lang = settings.language

  const existing = existingId ? schedules.find((s) => s.id === existingId) : null

  const now = Date.now()
  const defaultStart = initialStartMillis ?? now
  const defaultEnd = defaultStart + 60 * 60 * 1000

  const [title, setTitle] = useState(existing?.title ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [startStr, setStartStr] = useState(formatDatetimeLocal(existing?.startTimeMillis ?? defaultStart))
  const [endStr, setEndStr] = useState(formatDatetimeLocal(existing?.endTimeMillis ?? defaultEnd))
  const [colorArgb, setColorArgb] = useState(existing?.colorArgb ?? 0xff0088ff)
  const [isCompleted, setIsCompleted] = useState(existing?.isCompleted ?? false)
  const [reminder, setReminder] = useState<number | null>(existing?.reminderMinutesBefore ?? null)
  const [recurrence, setRecurrence] = useState<string | null>(existing?.recurrenceRule ?? null)
  const [priority, setPriority] = useState(existing?.priority ?? 0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEdit = !!existing

  const handleSave = () => {
    if (!title.trim()) return
    const start = parseDatetimeLocal(startStr)
    const end = parseDatetimeLocal(endStr)
    if (!existing) {
      onSave(createScheduleItem({ title: title.trim(), description, startTimeMillis: start, endTimeMillis: Math.max(end, start + 60000), colorArgb, reminderMinutesBefore: reminder, recurrenceRule: recurrence, priority }))
    } else {
      onSave({ ...existing, title: title.trim(), description, startTimeMillis: start, endTimeMillis: Math.max(end, start + 60000), colorArgb, isCompleted, reminderMinutesBefore: reminder, recurrenceRule: recurrence, priority })
    }
  }

  const PRIORITY_LABELS = lang === "zh" ? ["无", "低", "中", "高"] : ["None", "Low", "Med", "High"]

  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 20, padding: "4px 8px 4px 0" }}
        >
          {t("edit.back", lang)}
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.95)", flex: 1 }}>
          {isEdit ? t("edit.edit_event", lang) : t("edit.new_event", lang)}
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Title */}
        <GlassCard style={{ padding: 16 }}>
          <GlassInput label={t("edit.title", lang)} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("edit.title_placeholder", lang)} autoFocus />
        </GlassCard>

        {/* Notes */}
        <GlassCard style={{ padding: 16 }}>
          <GlassTextarea label={t("edit.notes", lang)} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("edit.notes_placeholder", lang)} style={{ minHeight: 72 }} />
        </GlassCard>

        {/* Time */}
        <GlassCard style={{ padding: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <GlassInput label={t("edit.start", lang)} type="datetime-local" value={startStr} onChange={(e) => setStartStr(e.target.value)} />
            <GlassInput label={t("edit.end", lang)} type="datetime-local" value={endStr} onChange={(e) => setEndStr(e.target.value)} />
          </div>
        </GlassCard>

        {/* Color picker */}
        <GlassCard style={{ padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.05em" }}>
            {t("edit.color", lang)}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SCHEDULE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColorArgb(c)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: argbToHex(c),
                  border: colorArgb === c ? "3px solid white" : "2px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  transition: "transform 0.15s",
                  transform: colorArgb === c ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </GlassCard>

        {/* Reminder */}
        <GlassCard style={{ padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.05em" }}>
            {t("edit.reminder", lang)}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {REMINDER_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setReminder(opt.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 12,
                  background: reminder === opt.value ? "rgba(0,136,255,0.25)" : "rgba(255,255,255,0.06)",
                  border: reminder === opt.value ? "1px solid rgba(0,136,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  color: reminder === opt.value ? "#0088ff" : "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {lang === "zh" ? opt.zh : opt.en}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Recurrence */}
        <GlassCard style={{ padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.05em" }}>
            {t("edit.recurrence", lang)}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {RECURRENCE_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setRecurrence(opt.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 12,
                  background: recurrence === opt.value ? "rgba(0,136,255,0.25)" : "rgba(255,255,255,0.06)",
                  border: recurrence === opt.value ? "1px solid rgba(0,136,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  color: recurrence === opt.value ? "#0088ff" : "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {lang === "zh" ? opt.zh : opt.en}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Priority */}
        <GlassCard style={{ padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.05em" }}>
            {t("edit.priority", lang)}
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {PRIORITY_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => setPriority(i)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 12,
                  background: priority === i ? "rgba(0,136,255,0.25)" : "rgba(255,255,255,0.06)",
                  border: priority === i ? "1px solid rgba(0,136,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  color: priority === i ? "#0088ff" : "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Completed status (edit mode only) */}
        {isEdit && (
          <GlassCard style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{t("edit.mark_completed", lang)}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {isCompleted ? t("edit.completed_status", lang) : t("edit.pending_status", lang)}
                </p>
              </div>
              <GlassToggle checked={isCompleted} onChange={setIsCompleted} />
            </div>
          </GlassCard>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <GlassButton variant="primary" onClick={handleSave} style={{ flex: 1 }}>
            {isEdit ? t("edit.save", lang) : t("edit.add_event", lang)}
          </GlassButton>
        </div>

        {isEdit && (
          <div>
            {showDeleteConfirm ? (
              <GlassCard style={{ padding: 16 }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 12, textAlign: "center" }}>
                  {t("common.delete_confirm", lang)}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <GlassButton variant="ghost" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>
                    {t("common.cancel", lang)}
                  </GlassButton>
                  <GlassButton variant="danger" onClick={() => onDelete(existing!.id)} style={{ flex: 1 }}>
                    {t("edit.delete", lang)}
                  </GlassButton>
                </div>
              </GlassCard>
            ) : (
              <GlassButton variant="danger" onClick={() => setShowDeleteConfirm(true)} style={{ width: "100%" }}>
                {t("edit.delete", lang)}
              </GlassButton>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
