import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const payload  = isRegister ? { nombre, email, password } : { email, password }
      const { data } = await api.post(endpoint, payload)
      setAuth(data.token, data.nombre, data.email)
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3 relative" style={{ height: 160 }}>
            <img
              src="/kiru/kiru-feliz.png"
              alt="Kiru"
              width={160}
              height={160}
              className="object-contain absolute transition-opacity duration-300"
              style={{ opacity: showPassword ? 0 : 1 }}
            />
            <img
              src="/kiru/kiru-ojos-tapados.png"
              alt="Kiru tapándose los ojos"
              width={160}
              height={160}
              className="object-contain absolute transition-opacity duration-300"
              style={{ opacity: showPassword ? 1 : 0 }}
            />
          </div>
          <h1 className="text-3xl font-bold text-eco-700 dark:text-eco-400">EcoLoop</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">IA que gamifica tu reciclaje</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input type="text" placeholder="Tu nombre" value={nombre}
              onChange={e => setNombre(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500" />
          )}
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500" />
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password}
              onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500" />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-eco-600 hover:bg-eco-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Iniciar sesion'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          {isRegister ? 'Ya tienes cuenta?' : 'No tienes cuenta?'}{' '}
          <button onClick={() => setIsRegister(!isRegister)}
            className="text-eco-600 hover:underline font-medium">
            {isRegister ? 'Inicia sesion' : 'Registrate'}
          </button>
        </p>
      </div>
    </div>
  )
}
