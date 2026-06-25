import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { token, nombre, email, logout } = useAuthStore()
  return { isAuthenticated: !!token, nombre, email, logout }
}
