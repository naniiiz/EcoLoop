import { useCallback, useEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

function KiruToggleIcon({ theme, animating }: { theme: string; animating: boolean }) {
  const src = theme === 'light' ? '/kiru/kiru-luna.webp' : '/kiru/kiru-sol.webp'
  return (
    <img
      src={src}
      alt={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      width={34}
      height={34}
      className={animating ? 'kiru-animate' : ''}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const setAuth = useAuthStore(s => s.setAuth)
  const setAuthTransition = useAuthStore(s => s.setAuthTransition)
  const { theme, toggleTheme } = useAuthStore()
  const [animating, setAnimating] = useState(false)

  const handleToggleTheme = useCallback(() => {
    setAnimating(true)
    toggleTheme()
    setTimeout(() => setAnimating(false), 500)
  }, [toggleTheme])
  const containerRef  = useRef<HTMLDivElement>(null)
  const leftPupilRef  = useRef<HTMLImageElement>(null)
  const rightPupilRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const track = (ref: React.RefObject<HTMLImageElement | null>, cx: number, cy: number, mx: MouseEvent, maxL: number, maxR: number, maxY: number) => {
      if (!ref.current) return
      const dx = mx.clientX - cx
      const dy = mx.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist === 0) return
      const maxX = dx < 0 ? maxL : maxR
      const ox = Math.sign(dx) * Math.min(maxX, Math.abs(dx * 3 / dist))
      const oy = Math.sign(dy) * Math.min(maxY, Math.abs(dy * 3 / dist))
      ref.current.style.transform = `translate(${ox}px, ${oy}px)`
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || showPassword) return
      const rect = containerRef.current.getBoundingClientRect()
      track(leftPupilRef,  rect.left + rect.width * (454 / 1024), rect.top + rect.height * (330 / 1024), e, 8, 5, 5)
      track(rightPupilRef, rect.left + rect.width * (573 / 1024), rect.top + rect.height * (330 / 1024), e, 6, 3, 3)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [showPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const payload  = isRegister ? { nombre, email, password } : { email, password }
      const { data } = await api.post(endpoint, payload)
      setAuth(data.token, data.nombre, data.email)
      setAuthTransition({ type: 'login', nombre: data.nombre })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-50 dark:bg-gray-900 p-4">
      <button
        onClick={handleToggleTheme}
        title="Cambiar tema"
        className="fixed top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
      >
        <KiruToggleIcon theme={theme} animating={animating} />
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div ref={containerRef} className="flex justify-center mb-3 relative" style={{ height: 160, width: 160, margin: '0 auto', overflow: 'hidden' }}>
            <img
              src="/kiru/kiru-feliz-sin-pupilas.png"
              alt="Kiru"
              width={160}
              height={160}
              className="object-contain absolute"
              style={{ opacity: showPassword ? 0 : 1, transition: 'opacity 300ms' }}
            />
            <img
              ref={leftPupilRef}
              src="/kiru/kiru-pupila-izq.png"
              alt=""
              aria-hidden
              width={160}
              height={160}
              className="object-contain absolute pointer-events-none"
              style={{ opacity: showPassword ? 0 : 1, transition: 'opacity 300ms', left: '1px', top: '-1.5px' }}
            />
            <img
              ref={rightPupilRef}
              src="/kiru/kiru-pupila-der.png"
              alt=""
              aria-hidden
              width={160}
              height={160}
              className="object-contain absolute pointer-events-none"
              style={{ opacity: showPassword ? 0 : 1, transition: 'opacity 300ms', left: '1px', top: '-1.5px' }}
            />
            <img
              src="/kiru/kiru-ojos-tapados.png"
              alt="Kiru tapándose los ojos"
              width={160}
              height={160}
              className="object-contain absolute"
              style={{ opacity: showPassword ? 1 : 0, transition: 'opacity 300ms' }}
            />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-eco-700 dark:text-eco-400">EcoLoop</h1>
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
