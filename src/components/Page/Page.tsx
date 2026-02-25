import { useRef, useCallback, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import Panel from '@/components/Panel/Panel'
import Onomatopoeia, { type OnomatopoeiaInstance } from '@/components/Overlays/Onomatopoeia'
import GlobalFX from '@/components/Overlays/GlobalFX'
import { useInteraction } from '@/hooks/useInteraction'
import { useAudioSync } from '@/hooks/useAudioSync'
import { useAppStore, selectCurrentPanelIndex, selectBackgroundColor } from '@/store/useAppStore'
import { effectsManager } from '@/managers/EffectsManager'
import { useNarrative } from '@/context/NarrativeContext'
import { useUI } from '@/context/UIContext'
import type { IPageConfig, IOnomatopoeiaData } from '@/types'
import { ASPECT_RATIO_CSS, PAGE_EXIT_DURATION } from '@/utils/constants'
import styles from './Page.module.css'

interface PageProps {
  config: IPageConfig
}

// ─── Page — El Orquestador de la Página Completa ─────────────────────────────
// Responsabilidades:
//   1. Renderiza todos los panels según el índice activo del store
//   2. Detecta TAP (avanza panel) y SWIPE UP (cambia página)
//   3. Aplica color de fondo y aspect-ratio 9:16
//   4. Coordina Onomatopeyas y Efectos Globales
//   5. Registra su ref en el EffectsManager para los shakes
//
// En Unity, equivale al PageController.cs que gestiona los PanelControllers
// y el GameManager recibe los eventos de tap/swipe.
export default function Page({ config }: PageProps) {
  const pageRootRef = useRef<HTMLDivElement | null>(null)
  const flashOverlayRef = useRef<HTMLDivElement | null>(null)

  const currentPanelIndex = useAppStore(selectCurrentPanelIndex)
  const backgroundColor = useAppStore(selectBackgroundColor)
  const advancePanel = useAppStore((s) => s.advancePanel)
  const activeAudioId = useAppStore((s) => s.pageState.activeAudioId)

  const { goToNextPage } = useNarrative()
  const { isMuted } = useUI()

  // ── Onomatopeyas activas ───────────────────────────────────────────────────
  const [onomatopoeias, setOnomatopoeias] = useState<OnomatopoeiaInstance[]>([])

  const handleOnomatopoeia = useCallback((data: IOnomatopoeiaData) => {
    const id = `omato_${Date.now()}_${Math.random()}`
    setOnomatopoeias((prev) => [...prev, { id, data }])
  }, [])

  const removeOnomatopoeia = useCallback((id: string) => {
    setOnomatopoeias((prev) => prev.filter((o) => o.id !== id))
  }, [])

  // ── Registra refs en managers al montar ────────────────────────────────────
  const registerRefs = useCallback((el: HTMLDivElement | null) => {
    pageRootRef.current = el
    effectsManager.registerPageRoot(el)
  }, [])

  const registerFlashOverlay = useCallback((el: HTMLDivElement | null) => {
    flashOverlayRef.current = el
    effectsManager.registerFlashOverlay(el)
  }, [])

  // ── TAP: avanza al siguiente panel ────────────────────────────────────────
  const handleTap = useCallback(() => {
    const nextIndex = currentPanelIndex + 1
    if (nextIndex >= config.panels.length) return
    advancePanel()
  }, [currentPanelIndex, config.panels.length, advancePanel])

  // ── SWIPE UP: transición a la página siguiente ────────────────────────────
  const handleSwipeUp = useCallback(() => {
    const el = pageRootRef.current
    if (!el) {
      goToNextPage()
      return
    }

    gsap.to(el, {
      y: '-100%',
      opacity: 0,
      duration: PAGE_EXIT_DURATION,
      ease: 'power2.in',
      onComplete: () => {
        goToNextPage()
        gsap.set(el, { y: 0, opacity: 1 })
      },
    })
  }, [goToNextPage])

  // ── Detección de gestos ────────────────────────────────────────────────────
  useInteraction({
    targetRef: pageRootRef,
    onTap: handleTap,
    onSwipeUp: handleSwipeUp,
  })

  // ── Auto-reveal del primer panel al cargar la página ─────────────────────
  // currentPanelIndex empieza en -1 (ningún panel visible). Este efecto avanza
  // automáticamente al panel 0 al montar, para que el usuario vea algo sin
  // necesitar un TAP previo. Se dispara solo cuando cambia la página (config.id).
  useEffect(() => {
    if (currentPanelIndex === -1 && config.panels.length > 0) {
      advancePanel()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id])

  // ── Sincronización de audio ────────────────────────────────────────────────
  useAudioSync({
    activePanelId: activeAudioId || null,
    isMuted,
  })

  return (
    <div
      ref={registerRefs}
      className={styles.page}
      data-cliffhanger={config.pacingProfile.hasCliffhanger ? 'true' : 'false'}
      style={{
        backgroundColor,
        aspectRatio: config.aspectRatio ?? ASPECT_RATIO_CSS,
      }}
    >
      {/* Panels de la página */}
      {config.panels.map((panel, index) => (
        <Panel
          key={panel.id}
          config={panel}
          panelIndex={index}
          isVisible={index <= currentPanelIndex}
          isActive={index === currentPanelIndex}
          onOnomatopoeia={handleOnomatopoeia}
        />
      ))}

      {/* Capa de onomatopeyas */}
      {onomatopoeias.map((instance) => (
        <Onomatopoeia
          key={instance.id}
          id={instance.id}
          data={instance.data}
          onComplete={removeOnomatopoeia}
        />
      ))}

      {/* Efectos globales (flash, partículas, etc.) */}
      <GlobalFX flashOverlayRef={registerFlashOverlay} />
    </div>
  )
}
