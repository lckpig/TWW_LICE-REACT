import { useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  SWIPE_THRESHOLD_PX,
  TAP_MAX_DURATION_MS,
  TAP_THROTTLE_MS,
} from '@/utils/constants'

// ─── useInteraction — Gestos TAP y SWIPE UP ───────────────────────────────────
// Detecta:
//   - TAP: Revela la siguiente viñeta (avanza currentPanelIndex)
//   - SWIPE UP: Navega a la siguiente página
//
// En Unity, este patrón equivale a Input.GetMouseButtonDown() o
// el sistema de TouchManager que despacha eventos al GameManager.

interface UseInteractionOptions {
  /** Elemento del DOM que escucha los eventos (normalmente el contenedor de página) */
  targetRef: React.RefObject<HTMLElement | null>
  /** Callback cuando se detecta un TAP válido */
  onTap?: () => void
  /** Callback cuando se detecta un SWIPE UP válido */
  onSwipeUp?: () => void
  /** Si false, deshabilita toda la detección */
  enabled?: boolean
}

export function useInteraction({
  targetRef,
  onTap,
  onSwipeUp,
  enabled = true,
}: UseInteractionOptions) {
  const isSwipeLocked = useAppStore((s) => s.pageState.isSwipeLocked)

  // ── Estado temporal de touch ───────────────────────────────────────────────
  const touchStartY = useRef<number | null>(null)
  const touchStartTime = useRef<number | null>(null)
  const lastTapTime = useRef<number>(0)

  // ── Detección de TAP ──────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    if (!enabled || isSwipeLocked) return

    const now = Date.now()
    if (now - lastTapTime.current < TAP_THROTTLE_MS) return
    lastTapTime.current = now

    onTap?.()
  }, [enabled, isSwipeLocked, onTap])

  // ── Eventos de mouse ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = targetRef.current
    if (!el || !enabled) return

    const handleMouseDown = (e: MouseEvent) => {
      // Ignora botones secundarios
      if (e.button !== 0) return
      touchStartTime.current = Date.now()
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return
      const elapsed = touchStartTime.current ? Date.now() - touchStartTime.current : 0
      if (elapsed < TAP_MAX_DURATION_MS) handleTap()
      touchStartTime.current = null
    }

    el.addEventListener('mousedown', handleMouseDown)
    el.addEventListener('mouseup', handleMouseUp)

    return () => {
      el.removeEventListener('mousedown', handleMouseDown)
      el.removeEventListener('mouseup', handleMouseUp)
    }
  }, [targetRef, enabled, handleTap])

  // ── Eventos de touch ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = targetRef.current
    if (!el || !enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      touchStartY.current = touch.clientY
      touchStartTime.current = Date.now()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null || touchStartTime.current === null) return

      const touch = e.changedTouches[0]
      if (!touch) return

      const deltaY = touchStartY.current - touch.clientY
      const elapsed = Date.now() - touchStartTime.current

      if (Math.abs(deltaY) > SWIPE_THRESHOLD_PX) {
        // Es un SWIPE
        if (deltaY > 0 && !isSwipeLocked) {
          // SWIPE UP
          onSwipeUp?.()
        }
      } else if (elapsed < TAP_MAX_DURATION_MS && Math.abs(deltaY) < 10) {
        // Es un TAP
        handleTap()
      }

      touchStartY.current = null
      touchStartTime.current = null
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [targetRef, enabled, isSwipeLocked, onSwipeUp, handleTap])

  // ── Wheel (SWIPE UP en desktop con rueda del ratón) ───────────────────────
  useEffect(() => {
    const el = targetRef.current
    if (!el || !enabled) return

    let wheelDebounce: ReturnType<typeof setTimeout> | null = null

    const handleWheel = (e: WheelEvent) => {
      if (isSwipeLocked) return
      if (e.deltaY > 30) {
        if (wheelDebounce) return
        onSwipeUp?.()
        wheelDebounce = setTimeout(() => { wheelDebounce = null }, 800)
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: true })
    return () => {
      el.removeEventListener('wheel', handleWheel)
      if (wheelDebounce) clearTimeout(wheelDebounce)
    }
  }, [targetRef, enabled, isSwipeLocked, onSwipeUp])
}
