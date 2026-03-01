import React from "react"
import { argbToHex } from "../data/types"
import type { AppSettings } from "../data/settings"

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

export function LiquidBottomTabs({
  activeTab,
  onTabChange,
  tabs,
  settings,
  accentColor = 0xff0088ff,
}: LiquidBottomTabsProps) {
  const accent = argbToHex(accentColor)

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
      {/* Background glass */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 56,
          borderRadius: 28,
          backdropFilter: `blur(${settings.blurRadius}px) saturate(${settings.vibrancyEnabled ? 180 : 100}%)`,
          WebkitBackdropFilter: `blur(${settings.blurRadius}px) saturate(${settings.vibrancyEnabled ? 180 : 100}%)`,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          padding: "0 8px",
          gap: 4,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
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
