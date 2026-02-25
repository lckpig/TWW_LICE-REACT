// ─── Re-exportaciones de utilidades de animación ─────────────────────────────
// Este archivo se mantiene por compatibilidad y como punto de acceso centralizado
// a las funciones de animación de GSAP del proyecto.
//
// La lógica de timeline sincronizado con video está en:
//   @/hooks/useGSAPTimeline.ts
//
// Las funciones de entrada de paneles están en:
//   @/utils/coordinates.ts → getEntryFromVars, getEntryToVars

export { getEntryFromVars, getEntryToVars } from '@/utils/coordinates'

import { gsap } from 'gsap'

/**
 * Crea un Timeline maestro para una página en pausa.
 * Equivale a DOTween.Sequence().SetAutoKill(false) en Unity.
 */
export function createPageTimeline(): gsap.core.Timeline {
  return gsap.timeline({ paused: true })
}

/**
 * Fade in de un elemento (entrada suave genérica).
 * Equivale a canvasGroup.DOFade(1, duration) en Unity.
 */
export function fadeIn(
  target: Element | string,
  duration = 0.4,
  delay = 0,
): gsap.core.Tween {
  return gsap.fromTo(
    target,
    { opacity: 0 },
    { opacity: 1, duration, delay, ease: 'power2.out' },
  )
}

/**
 * Fade out de un elemento.
 * Equivale a canvasGroup.DOFade(0, duration) en Unity.
 */
export function fadeOut(target: Element | string, duration = 0.3): gsap.core.Tween {
  return gsap.to(target, { opacity: 0, duration, ease: 'power2.in' })
}

/**
 * Animación de entrada completa (fade + traslación) para una viñeta.
 * @deprecated Usa directamente useGSAPTimeline + getEntryFromVars/getEntryToVars en Panel.tsx.
 */
export function animateVignetteIn(
  target: Element | string,
  delay = 0,
  duration = 0.4,
): gsap.core.Tween {
  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration, delay, ease: 'power2.out' },
  )
}

/**
 * Animación de salida para una viñeta.
 * @deprecated Usa directamente fadeOut().
 */
export function animateVignetteOut(
  target: Element | string,
  duration = 0.3,
): gsap.core.Tween {
  return fadeOut(target, duration)
}
