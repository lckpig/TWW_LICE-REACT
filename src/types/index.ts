// ─── Tipos base del Shot List (fuente de verdad JSON → Unity ScriptableObjects) ───

export interface Vignette {
  id: string
  /** Posición en el grid 100×100 — equivale a RectTransform Anchors en Unity */
  x: number
  y: number
  width: number
  height: number
  videoSrc?: string
  videoType: 'LOOP' | 'ACTION'
  zIndex: number
}

export interface Page {
  id: string
  index: number
  vignettes: Vignette[]
}

export interface ShotList {
  title: string
  pages: Page[]
}

// ─── Estado narrativo global (Zustand store → C# Manager Singleton) ───

export interface NarrativeState {
  engineOn: boolean
  currentPageIndex: number
  visibleVignetteIds: string[]
}

// ─── Audio ───

export type AudioId = string

export interface AudioTrack {
  id: AudioId
  src: string
  loop: boolean
  volume: number
}
