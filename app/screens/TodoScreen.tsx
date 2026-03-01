import React, { useState } from "react"
import { useAppStore } from "../data/store"
import { t } from "../data/i18n"
import type { TodoItem } from "../data/types"
import { GlassCard, GlassCheckbox, PriorityBadge, SectionHeader, EmptyState, FAB } from "../components/GlassUI"

interface TodoScreenProps {
  onEditTodo: (id: number) => void
  onAddTodo: () => void
}

export function TodoScreen({ onEditTodo, onAddTodo }: TodoScreenProps) {
  const { state, updateTodo } = useAppStore()
  const { todos, settings } = state
  const lang = settings.language

  const [searchQuery, setSearchQuery] = useState("")

  const filtered = searchQuery
    ? todos.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : todos

  const pendingTodos = filtered.filter((t) => !t.isCompleted).sort((a, b) => b.priority - a.priority)
  const completedTodos = filtered.filter((t) => t.isCompleted).sort((a, b) => b.priority - a.priority)

  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 100px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.95)", marginBottom: 4 }}>
          {t("todo.title", lang)}
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          {pendingTodos.length} {lang === "zh" ? "项待完成" : "pending"}
        </p>
      </div>

      {/* Search */}
      <GlassCard style={{ marginBottom: 16, padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, opacity: 0.5 }}>🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("todo.title", lang) + "..."}
            style={{ background: "none", border: "none", outline: "none", color: "rgba(255,255,255,0.85)", fontSize: 15, flex: 1 }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 18 }}>×</button>
          )}
        </div>
      </GlassCard>

      {pendingTodos.length === 0 && completedTodos.length === 0 ? (
        <EmptyState icon="✅" title={t("todo.no_tasks", lang)} hint={t("todo.add_hint", lang)} />
      ) : (
        <>
          {/* Pending */}
          {pendingTodos.length > 0 && (
            <>
              <SectionHeader title={t("todo.pending", lang)} count={pendingTodos.length} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {pendingTodos.map((item) => (
                  <TodoItemRow key={item.id} item={item} lang={lang} onToggle={(v) => updateTodo({ ...item, isCompleted: v })} onEdit={() => onEditTodo(item.id)} />
                ))}
              </div>
            </>
          )}

          {/* Completed */}
          {completedTodos.length > 0 && (
            <>
              <SectionHeader title={t("todo.completed", lang)} count={completedTodos.length} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {completedTodos.map((item) => (
                  <TodoItemRow key={item.id} item={item} lang={lang} onToggle={(v) => updateTodo({ ...item, isCompleted: v })} onEdit={() => onEditTodo(item.id)} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <FAB onClick={onAddTodo} label={t("todo.edit.add", lang)} />
    </div>
  )
}

function TodoItemRow({ item, lang, onToggle, onEdit }: { item: TodoItem; lang: "zh" | "en"; onToggle: (v: boolean) => void; onEdit: () => void }) {
  const PRIORITY_COLORS = ["#34d399", "#fbbf24", "#f87171"]

  return (
    <GlassCard style={{ padding: "12px 14px", cursor: "pointer" }} onClick={onEdit}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <GlassCheckbox checked={item.isCompleted} onChange={onToggle} color={PRIORITY_COLORS[item.priority]} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{
              fontSize: 15,
              fontWeight: 600,
              color: item.isCompleted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
              textDecoration: item.isCompleted ? "line-through" : "none",
            }}>
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
      </div>
    </GlassCard>
  )
}
