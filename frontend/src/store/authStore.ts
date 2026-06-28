import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthTransition {
  type: 'login' | 'logout'
  nombre?: string
}

interface AuthState {
  token: string | null
  nombre: string | null
  email: string | null
  theme: 'light' | 'dark'
  authTransition: AuthTransition | null
  setAuth: (token: string, nombre: string, email: string) => void
  logout: () => void
  toggleTheme: () => void
  setAuthTransition: (t: AuthTransition | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      nombre: null,
      email: null,
      theme: 'light',
      authTransition: null,
      setAuth: (token, nombre, email) => set({ token, nombre, email }),
      logout: () => set({ token: null, nombre: null, email: null }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setAuthTransition: (t) => set({ authTransition: t }),
    }),
    {
      name: 'ecoloop-auth',
      partialize: (state) => ({
        token: state.token,
        nombre: state.nombre,
        email: state.email,
        theme: state.theme,
      }),
    }
  )
)
