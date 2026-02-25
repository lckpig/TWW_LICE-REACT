import { Howl, Howler } from 'howler'
import type { AudioId, AudioTrack } from '../types'

// ─── Audio Manager centralizado (equivale al AudioManager de Unity) ───
// Gestiona crossfades, SFX y tracks de vídeo de forma desacoplada.

class AudioManager {
  private tracks = new Map<AudioId, Howl>()

  register(track: AudioTrack): void {
    if (this.tracks.has(track.id)) return

    const howl = new Howl({
      src: [track.src],
      loop: track.loop,
      volume: track.volume,
    })

    this.tracks.set(track.id, howl)
  }

  play(id: AudioId): void {
    this.tracks.get(id)?.play()
  }

  stop(id: AudioId): void {
    this.tracks.get(id)?.stop()
  }

  /** Crossfade de duración `seconds` entre dos tracks */
  crossfade(fromId: AudioId, toId: AudioId, seconds = 1): void {
    const from = this.tracks.get(fromId)
    const to = this.tracks.get(toId)

    if (from) from.fade(from.volume(), 0, seconds * 1000)
    if (to) {
      to.play()
      to.fade(0, to.volume(), seconds * 1000)
    }
  }

  setVolume(id: AudioId, value: number): void {
    this.tracks.get(id)?.volume(value)
  }

  setGlobalVolume(value: number): void {
    Howler.volume(value)
  }

  unregister(id: AudioId): void {
    this.tracks.get(id)?.unload()
    this.tracks.delete(id)
  }

  dispose(): void {
    this.tracks.forEach((howl) => howl.unload())
    this.tracks.clear()
  }
}

export const audioManager = new AudioManager()
