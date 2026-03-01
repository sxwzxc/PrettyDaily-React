import React, { useId, useState, useCallback } from "react"
import { argbToHex } from "../data/types"
import type { AppSettings } from "../data/settings"
import { displacementMap } from "@liquid/utils"

export type TabId = "today" | "todo" | "calendar" | "stats" | "settings"

interface Tab {
  id: TabId
  label: string
  icon: string
}

interface LiquidBottomTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  tabs: Tab[]
  settings: AppSettings
  accentColor?: number
}

function NavGlassFilter({ id, scale = 50 }: { id: string; scale?: number }) {
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
          <feGaussianBlur in="RGB_COMBINED" stdDeviation="0.4" result="ABERRATED_BLURRED" />
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

export function LiquidBottomTabs({
  activeTab,
  onTabChange,
  tabs,
  settings,
  accentColor = 0xff0088ff,
}: LiquidBottomTabsProps) {
  const accent = argbToHex(accentColor)
  const filterId = useId()
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

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
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "0 8px",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Background glass with liquid effect */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          height: 56,
          borderRadius: 28,
          overflow: "hidden",
          isolation: "isolate",
          padding: "0 8px",
          gap: 4,
        }}
      >
        {/* Liquid glass SVG filter */}
        <NavGlassFilter id={filterId} scale={50} />

        {/* Glass backdrop */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            zIndex: -1,
            backdropFilter: `blur(${settings.blurRadius}px) saturate(${settings.vibrancyEnabled ? 180 : 100}%)`,
            WebkitBackdropFilter: `blur(${settings.blurRadius}px) saturate(${settings.vibrancyEnabled ? 180 : 100}%)`,
            filter: `url(#${filterId})`,
            background: "rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        />

        {/* Dynamic gradient border */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            pointerEvents: "none",
            padding: "1px",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            background: `linear-gradient(
              ${135 + mouseOffset.x * 1.2}deg,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,${0.18 + Math.abs(mouseOffset.x) * 0.006}) ${Math.max(10, 33 + mouseOffset.y * 0.3)}%,
              rgba(255,255,255,${0.42 + Math.abs(mouseOffset.x) * 0.008}) ${Math.min(90, 66 + mouseOffset.y * 0.4)}%,
              rgba(255,255,255,0) 100%
            )`,
            zIndex: 3,
          }}
        />

        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "0 16px",
                height: 44,
                borderRadius: 22,
                background: isActive
                  ? `${accent}22`
                  : "transparent",
                border: isActive
                  ? `1px solid ${accent}44`
                  : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
                minWidth: 64,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  lineHeight: 1,
                  filter: isActive ? "none" : "grayscale(60%)",
                  opacity: isActive ? 1 : 0.5,
                  transition: "all 0.2s ease",
                }}
              >
                {tab.icon}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? accent : "rgba(255,255,255,0.45)",
                  letterSpacing: "0.03em",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
