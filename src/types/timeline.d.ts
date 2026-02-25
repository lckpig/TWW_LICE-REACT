// ─── Sistema de Keyframes y Timelines del LICE ───────────────────────────────
// El TimelineManager lee estos tipos y los ejecuta en sincronía con el video.
// Equivale al sistema de DOTween Sequences en Unity (C#).

import type { PanelVideoState, GlobalWeather } from './cinematic'

// ─── Tipos de eventos que puede disparar un keyframe ─────────────────────────
export type KeyframeType =
  | 'sfx'           // Reproducir un SFX puntual (explosión, impacto)
  | 'onomatopoeia'  // Mostrar texto animado (BOOM!, SPLASH!, CRACK!)
  | 'cameraShake'   // Vibración de la pantalla entera
  | 'flash'         // Destello de luz sobre la página
  | 'visualControl' // Control Remoto: afectar el estado visual de otro panel
  | 'weather'       // Activar/desactivar clima global (lluvia, nieve)
  | 'ambientVolume' // Ajustar volumen de un sonido ambiental en otro panel

// ─── Datos específicos por tipo de keyframe ───────────────────────────────────

export interface ISfxData {
  audioId: string
  volume?: number
}

export interface IOnomatopoeiaData {
  text: string
  /** Posición relativa al panel en % (0–100) */
  x: number
  y: number
  /** Estilo de animación de entrada */
  animation: 'bounce' | 'elastic' | 'pop' | 'slam'
  fontSize?: number
  color?: string
  /** Duración en pantalla en segundos antes de desaparecer */
  displayDuration?: number
}

export interface ICameraShakeData {
  intensity: number    // 1–10
  duration: number     // segundos
  axis: 'both' | 'x' | 'y'
}

export interface IFlashData {
  color: string        // CSS color (ej. '#ffffff', 'rgba(255,255,0,0.8)')
  duration: number     // segundos para el ciclo completo (flash + fade)
}

export interface IVisualControlData {
  /** ID del panel objetivo que recibirá el cambio */
  targetPanelId: string
  videoState: PanelVideoState
  /** Filtro CSS opcional a aplicar (ej. 'brightness(0.3)' para apagar luz) */
  cssFilter?: string
}

export interface IWeatherData {
  weather: GlobalWeather
  /** Transición en segundos */
  transitionDuration?: number
}

export interface IAmbientVolumeData {
  targetPanelId: string
  volume: number       // 0.0 – 1.0
  fadeDuration: number // segundos
}

// ─── Tipo discriminado del dato del keyframe según su tipo ───────────────────
export type KeyframeData =
  | ISfxData
  | IOnomatopoeiaData
  | ICameraShakeData
  | IFlashData
  | IVisualControlData
  | IWeatherData
  | IAmbientVolumeData

// ─── Keyframe: la unidad mínima del Timeline ─────────────────────────────────
export interface IKeyframe {
  /** Segundo exacto del video en el que se dispara este evento */
  time: number
  type: KeyframeType
  data: KeyframeData
  /** Si true, el evento solo se dispara una vez aunque el video haga loop */
  once?: boolean
}

// ─── Evento ya ejecutado (para evitar re-disparos en bucles) ─────────────────
export interface IFiredEvent {
  keyframe: IKeyframe
  firedAtTime: number
}

// ─── Descriptor de un timeline completo de un panel ─────────────────────────
export interface IPanelTimeline {
  panelId: string
  keyframes: IKeyframe[]
}
