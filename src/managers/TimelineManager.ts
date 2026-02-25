import type { IKeyframe } from '@/types'
import { KEYFRAME_TOLERANCE_S } from '@/utils/constants'

// ─── TimelineManager — Coordinador Global de Timelines ───────────────────────
// Proporciona funciones puras para la lógica de keyframes que pueden ser
// usadas tanto por el hook useGSAPTimeline como en tests unitarios.
//
// Complementa al hook useGSAPTimeline.ts (que es por-panel y vive en React).
// Este Singleton gestiona el registro de timelines activos y provee
// utilidades de detección de keyframes independientes de React.
//
// En Unity, equivale al SequenceManager.cs que gestiona todos los
// DOTween Sequences activos en escena, con métodos estáticos para
// detección de eventos temporales.

type KeyframeHandler = (keyframe: IKeyframe) => void

interface ActiveTimeline {
  panelId: string
  keyframes: IKeyframe[]
  onKeyframe: KeyframeHandler
  firedTimes: Set<number>
  videoEl: HTMLVideoElement | null
  rafId: number | null
}

class TimelineManager {
  private static instance: TimelineManager
  private activeTimelines = new Map<string, ActiveTimeline>()

  private constructor() {}

  static getInstance(): TimelineManager {
    if (!TimelineManager.instance) {
      TimelineManager.instance = new TimelineManager()
    }
    return TimelineManager.instance
  }

  // ── Registra un timeline para un panel ───────────────────────────────────
  register(
    panelId: string,
    keyframes: IKeyframe[],
    videoEl: HTMLVideoElement | null,
    onKeyframe: KeyframeHandler,
  ): void {
    this.unregister(panelId)

    const timeline: ActiveTimeline = {
      panelId,
      keyframes,
      onKeyframe,
      firedTimes: new Set(),
      videoEl,
      rafId: null,
    }

    this.activeTimelines.set(panelId, timeline)
  }

  // ── Inicia la monitorización via RAF ─────────────────────────────────────
  start(panelId: string): void {
    const tl = this.activeTimelines.get(panelId)
    if (!tl) return

    tl.firedTimes.clear()
    this.tick(panelId)
  }

  // ── Loop de monitoreo ─────────────────────────────────────────────────────
  private tick(panelId: string): void {
    const tl = this.activeTimelines.get(panelId)
    if (!tl || !tl.videoEl) return

    const currentTime = tl.videoEl.currentTime
    this.checkKeyframes(tl, currentTime)

    tl.rafId = requestAnimationFrame(() => this.tick(panelId))
  }

  // ── Lógica pura de detección de keyframes (reutilizable en tests) ─────────
  checkKeyframes(tl: ActiveTimeline, currentTime: number): void {
    for (const keyframe of tl.keyframes) {
      if (tl.firedTimes.has(keyframe.time)) continue

      if (
        currentTime >= keyframe.time - KEYFRAME_TOLERANCE_S &&
        currentTime <= keyframe.time + KEYFRAME_TOLERANCE_S
      ) {
        tl.onKeyframe(keyframe)

        if (keyframe.once !== false) {
          tl.firedTimes.add(keyframe.time)
        }
      }
    }
  }

  // ── Detiene la monitorización de un panel ─────────────────────────────────
  stop(panelId: string): void {
    const tl = this.activeTimelines.get(panelId)
    if (!tl) return

    if (tl.rafId !== null) {
      cancelAnimationFrame(tl.rafId)
      tl.rafId = null
    }
  }

  // ── Elimina el registro de un panel ──────────────────────────────────────
  unregister(panelId: string): void {
    this.stop(panelId)
    this.activeTimelines.delete(panelId)
  }

  // ── Detiene todos los timelines activos (cambio de página) ───────────────
  stopAll(): void {
    this.activeTimelines.forEach((_, panelId) => this.stop(panelId))
  }

  // ── Libera todos los timelines ────────────────────────────────────────────
  disposeAll(): void {
    this.stopAll()
    this.activeTimelines.clear()
  }

  // ── Utilidades de keyframes (funciones puras) ────────────────────────────

  /**
   * Dado un conjunto de keyframes y un tiempo, devuelve los que deben dispararse.
   * Función pura — no tiene efectos secundarios.
   * Equivale a un método utilitario estático en Unity: TimelineUtils.GetFiredKeys(time, keyframes).
   */
  static getKeyframesAtTime(
    keyframes: IKeyframe[],
    currentTime: number,
    alreadyFired: Set<number>,
    tolerance = KEYFRAME_TOLERANCE_S,
  ): IKeyframe[] {
    return keyframes.filter((kf) => {
      if (alreadyFired.has(kf.time)) return false
      return (
        currentTime >= kf.time - tolerance &&
        currentTime <= kf.time + tolerance
      )
    })
  }

  /**
   * Ordena keyframes por tiempo ascendente.
   * Equivale a Sort() en una lista de C#.
   */
  static sortKeyframes(keyframes: IKeyframe[]): IKeyframe[] {
    return [...keyframes].sort((a, b) => a.time - b.time)
  }

  /**
   * Valida que todos los keyframes de una lista tengan tiempos positivos
   * y tipos válidos. Útil en el EditorMode de Unity.
   */
  static validateKeyframes(keyframes: IKeyframe[]): string[] {
    const errors: string[] = []
    const validTypes = ['sfx', 'onomatopoeia', 'cameraShake', 'flash', 'visualControl', 'weather', 'ambientVolume']

    keyframes.forEach((kf, i) => {
      if (kf.time < 0) errors.push(`Keyframe[${i}]: time negativo (${kf.time})`)
      if (!validTypes.includes(kf.type)) errors.push(`Keyframe[${i}]: tipo desconocido (${kf.type})`)
      if (!kf.data) errors.push(`Keyframe[${i}]: sin datos`)
    })

    return errors
  }
}

export const timelineManager = TimelineManager.getInstance()
export { TimelineManager }
