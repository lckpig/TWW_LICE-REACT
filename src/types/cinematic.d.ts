// ─── Tipos cinemáticos del LICE (fuente de verdad → Unity ScriptableObjects) ───
// Estos enums e interfaces se traducen 1:1 a C# en la migración a Unity.

// ─── Tipos de plano cinematográfico ───────────────────────────────────────────
export type ShotType = 'LONG' | 'MEDIUM' | 'CLOSE_UP' | 'EXTREME_CLOSE_UP'

// ─── Ángulo de cámara ─────────────────────────────────────────────────────────
export type Angle = 'NORMAL' | 'LOW' | 'HIGH' | 'PROFILE' | 'BIRD_EYE'

// ─── Tipo de panel: solo ambiente (TYPE_A) o acción + ambiente (TYPE_B) ───────
// TYPE_A: un único video en loop.
// TYPE_B: video de acción → transición imperceptible → video de loop ambiental.
export type PanelType = 'TYPE_A_LOOP' | 'TYPE_B_ACTION'

// ─── Dirección de entrada de la animación de aparición del panel ──────────────
// Se calcula automáticamente a partir de la posición del panel en el grid 100x100.
// Panel en zona izquierda → entra desde LEFT. Panel en zona central → FADE.
export type EntryDirection = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' | 'FADE' | 'SCALE'

// ─── Estado visual de un panel (para el sistema de Control Remoto) ────────────
// Permite que un keyframe de la viñeta 5 afecte visualmente a la viñeta 1.
export type PanelVideoState = 'playing' | 'stopped' | 'dimmed' | 'hidden'

// ─── Clima global de la página ────────────────────────────────────────────────
export type GlobalWeather = 'none' | 'rain' | 'snow' | 'fog' | 'dust'

// ─── Regla de los 180° ────────────────────────────────────────────────────────
// Garantiza la coherencia espacial entre panels consecutivos.
// Si un personaje mira a la derecha en el panel A, debe mantenerla en el B.
export interface IRule180 {
  axisX: 'left' | 'right' | 'neutral'
  axisY: 'up' | 'down' | 'neutral'
  /** ID del panel de referencia que establece el eje */
  referencePanel: string
}

// ─── Parámetros de animación calculados según ShotType ────────────────────────
// El ShotManager los calcula y los Panel los consumen.
export interface IShotAnimationParams {
  /** Factor de zoom en la animación de entrada (CLOSE_UP tiene más zoom) */
  zoomFactor: number
  /** Profundidad de parallax relativa al fondo */
  parallaxDepth: number
  /** Duración de la animación de entrada en segundos */
  entryDuration: number
  /** Dirección de entrada calculada */
  entryDirection: EntryDirection
}
