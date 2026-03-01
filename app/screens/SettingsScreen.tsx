import React, { useState, useEffect } from "react"
import { useAppStore } from "../data/store"
import { t } from "../data/i18n"
import type { AppSettings } from "../data/settings"
import { DEFAULT_SETTINGS } from "../data/settings"
import { GlassCard, GlassToggle, GlassSlider, GlassInput, GlassButton } from "../components/GlassUI"

type SettingsPage = "main" | "glass" | "general" | "data" | "account" | "about" | "appearance"

export function SettingsScreen() {
  const { state, updateSettings, login, logout, updateServerUrl, setSyncEnabled, pushToCloud, pullFromCloud, exportData, importData } = useAppStore()
  const { settings, account, isSyncing, lastSyncError } = state
  const lang = settings.language

  const [page, setPage] = useState<SettingsPage>("main")

  if (page === "glass") return <GlassEffectPage settings={settings} update={updateSettings} lang={lang} onBack={() => setPage("main")} />
  if (page === "general") return <GeneralPage settings={settings} update={updateSettings} lang={lang} onBack={() => setPage("main")} />
  if (page === "appearance") return <AppearancePage settings={settings} update={updateSettings} lang={lang} onBack={() => setPage("main")} />
  if (page === "data") return <DataPage exportData={exportData} importData={importData} lang={lang} onBack={() => setPage("main")} />
  if (page === "account") return <AccountPage settings={settings} account={account} isSyncing={isSyncing} lastSyncError={lastSyncError} login={login} logout={logout} updateServerUrl={updateServerUrl} setSyncEnabled={setSyncEnabled} pushToCloud={pushToCloud} pullFromCloud={pullFromCloud} lang={lang} onBack={() => setPage("main")} />
  if (page === "about") return <AboutPage lang={lang} onBack={() => setPage("main")} />

  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 100px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.95)", marginBottom: 6 }}>{t("settings.title", lang)}</h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>{t("settings.subtitle", lang)}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <SettingItem icon="✨" title={t("settings.glass_effect", lang)} desc={t("settings.glass_effect_desc", lang)} onClick={() => setPage("glass")} />
        <SettingItem icon="⚙️" title={t("settings.general", lang)} desc={t("settings.general_desc", lang)} onClick={() => setPage("general")} />
        <SettingItem icon="�️" title={t("settings.appearance", lang)} desc={t("settings.appearance_desc", lang)} onClick={() => setPage("appearance")} />
        <SettingItem icon="�📁" title={t("settings.data", lang)} desc={t("settings.data_desc", lang)} onClick={() => setPage("data")} />
        <SettingItem icon="☁️" title={t("settings.account", lang)} desc={t("settings.account_desc", lang)} onClick={() => setPage("account")} />
        <SettingItem icon="ℹ️" title={t("settings.about", lang)} desc={t("settings.about_desc", lang)} onClick={() => setPage("about")} />
      </div>
    </div>
  )
}

function SettingItem({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <GlassCard style={{ padding: "14px 16px", cursor: "pointer" }} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{title}</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{desc}</p>
        </div>
        <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>›</span>
      </div>
    </GlassCard>
  )
}

