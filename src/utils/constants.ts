// ─── Constantes globales del LICE ─────────────────────────────────────────────
// Centralizar aquí evita "números mágicos" en el código.
// En Unity, estas constantes se convierten en campos de un ScriptableObject
// de configuración global o en una clase estática C# de constantes.

// ─── Duraciones de animación (en segundos) ────────────────────────────────────

/** Duración de la animación de entrada de un panel al recibir TAP */
export const ENTRY_ANIMATION_DURATION = 0.8

/** Duración del crossfade de audio entre el panel anterior y el nuevo */
export const CROSSFADE_DURATION = 0.5

/** Duración del crossfade visual entre el video de acción y el de loop (TYPE_B) */
export const ACTION_LOOP_CROSSFADE = 0.1

/** Duración de la transición de salida de una página (SWIPE UP) */
export const PAGE_EXIT_DURATION = 0.6

/** Duración de la transición de entrada de una nueva página */
export const PAGE_ENTER_DURATION = 0.8

/** Delay en ms desde que empieza la animación de entrada de página hasta que aparece la viñeta 1.
 *  Debe ser >= PAGE_ENTER_DURATION * 1000 para que la página haya llegado al centro antes de que
 *  empiece la animación de la viñeta 1. */
export const PAGE_FIRST_PANEL_DELAY_MS = 900

/** Duración del Camera Shake por defecto */
export const DEFAULT_SHAKE_DURATION = 0.4

/** Duración del Flash por defecto */
export const DEFAULT_FLASH_DURATION = 0.3

// ─── Sistema de Grid ──────────────────────────────────────────────────────────

/** Tamaño del grid virtual. Todas las posiciones son 0–100 en ambos ejes */
export const GRID_SIZE = 100

/**
 * Relación de aspecto del contenedor de página (formato cómic vertical).
 * En CSS: aspect-ratio: 9 / 16.
 * En Unity: equivale a la resolución de referencia del Canvas.
 */
export const ASPECT_RATIO_W = 9
export const ASPECT_RATIO_H = 16
export const ASPECT_RATIO_CSS = `${ASPECT_RATIO_W} / ${ASPECT_RATIO_H}`

// ─── Z-Index ──────────────────────────────────────────────────────────────────

/** Offset base de z-index para panels. Panel index 0 → z-index 10 */
export const Z_INDEX_BASE = 10

/** Z-index de la capa de onomatopeyas (sobre todos los panels) */
export const Z_INDEX_ONOMATOPOEIA = 200

/** Z-index de los efectos globales (flash, shake overlay) */
export const Z_INDEX_GLOBAL_FX = 300

/** Z-index del HUD/UI de la aplicación */
export const Z_INDEX_UI = 400

// ─── Volúmenes ────────────────────────────────────────────────────────────────

/** Volumen por defecto de un panel al activarse */
export const DEFAULT_PANEL_VOLUME = 1.0

/** Volumen al que se reduce el panel anterior durante un crossfade */
export const BACKGROUND_PANEL_VOLUME = 0.0

/** Volumen de los sonidos ambientales globales (lluvia, motores) */
export const AMBIENT_VOLUME = 0.4

/** Volumen de los SFX disparados por keyframes */
export const SFX_VOLUME = 0.9

// ─── Detección de gestos ──────────────────────────────────────────────────────

/** Distancia mínima en px para que un swipe vertical sea válido */
export const SWIPE_THRESHOLD_PX = 60

/** Tiempo máximo en ms para que un toque se considere TAP (no long-press) */
export const TAP_MAX_DURATION_MS = 300

/** Tiempo mínimo entre TAPs válidos (throttle) en ms */
export const TAP_THROTTLE_MS = 100

// ─── Timing del Master Clock ──────────────────────────────────────────────────

/**
 * Tolerancia en segundos para la comparación de keyframes.
 * Si video.currentTime está dentro de este rango del keyframe.time, se dispara.
 * Evita que keyframes sean ignorados por lagueos mínimos del video.
 */
export const KEYFRAME_TOLERANCE_S = 0.05

// ─── Colores de sistema ───────────────────────────────────────────────────────

export const COLOR_FLASH_DEFAULT = 'rgba(255, 255, 255, 0.9)'
export const COLOR_BACKGROUND_DEFAULT = '#0a0a0a'
