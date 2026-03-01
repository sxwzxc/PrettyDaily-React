import React, { useId, useState, useCallback } from "react"
import { argbToHex } from "../data/types"
import { displacementMap } from "@liquid/utils"

// ─── Liquid Glass SVG Filter ──────────────────────────────────────────────────
function LiquidGlassFilter({ id, scale = 40 }: { id: string; scale?: number }) {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
      <defs>
        <filter id={id} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feImage result="DISPLACEMENT_MAP" href={displacementMap} preserveAspectRatio="xMidYMid slice" />
          <feColorMatrix
            in="DISPLACEMENT_MAP"
            type="matrix"
            values="0.3 0.3 0.3 0 0  0.3 0.3 0.3 0 0  0.3 0.3 0.3 0 0  0 0 0 1 0"
            result="EDGE_INTENSITY"
          />
          <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
            <feFuncA type="discrete" tableValues="0 0.08 1" />
          </feComponentTransfer>
          <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale={-scale} xChannelSelector="R" yChannelSelector="B" result="RED_DISPLACED" />
          <feColorMatrix in="RED_DISPLACED" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="RED_CHANNEL" />
          <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale={-scale - 1} xChannelSelector="R" yChannelSelector="B" result="GREEN_DISPLACED" />
          <feColorMatrix in="GREEN_DISPLACED" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="GREEN_CHANNEL" />
          <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale={-scale - 2} xChannelSelector="R" yChannelSelector="B" result="BLUE_DISPLACED" />
          <feColorMatrix in="BLUE_DISPLACED" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="BLUE_CHANNEL" />
          <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
          <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />
          <feGaussianBlur in="RGB_COMBINED" stdDeviation="0.3" result="ABERRATED_BLURRED" />
          <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION" />
          <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN" />
          <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

interface GlassCardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
  blurRadius?: number
  lensHeight?: number
  lensAmount?: number
  depthEffect?: boolean
  vibrancyEnabled?: boolean
  chromaticAberration?: boolean
  useFrostedGlass?: boolean
  accentColor?: number  // argb
}

export function GlassCard({
  children,
  style,
  className,
  onClick,
  blurRadius = 16,
  depthEffect = true,
  vibrancyEnabled = true,
  accentColor,
}: GlassCardProps) {
  const filterId = useId()
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const accent = accentColor ? argbToHex(accentColor) : undefined

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouseOffset({
      x: ((e.clientX - rect.left - rect.width / 2) / rect.width) * 100,
      y: ((e.clientY - rect.top - rect.height / 2) / rect.height) * 100,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 })
  }, [])

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        isolation: "isolate",
        cursor: onClick ? "pointer" : undefined,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        ...style,
      }}
    >
      {/* Liquid glass SVG displacement filter */}
      <LiquidGlassFilter id={filterId} scale={35} />

      {/* Glass backdrop with liquid glass displacement (behind content) */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          zIndex: -1,
          backdropFilter: `blur(${blurRadius}px) saturate(${vibrancyEnabled ? 180 : 100}%)`,
          WebkitBackdropFilter: `blur(${blurRadius}px) saturate(${vibrancyEnabled ? 180 : 100}%)`,
          filter: `url(#${filterId})`,
          background: "rgba(255,255,255,0.06)",
          boxShadow: depthEffect
            ? `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)${accent ? `, 0 0 0 1px ${accent}33` : ""}`
            : "0 4px 16px rgba(0,0,0,0.2)",
        }}
      />

      {/* Dynamic gradient border (liquid glass highlight, above content) */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          pointerEvents: "none",
          zIndex: 2,
          padding: "1px",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          background: `linear-gradient(
            ${135 + mouseOffset.x * 1.2}deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,${0.15 + Math.abs(mouseOffset.x) * 0.006}) ${Math.max(10, 33 + mouseOffset.y * 0.3)}%,
            rgba(255,255,255,${0.38 + Math.abs(mouseOffset.x) * 0.008}) ${Math.min(90, 66 + mouseOffset.y * 0.4)}%,
            rgba(255,255,255,0) 100%
          )`,
        }}
      />

      {/* Accent color top border */}
      {accent && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: accent,
            borderRadius: "20px 20px 0 0",
            opacity: 0.9,
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      )}

      {children}
    </div>
  )
}

