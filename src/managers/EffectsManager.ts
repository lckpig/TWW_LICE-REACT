import { gsap } from 'gsap'
import { useAppStore } from '@/store/useAppStore'
import type { ICameraShakeData, IFlashData, GlobalWeather } from '@/types'
import {
  DEFAULT_SHAKE_DURATION,
  DEFAULT_FLASH_DURATION,
  COLOR_FLASH_DEFAULT,
} from '@/utils/constants'

// ─── EffectsManager — Lanzador de efectos visuales globales ──────────────────
// Gestiona Camera Shake, Flash y cambios de clima global.
// Opera sobre el elemento raíz de la página (registrado externamente)
// y sobre el store de Zustand para actualizar estados reactivos.
//
// En Unity, equivale al CinemachineImpulse para el Shake y a
// un CanvasGroup con DOFade para el Flash.

class EffectsManager {
  private static instance: EffectsManager

  /** Elemento del DOM que representa el contenedor de la página actual */
  private pageRootEl: HTMLElement | null = null

  private shakeTimeline: gsap.core.Timeline | null = null
  private flashTween: gsap.core.Tween | null = null
  private flashOverlayEl: HTMLElement | null = null

  private constructor() {}

  static getInstance(): EffectsManager {
    if (!EffectsManager.instance) {
      EffectsManager.instance = new EffectsManager()
    }
    return EffectsManager.instance
  }

  // ── Registro de elementos del DOM ─────────────────────────────────────────
  registerPageRoot(el: HTMLElement | null): void {
    this.pageRootEl = el
  }

  registerFlashOverlay(el: HTMLElement | null): void {
    this.flashOverlayEl = el
  }

  // ── Camera Shake ──────────────────────────────────────────────────────────
  // Equivale a CinemachineImpulseSource.GenerateImpulse() en Unity.
  shake(params: ICameraShakeData = { intensity: 5, duration: DEFAULT_SHAKE_DURATION, axis: 'both' }): void {
    if (!this.pageRootEl) return

    this.shakeTimeline?.kill()

    const { intensity, duration, axis } = params
    const px = intensity * 1.5
    const tl = gsap.timeline({
      onStart: () => useAppStore.getState().triggerShake(true),
      onComplete: () => {
        useAppStore.getState().triggerShake(false)
        gsap.set(this.pageRootEl!, { x: 0, y: 0 })
      },
    })

    const xVars = axis === 'y' ? {} : { x: `+=${px}` }
    const yVars = axis === 'x' ? {} : { y: `+=${px}` }

    const steps = Math.max(4, Math.floor(duration / 0.05))
    for (let i = 0; i < steps; i++) {
      const sign = i % 2 === 0 ? 1 : -1
      tl.to(this.pageRootEl, {
        ...(axis !== 'y' ? { x: sign * px * (1 - i / steps) } : {}),
        ...(axis !== 'x' ? { y: sign * px * 0.5 * (1 - i / steps) } : {}),
        duration: duration / steps,
        ease: 'none',
        overwrite: false,
      })
    }

    // Silencia advertencias de TypeScript sobre variables no usadas
    void xVars
    void yVars

    this.shakeTimeline = tl
  }

  // ── Flash ─────────────────────────────────────────────────────────────────
  // Equivale a Image.DOColor(flashColor, duration).Then(DOColor(transparent)) en Unity.
  flash(params: IFlashData = { color: COLOR_FLASH_DEFAULT, duration: DEFAULT_FLASH_DURATION }): void {
    const overlay = this.flashOverlayEl
    if (!overlay) return

    this.flashTween?.kill()

    const { color, duration } = params
    useAppStore.getState().setFlash(color)

    gsap.set(overlay, { backgroundColor: color, opacity: 1 })

    this.flashTween = gsap.to(overlay, {
      opacity: 0,
      duration: duration * 0.7,
      delay: duration * 0.3,
      ease: 'power2.in',
      onComplete: () => {
        useAppStore.getState().setFlash(null)
        gsap.set(overlay, { backgroundColor: 'transparent' })
      },
    })
  }

  // ── Clima Global ──────────────────────────────────────────────────────────
  // El componente GlobalFX.tsx escucha el store y renderiza el canvas de partículas.
  setWeather(weather: GlobalWeather): void {
    useAppStore.getState().setGlobalWeather(weather)
  }

  transitionWeather(weather: GlobalWeather, _transitionDuration = 1.0): void {
    useAppStore.getState().setGlobalWeather(weather)
  }

  // ── Limpieza ──────────────────────────────────────────────────────────────
  dispose(): void {
    this.shakeTimeline?.kill()
    this.flashTween?.kill()
    this.shakeTimeline = null
    this.flashTween = null
    this.pageRootEl = null
    this.flashOverlayEl = null
  }
}

export const effectsManager = EffectsManager.getInstance()
