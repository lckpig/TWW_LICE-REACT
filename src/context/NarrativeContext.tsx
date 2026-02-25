import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { IPageConfig, IStoryManifest } from '@/types'
import { useAppStore } from '@/store/useAppStore'

// ─── Tipos del contexto ───────────────────────────────────────────────────────

interface NarrativeContextValue {
  /** Manifiesto completo de la historia (cargado una sola vez) */
  manifest: IStoryManifest | null
  /** Configuración de la página actualmente visible */
  currentPageConfig: IPageConfig | null
  /** True mientras se está cargando el JSON de la página */
  isPageLoading: boolean
  /** Error de carga si ocurre */
  loadError: string | null
  /** Número total de páginas en la historia */
  totalPages: number
  /** Navega a la página siguiente */
  goToNextPage: () => void
  /** Navega a la página anterior */
  goToPrevPage: () => void
  /** Navega a una página por índice */
  goToPage: (index: number) => void
}

// ─── Creación del contexto ────────────────────────────────────────────────────
const NarrativeContext = createContext<NarrativeContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

interface NarrativeProviderProps {
  children: ReactNode
  /** Ruta al archivo story-manifest.json */
  manifestPath?: string
}

export function NarrativeProvider({
  children,
  manifestPath = '/src/config/manifest/story-manifest.json',
}: NarrativeProviderProps) {
  const [manifest, setManifest] = useState<IStoryManifest | null>(null)
  const [currentPageConfig, setCurrentPageConfig] = useState<IPageConfig | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const currentPageIndex = useAppStore((s) => s.currentPageIndex)
  const setCurrentPage = useAppStore((s) => s.setCurrentPage)
  const setBackgroundColor = useAppStore((s) => s.setBackgroundColor)
  const resetPanels = useAppStore((s) => s.resetPanels)
  const setSwipeLock = useAppStore((s) => s.setSwipeLock)

  // ── Carga inicial del manifiesto ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function loadManifest() {
      try {
        const res = await fetch(manifestPath)
        if (!res.ok) throw new Error(`Manifiesto no encontrado: ${manifestPath}`)
        const data: IStoryManifest = await res.json()
        if (!cancelled) setManifest(data)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Error desconocido')
      }
    }

    void loadManifest()
    return () => { cancelled = true }
  }, [manifestPath])

  // ── Carga de la página cuando cambia el índice o el manifiesto ────────────
  useEffect(() => {
    if (!manifest) return

    const entry = manifest.pages[currentPageIndex]
    if (!entry) {
      setLoadError(`Página ${currentPageIndex} no existe en el manifiesto`)
      return
    }

    let cancelled = false
    setIsPageLoading(true)
    setLoadError(null)
    setSwipeLock(true)

    async function loadPage() {
      try {
        const res = await fetch(entry.configPath)
        if (!res.ok) throw new Error(`Config no encontrada: ${entry.configPath}`)
        const config: IPageConfig = await res.json()

        if (!cancelled) {
          setCurrentPageConfig(config)
          setBackgroundColor(config.backgroundColor)
          resetPanels()
          setIsPageLoading(false)
          setSwipeLock(false)
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Error cargando página')
          setIsPageLoading(false)
          setSwipeLock(false)
        }
      }
    }

    void loadPage()
    return () => { cancelled = true }
  }, [manifest, currentPageIndex, setBackgroundColor, resetPanels, setSwipeLock])

  // ── Navegación ────────────────────────────────────────────────────────────
  const totalPages = manifest?.pages.length ?? 0

  const goToPage = useCallback(
    (index: number) => {
      if (!manifest) return
      if (index < 0 || index >= manifest.pages.length) return
      setCurrentPage(index)
    },
    [manifest, setCurrentPage],
  )

  const goToNextPage = useCallback(() => {
    if (manifest && currentPageIndex >= manifest.pages.length - 1) {
      // TODO: reemplazar por pantalla de fin de cómic
      alert('¡Has terminado el cómic!')
      window.location.reload()
      return
    }
    goToPage(currentPageIndex + 1)
  }, [currentPageIndex, goToPage, manifest])

  const goToPrevPage = useCallback(() => {
    goToPage(currentPageIndex - 1)
  }, [currentPageIndex, goToPage])

  return (
    <NarrativeContext.Provider
      value={{
        manifest,
        currentPageConfig,
        isPageLoading,
        loadError,
        totalPages,
        goToNextPage,
        goToPrevPage,
        goToPage,
      }}
    >
      {children}
    </NarrativeContext.Provider>
  )
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────
export function useNarrative(): NarrativeContextValue {
  const ctx = useContext(NarrativeContext)
  if (!ctx) throw new Error('useNarrative debe usarse dentro de <NarrativeProvider>')
  return ctx
}
