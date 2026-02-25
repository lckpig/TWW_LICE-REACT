import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import type { IOnomatopoeiaData } from '@/types'
import { Z_INDEX_ONOMATOPOEIA } from '@/utils/constants'

// ─── Instancia de una onomatopeya en pantalla ─────────────────────────────────
export interface OnomatopoeiaInstance {
  id: string
  data: IOnomatopoeiaData
}

interface OnomatopoeiaProps {
  id: string
  data: IOnomatopoeiaData
  /** Callback invocado cuando la animación termina y el elemento debe eliminarse */
  onComplete: (id: string) => void
}

// ─── Onomatopoeia — Texto dinámico animado ────────────────────────────────────
// Renderiza textos como BOOM!, SPLASH!, CRACK! con animaciones GSAP.
// Se auto-destruye después de displayDuration segundos.
//
// En Unity, equivale a un TextMeshPro GameObject que DOTween anima
// con Scale + Fade y luego llama a Destroy(gameObject, delay).
export default function Onomatopoeia({ id, data, onComplete }: OnomatopoeiaProps) {
  const elRef = useRef<HTMLDivElement | null>(null)

  const {
    text,
    x,
    y,
    animation,
    fontSize = 32,
    color = '#ffffff',
    displayDuration = 1.5,
  } = data

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    // Estado inicial: invisible y comprimido
    gsap.set(el, { opacity: 0, scale: 0, x: '-50%', y: '-50%' })

    const tl = gsap.timeline({
      onComplete: () => onComplete(id),
    })

    // ── Animación de entrada según tipo ───────────────────────────────────
    switch (animation) {
      case 'bounce':
        tl.to(el, { opacity: 1, scale: 1.2, duration: 0.15, ease: 'back.out(3)' })
          .to(el, { scale: 1.0, duration: 0.1, ease: 'bounce.out' })
        break

      case 'elastic':
        tl.to(el, { opacity: 1, scale: 1.0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
        break

      case 'slam':
        tl.to(el, { opacity: 1, scale: 1.4, duration: 0.08, ease: 'power4.out' })
          .to(el, { scale: 1.0, duration: 0.15, ease: 'power2.out' })
        break

      case 'pop':
      default:
        tl.to(el, { opacity: 1, scale: 1.1, duration: 0.12, ease: 'back.out(2)' })
          .to(el, { scale: 1.0, duration: 0.08 })
        break
    }

    // ── Permanece visible por displayDuration ─────────────────────────────
    tl.to(el, { opacity: 1, duration: displayDuration - 0.3 })

    // ── Fade out ──────────────────────────────────────────────────────────
    tl.to(el, { opacity: 0, scale: 0.8, duration: 0.25, ease: 'power2.in' })

    return () => {
      tl.kill()
    }
  }, [id, animation, displayDuration, onComplete])

  return (
    <div
      ref={elRef}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        fontSize: `${fontSize}px`,
        color,
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontWeight: 900,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: Z_INDEX_ONOMATOPOEIA,
        textShadow: `
          2px 2px 0 rgba(0,0,0,0.8),
          -1px -1px 0 rgba(0,0,0,0.8),
          1px -1px 0 rgba(0,0,0,0.8),
          -1px 1px 0 rgba(0,0,0,0.8)
        `,
        willChange: 'transform, opacity',
      }}
    >
      {text}
    </div>
  )
}
