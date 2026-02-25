import type { IPageConfig, IPanelConfig } from '@/types'
import { timelineManager } from './TimelineManager'
import { audioManager } from './AudioManager'
import { effectsManager } from './EffectsManager'
import { useAppStore } from '@/store/useAppStore'

// ─── ResourceManager — Gestión de Memoria de Videos ─────────────────────────
// Responsabilidades:
//   1. Preload de los videos de la página entrante
//   2. Cleanup de los videos de la página saliente (libera memoria GPU)
//   3. Lazy loading opcional por página
//
// CRÍTICO para móviles: los videos en memoria de GPU consumen mucho.
// La técnica videoEl.src = '' + videoEl.load() fuerza la liberación del buffer.
//
// En Unity, equivale al AddressableAssets / AssetBundle system:
//   Addressables.LoadAssetAsync() → Addressables.Release(handle)

class ResourceManager {
  private static instance: ResourceManager
  private preloadedPanels = new Set<string>()
  private videoElements = new Map<string, HTMLVideoElement>()

  private constructor() {}

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager()
    }
    return ResourceManager.instance
  }

  // ── Preload de todos los videos de una página ─────────────────────────────
  // Crea elementos <video> ocultos y los precarga.
  // En Unity: Addressables.LoadAssetAsync<VideoClip>(key)
  async preloadPage(config: IPageConfig): Promise<void> {
    const preloadPromises = config.panels.flatMap((panel) =>
      this.getVideoSrcsForPanel(panel).map((src) => this.preloadVideo(panel.id, src)),
    )

    await Promise.allSettled(preloadPromises)
  }

  // ── Preload de un video individual ───────────────────────────────────────
  private preloadVideo(panelId: string, src: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.preloadedPanels.has(`${panelId}_${src}`)) {
        resolve()
        return
      }

      const video = document.createElement('video')
      video.preload = 'auto'
      video.muted = true
      video.playsInline = true
      video.src = src

      const key = `${panelId}_${src}`
      this.videoElements.set(key, video)

      const onCanPlay = () => {
        this.preloadedPanels.add(key)
        video.removeEventListener('canplay', onCanPlay)
        video.removeEventListener('error', onError)
        resolve()
      }

      const onError = () => {
        video.removeEventListener('canplay', onCanPlay)
        video.removeEventListener('error', onError)
        resolve()
      }

      video.addEventListener('canplay', onCanPlay)
      video.addEventListener('error', onError)
    })
  }

  // ── Devuelve todas las rutas de video de un panel ─────────────────────────
  private getVideoSrcsForPanel(panel: IPanelConfig): string[] {
    const srcs: string[] = [panel.videoSources.loop]
    if (panel.videoSources.action) srcs.push(panel.videoSources.action)
    return srcs
  }

  // ── Cleanup de la página saliente — Libera memoria de GPU ─────────────────
  // CRÍTICO: videoEl.src = '' + videoEl.load() fuerza al navegador a liberar
  // el buffer de video de la memoria de la GPU.
  // En Unity: Addressables.Release(handle) o Resources.UnloadAsset(clip)
  disposePage(config: IPageConfig): void {
    // 1. Limpia los elementos de video pre-cargados de esta página
    config.panels.forEach((panel) => {
      this.getVideoSrcsForPanel(panel).forEach((src) => {
        const key = `${panel.id}_${src}`
        const video = this.videoElements.get(key)
        if (video) {
          video.pause()
          video.src = ''
          video.load()
          this.videoElements.delete(key)
          this.preloadedPanels.delete(key)
        }
      })
    })

    // 2. Limpia los videos registrados en el panelRegistry del store
    const registry = useAppStore.getState().panelRegistry
    registry.forEach((ref) => {
      this.releaseVideoElement(ref.actionVideoEl)
      this.releaseVideoElement(ref.loopVideoEl)
    })

    // 3. Limpia managers
    timelineManager.disposeAll()
    audioManager.disposePageAudio()
    effectsManager.dispose()
  }

  // ── Libera un elemento de video del DOM ──────────────────────────────────
  private releaseVideoElement(el: HTMLVideoElement | null): void {
    if (!el) return
    el.pause()
    el.src = ''
    el.load()
  }

  // ── Limpieza total ────────────────────────────────────────────────────────
  disposeAll(): void {
    this.videoElements.forEach((video) => {
      video.pause()
      video.src = ''
      video.load()
    })
    this.videoElements.clear()
    this.preloadedPanels.clear()
  }

  // ── Comprueba si una página ya está pre-cargada ───────────────────────────
  isPagePreloaded(config: IPageConfig): boolean {
    return config.panels.every((panel) =>
      this.getVideoSrcsForPanel(panel).every((src) =>
        this.preloadedPanels.has(`${panel.id}_${src}`),
      ),
    )
  }

  // ── Obtiene el uso aproximado de memoria (para debug) ────────────────────
  getStats(): { preloadedCount: number; videoElementCount: number } {
    return {
      preloadedCount: this.preloadedPanels.size,
      videoElementCount: this.videoElements.size,
    }
  }
}

export const resourceManager = ResourceManager.getInstance()