// ─── Glass Effect page ────────────────────────────────────────────────────────
function GlassEffectPage({ settings, update, lang, onBack }: { settings: AppSettings; update: (s: Partial<AppSettings>) => void; lang: "zh" | "en"; onBack: () => void }) {
  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 20, padding: "4px 8px 4px 0" }}>
          {t("settings.back", lang)}
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.95)" }}>{t("settings.glass_effect", lang)}</h1>
      </div>

      {/* Preview card */}
      <GlassCard style={{ padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{t("settings.preview", lang)}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{t("settings.preview_desc", lang)}</p>
      </GlassCard>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <GlassCard style={{ padding: 16 }}>
          <GlassSlider label={t("settings.blur_radius", lang)} value={settings.blurRadius} min={0} max={32} step={1} displayValue={`${settings.blurRadius}dp`} onChange={(v) => update({ blurRadius: v })} />
        </GlassCard>
        <GlassCard style={{ padding: 16 }}>
          <GlassSlider label={t("settings.lens_height", lang)} value={settings.lensHeight} min={0} max={24} step={1} displayValue={`${settings.lensHeight}dp`} onChange={(v) => update({ lensHeight: v })} />
        </GlassCard>
        <GlassCard style={{ padding: 16 }}>
          <GlassSlider label={t("settings.lens_amount", lang)} value={settings.lensAmount} min={0} max={64} step={1} displayValue={`${settings.lensAmount}dp`} onChange={(v) => update({ lensAmount: v })} />
        </GlassCard>
        <GlassCard style={{ padding: 16 }}>
          <ToggleRow label={t("settings.depth_effect", lang)} desc={t("settings.depth_desc", lang)} checked={settings.depthEffect} onChange={(v) => update({ depthEffect: v })} />
        </GlassCard>
        <GlassCard style={{ padding: 16 }}>
          <ToggleRow label={t("settings.vibrancy", lang)} desc={t("settings.vibrancy_desc", lang)} checked={settings.vibrancyEnabled} onChange={(v) => update({ vibrancyEnabled: v })} />
        </GlassCard>
        <GlassCard style={{ padding: 16 }}>
          <ToggleRow label={t("settings.chromatic", lang)} desc={t("settings.chromatic_desc", lang)} checked={settings.chromaticAberration} onChange={(v) => update({ chromaticAberration: v })} />
        </GlassCard>
        <GlassCard style={{ padding: 16 }}>
          <ToggleRow label={t("settings.frosted_glass", lang)} desc={t("settings.frosted_glass_desc", lang)} checked={settings.useFrostedGlass} onChange={(v) => update({ useFrostedGlass: v })} />
        </GlassCard>
        <GlassButton variant="ghost" onClick={() => update({ blurRadius: DEFAULT_SETTINGS.blurRadius, lensHeight: DEFAULT_SETTINGS.lensHeight, lensAmount: DEFAULT_SETTINGS.lensAmount, depthEffect: DEFAULT_SETTINGS.depthEffect, vibrancyEnabled: DEFAULT_SETTINGS.vibrancyEnabled, chromaticAberration: DEFAULT_SETTINGS.chromaticAberration, useFrostedGlass: DEFAULT_SETTINGS.useFrostedGlass })} style={{ width: "100%" }}>
          {t("settings.reset", lang)}
        </GlassButton>
      </div>
    </div>
  )
}