// ─── Priority badge ────────────────────────────────────────────────────────────
const PRIORITY_COLORS = ["transparent", "#34d399", "#fbbf24", "#f87171"]
const PRIORITY_BORDER_COLORS = ["transparent", "#059669", "#d97706", "#dc2626"]

interface PriorityBadgeProps {
  priority: number
  lang?: "zh" | "en"
}

const PRIORITY_LABELS_ZH = ["", "低", "中", "高"]
const PRIORITY_LABELS_EN = ["", "Low", "Med", "High"]

export function PriorityBadge({ priority, lang = "zh" }: PriorityBadgeProps) {
  if (priority === 0) return null
  const labels = lang === "zh" ? PRIORITY_LABELS_ZH : PRIORITY_LABELS_EN
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 7px",
        borderRadius: 99,
        background: PRIORITY_COLORS[priority] + "28",
        color: PRIORITY_COLORS[priority],
        border: `1px solid ${PRIORITY_BORDER_COLORS[priority]}44`,
        letterSpacing: "0.03em",
      }}
    >
      {labels[priority]}
    </span>
  )
}

// ─── Checkbox / Completion toggle ────────────────────────────────────────────
interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  color?: string
  size?: number
}

export function GlassCheckbox({ checked, onChange, color = "#0088ff", size = 22 }: CheckboxProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onChange(!checked)
      }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        border: checked ? "none" : `2px solid rgba(255,255,255,0.35)`,
        background: checked
          ? color
          : "rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "all 0.2s ease",
        backdropFilter: "blur(8px)",
      }}
    >
      {checked && (
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 12 10" fill="none">
          <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

// ─── Color dot ────────────────────────────────────────────────────────────────
export function ColorDot({ colorArgb, size = 10 }: { colorArgb: number; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: argbToHex(colorArgb),
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      {count != null && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "1px 6px",
            borderRadius: 99,
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {count}
        </span>
      )}
    </div>
  )
}

// ─── Floating action button ───────────────────────────────────────────────────
export function FAB({ onClick, label }: { onClick: () => void; label?: string }) {
  const filterId = useId()
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouseOffset({
      x: ((e.clientX - rect.left - rect.width / 2) / rect.width) * 100,
      y: ((e.clientY - rect.top - rect.height / 2) / rect.height) * 100,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 })
  }, [])

  return (
    <button
      onClick={onClick}
      title={label}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "fixed",
        bottom: 100,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        background: "linear-gradient(135deg, rgba(0,136,255,0.6), rgba(0,85,204,0.6))",
        border: "none",
        boxShadow: "0 8px 32px rgba(0,136,255,0.4)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        color: "white",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        overflow: "hidden",
        isolation: "isolate",
        zIndex: 100,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)"
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,136,255,0.5)"
      }}
    >
      {/* Liquid glass filter */}
      <LiquidGlassFilter id={filterId} scale={30} />
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          zIndex: -1,
          filter: `url(#${filterId})`,
          background: "rgba(0,136,255,0.15)",
        }}
      />
      {/* Gradient border */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          pointerEvents: "none",
          zIndex: 2,
          padding: "1px",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          background: `linear-gradient(
            ${135 + mouseOffset.x * 1.2}deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,${0.3 + Math.abs(mouseOffset.x) * 0.008}) 50%,
            rgba(255,255,255,0) 100%
          )`,
        }}
      />
      +
    </button>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, hint }: { icon: string; title: string; hint?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "48px 24px",
        opacity: 0.5,
      }}
    >
      <span style={{ fontSize: 48 }}>{icon}</span>
      <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{title}</span>
      {hint && <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>{hint}</span>}
    </div>
  )
}

