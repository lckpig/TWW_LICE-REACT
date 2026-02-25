import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { audioManager } from '@/managers/AudioManager'
import { useNarrative } from '@/context/NarrativeContext'
import { useAppStore, selectGlobalWeather, selectCurrentPageIndex } from '@/store/useAppStore'
import { AMBIENT_VOLUME, Z_INDEX_UI } from '@/utils/constants'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
}

// ─── AppShell — Estructura Base de la Aplicación ─────────────────────────────
// Proporciona:
//   1. El contenedor visual centrado (viewport)
//   2. Los elementos <audio> globales persistentes (lluvia, viento)
//      que sobreviven entre viñetas porque están FUERA del componente Page.
//   3. El HUD mínimo de la UI (fullscreen, paginador)
//
// En Unity, equivale al GameManager GameObject que existe en todas
// las escenas y contiene los AudioSource de ambiente global.
export default function AppShell({ children }: AppShellProps) {
  const rainAudioRef = useRef<HTMLAudioElement | null>(null)
  const windAudioRef = useRef<HTMLAudioElement | null>(null)
  const globalWeather = useAppStore(selectGlobalWeather)
  const currentPageIndex = useAppStore(selectCurrentPageIndex)
  const { totalPages } = useNarrative()

  // ── Registra los audios globales en el AudioManager ───────────────────────
  useEffect(() => {
    const rainEl = rainAudioRef.current
    if (rainEl) {
      rainEl.volume = AMBIENT_VOLUME
      rainEl.loop = true
      audioManager.registerGlobalAudio('ambient_rain', rainEl)
    }

    const windEl = windAudioRef.current
    if (windEl) {
      windEl.volume = AMBIENT_VOLUME
      windEl.loop = true
      audioManager.registerGlobalAudio('ambient_wind', windEl)
    }

    return () => {
      audioManager.unregisterGlobalAudio('ambient_rain')
      audioManager.unregisterGlobalAudio('ambient_wind')
    }
  }, [])

  // ── Reproduce/detiene los audios globales según el clima actual ───────────
  useEffect(() => {
    if (globalWeather === 'rain') {
      audioManager.playGlobalAudio('ambient_rain')
    } else {
      audioManager.stopGlobalAudio('ambient_rain', 1.5)
    }

    if (globalWeather === 'dust') {
      audioManager.playGlobalAudio('ambient_wind')
    } else {
      audioManager.stopGlobalAudio('ambient_wind', 1.5)
    }
  }, [globalWeather])

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return (
    <div className={styles.shell}>
      {/* Contenido principal (Page) */}
      <main className={styles.viewport}>
        {children}
      </main>

      {/* HUD — Esquina superior derecha: botón fullscreen */}
      <div className={styles.topRightHUD} style={{ zIndex: Z_INDEX_UI }}>
        <button
          className={styles.fullscreenBtn}
          onClick={toggleFullscreen}
          aria-label={
            isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
          }
        >
          {isFullscreen ? '⊟' : '⊞'}
        </button>
      </div>

      {/* HUD — Esquina inferior derecha: paginador */}
      <div
        className={styles.bottomRightHUD}
        style={{ zIndex: Z_INDEX_UI }}
      >
        {currentPageIndex + 1} / {totalPages}
      </div>

      {/* Audio global de lluvia (fuera del Page para que no se reinicie) */}
      <audio
        ref={rainAudioRef}
        src="/src/assets/shared/ambient_rain.mp3"
        preload="auto"
        style={{ display: 'none' }}
      />

      {/* Audio global de viento/polvo (clima dust) */}
      <audio
        ref={windAudioRef}
        src="/src/assets/shared/ambient_wind.mp3"
        preload="auto"
        style={{ display: 'none' }}
      />
    </div>
  )
}
