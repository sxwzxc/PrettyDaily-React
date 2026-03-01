// ScheduleItem - calendar event model
export interface ScheduleItem {
  id: number                  // Date.now() as id
  title: string
  description: string
  startTimeMillis: number
  endTimeMillis: number
  isCompleted: boolean
  colorArgb: number           // e.g. 0xff0088ff
  reminderMinutesBefore: number | null  // null=none, 0/5/10/15/30/60
  recurrenceRule: string | null         // null/"daily"/"weekly"/"monthly"/"yearly"
  priority: number            // 0=none, 1=low, 2=medium, 3=high
}

export function createScheduleItem(partial: Partial<ScheduleItem> & { title: string; startTimeMillis: number; endTimeMillis: number }): ScheduleItem {
  return {
    id: Date.now(),
    description: "",
    isCompleted: false,
    colorArgb: 0xff0088ff,
    reminderMinutesBefore: null,
    recurrenceRule: null,
    priority: 0,
    ...partial,
  }
}

// TodoItem - task model
export interface TodoItem {
  id: number
  title: string
  description: string
  dueDateMillis: number | null
  isCompleted: boolean
  priority: number  // 0=low, 1=medium, 2=high
}

export function createTodoItem(partial: Partial<TodoItem> & { title: string }): TodoItem {
  return {
    id: Date.now(),
    description: "",
    dueDateMillis: null,
    isCompleted: false,
    priority: 1,
    ...partial,
  }
}

// Color palette for schedule items
export const SCHEDULE_COLORS: number[] = [
  0xff0088ff, // Blue
  0xff00c896, // Teal
  0xffff6b6b, // Red
  0xffff9f40, // Orange
  0xffffffb3,  // Yellow
  0xffa78bfa, // Purple
  0xffec4899, // Pink
  0xff34d399, // Green
]

export function argbToHex(argb: number): string {
  const r = (argb >> 16) & 0xff
  const g = (argb >> 8) & 0xff
  const b = argb & 0xff
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

export function hexToArgb(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0xff000000 | (r << 16) | (g << 8) | b) >>> 0
}

// Priority labels
export const PRIORITY_LABELS = {
  zh: ["无", "低", "中", "高"],
  en: ["None", "Low", "Medium", "High"],
}

// Recurrence labels
export const RECURRENCE_OPTIONS = [
  { value: null, zh: "不重复", en: "No repeat" },
  { value: "daily", zh: "每天", en: "Daily" },
  { value: "weekly", zh: "每周", en: "Weekly" },
  { value: "monthly", zh: "每月", en: "Monthly" },
  { value: "yearly", zh: "每年", en: "Yearly" },
]

// Reminder labels
export const REMINDER_OPTIONS = [
  { value: null, zh: "无提醒", en: "No reminder" },
  { value: 0, zh: "事件开始时", en: "At event time" },
  { value: 5, zh: "5 分钟前", en: "5 minutes before" },
  { value: 10, zh: "10 分钟前", en: "10 minutes before" },
  { value: 15, zh: "15 分钟前", en: "15 minutes before" },
  { value: 30, zh: "30 分钟前", en: "30 minutes before" },
  { value: 60, zh: "1 小时前", en: "1 hour before" },
]
