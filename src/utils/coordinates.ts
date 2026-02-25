// ─── Sistema de Coordenadas del Grid 100x100 ─────────────────────────────────
// Convierte las posiciones del JSON (0–100) a estilos CSS absolutos.
// En Unity, estas funciones equivalen al cálculo de Anchors en RectTransform.

import type { EntryDirection } from '@/types'
import type { IPanelConfig } from '@/types'
import { GRID_SIZE, Z_INDEX_BASE } from './constants'

// ─── Conversión Grid → CSS ────────────────────────────────────────────────────

/**
 * Convierte una coordenada del grid (0–100) al string CSS de porcentaje.
 * El panel se posiciona en un contenedor con position: relative.
 */
export function gridToPercent(value: number): string {
  return `${(value / GRID_SIZE) * 100}%`
}

/**
 * Genera el objeto de estilos CSS inline para posicionar un panel
 * de forma absoluta dentro del contenedor de página.
 *
 * Equivale a configurar los Anchors de un RectTransform en Unity.
 */
export function getPanelStyle(
  panel: Pick<IPanelConfig, 'x' | 'y' | 'width' | 'height' | 'zIndex'>,
  panelIndex: number,
): React.CSSProperties {
  return {
    position: 'absolute',
    left: gridToPercent(panel.x),
    top: gridToPercent(panel.y),
    width: gridToPercent(panel.width),
    height: gridToPercent(panel.height),
    zIndex: panel.zIndex ?? panelIndex + Z_INDEX_BASE,
  }
}

// ─── Cálculo automático de EntryDirection ─────────────────────────────────────

/**
 * Calcula la dirección de entrada de un panel basándose en su posición
 * en el grid. La lógica espacial es:
 *
 *   - Panel en tercio izquierdo  (x < 33)   → entra desde LEFT
 *   - Panel en tercio derecho    (x > 67)   → entra desde RIGHT
 *   - Panel en zona superior     (y < 25)   → entra desde TOP
 *   - Panel en zona inferior     (y > 75)   → entra desde BOTTOM
 *   - Panel en zona central                 → FADE (aparición suave)
 *
 * Si el panel tiene entryDirection explícito en el JSON, ese valor tiene prioridad.
 */
export function computeEntryDirection(
  panel: Pick<IPanelConfig, 'x' | 'y' | 'width' | 'entryDirection'>,
): EntryDirection {
  if (panel.entryDirection) return panel.entryDirection

  const centerX = panel.x + panel.width / 2

  if (centerX < 33) return 'LEFT'
  if (centerX > 67) return 'RIGHT'
  if (panel.y < 25) return 'TOP'
  if (panel.y > 75) return 'BOTTOM'
  return 'FADE'
}

// ─── Transformaciones GSAP para animación de entrada ─────────────────────────

/**
 * Devuelve el estado inicial (from) de la animación de entrada según dirección.
 * Usado por GSAP: gsap.fromTo(element, getEntryFromVars(dir), getEntryToVars())
 *
 * Equivale al estado inicial de un DOTween Sequence en Unity.
 */
export function getEntryFromVars(direction: EntryDirection): gsap.TweenVars {
  const OFFSET = '40px'

  switch (direction) {
    case 'LEFT':   return { opacity: 0, x: `-${OFFSET}` }
    case 'RIGHT':  return { opacity: 0, x: OFFSET }
    case 'TOP':    return { opacity: 0, y: `-${OFFSET}` }
    case 'BOTTOM': return { opacity: 0, y: OFFSET }
    case 'SCALE':  return { opacity: 0, scale: 0.85 }
    case 'FADE':
    default:       return { opacity: 0 }
  }
}

/**
 * Devuelve el estado final (to) de la animación de entrada.
 * Siempre es la posición natural del elemento.
 */
export function getEntryToVars(duration: number, ease = 'power2.out'): gsap.TweenVars {
  return {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration,
    ease,
  }
}

// ─── Z-Index dinámico ─────────────────────────────────────────────────────────

/**
 * Calcula el z-index de un panel a partir de su índice en la página.
 * El panel 0 tiene z-index Z_INDEX_BASE (10), el panel 1 tiene 11, etc.
 * Garantiza que el panel activo siempre tape a los anteriores.
 */
export function computeZIndex(panelIndex: number, explicitZIndex?: number): number {
  return explicitZIndex ?? panelIndex + Z_INDEX_BASE
}

// ─── Detección de zona en el grid ────────────────────────────────────────────

/** Devuelve true si el panel está principalmente en la mitad izquierda del grid */
export function isLeftHalf(panel: Pick<IPanelConfig, 'x' | 'width'>): boolean {
  return panel.x + panel.width / 2 < GRID_SIZE / 2
}

/** Devuelve true si el panel está principalmente en la mitad derecha del grid */
export function isRightHalf(panel: Pick<IPanelConfig, 'x' | 'width'>): boolean {
  return panel.x + panel.width / 2 > GRID_SIZE / 2
}
