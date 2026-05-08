import { create } from 'zustand'

type AppState = {
  hasSubmitted: boolean
  setHasSubmitted: (value: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  hasSubmitted: false,
  setHasSubmitted: (value) => set({ hasSubmitted: value }),
}))
