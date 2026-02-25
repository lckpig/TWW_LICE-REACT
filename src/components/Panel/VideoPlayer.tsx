import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  type VideoHTMLAttributes,
} from 'react'

// ─── API pública del VideoPlayer (accessible via ref) ─────────────────────────
// Oculta la complejidad de la etiqueta <video> nativa.
// En Unity, equivale a los métodos públicos de VideoController.cs sobre VideoPlayer.
export interface VideoPlayerHandle {
  /** Referencia directa al elemento <video> del DOM */
  videoEl: HTMLVideoElement | null
  /** Reproduce el video desde el inicio */
  playFromStart: () => Promise<void>
  /** Pausa la reproducción */
  pause: () => void
  /** Cambia el volumen (0.0 – 1.0) con transición inmediata */
  setVolume: (volume: number) => void
  /** Sincroniza el tiempo de reproducción con el Master Clock */
  syncWithMaster: (masterTime: number) => void
  /** Devuelve el tiempo de reproducción actual */
  getCurrentTime: () => number
  /** True si el video está reproduciéndose actualmente */
  isPlaying: () => boolean
}

interface VideoPlayerProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string
  /** Si true, el video carga en background inmediatamente al montarse */
  preloadEager?: boolean
  /** Callback que se invoca en cada actualización de tiempo (para keyframes) */
  onTimeUpdate?: (currentTime: number) => void
}

// ─── VideoPlayer Component ────────────────────────────────────────────────────
const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ src, preloadEager = true, onTimeUpdate, style, ...rest }, ref) {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    // ── Expone la API al componente padre via ref ────────────────────────────
    useImperativeHandle(ref, () => ({
      get videoEl() {
        return videoRef.current
      },

      async playFromStart(): Promise<void> {
        const el = videoRef.current
        if (!el) return
        el.currentTime = 0
        try {
          await el.play()
        } catch {
          // Autoplay bloqueado por el navegador — el usuario debe interactuar primero
        }
      },

      pause(): void {
        videoRef.current?.pause()
      },

      setVolume(volume: number): void {
        if (videoRef.current) {
          videoRef.current.volume = Math.max(0, Math.min(1, volume))
        }
      },

      syncWithMaster(masterTime: number): void {
        const el = videoRef.current
        if (!el) return
        // Solo ajusta si la diferencia es significativa (evita micro-saltos)
        if (Math.abs(el.currentTime - masterTime) > 0.1) {
          el.currentTime = masterTime
        }
      },

      getCurrentTime(): number {
        return videoRef.current?.currentTime ?? 0
      },

      isPlaying(): boolean {
        const el = videoRef.current
        if (!el) return false
        return !el.paused && !el.ended && el.readyState >= 2
      },
    }))

    // ── Proxy del onTimeUpdate ────────────────────────────────────────────────
    useEffect(() => {
      const el = videoRef.current
      if (!el || !onTimeUpdate) return

      const handler = () => onTimeUpdate(el.currentTime)
      el.addEventListener('timeupdate', handler)
      return () => el.removeEventListener('timeupdate', handler)
    }, [onTimeUpdate])

    return (
      <video
        ref={videoRef}
        src={src}
        preload={preloadEager ? 'auto' : 'metadata'}
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          ...style,
        }}
        {...rest}
      />
    )
  },
)

export default VideoPlayer
