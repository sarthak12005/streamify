import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: "coffee",
  setTheme: (theme) => set({theme}),
}))


