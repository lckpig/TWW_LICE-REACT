import { useEffect, useRef, useCallback } from 'react'
import { useAppStore, selectGlobalEffects } from '@/store/useAppStore'
import { Z_INDEX_GLOBAL_FX } from '@/utils/constants'

interface GlobalFXProps {
  /** Callback para registrar el ref del overlay de flash en el EffectsManager */
  flashOverlayRef?: (el: HTMLDivElement | null) => void
}

// ─── GlobalFX — Efectos visuales globales de la página ───────────────────────
// Gestiona los overlays de Flash y el canvas de partículas de clima (lluvia/nieve).
// Lee el estado del store Zustand y reacciona reactivamente.
//
// En Unity, equivale a los PostProcessing Volumes + Particle Systems
// que el EffectsManager.cs activa/desactiva.
export default function GlobalFX({ flashOverlayRef }: GlobalFXProps) {
  const globalEffects = useAppStore(selectGlobalEffects)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])

  // ── Sistema de partículas básico para lluvia/nieve ────────────────────────
  interface Particle {
    x: number
    y: number
    speed: number
    length: number
    opacity: number
    drift: number
  }

  const initParticles = useCallback((count: number, isSnow: boolean) => {
    const canvas = canvasRef.current
    if (!canvas) return

    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: isSnow ? 0.5 + Math.random() * 1 : 8 + Math.random() * 6,
      length: isSnow ? 3 : 15 + Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.5,
      drift: isSnow ? (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 0.3,
    }))
  }, [])

  const drawParticles = useCallback((isSnow: boolean) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of particlesRef.current) {
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.strokeStyle = isSnow ? '#ddeeff' : '#8ab4d4'
      ctx.lineWidth = isSnow ? 2 : 1

      if (isSnow) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.length / 2, 0, Math.PI * 2)
        ctx.fillStyle = '#ddeeff'
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x + p.drift * 2, p.y + p.length)
        ctx.stroke()
      }
      ctx.restore()

      // Avanza la partícula
      p.y += p.speed
      p.x += p.drift

      // Resetea cuando sale por abajo
      if (p.y > canvas.height) {
        p.y = -p.length
        p.x = Math.random() * canvas.width
      }
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
    }

    rafRef.current = requestAnimationFrame(() => drawParticles(isSnow))
  }, [])

  const stopParticles = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    particlesRef.current = []
  }, [])

  // ── Reacciona al cambio de clima ──────────────────────────────────────────
  useEffect(() => {
    stopParticles()

    if (globalEffects.globalWeather === 'rain') {
      initParticles(150, false)
      drawParticles(false)
    } else if (globalEffects.globalWeather === 'snow') {
      initParticles(80, true)
      drawParticles(true)
    }

    return stopParticles
  }, [globalEffects.globalWeather, initParticles, drawParticles, stopParticles])

  // ── Redimensiona el canvas cuando cambia el contenedor ────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width
        canvas.height = entry.contentRect.height
      }
    })

    const parent = canvas.parentElement
    if (parent) ro.observe(parent)

    return () => ro.disconnect()
  }, [])

  const isWeatherActive =
    globalEffects.globalWeather === 'rain' || globalEffects.globalWeather === 'snow'

  return (
    <>
      {/* Overlay del Flash (el EffectsManager lo manipula directamente via DOM) */}
      <div
        ref={flashOverlayRef ?? undefined}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: Z_INDEX_GLOBAL_FX,
          opacity: 0,
          backgroundColor: 'transparent',
          willChange: 'opacity',
        }}
      />

      {/* Canvas de partículas de clima */}
      {isWeatherActive && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: Z_INDEX_GLOBAL_FX - 1,
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </>
  )
}
