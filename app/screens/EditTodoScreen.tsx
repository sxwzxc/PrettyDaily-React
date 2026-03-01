import React, { useState } from "react"
import { useAppStore } from "../data/store"
import { t } from "../data/i18n"
import { createTodoItem } from "../data/types"
import type { TodoItem } from "../data/types"
import { GlassCard, GlassInput, GlassTextarea, GlassButton, GlassToggle } from "../components/GlassUI"

interface EditTodoScreenProps {
  existingId?: number | null
  onSave: (item: TodoItem) => void
  onDelete: (id: number) => void
  onBack: () => void
}

function formatDate(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function EditTodoScreen({ existingId, onSave, onDelete, onBack }: EditTodoScreenProps) {
  const { state } = useAppStore()
  const { todos, settings } = state
  const lang = settings.language

  const existing = existingId ? todos.find((t) => t.id === existingId) : null

  const [title, setTitle] = useState(existing?.title ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [hasDueDate, setHasDueDate] = useState(existing?.dueDateMillis != null)
  const [dueDateStr, setDueDateStr] = useState(existing?.dueDateMillis ? formatDate(existing.dueDateMillis) : formatDate(Date.now()))
  const [priority, setPriority] = useState(existing?.priority ?? 1)
  const [isCompleted, setIsCompleted] = useState(existing?.isCompleted ?? false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEdit = !!existing
  const PRIORITY_LABELS = lang === "zh" ? ["低", "中", "高"] : ["Low", "Medium", "High"]
  const PRIORITY_COLORS = ["#34d399", "#fbbf24", "#f87171"]

  const handleSave = () => {
    if (!title.trim()) return
    const dueDateMillis = hasDueDate ? new Date(dueDateStr).getTime() : null

    if (!existing) {
      onSave(createTodoItem({ title: title.trim(), description, dueDateMillis, priority }))
    } else {
      onSave({ ...existing, title: title.trim(), description, dueDateMillis, priority, isCompleted })
    }
  }

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
          {isEdit ? t("todo.edit.edit", lang) : t("todo.edit.new", lang)}
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Title */}
        <GlassCard style={{ padding: 16 }}>
          <GlassInput label={t("edit.title", lang)} value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} placeholder={t("todo.edit.title_placeholder", lang)} autoFocus />
        </GlassCard>

        {/* Description */}
        <GlassCard style={{ padding: 16 }}>
          <GlassTextarea label={t("edit.notes", lang)} value={description} onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)} placeholder={t("todo.edit.description_placeholder", lang)} style={{ minHeight: 72 }} />
        </GlassCard>

        {/* Priority */}
        <GlassCard style={{ padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.05em" }}>
            {t("todo.edit.priority", lang)}
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {PRIORITY_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => setPriority(i)}
                style={{
                  padding: "6px 18px",
                  borderRadius: 12,
                  background: priority === i ? `${PRIORITY_COLORS[i]}22` : "rgba(255,255,255,0.06)",
                  border: priority === i ? `1px solid ${PRIORITY_COLORS[i]}66` : "1px solid rgba(255,255,255,0.1)",
                  color: priority === i ? PRIORITY_COLORS[i] : "rgba(255,255,255,0.7)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Due date */}
        <GlassCard style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: hasDueDate ? 12 : 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{t("todo.edit.due_date", lang)}</p>
            <GlassToggle checked={hasDueDate} onChange={setHasDueDate} />
          </div>
          {hasDueDate && (
            <GlassInput type="date" value={dueDateStr} onChange={(e) => setDueDateStr((e.target as HTMLInputElement).value)} />
          )}
        </GlassCard>

        {/* Completed (edit mode) */}
        {isEdit && (
          <GlassCard style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{t("edit.mark_completed", lang)}</p>
              <GlassToggle checked={isCompleted} onChange={setIsCompleted} />
            </div>
          </GlassCard>
        )}

        {/* Save button */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <GlassButton variant="primary" onClick={handleSave} style={{ flex: 1 }}>
            {isEdit ? t("todo.edit.save", lang) : t("todo.edit.add", lang)}
          </GlassButton>
        </div>

        {/* Delete */}
        {isEdit && (
          <div>
            {showDeleteConfirm ? (
              <GlassCard style={{ padding: 16 }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 12, textAlign: "center" }}>
                  {t("common.delete_confirm", lang)}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <GlassButton variant="ghost" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>{t("common.cancel", lang)}</GlassButton>
                  <GlassButton variant="danger" onClick={() => onDelete(existing!.id)} style={{ flex: 1 }}>{t("todo.edit.delete", lang)}</GlassButton>
                </div>
              </GlassCard>
            ) : (
              <GlassButton variant="danger" onClick={() => setShowDeleteConfirm(true)} style={{ width: "100%" }}>
                {t("todo.edit.delete", lang)}
              </GlassButton>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
