import { useEffect, useRef, useCallback } from 'react'
import { useAppStore, selectGlobalEffects } from '@/store/useAppStore'
import type { GlobalWeather } from '@/types'
import { Z_INDEX_GLOBAL_FX } from '@/utils/constants'

interface GlobalFXProps {
  /** Callback para registrar el ref del overlay de flash en el EffectsManager */
  flashOverlayRef?: (el: HTMLDivElement | null) => void
}

// ─── Descriptor de una partícula individual ───────────────────────────────────
interface Particle {
  x: number
  y: number
  speed: number
  length: number
  opacity: number
  drift: number
}

// ─── Configuración de partículas según tipo de clima ─────────────────────────
interface WeatherParticleConfig {
  count: number
  color: string
  lineWidth: number
  isCircle: boolean
  speedMin: number
  speedMax: number
  lengthMin: number
  lengthMax: number
  opacityMin: number
  opacityMax: number
  driftMin: number
  driftMax: number
  /** Si true, el movimiento principal es horizontal (dust) */
  horizontal: boolean
}

const WEATHER_CONFIGS: Partial<Record<GlobalWeather, WeatherParticleConfig>> = {
  rain: {
    count: 150,
    color: '#8ab4d4',
    lineWidth: 1,
    isCircle: false,
    speedMin: 8,
    speedMax: 14,
    lengthMin: 15,
    lengthMax: 25,
    opacityMin: 0.3,
    opacityMax: 0.8,
    driftMin: -0.3,
    driftMax: 0.3,
    horizontal: false,
  },
  snow: {
    count: 80,
    color: '#ddeeff',
    lineWidth: 2,
    isCircle: true,
    speedMin: 0.5,
    speedMax: 1.5,
    lengthMin: 3,
    lengthMax: 6,
    opacityMin: 0.4,
    opacityMax: 0.9,
    driftMin: -0.5,
    driftMax: 0.5,
    horizontal: false,
  },
  fog: {
    count: 35,
    color: '#b8c8d8',
    lineWidth: 1,
    isCircle: true,
    speedMin: 0.1,
    speedMax: 0.4,
    lengthMin: 40,
    lengthMax: 100,
    opacityMin: 0.05,
    opacityMax: 0.2,
    driftMin: 0.2,
    driftMax: 0.6,
    horizontal: true,
  },
  dust: {
    count: 100,
    color: '#c4a265',
    lineWidth: 1,
    isCircle: false,
    speedMin: 3,
    speedMax: 7,
    lengthMin: 4,
    lengthMax: 10,
    opacityMin: 0.2,
    opacityMax: 0.6,
    driftMin: -0.5,
    driftMax: 0.5,
    horizontal: true,
  },
}

// ─── GlobalFX — Efectos visuales globales de la página ───────────────────────
// Gestiona los overlays de Flash, niebla y el canvas de partículas de clima.
// Soporta: rain, snow, fog, dust.
//
// En Unity, equivale a los PostProcessing Volumes + Particle Systems
// que el EffectsManager.cs activa/desactiva.
export default function GlobalFX({ flashOverlayRef }: GlobalFXProps) {
  const globalEffects = useAppStore(selectGlobalEffects)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const currentWeatherRef = useRef<GlobalWeather>('none')

  // ── Inicializa el array de partículas según configuración de clima ─────────
  const initParticles = useCallback((weather: GlobalWeather) => {
    const canvas = canvasRef.current
    const cfg = WEATHER_CONFIGS[weather]
    if (!canvas || !cfg) return

    particlesRef.current = Array.from({ length: cfg.count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin),
      length: cfg.lengthMin + Math.random() * (cfg.lengthMax - cfg.lengthMin),
      opacity: cfg.opacityMin + Math.random() * (cfg.opacityMax - cfg.opacityMin),
      drift: cfg.driftMin + Math.random() * (cfg.driftMax - cfg.driftMin),
    }))
  }, [])

  // ── Loop de dibujo de partículas ──────────────────────────────────────────
  const drawParticles = useCallback((weather: GlobalWeather) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const cfg = WEATHER_CONFIGS[weather]
    if (!canvas || !ctx || !cfg) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of particlesRef.current) {
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.strokeStyle = cfg.color
      ctx.fillStyle = cfg.color
      ctx.lineWidth = cfg.lineWidth

      if (cfg.isCircle) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.length / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        if (cfg.horizontal) {
          // Dust: líneas horizontales
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.length, p.y + p.drift * 2)
        } else {
          // Rain: líneas verticales con ligero drift
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.drift * 2, p.y + p.length)
        }
        ctx.stroke()
      }
      ctx.restore()

      // Avanza la partícula según el eje principal del clima
      if (cfg.horizontal) {
        p.x += p.speed
        p.y += p.drift

        // Resetea cuando sale por la derecha
        if (p.x > canvas.width) {
          p.x = -p.length
          p.y = Math.random() * canvas.height
        }
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      } else {
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
    }

    rafRef.current = requestAnimationFrame(() => drawParticles(weather))
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
    currentWeatherRef.current = globalEffects.globalWeather

    const weather = globalEffects.globalWeather
    if (weather in WEATHER_CONFIGS) {
      initParticles(weather)
      drawParticles(weather)
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

  const isParticleWeather = globalEffects.globalWeather in WEATHER_CONFIGS
  const isFog = globalEffects.globalWeather === 'fog'

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

      {/* Overlay de niebla (fog): gradiente radial semitransparente pulsante */}
      {isFog && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: Z_INDEX_GLOBAL_FX - 2,
            background:
              'radial-gradient(ellipse at 40% 60%, rgba(160,175,190,0.35) 0%, rgba(100,115,130,0.18) 50%, transparent 80%)',
            animation: 'fogPulse 5s ease-in-out infinite',
          }}
        />
      )}

      {/* Canvas de partículas de clima (rain, snow, fog mist, dust) */}
      {isParticleWeather && (
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
