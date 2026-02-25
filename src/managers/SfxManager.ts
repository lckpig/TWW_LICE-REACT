import { Howl } from 'howler'

// ─── SfxManager — Reproductor de SFX Puntuales ───────────────────────────────
// Gestiona sonidos puntuales (explosiones, impactos, cargas) usando Howler.js.
// Opera de forma independiente al AudioManager: los SFX no hacen crossfade,
// se superponen sobre el audio ambiental del panel activo.
//
// Convención de audioId → ruta de asset:
//   "sfx_metal_impact" → /src/assets/shared/sfx_metal_impact.mp3
//
// En Unity, equivale a los AudioSource con PlayOneShot() gestionados
// por el SoundEffectManager.cs (separado del AudioManager de ambiente).

class SfxManager {
  private static instance: SfxManager
  private sounds = new Map<string, Howl>()

  private constructor() {}

  static getInstance(): SfxManager {
    if (!SfxManager.instance) {
      SfxManager.instance = new SfxManager()
    }
    return SfxManager.instance
  }

  // ── Precarga un SFX por su audioId ───────────────────────────────────────
  // Llamar en el preload de la página para evitar latencia al disparar.
  preload(audioId: string): void {
    if (this.sounds.has(audioId)) return

    const src = `/src/assets/shared/${audioId}.mp3`
    const howl = new Howl({
      src: [src],
      preload: true,
      volume: 0.9,
      onloaderror: (_id, err) => {
        console.warn(`[SfxManager] No se pudo cargar "${audioId}":`, err)
      },
    })

    this.sounds.set(audioId, howl)
  }

  // ── Reproduce un SFX por su audioId ──────────────────────────────────────
  // Si el SFX no está precargado, lo carga al vuelo (con posible latencia).
  // Equivale a AudioSource.PlayOneShot(clip) en Unity.
  play(audioId: string, volume?: number): void {
    if (!this.sounds.has(audioId)) {
      this.preload(audioId)
    }

    const howl = this.sounds.get(audioId)
    if (!howl) return

    if (volume !== undefined) {
      howl.volume(Math.max(0, Math.min(1, volume)))
    }

    howl.play()
  }

  // ── Precarga múltiples SFX de una vez (llamar al cargar una página) ───────
  preloadBatch(audioIds: string[]): void {
    audioIds.forEach((id) => this.preload(id))
  }

  // ── Detiene un SFX específico ─────────────────────────────────────────────
  stop(audioId: string): void {
    this.sounds.get(audioId)?.stop()
  }

  // ── Silencia/restaura todos los SFX (botón mute global) ──────────────────
  applyMute(muted: boolean): void {
    this.sounds.forEach((howl) => {
      howl.mute(muted)
    })
  }

  // ── Descarga todos los SFX (cambio de página, libera memoria) ────────────
  // En Unity: Resources.UnloadAsset(audioClip)
  dispose(): void {
    this.sounds.forEach((howl) => {
      howl.stop()
      howl.unload()
    })
    this.sounds.clear()
  }
}

export const sfxManager = SfxManager.getInstance()
