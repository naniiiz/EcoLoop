import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  nombre: string | null
  email: string | null
  theme: 'light' | 'dark'
  setAuth: (token: string, nombre: string, email: string) => void
  logout: () => void
  toggleTheme: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      nombre: null,
      email: null,
      theme: 'light',
      setAuth: (token, nombre, email) => set({ token, nombre, email }),
      logout: () => set({ token: null, nombre: null, email: null }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' })
    }),
    { name: 'ecoloop-auth' }
  )
)
