import { create } from 'zustand'
import type {
  IPageState,
  IGlobalEffects,
  IPanelRegistry,
  IPanelRef,
  GlobalWeather,
  PanelVideoState,
} from '@/types'
import { COLOR_BACKGROUND_DEFAULT } from '@/utils/constants'

// ─── Estado de un panel individual (para el sistema de Control Remoto) ────────
export interface IPanelOverrideState {
  videoState: PanelVideoState
  cssFilter: string | null
}

// ─── Store completo de la aplicación ─────────────────────────────────────────
interface AppStore {
  // ── Estado de la página actual ──────────────────────────────────────────────
  pageState: IPageState
  // ── Efectos visuales globales ───────────────────────────────────────────────
  globalEffects: IGlobalEffects
  // ── Registro de referencias DOM a elementos video/audio ─────────────────────
  panelRegistry: IPanelRegistry
  // ── Sobreescrituras de estado por panel (para Control Remoto) ───────────────
  panelOverrides: Map<string, IPanelOverrideState>
  // ── Índice de página actual (navegación entre páginas) ──────────────────────
  currentPageIndex: number
  // ── Color de fondo actual (viene del JSON de la página) ─────────────────────
  backgroundColor: string

  // ── Acciones de navegación entre páginas ────────────────────────────────────
  setCurrentPage: (index: number) => void
  setBackgroundColor: (color: string) => void

  // ── Acciones de panels ──────────────────────────────────────────────────────
  /** Avanza al siguiente panel de la página (disparado por TAP) */
  advancePanel: () => void
  /** Retrocede al panel anterior */
  retreatPanel: () => void
  /** Salta directamente a un panel por su índice */
  jumpToPanel: (index: number) => void
  /** Resetea el panel activo a 0 (se llama al cargar una nueva página) */
  resetPanels: () => void
  /** Bloquea/desbloquea el SWIPE durante transiciones */
  setSwipeLock: (locked: boolean) => void
  /** Actualiza el ID del audio activo */
  setActiveAudioId: (id: string) => void

  // ── Control Remoto: modifica el estado visual de otro panel ─────────────────
  /** Permite que el TimelineManager de un panel afecte a otro panel */
  updatePanelOverride: (panelId: string, state: Partial<IPanelOverrideState>) => void
  clearPanelOverride: (panelId: string) => void

  // ── Efectos globales ─────────────────────────────────────────────────────────
  triggerShake: (active: boolean) => void
  setFlash: (color: string | null) => void
  setGlobalWeather: (weather: GlobalWeather) => void

  // ── Registro de referencias DOM ─────────────────────────────────────────────
  registerPanelRef: (ref: IPanelRef) => void
  unregisterPanelRef: (panelId: string) => void
  getPanelRef: (panelId: string) => IPanelRef | undefined
}

// ─── Estado inicial ───────────────────────────────────────────────────────────
const initialPageState: IPageState = {
  currentPanelIndex: -1, // -1 = ningún panel visible aún (esperando primer TAP)
  isSwipeLocked: false,
  activeAudioId: '',
}

const initialGlobalEffects: IGlobalEffects = {
  isShakeActive: false,
  flashColor: null,
  globalWeather: 'none',
}

// ─── Creación del Store ───────────────────────────────────────────────────────
export const useAppStore = create<AppStore>((set, get) => ({
  pageState: { ...initialPageState },
  globalEffects: { ...initialGlobalEffects },
  panelRegistry: new Map<string, IPanelRef>(),
  panelOverrides: new Map<string, IPanelOverrideState>(),
  currentPageIndex: 0,
  backgroundColor: COLOR_BACKGROUND_DEFAULT,

  // ── Navegación entre páginas ─────────────────────────────────────────────────
  setCurrentPage: (index) =>
    set({
      currentPageIndex: index,
      pageState: { ...initialPageState },
      globalEffects: { ...initialGlobalEffects },
      panelOverrides: new Map(),
    }),

  setBackgroundColor: (color) => set({ backgroundColor: color }),

  // ── Acciones de panels ───────────────────────────────────────────────────────
  advancePanel: () =>
    set((state) => ({
      pageState: {
        ...state.pageState,
        currentPanelIndex: state.pageState.currentPanelIndex + 1,
      },
    })),

  retreatPanel: () =>
    set((state) => ({
      pageState: {
        ...state.pageState,
        currentPanelIndex: Math.max(-1, state.pageState.currentPanelIndex - 1),
      },
    })),

  jumpToPanel: (index) =>
    set((state) => ({
      pageState: { ...state.pageState, currentPanelIndex: index },
    })),

  resetPanels: () =>
    set((state) => ({
      pageState: { ...state.pageState, currentPanelIndex: -1 },
    })),

  setSwipeLock: (locked) =>
    set((state) => ({
      pageState: { ...state.pageState, isSwipeLocked: locked },
    })),

  setActiveAudioId: (id) =>
    set((state) => ({
      pageState: { ...state.pageState, activeAudioId: id },
    })),

  // ── Control Remoto ────────────────────────────────────────────────────────────
  updatePanelOverride: (panelId, partialState) => {
    const map = new Map(get().panelOverrides)
    const current = map.get(panelId) ?? { videoState: 'playing', cssFilter: null }
    map.set(panelId, { ...current, ...partialState })
    set({ panelOverrides: map })
  },

  clearPanelOverride: (panelId) => {
    const map = new Map(get().panelOverrides)
    map.delete(panelId)
    set({ panelOverrides: map })
  },

  // ── Efectos globales ─────────────────────────────────────────────────────────
  triggerShake: (active) =>
    set((state) => ({
      globalEffects: { ...state.globalEffects, isShakeActive: active },
    })),

  setFlash: (color) =>
    set((state) => ({
      globalEffects: { ...state.globalEffects, flashColor: color },
    })),

  setGlobalWeather: (weather) =>
    set((state) => ({
      globalEffects: { ...state.globalEffects, globalWeather: weather },
    })),

  // ── Registro de referencias DOM ──────────────────────────────────────────────
  registerPanelRef: (ref) => {
    const map = new Map(get().panelRegistry)
    map.set(ref.panelId, ref)
    set({ panelRegistry: map })
  },

  unregisterPanelRef: (panelId) => {
    const map = new Map(get().panelRegistry)
    map.delete(panelId)
    set({ panelRegistry: map })
  },

  getPanelRef: (panelId) => get().panelRegistry.get(panelId),
}))

// ─── Selectores optimizados ───────────────────────────────────────────────────
// Usar selectores evita re-renders innecesarios (patrón Zustand).

export const selectCurrentPanelIndex = (s: AppStore) => s.pageState.currentPanelIndex
export const selectIsSwipeLocked = (s: AppStore) => s.pageState.isSwipeLocked
export const selectActiveAudioId = (s: AppStore) => s.pageState.activeAudioId
export const selectGlobalEffects = (s: AppStore) => s.globalEffects
export const selectIsShakeActive = (s: AppStore) => s.globalEffects.isShakeActive
export const selectFlashColor = (s: AppStore) => s.globalEffects.flashColor
export const selectGlobalWeather = (s: AppStore) => s.globalEffects.globalWeather
export const selectCurrentPageIndex = (s: AppStore) => s.currentPageIndex
export const selectBackgroundColor = (s: AppStore) => s.backgroundColor
export const selectPanelOverride = (panelId: string) => (s: AppStore) =>
  s.panelOverrides.get(panelId)
