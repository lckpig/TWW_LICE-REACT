import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { audioManager } from '@/managers/AudioManager'
import { CROSSFADE_DURATION } from '@/utils/constants'

// ─── useAudioSync — Sincronizador de Crossfades de Audio ─────────────────────
// Monitorea el panel activo en el store y reacciona automáticamente
// para realizar los crossfades de volumen entre panels.
//
// Este hook vive en el componente Page.tsx para que opere a nivel
// de toda la página, no de un panel individual.
//
// En Unity, equivale al método OnPanelActivated() en el AudioManager.cs
// que DOTween usa para hacer el AudioSource.DOFade().

interface UseAudioSyncOptions {
  /** ID del panel cuyo audio debe tener prioridad ahora */
  activePanelId: string | null
  /** Si true, aplica mute global en lugar de crossfade */
  isMuted?: boolean
  /** Duración del crossfade en segundos */
  crossfadeDuration?: number
}

export function useAudioSync({
  activePanelId,
  isMuted = false,
  crossfadeDuration = CROSSFADE_DURATION,
}: UseAudioSyncOptions) {
  const previousPanelId = useRef<string | null>(null)

  // ── Reacciona cuando cambia el panel activo ───────────────────────────────
  useEffect(() => {
    if (!activePanelId) return

    const prevId = previousPanelId.current

    if (prevId && prevId !== activePanelId) {
      // Crossfade: baja el anterior y sube el nuevo
      audioManager.crossfade(prevId, activePanelId, crossfadeDuration)
    } else if (!prevId) {
      // Primer panel: sube directamente
      audioManager.bringPanelToFront(activePanelId, crossfadeDuration)
    }

    previousPanelId.current = activePanelId
  }, [activePanelId, crossfadeDuration])

  // ── Reacciona al cambio de mute global ───────────────────────────────────
  useEffect(() => {
    audioManager.applyGlobalMute(isMuted)
  }, [isMuted])

  // ── Limpieza al desmontar (cambio de página) ──────────────────────────────
  useEffect(() => {
    return () => {
      audioManager.disposePageAudio()
      previousPanelId.current = null
    }
  }, [])
}

// ─── useActivePanelAudioId ────────────────────────────────────────────────────
// Selector reactivo que devuelve el ID del audio activo desde el store.
// Usado por Page.tsx para pasar el activePanelId a useAudioSync.
export function useActivePanelAudioId(): string {
  return useAppStore((s) => s.pageState.activeAudioId)
}
