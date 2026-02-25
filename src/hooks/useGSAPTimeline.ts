import { useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import type { IKeyframe } from '@/types'
import { KEYFRAME_TOLERANCE_S } from '@/utils/constants'

// ─── useGSAPTimeline — El Master Clock del LICE ───────────────────────────────
// Sincroniza el timeline de GSAP con el tiempo real del <video>.
//
// REGLA CRÍTICA: NO usa setTimeout. Monitorea video.currentTime
// via requestAnimationFrame para garantizar sincronía perfecta.
//
// En Unity, este patrón equivale al Update() loop que compara
// Time.time con los tiempos de los keyframes del DOTween Sequence.
//
// Uso:
//   const { startTimeline, stopTimeline, seekTimeline } = useGSAPTimeline({
//     videoRef,
//     keyframes,
//     onKeyframe,
//   })

interface UseGSAPTimelineOptions {
  /** Referencia al <video> que actúa como Master Clock */
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** Keyframes del JSON a monitorear */
  keyframes: IKeyframe[]
  /** Callback que se invoca cuando se alcanza un keyframe */
  onKeyframe: (keyframe: IKeyframe) => void
  /** Si true, el timeline se inicia automáticamente cuando el video hace play */
  autoStart?: boolean
}

interface UseGSAPTimelineReturn {
  /** Timeline GSAP interno (pausado por defecto) */
  gsapTimeline: React.RefObject<gsap.core.Timeline | null>
  /** Inicia la monitorización del video */
  startTimeline: () => void
  /** Detiene la monitorización */
  stopTimeline: () => void
  /** Sincroniza el GSAP Timeline con el currentTime del video */
  seekTimeline: (time: number) => void
  /** Añade un tween al timeline interno (para animaciones visuales) */
  addTween: (tween: gsap.core.Tween, position?: number | string) => void
}

export function useGSAPTimeline({
  videoRef,
  keyframes,
  onKeyframe,
  autoStart = false,
}: UseGSAPTimelineOptions): UseGSAPTimelineReturn {
  const gsapTimeline = useRef<gsap.core.Timeline | null>(null)
  const rafRef = useRef<number | null>(null)
  const firedKeyframes = useRef<Set<number>>(new Set())
  const isRunning = useRef(false)

  // ── Crea el timeline GSAP en pausa ────────────────────────────────────────
  useEffect(() => {
    gsapTimeline.current = gsap.timeline({ paused: true })

    return () => {
      gsapTimeline.current?.kill()
      gsapTimeline.current = null
    }
  }, [])

  // ── Reinicia los keyframes disparados cuando cambian los keyframes ─────────
  useEffect(() => {
    firedKeyframes.current.clear()
  }, [keyframes])

  // ── Loop de monitoreo via requestAnimationFrame ───────────────────────────
  const monitorLoop = useCallback(() => {
    const video = videoRef.current
    if (!video || !isRunning.current) return

    const currentTime = video.currentTime

    // Sincroniza el GSAP timeline con el tiempo del video
    // Esto garantiza que si el video se laguea, las animaciones no se adelanten
    if (gsapTimeline.current) {
      gsapTimeline.current.seek(currentTime, false)
    }

    // Verifica cada keyframe que aún no ha sido disparado
    for (const keyframe of keyframes) {
      const alreadyFired = firedKeyframes.current.has(keyframe.time)

      if (!alreadyFired && Math.abs(currentTime - keyframe.time) <= KEYFRAME_TOLERANCE_S) {
        // Si el tiempo del video está dentro de la tolerancia del keyframe, disparar
        if (currentTime >= keyframe.time - KEYFRAME_TOLERANCE_S) {
          onKeyframe(keyframe)

          // Los keyframes con once: true solo se disparan una vez
          if (keyframe.once !== false) {
            firedKeyframes.current.add(keyframe.time)
          }
        }
      }
    }

    rafRef.current = requestAnimationFrame(monitorLoop)
  }, [videoRef, keyframes, onKeyframe])

  // ── Inicia la monitorización ──────────────────────────────────────────────
  const startTimeline = useCallback(() => {
    if (isRunning.current) return
    isRunning.current = true
    firedKeyframes.current.clear()
    gsapTimeline.current?.play()
    rafRef.current = requestAnimationFrame(monitorLoop)
  }, [monitorLoop])

  // ── Detiene la monitorización ─────────────────────────────────────────────
  const stopTimeline = useCallback(() => {
    isRunning.current = false
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    gsapTimeline.current?.pause()
  }, [])

  // ── Busca un tiempo específico en el GSAP timeline ────────────────────────
  const seekTimeline = useCallback((time: number) => {
    gsapTimeline.current?.seek(time, false)
  }, [])

  // ── Añade un tween al timeline interno ────────────────────────────────────
  const addTween = useCallback((tween: gsap.core.Tween, position?: number | string) => {
    gsapTimeline.current?.add(tween, position)
  }, [])

  // ── Inicio automático si autoStart = true ────────────────────────────────
  useEffect(() => {
    if (!autoStart) return

    const video = videoRef.current
    if (!video) return

    const handlePlay = () => startTimeline()
    const handlePause = () => stopTimeline()
    const handleEnded = () => stopTimeline()

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      stopTimeline()
    }
  }, [autoStart, videoRef, startTimeline, stopTimeline])

  // ── Cleanup al desmontar ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopTimeline()
    }
  }, [stopTimeline])

  return { gsapTimeline, startTimeline, stopTimeline, seekTimeline, addTween }
}
