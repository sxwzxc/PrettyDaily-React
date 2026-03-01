import type { Language } from "./i18n"

export interface AppSettings {
  // Glass effect
  blurRadius: number          // 0–32, default 16
  lensHeight: number          // 0–24, default 16
  lensAmount: number          // 0–64, default 32
  depthEffect: boolean
  vibrancyEnabled: boolean
  chromaticAberration: boolean
  useFrostedGlass: boolean

  // App
  language: Language
  themeMode: "system" | "light" | "dark"
  showCompletedInCalendar: boolean
  completionAnimationEnabled: boolean
  completionSoundEnabled: boolean

  // Background & Window
  backgroundImagePath: string      // absolute path, "" = none
  backgroundImageOpacity: number   // 0.0–1.0, default 0.85
  windowTransparency: boolean      // enable Acrylic (Win) / Vibrancy (Mac)
  windowTransparencyOverlay: number // dark overlay 0.0–0.7, default 0.35
}

export const DEFAULT_SETTINGS: AppSettings = {
  blurRadius: 16,
  lensHeight: 16,
  lensAmount: 32,
  depthEffect: true,
  vibrancyEnabled: true,
  chromaticAberration: false,
  useFrostedGlass: false,
  language: "zh",
  themeMode: "system",
  showCompletedInCalendar: true,
  completionAnimationEnabled: true,
  completionSoundEnabled: true,

  backgroundImagePath: "",
  backgroundImageOpacity: 0.85,
  windowTransparency: false,
  windowTransparencyOverlay: 0.35,
}

export interface AccountSettings {
  isLoggedIn: boolean
  username: string
  token: string
  serverUrl: string
  syncEnabled: boolean
}

export const DEFAULT_ACCOUNT: AccountSettings = {
  isLoggedIn: false,
  username: "",
  token: "",
  serverUrl: "",
  syncEnabled: false,
}