// ─── General settings page ────────────────────────────────────────────────────
function GeneralPage({ settings, update, lang, onBack }: { settings: AppSettings; update: (s: Partial<AppSettings>) => void; lang: "zh" | "en"; onBack: () => void }) {
  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 20, padding: "4px 8px 4px 0" }}>
          {t("settings.back", lang)}
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.95)" }}>{t("settings.general", lang)}</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Language */}
        <GlassCard style={{ padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.05em" }}>
            {t("settings.language", lang).toUpperCase()}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {(["zh", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => update({ language: l })}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 12,
                  background: settings.language === l ? "rgba(0,136,255,0.25)" : "rgba(255,255,255,0.06)",
                  border: settings.language === l ? "1px solid rgba(0,136,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  color: settings.language === l ? "#0088ff" : "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {l === "zh" ? t("settings.lang_zh", lang) : t("settings.lang_en", lang)}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Theme */}
        <GlassCard style={{ padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.05em" }}>
            {t("settings.theme", lang).toUpperCase()}
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {(["system", "light", "dark"] as const).map((m) => {
              const label = m === "system" ? t("settings.theme_system", lang) : m === "light" ? t("settings.theme_light", lang) : t("settings.theme_dark", lang)
              return (
                <button
                  key={m}
                  onClick={() => update({ themeMode: m })}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 12,
                    background: settings.themeMode === m ? "rgba(0,136,255,0.25)" : "rgba(255,255,255,0.06)",
                    border: settings.themeMode === m ? "1px solid rgba(0,136,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                    color: settings.themeMode === m ? "#0088ff" : "rgba(255,255,255,0.7)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: 16 }}>
          <ToggleRow label={t("settings.show_completed", lang)} desc={t("settings.show_completed_desc", lang)} checked={settings.showCompletedInCalendar} onChange={(v) => update({ showCompletedInCalendar: v })} />
        </GlassCard>
        <GlassCard style={{ padding: 16 }}>
          <ToggleRow label={t("settings.completion_animation", lang)} desc={t("settings.completion_animation_desc", lang)} checked={settings.completionAnimationEnabled} onChange={(v) => update({ completionAnimationEnabled: v })} />
        </GlassCard>
        <GlassCard style={{ padding: 16 }}>
          <ToggleRow label={t("settings.completion_sound", lang)} desc={t("settings.completion_sound_desc", lang)} checked={settings.completionSoundEnabled} onChange={(v) => update({ completionSoundEnabled: v })} />
        </GlassCard>
      </div>
    </div>
  )
}

// ─── Data management page ─────────────────────────────────────────────────────
function DataPage({ exportData, importData, lang, onBack }: { exportData: () => string; importData: (j: string) => boolean; lang: "zh" | "en"; onBack: () => void }) {
  const [msg, setMsg] = useState<string | null>(null)

  const handleExport = () => {
    try {
      const data = exportData()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `prettydaily-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMsg(t("settings.export_success", lang))
    } catch {
      setMsg(t("settings.export_error", lang))
    }
    setTimeout(() => setMsg(null), 3000)
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const json = ev.target?.result as string
        const ok = importData(json)
        setMsg(ok ? t("settings.import_success", lang) : t("settings.import_error", lang))
        setTimeout(() => setMsg(null), 3000)
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 20, padding: "4px 8px 4px 0" }}>
          {t("settings.back", lang)}
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.95)" }}>{t("settings.data", lang)}</h1>
      </div>

      {msg && (
        <GlassCard style={{ padding: 14, marginBottom: 12, background: "rgba(0,136,255,0.15)" }}>
          <p style={{ fontSize: 14, color: "#0088ff", fontWeight: 600 }}>{msg}</p>
        </GlassCard>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <GlassCard style={{ padding: "14px 16px", cursor: "pointer" }} onClick={handleExport}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>📤</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{t("settings.export", lang)}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t("settings.export_desc", lang)}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard style={{ padding: "14px 16px", cursor: "pointer" }} onClick={handleImport}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>📥</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{t("settings.import", lang)}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t("settings.import_desc", lang)}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

// ─── Account page ─────────────────────────────────────────────────────────────
function AccountPage({
  settings, account, isSyncing, lastSyncError,
  login, logout, updateServerUrl, setSyncEnabled, pushToCloud, pullFromCloud, lang, onBack
}: {
  settings: AppSettings
  account: { isLoggedIn: boolean; username: string; serverUrl: string; syncEnabled: boolean }
  isSyncing: boolean
  lastSyncError: string | null
  login: (token: string, username: string) => void
  logout: () => void
  updateServerUrl: (url: string) => void
  setSyncEnabled: (v: boolean) => void
  pushToCloud: () => void
  pullFromCloud: () => void
  lang: "zh" | "en"
  onBack: () => void
}) {
  const [serverUrl, setServerUrl] = useState(account.serverUrl)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      const resp = await fetch(`${serverUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      updateServerUrl(serverUrl)
      login(data.token, username)
      setMsg(t("settings.login_success", lang))
    } catch (e) {
      setMsg(`${t("settings.login_error", lang)}: ${e}`)
    }
    setTimeout(() => setMsg(null), 3000)
  }

  const handleRegister = async () => {
    try {
      const resp = await fetch(`${serverUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!resp.ok) throw new Error(await resp.text())
      setMsg(t("settings.register_success", lang))
    } catch (e) {
      setMsg(`${t("settings.login_error", lang)}: ${e}`)
    }
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 20, padding: "4px 8px 4px 0" }}>
          {t("settings.back", lang)}
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.95)" }}>{t("settings.account", lang)}</h1>
      </div>

      {msg && (
        <GlassCard style={{ padding: 14, marginBottom: 12, background: "rgba(0,136,255,0.1)" }}>
          <p style={{ fontSize: 14, color: "#0088ff", fontWeight: 600 }}>{msg}</p>
        </GlassCard>
      )}

      {lastSyncError && (
        <GlassCard style={{ padding: 14, marginBottom: 12, background: "rgba(255,68,68,0.1)" }}>
          <p style={{ fontSize: 13, color: "#ff4444" }}>{t("settings.sync_error", lang)}: {lastSyncError}</p>
        </GlassCard>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!account.isLoggedIn ? (
          <>
            <GlassCard style={{ padding: 16 }}>
              <GlassInput label={t("settings.server_url", lang)} value={serverUrl} onChange={(e) => setServerUrl((e.target as HTMLInputElement).value)} placeholder={t("settings.server_url_placeholder", lang)} />
            </GlassCard>
            <GlassCard style={{ padding: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <GlassInput label={t("settings.username", lang)} value={username} onChange={(e) => setUsername((e.target as HTMLInputElement).value)} placeholder={t("settings.username", lang)} />
                <GlassInput label={t("settings.password", lang)} type="password" value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} placeholder="••••••••" />
              </div>
            </GlassCard>
            <div style={{ display: "flex", gap: 8 }}>
              <GlassButton variant="primary" onClick={handleLogin} style={{ flex: 1 }}>{t("settings.login", lang)}</GlassButton>
              <GlassButton variant="ghost" onClick={handleRegister} style={{ flex: 1 }}>{t("settings.register", lang)}</GlassButton>
            </div>
          </>
        ) : (
          <>
            <GlassCard style={{ padding: 16 }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{t("settings.logged_in_as", lang)}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{account.username}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{account.serverUrl}</p>
            </GlassCard>
            <GlassCard style={{ padding: 16 }}>
              <ToggleRow
                label={t("settings.sync_enabled", lang)}
                desc={t("settings.sync_enabled_desc", lang)}
                checked={account.syncEnabled}
                onChange={setSyncEnabled}
              />
            </GlassCard>
            <div style={{ display: "flex", gap: 8 }}>
              <GlassButton variant="ghost" onClick={() => pushToCloud()} style={{ flex: 1 }} disabled={isSyncing}>
                {isSyncing ? t("settings.syncing", lang) : t("settings.push_sync", lang)}
              </GlassButton>
              <GlassButton variant="ghost" onClick={() => pullFromCloud()} style={{ flex: 1 }} disabled={isSyncing}>
                {isSyncing ? t("settings.syncing", lang) : t("settings.pull_sync", lang)}
              </GlassButton>
            </div>
            <GlassButton variant="danger" onClick={logout}>{t("settings.logout", lang)}</GlassButton>
          </>
        )}
      </div>
    </div>
  )
}

// ─── About page ───────────────────────────────────────────────────────────────
function AboutPage({ lang, onBack }: { lang: "zh" | "en"; onBack: () => void }) {
  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 20, padding: "4px 8px 4px 0" }}>
          {t("settings.back", lang)}
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.95)" }}>{t("settings.about", lang)}</h1>
      </div>

      <GlassCard style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.95)", marginBottom: 6 }}>PrettyDaily</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{t("settings.version", lang)} 1.0.0</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 16 }}>
          {lang === "zh" ? "漂亮的液态玻璃日常日程应用" : "A beautiful daily schedule app with Liquid Glass effects"}
        </p>
      </GlassCard>
    </div>
  )
}

// ─── Appearance page (Background & Window) ────────────────────────────────────
function AppearancePage({ settings, update, lang, onBack }: { settings: AppSettings; update: (s: Partial<AppSettings>) => void; lang: "zh" | "en"; onBack: () => void }) {
  const [platform, setPlatform] = useState<string>("")

  useEffect(() => {
    const api = (window as any).electronAPI
    if (api) api.getPlatform().then(setPlatform)
  }, [])

  const handlePickImage = async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const path = await api.pickImage()
    if (path) update({ backgroundImagePath: path })
  }

  const handleClearImage = () => {
    update({ backgroundImagePath: "" })
  }

  // Platform tip for transparency
  let platformTip = ""
  if (platform === "win32") platformTip = t("settings.window_effect_win", lang)
  else if (platform === "darwin") platformTip = t("settings.window_effect_mac", lang)
  else if (platform) platformTip = t("settings.window_effect_other", lang)

  return (
    <div style={{ height: "100vh", overflowY: "auto", padding: "24px 16px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 20, padding: "4px 8px 4px 0" }}>
          {t("settings.back", lang)}
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.95)" }}>{t("settings.appearance", lang)}</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* ── Background Image section ── */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", paddingLeft: 4 }}>
          {t("settings.bg_image", lang).toUpperCase()}
        </p>

        {/* Current image preview / placeholder */}
        <GlassCard style={{ padding: 16 }}>
          {settings.backgroundImagePath ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 64,
                  height: 48,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                🖼️
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {settings.backgroundImagePath.split(/[\\/]/).pop()}
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {settings.backgroundImagePath}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: "8px 0" }}>
              {t("settings.bg_no_image", lang)}
            </p>
          )}
        </GlassCard>

        {/* Pick / Clear buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <GlassButton onClick={handlePickImage} style={{ flex: 1 }}>
            {t("settings.bg_pick", lang)}
          </GlassButton>
          {settings.backgroundImagePath && (
            <GlassButton variant="ghost" onClick={handleClearImage} style={{ flex: 1 }}>
              {t("settings.bg_clear", lang)}
            </GlassButton>
          )}
        </div>

        {/* Opacity slider — only shown when image is set */}
        {settings.backgroundImagePath && (
          <GlassCard style={{ padding: 16 }}>
            <GlassSlider
              label={t("settings.bg_opacity", lang)}
              value={settings.backgroundImageOpacity}
              min={0.1}
              max={1}
              step={0.05}
              displayValue={`${Math.round(settings.backgroundImageOpacity * 100)}%`}
              onChange={(v) => update({ backgroundImageOpacity: v })}
            />
          </GlassCard>
        )}

        {/* ── Window Transparency section ── */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", paddingLeft: 4, marginTop: 8 }}>
          {t("settings.window_effect", lang).toUpperCase()}
        </p>

        <GlassCard style={{ padding: 16 }}>
          <ToggleRow
            label={t("settings.window_effect", lang)}
            desc={t("settings.window_effect_desc", lang)}
            checked={settings.windowTransparency}
            onChange={(v) => update({ windowTransparency: v })}
          />
        </GlassCard>

        {/* Platform tip */}
        {platformTip && (
          <GlassCard style={{ padding: 12, background: "rgba(0,136,255,0.08)", borderColor: "rgba(0,136,255,0.2)" }}>
            <p style={{ fontSize: 12, color: "rgba(0,180,255,0.8)" }}>ℹ️ {platformTip}</p>
          </GlassCard>
        )}

        {/* Overlay darkness slider — only when transparency on AND no image */}
        {settings.windowTransparency && !settings.backgroundImagePath && (
          <GlassCard style={{ padding: 16 }}>
            <GlassSlider
              label={t("settings.window_overlay", lang)}
              value={settings.windowTransparencyOverlay}
              min={0}
              max={0.7}
              step={0.05}
              displayValue={`${Math.round(settings.windowTransparencyOverlay * 100)}%`}
              onChange={(v) => update({ windowTransparencyOverlay: v })}
            />
          </GlassCard>
        )}
      </div>
    </div>
  )
}

// ─── Shared: toggle row ───────────────────────────────────────────────────────
function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{desc}</p>}
      </div>
      <GlassToggle checked={checked} onChange={onChange} />
    </div>
  )
}
