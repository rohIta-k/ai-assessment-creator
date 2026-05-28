import { create } from 'zustand'

interface UIStore {
  mobileMenuOpen: boolean
  activeFilter: string
  setMobileMenuOpen: (mobileMenuOpen: boolean) => void
  setActiveFilter: (activeFilter: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  mobileMenuOpen: false,
  activeFilter: 'All',
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
}))
