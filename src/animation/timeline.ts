import { gsap } from 'gsap'

// ─── Utilidades de Timeline GSAP (equivalen a DOTween Sequences en Unity) ───
// La lógica temporal aquí se convierte 1:1 cambiando únicamente la sintaxis.

/**
 * Crea un Timeline maestro para una página.
 * Equivale a `DOTween.Sequence()` en Unity.
 */
export function createPageTimeline(): gsap.core.Timeline {
  return gsap.timeline({ paused: true })
}

/**
 * Anima la entrada de una viñeta con fade + escala.
 * Equivale a: `sequence.Append(transform.DOScale(1, duration).From(0))`
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
 * Anima la salida de una viñeta.
 * Equivale a: `sequence.Append(canvasGroup.DOFade(0, duration))`
 */
export function animateVignetteOut(
  target: Element | string,
  duration = 0.3,
): gsap.core.Tween {
  return gsap.to(target, { opacity: 0, duration, ease: 'power2.in' })
}
