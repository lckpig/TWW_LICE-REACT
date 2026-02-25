import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

// ─── Tipos del contexto ───────────────────────────────────────────────────────

interface UIContextValue {
  /** True si el usuario ha silenciado todo el audio */
  isMuted: boolean
  /** True si el panel de ajustes está visible */
  showSettings: boolean
  /** True mientras hay una carga de página en curso (para mostrar loader) */
  isLoading: boolean
  /** Activa el modo de depuración visual (muestra grid, IDs de panels, etc.) */
  debugMode: boolean
  /** Nivel de volumen maestro (0.0 – 1.0) */
  masterVolume: number

  // ── Acciones ────────────────────────────────────────────────────────────────
  toggleMute: () => void
  setMuted: (value: boolean) => void
  toggleSettings: () => void
  setLoading: (value: boolean) => void
  toggleDebugMode: () => void
  setMasterVolume: (value: number) => void
}

// ─── Creación del contexto ────────────────────────────────────────────────────
const UIContext = createContext<UIContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

interface UIProviderProps {
  children: ReactNode
}

export function UIProvider({ children }: UIProviderProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoadingState] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [masterVolume, setMasterVolumeState] = useState(1.0)

  const toggleMute = useCallback(() => setIsMuted((v) => !v), [])
  const setMuted = useCallback((value: boolean) => setIsMuted(value), [])
  const toggleSettings = useCallback(() => setShowSettings((v) => !v), [])
  const setLoading = useCallback((value: boolean) => setIsLoadingState(value), [])
  const toggleDebugMode = useCallback(() => setDebugMode((v) => !v), [])

  const setMasterVolume = useCallback((value: number) => {
    setMasterVolumeState(Math.max(0, Math.min(1, value)))
  }, [])

  return (
    <UIContext.Provider
      value={{
        isMuted,
        showSettings,
        isLoading,
        debugMode,
        masterVolume,
        toggleMute,
        setMuted,
        toggleSettings,
        setLoading,
        toggleDebugMode,
        setMasterVolume,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────
export function useUI(): UIContextValue {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>')
  return ctx
}
