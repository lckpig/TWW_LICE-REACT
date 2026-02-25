// ─── HUB CENTRAL DE TIPOS DEL LICE ───────────────────────────────────────────
// Este archivo re-exporta todos los tipos del proyecto para que los consumers
// puedan importar desde '@/types' sin conocer la estructura interna.
// En Unity, cada archivo .d.ts aquí referenciado genera un namespace C# propio.

// ─── Tipos cinemáticos ────────────────────────────────────────────────────────
export type {
  ShotType,
  Angle,
  PanelType,
  EntryDirection,
  PanelVideoState,
  GlobalWeather,
  IRule180,
  IShotAnimationParams,
} from './cinematic'

// ─── Sistema de Timeline y Keyframes ─────────────────────────────────────────
export type {
  KeyframeType,
  KeyframeData,
  ISfxData,
  IOnomatopoeiaData,
  ICameraShakeData,
  IFlashData,
  IVisualControlData,
  IWeatherData,
  IAmbientVolumeData,
  IKeyframe,
  IFiredEvent,
  IPanelTimeline,
} from './timeline'

// ─── Configuración JSON ───────────────────────────────────────────────────────
export type {
  IVideoSources,
  IPacingProfile,
  IRule180Config,
  IPanelConfig,
  IPageConfig,
  IStoryManifestEntry,
  IStoryManifest,
} from './config'

// ─── Estado narrativo global (Zustand store → C# Manager Singleton) ──────────

export interface IPageState {
  /** Índice del panel activo actualmente en la página */
  currentPanelIndex: number
  /** Bloquea el SWIPE mientras hay una transición de página en curso */
  isSwipeLocked: boolean
  /** ID del panel cuyo audio tiene prioridad en este momento */
  activeAudioId: string
}

export interface IGlobalEffects {
  isShakeActive: boolean
  /** Color del flash activo, null si no hay flash */
  flashColor: string | null
  globalWeather: GlobalWeather
}

// ─── Referencia a los nodos DOM de audio/video de un panel ───────────────────
// Permite que el AudioManager manipule los elementos directamente.
export interface IPanelRef {
  panelId: string
  actionVideoEl: HTMLVideoElement | null
  loopVideoEl: HTMLVideoElement | null
  /** Elemento <audio> global si el panel tiene una pista independiente */
  globalAudioEl?: HTMLAudioElement | null
}

/** Mapa de todas las referencias registradas: panelId → IPanelRef */
export type IPanelRegistry = Map<string, IPanelRef>

// ─── Tipos de audio (retrocompatibilidad con implementación anterior) ─────────
export type AudioId = string

export interface AudioTrack {
  id: AudioId
  src: string
  loop: boolean
  volume: number
}

// ─── Re-exportación de imports necesarios para este archivo ──────────────────
import type { GlobalWeather } from './cinematic'
