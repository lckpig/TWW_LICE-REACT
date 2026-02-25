import { gsap } from 'gsap'
import { useAppStore } from '@/store/useAppStore'
import {
  CROSSFADE_DURATION,
  DEFAULT_PANEL_VOLUME,
  BACKGROUND_PANEL_VOLUME,
  AMBIENT_VOLUME,
} from '@/utils/constants'

// ─── AudioManager — Director de Orquesta del Sonido ──────────────────────────
// Principio: "Una sola viñeta con prioridad sonora".
//
// NO crea nuevos objetos Audio. Opera sobre los elementos <video> y <audio>
// ya montados en el DOM, registrados en el panelRegistry del store.
//
// En Unity, esta clase se convierte en AudioManager.cs, donde los
// AudioSource de los GameObject de video son manipulados via DOTween.
//
// Implementado como Singleton para facilitar la migración a C#.

class AudioManager {
  private static instance: AudioManager
  private activeTweens = new Map<string, gsap.core.Tween>()
  private globalAudioRefs = new Map<string, HTMLAudioElement>()

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  // ── Obtiene el elemento de video activo del panel ─────────────────────────
  private getVideoEl(panelId: string): HTMLVideoElement | null {
    const ref = useAppStore.getState().getPanelRef(panelId)
    if (!ref) return null
    return ref.loopVideoEl ?? ref.actionVideoEl
  }

  // ── Fade de volumen en un elemento de video ───────────────────────────────
  private fadeVolume(
    el: HTMLVideoElement | HTMLAudioElement,
    targetVolume: number,
    duration: number,
    id: string,
  ): void {
    this.activeTweens.get(id)?.kill()

    const tween = gsap.to(el, {
      volume: targetVolume,
      duration,
      ease: 'power1.inOut',
      onComplete: () => {
        this.activeTweens.delete(id)
      },
    })

    this.activeTweens.set(id, tween)
  }

  // ── Sube el volumen del panel que acaba de activarse ──────────────────────
  bringPanelToFront(panelId: string, duration = CROSSFADE_DURATION): void {
    const el = this.getVideoEl(panelId)
    if (!el) return
    this.fadeVolume(el, DEFAULT_PANEL_VOLUME, duration, `in_${panelId}`)
    useAppStore.getState().setActiveAudioId(panelId)
  }

  // ── Baja el volumen del panel que pierde la prioridad ─────────────────────
  sendPanelToBackground(panelId: string, duration = CROSSFADE_DURATION): void {
    const el = this.getVideoEl(panelId)
    if (!el) return
    this.fadeVolume(el, BACKGROUND_PANEL_VOLUME, duration, `out_${panelId}`)
  }

  // ── Crossfade entre dos panels ────────────────────────────────────────────
  // Equivale a AudioSource.DOFade() en Unity.
  crossfade(fromPanelId: string, toPanelId: string, duration = CROSSFADE_DURATION): void {
    this.sendPanelToBackground(fromPanelId, duration)
    this.bringPanelToFront(toPanelId, duration)
  }

  // ── Fade a volumen específico (Control Remoto desde Timeline) ─────────────
  setVolumeFaded(panelId: string, targetVolume: number, fadeDuration: number): void {
    const el = this.getVideoEl(panelId)
    if (!el) return
    this.fadeVolume(el, targetVolume, fadeDuration, `manual_${panelId}`)
  }

  // ── Silencia un panel al instante (sin fade) ──────────────────────────────
  mutePanel(panelId: string): void {
    const el = this.getVideoEl(panelId)
    if (el) {
      this.activeTweens.get(`in_${panelId}`)?.kill()
      this.activeTweens.get(`out_${panelId}`)?.kill()
      el.volume = 0
    }
  }

  // ── Audio global independiente (lluvia, motores, música de fondo) ─────────
  // Estos elementos <audio> persisten entre viñetas porque son globales.
  registerGlobalAudio(id: string, el: HTMLAudioElement): void {
    this.globalAudioRefs.set(id, el)
  }

  unregisterGlobalAudio(id: string): void {
    this.globalAudioRefs.delete(id)
  }

  playGlobalAudio(id: string): void {
    const el = this.globalAudioRefs.get(id)
    if (el) void el.play()
  }

  stopGlobalAudio(id: string, fadeDuration = 1.0): void {
    const el = this.globalAudioRefs.get(id)
    if (!el) return
    this.fadeVolume(el, 0, fadeDuration, `global_out_${id}`)
    setTimeout(() => {
      el.pause()
      el.currentTime = 0
      el.volume = AMBIENT_VOLUME
    }, fadeDuration * 1000)
  }

  setGlobalAudioVolume(id: string, volume: number, fadeDuration = 0.5): void {
    const el = this.globalAudioRefs.get(id)
    if (!el) return
    this.fadeVolume(el, volume, fadeDuration, `global_${id}`)
  }

  // ── Aplica mute global a todos los panels (acción del botón mute) ─────────
  applyGlobalMute(muted: boolean): void {
    const registry = useAppStore.getState().panelRegistry
    registry.forEach((ref) => {
      if (ref.loopVideoEl) ref.loopVideoEl.muted = muted
      if (ref.actionVideoEl) ref.actionVideoEl.muted = muted
    })
    this.globalAudioRefs.forEach((el) => {
      el.muted = muted
    })
  }

  // ── Silencia todos los panels excepto el activo (cambio de página) ────────
  silenceAllExcept(activePanelId: string): void {
    const registry = useAppStore.getState().panelRegistry
    registry.forEach((ref) => {
      if (ref.panelId === activePanelId) return
      this.mutePanel(ref.panelId)
    })
  }

  // ── Limpieza total (se llama al desmontar una página) ─────────────────────
  disposePageAudio(): void {
    this.activeTweens.forEach((tween) => tween.kill())
    this.activeTweens.clear()
  }
}

export const audioManager = AudioManager.getInstance()
