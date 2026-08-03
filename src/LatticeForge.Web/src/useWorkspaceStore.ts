import { create } from 'zustand'

export type ViewMode = 'orbit' | 'front' | 'section'

type WorkspaceState = {
  viewMode: ViewMode
  showGrid: boolean
  setViewMode: (viewMode: ViewMode) => void
  toggleGrid: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  viewMode: 'orbit',
  showGrid: true,
  setViewMode: (viewMode) => set({ viewMode }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
}))
