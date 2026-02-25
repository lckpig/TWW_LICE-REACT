import { useEffect, useRef, type ReactNode } from 'react'
import { audioManager } from '@/managers/AudioManager'
import { useUI } from '@/context/UIContext'
import { useAppStore, selectGlobalWeather } from '@/store/useAppStore'
import { AMBIENT_VOLUME, Z_INDEX_UI } from '@/utils/constants'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
}

// ─── AppShell — Estructura Base de la Aplicación ─────────────────────────────
// Proporciona:
//   1. El contenedor visual centrado (viewport)
//   2. Los elementos <audio> globales persistentes (lluvia, motores)
//      que sobreviven entre viñetas porque están FUERA del componente Page.
//   3. El HUD mínimo de la UI (botón mute)
//
// En Unity, equivale al GameManager GameObject que existe en todas
// las escenas y contiene los AudioSource de ambiente global.
export default function AppShell({ children }: AppShellProps) {
  const rainAudioRef = useRef<HTMLAudioElement | null>(null)
  const { isMuted, toggleMute } = useUI()
  const globalWeather = useAppStore(selectGlobalWeather)

  // ── Registra los audios globales en el AudioManager ───────────────────────
  useEffect(() => {
    const rainEl = rainAudioRef.current
    if (rainEl) {
      rainEl.volume = AMBIENT_VOLUME
      rainEl.loop = true
      audioManager.registerGlobalAudio('ambient_rain', rainEl)
    }

    return () => {
      audioManager.unregisterGlobalAudio('ambient_rain')
    }
  }, [])

  // ── Reproduce/detiene el audio de lluvia según el clima global ────────────
  useEffect(() => {
    if (globalWeather === 'rain') {
      audioManager.playGlobalAudio('ambient_rain')
    } else {
      audioManager.stopGlobalAudio('ambient_rain', 1.5)
    }
  }, [globalWeather])

  return (
    <div className={styles.shell}>
      {/* Contenido principal (Page) */}
      <main className={styles.viewport}>
        {children}
      </main>

      {/* HUD — Botón de mute persistente */}
      <button
        className={styles.muteBtn}
        onClick={toggleMute}
        aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
        style={{ zIndex: Z_INDEX_UI }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Audio global de lluvia (fuera del Page para que no se reinicie) */}
      <audio
        ref={rainAudioRef}
        src="/src/assets/shared/ambient_rain.mp3"
        preload="auto"
        style={{ display: 'none' }}
      />
    </div>
  )
}