// ─── Glass input ─────────────────────────────────────────────────────────────
interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function GlassInput({ label, style, ...props }: GlassInputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "10px 14px",
          color: "rgba(255,255,255,0.9)",
          fontSize: 15,
          outline: "none",
          backdropFilter: "blur(8px)",
          width: "100%",
          ...style,
        }}
      />
    </div>
  )
}

// ─── Glass textarea ───────────────────────────────────────────────────────────
interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function GlassTextarea({ label, style, ...props }: GlassTextareaProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "10px 14px",
          color: "rgba(255,255,255,0.9)",
          fontSize: 15,
          outline: "none",
          backdropFilter: "blur(8px)",
          resize: "vertical",
          minHeight: 80,
          fontFamily: "inherit",
          width: "100%",
          ...style,
        }}
      />
    </div>
  )
}

// ─── Glass button ─────────────────────────────────────────────────────────────
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost"
}

export function GlassButton({ variant = "ghost", style, children, ...props }: GlassButtonProps) {
  const filterId = useId()
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouseOffset({
      x: ((e.clientX - rect.left - rect.width / 2) / rect.width) * 100,
      y: ((e.clientY - rect.top - rect.height / 2) / rect.height) * 100,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 })
  }, [])

  const bg = variant === "primary"
    ? "linear-gradient(135deg, rgba(0,136,255,0.5), rgba(0,85,204,0.5))"
    : variant === "danger"
    ? "linear-gradient(135deg, rgba(255,68,68,0.5), rgba(204,34,34,0.5))"
    : "rgba(255,255,255,0.08)"

  const solidBg = variant === "primary"
    ? "linear-gradient(135deg, #0088ff, #0055cc)"
    : variant === "danger"
    ? "linear-gradient(135deg, #ff4444, #cc2222)"
    : undefined

  return (
    <button
      {...props}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        background: solidBg ?? bg,
        border: "none",
        borderRadius: 14,
        padding: "12px 20px",
        color: "white",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        backdropFilter: variant === "ghost" ? "blur(12px) saturate(180%)" : undefined,
        WebkitBackdropFilter: variant === "ghost" ? "blur(12px) saturate(180%)" : undefined,
        transition: "all 0.15s ease",
        fontFamily: "inherit",
        ...style,
      }}
    >
      {/* Liquid glass filter for ghost buttons */}
      {variant === "ghost" && (
        <>
          <LiquidGlassFilter id={filterId} scale={25} />
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 14,
              zIndex: -1,
              filter: `url(#${filterId})`,
              background: "rgba(255,255,255,0.06)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          />
        </>
      )}
      {/* Dynamic gradient border */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 14,
          pointerEvents: "none",
          zIndex: 2,
          padding: "1px",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          background: `linear-gradient(
            ${135 + mouseOffset.x * 1.2}deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,${0.2 + Math.abs(mouseOffset.x) * 0.006}) 40%,
            rgba(255,255,255,${0.45 + Math.abs(mouseOffset.x) * 0.008}) 70%,
            rgba(255,255,255,0) 100%
          )`,
        }}
      />
      {children}
    </button>
  )
}

// ─── Glass toggle ─────────────────────────────────────────────────────────────
export function GlassToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        background: checked ? "#0088ff" : "rgba(255,255,255,0.12)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: 11,
          background: "white",
          transition: "left 0.2s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  )
}

// ─── Glass slider ─────────────────────────────────────────────────────────────
interface GlassSliderProps {
  value: number
  min: number
  max: number
  step?: number
  label: string
  displayValue?: string
  onChange: (v: number) => void
}

export function GlassSlider({ value, min, max, step = 1, label, displayValue, onChange }: GlassSliderProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{label}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>
          {displayValue ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: "#0088ff",
          height: 4,
          borderRadius: 2,
        }}
      />
    </div>
  )
}
