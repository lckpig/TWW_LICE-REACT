import { create } from 'zustand'
import type { NarrativeState } from '../types'

// ─── Store global (equivale a un C# Manager Singleton en Unity) ───

interface AppStore extends NarrativeState {
  setPage: (index: number) => void
  showVignette: (id: string) => void
  hideVignette: (id: string) => void
  setEngineOn: (value: boolean) => void
  reset: () => void
}

const initialState: NarrativeState = {
  engineOn: false,
  currentPageIndex: 0,
  visibleVignetteIds: [],
}

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setPage: (index) => set({ currentPageIndex: index }),

  showVignette: (id) =>
    set((state) => ({
      visibleVignetteIds: state.visibleVignetteIds.includes(id)
        ? state.visibleVignetteIds
        : [...state.visibleVignetteIds, id],
    })),

  hideVignette: (id) =>
    set((state) => ({
      visibleVignetteIds: state.visibleVignetteIds.filter((v) => v !== id),
    })),

  setEngineOn: (value) => set({ engineOn: value }),

  reset: () => set(initialState),
}))
