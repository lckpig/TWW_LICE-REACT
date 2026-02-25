// ─── Interfaces de configuración JSON del LICE ───────────────────────────────
// Estas interfaces definen la estructura estricta de los archivos JSON
// de /config. Son la "fuente de verdad" compartida entre React y Unity.
// En Unity se convierten en ScriptableObjects o clases C# deserializables.

import type { ShotType, Angle, PanelType, EntryDirection, GlobalWeather } from './cinematic'
import type { IKeyframe } from './timeline'

// ─── Fuentes de video para un panel ──────────────────────────────────────────
export interface IVideoSources {
  /** Video de ambiente en loop continuo (siempre requerido) */
  loop: string
  /** Video de acción puntual (solo en TYPE_B). Se reproduce una vez y cede al loop */
  action?: string
}

// ─── Perfil de pacing (ritmo emocional de la página) ─────────────────────────
export interface IPacingProfile {
  /** Número total de TAPs para descubrir toda la página */
  totalTaps: number
  /** Densidad emocional: 'tension' = muchos panels pequeños, 'breath' = pocos grandes */
  mood: 'tension' | 'breath' | 'action' | 'calm'
  /** Si true, el último panel tiene un cliffhanger visual que invita al SWIPE UP */
  hasCliffhanger: boolean
}

// ─── Eje de referencia para la regla de los 180° ─────────────────────────────
export interface IRule180Config {
  axisX: 'left' | 'right' | 'neutral'
  axisY: 'up' | 'down' | 'neutral'
}

// ─── Configuración de un panel individual (viñeta) ───────────────────────────
// Equivale a un ScriptableObject PanelConfig en Unity.
export interface IPanelConfig {
  id: string

  // ─ Geometría en grid 100x100 (equivale a RectTransform Anchors en Unity) ─
  x: number          // 0–100, porcentaje horizontal
  y: number          // 0–100, porcentaje vertical
  width: number      // 0–100, porcentaje del ancho total
  height: number     // 0–100, porcentaje del alto total

  // ─ Tipo cinemático ─────────────────────────────────────────────────────────
  panelType: PanelType
  shotType: ShotType
  angle: Angle

  // ─ Animación de entrada ────────────────────────────────────────────────────
  /** Si no se especifica, se calcula automáticamente desde la posición en el grid */
  entryDirection?: EntryDirection

  // ─ Videos ──────────────────────────────────────────────────────────────────
  videoSources: IVideoSources

  // ─ Timeline de eventos ─────────────────────────────────────────────────────
  keyframes: IKeyframe[]

  // ─ Z-order (si no se provee, se calcula como index + Z_INDEX_BASE) ─────────
  zIndex?: number

  // ─ Regla de los 180° (obligatorio si hay panel previo en la misma escena) ──
  rule180?: IRule180Config

  // ─ Metadatos opcionales ────────────────────────────────────────────────────
  label?: string          // Nombre descriptivo para depuración
  artNote?: string        // Nota del director de arte
}

// ─── Configuración de una página completa ────────────────────────────────────
// Equivale a un ScriptableObject PageConfig en Unity.
export interface IPageConfig {
  id: string
  index: number

  // ─ Visual ──────────────────────────────────────────────────────────────────
  backgroundColor: string    // CSS color (ej. '#0a0a0a')
  /** Relación de aspecto del container. Por defecto '9/16' para vertical */
  aspectRatio?: string

  // ─ Clima global de la página ───────────────────────────────────────────────
  initialWeather?: GlobalWeather

  // ─ Panels (viñetas) de la página ───────────────────────────────────────────
  panels: IPanelConfig[]

  // ─ Ritmo emocional ─────────────────────────────────────────────────────────
  pacingProfile: IPacingProfile

  // ─ Metadatos opcionales ────────────────────────────────────────────────────
  title?: string
  chapterIndex?: number
}

// ─── Entrada en el índice de la historia ─────────────────────────────────────
export interface IStoryManifestEntry {
  id: string
  index: number
  /** Ruta al archivo JSON de configuración de la página */
  configPath: string
  /** Thumbnail para previsualización (opcional) */
  thumbnail?: string
  title?: string
}

// ─── Manifiesto maestro de la historia (story-manifest.json) ─────────────────
// El punto de entrada que carga toda la historia.
// Equivale al GameManager en Unity que gestiona los niveles/capítulos.
export interface IStoryManifest {
  title: string
  version: string
  author?: string
  pages: IStoryManifestEntry[]
}
