import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import VideoPlayer, { type VideoPlayerHandle } from './VideoPlayer'
import { useGSAPTimeline } from '@/hooks/useGSAPTimeline'
import { useAppStore, selectPanelOverride } from '@/store/useAppStore'
import { audioManager } from '@/managers/AudioManager'
import { effectsManager } from '@/managers/EffectsManager'
import { sfxManager } from '@/managers/SfxManager'
import { shotManager } from '@/managers/ShotManager'
import { computeEntryDirection, getPanelStyle, getEntryFromVars, getEntryToVars } from '@/utils/coordinates'
import type { IPanelConfig, IKeyframe } from '@/types'
import type {
  IOnomatopoeiaData,
  ICameraShakeData,
  IFlashData,
  IVisualControlData,
  IWeatherData,
  IAmbientVolumeData,
  ISfxData,
} from '@/types'
import { ACTION_LOOP_CROSSFADE } from '@/utils/constants'
import styles from './Panel.module.css'

interface PanelProps {
  config: IPanelConfig
  panelIndex: number
  isVisible: boolean
  isActive: boolean
  /** Callback para notificar al Page que ha aparecido un keyframe de onomatopeya */
  onOnomatopoeia?: (data: IOnomatopoeiaData) => void
}

// ─── Panel — La Unidad Mínima de Acción ──────────────────────────────────────
// Implementa la máquina de estados:
//   PRE-MOUNT → MOUNTED → ACTIVE → (TYPE_B: THE_SWITCH)
//
// En Unity, equivale al PanelController.cs que gestiona los
// VideoPlayer components y los DOTween animations de entrada.
export default function Panel({
  config,
  panelIndex,
  isVisible,
  isActive,
  onOnomatopoeia,
}: PanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const actionVideoRef = useRef<VideoPlayerHandle | null>(null)
  const loopVideoRef = useRef<VideoPlayerHandle | null>(null)

  const registerPanelRef = useAppStore((s) => s.registerPanelRef)
  const unregisterPanelRef = useAppStore((s) => s.unregisterPanelRef)
  const updatePanelOverride = useAppStore((s) => s.updatePanelOverride)
  const panelOverride = useAppStore(selectPanelOverride(config.id))

  const hasAction = config.panelType === 'TYPE_B_ACTION' && !!config.videoSources.action
  const hasSwitched = useRef(false)

  // ── Registra los nodos de video en el panelRegistry del store ───────────────
  useEffect(() => {
    registerPanelRef({
      panelId: config.id,
      actionVideoEl: actionVideoRef.current?.videoEl ?? null,
      loopVideoEl: loopVideoRef.current?.videoEl ?? null,
    })

    return () => unregisterPanelRef(config.id)
  }, [config.id, registerPanelRef, unregisterPanelRef])

  // ── Calcula parámetros cinemáticos ──────────────────────────────────────────
  const entryDirection = computeEntryDirection(config)
  const animParams = shotManager.getAnimationParams(
    config.shotType,
    config.angle,
    entryDirection,
    panelIndex,
  )

  // ── Keyframe handler — El Bus de Eventos ────────────────────────────────────
  const handleKeyframe = useCallback(
    (keyframe: IKeyframe) => {
      switch (keyframe.type) {
        case 'sfx': {
          const sd = keyframe.data as ISfxData
          sfxManager.play(sd.audioId, sd.volume)
          break
        }
        case 'cameraShake':
          effectsManager.shake(keyframe.data as ICameraShakeData)
          break
        case 'flash':
          effectsManager.flash(keyframe.data as IFlashData)
          break
        case 'onomatopoeia':
          onOnomatopoeia?.(keyframe.data as IOnomatopoeiaData)
          break
        case 'weather': {
          const wd = keyframe.data as IWeatherData
          effectsManager.transitionWeather(wd.weather, wd.transitionDuration)
          break
        }
        case 'visualControl': {
          const vcd = keyframe.data as IVisualControlData
          updatePanelOverride(vcd.targetPanelId, {
            videoState: vcd.videoState,
            cssFilter: vcd.cssFilter ?? null,
          })
          break
        }
        case 'ambientVolume': {
          const avd = keyframe.data as IAmbientVolumeData
          audioManager.setVolumeFaded(avd.targetPanelId, avd.volume, avd.fadeDuration)
          break
        }
      }
    },
    [onOnomatopoeia, updatePanelOverride],
  )

  // ── GSAP Timeline del panel (sincronizado con el video activo) ───────────────
  const masterVideoRef = useRef<HTMLVideoElement | null>(null)

  const { startTimeline, stopTimeline } = useGSAPTimeline({
    videoRef: masterVideoRef,
    keyframes: config.keyframes,
    onKeyframe: handleKeyframe,
  })

  // ── Animación de entrada cuando el panel se hace visible ──────────────────
  useEffect(() => {
    const el = panelRef.current
    if (!el || !isVisible) return

    gsap.fromTo(
      el,
      getEntryFromVars(entryDirection),
      getEntryToVars(animParams.entryDuration),
    )
  }, [isVisible, entryDirection, animParams.entryDuration])

  // ── Activa la reproducción cuando el panel se convierte en el activo ───────
  useEffect(() => {
    if (!isActive) {
      stopTimeline()
      return
    }

    hasSwitched.current = false

    if (hasAction && config.videoSources.action) {
      // TYPE_B: inicia con el video de acción
      void actionVideoRef.current?.playFromStart()
      masterVideoRef.current = actionVideoRef.current?.videoEl ?? null
    } else {
      // TYPE_A: inicia directamente con el video de loop
      void loopVideoRef.current?.playFromStart()
      masterVideoRef.current = loopVideoRef.current?.videoEl ?? null
    }

    startTimeline()
    audioManager.bringPanelToFront(config.id)
  }, [isActive, hasAction, config.videoSources.action, config.id, startTimeline, stopTimeline])

  // ── THE SWITCH: acción → loop cuando el video de acción termina ────────────
  const handleActionEnded = useCallback(() => {
    if (hasSwitched.current) return
    hasSwitched.current = true

    const loopEl = loopVideoRef.current?.videoEl
    const actionEl = actionVideoRef.current?.videoEl

    if (!loopEl) return

    void loopEl.play()

    // Crossfade visual imperceptible (0.1s)
    gsap.to(actionEl ?? {}, { opacity: 0, duration: ACTION_LOOP_CROSSFADE })
    gsap.to(loopEl, { opacity: 1, duration: ACTION_LOOP_CROSSFADE })

    // El Master Clock pasa a monitorizar el video de loop
    masterVideoRef.current = loopEl
  }, [])

  // ── Control Remoto: reacciona a los overrides del store ─────────────────────
  const panelEl = panelRef.current
  useEffect(() => {
    if (!panelOverride || !panelEl) return

    if (panelOverride.cssFilter) {
      panelEl.style.filter = panelOverride.cssFilter
    }

    if (panelOverride.videoState === 'stopped') {
      actionVideoRef.current?.pause()
      loopVideoRef.current?.pause()
    }

    if (panelOverride.videoState === 'hidden') {
      panelEl.style.opacity = '0'
    }
  }, [panelOverride, panelEl])

  // ── Estilos de posición desde el grid 100x100 ────────────────────────────
  const panelStyle = getPanelStyle(config, panelIndex)

  if (!isVisible) return null

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      style={panelStyle}
      data-panel-id={config.id}
      data-shot-type={config.shotType}
    >
      {/* Video de loop (TYPE_A: único. TYPE_B: debajo de action, inicialmente invisible) */}
      <div
        className={styles.videoLayer}
        style={{ opacity: hasAction ? 0 : 1 }}
      >
        <VideoPlayer
          ref={loopVideoRef}
          src={config.videoSources.loop}
          loop
          muted
          preloadEager
        />
      </div>

      {/* Video de acción (solo TYPE_B) */}
      {hasAction && config.videoSources.action && (
        <div className={styles.videoLayer} style={{ opacity: 1 }}>
          <VideoPlayer
            ref={actionVideoRef}
            src={config.videoSources.action}
            muted
            preloadEager
            onEnded={handleActionEnded}
          />
        </div>
      )}
    </div>
  )
}
