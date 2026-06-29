import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { router } from '../../router'

export default function TransitionOverlay() {
  const authTransition    = useAuthStore(s => s.authTransition)
  const setAuthTransition = useAuthStore(s => s.setAuthTransition)
  const logout            = useAuthStore(s => s.logout)
  const theme             = useAuthStore(s => s.theme)
  const isDark            = theme === 'dark'
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const dataRef    = useRef(authTransition)
  const runningRef = useRef(false)

  useEffect(() => {
    if (!authTransition || runningRef.current) return
    runningRef.current = true
    dataRef.current = authTransition
    setExiting(false)
    setVisible(true)

    const t1 = setTimeout(() => {
      if (dataRef.current?.type === 'login') {
        router.navigate('/')
      } else {
        logout()
        router.navigate('/login')
      }
      setExiting(true)
    }, 2900)

    const t2 = setTimeout(() => {
      setVisible(false)
      setExiting(false)
      setAuthTransition(null)
      runningRef.current = false
    }, 3200)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [authTransition]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  const data    = dataRef.current
  const isLogin = data?.type === 'login'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #1f2937 100%)'
          : isLogin
            ? 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)'
            : 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #16a34a 100%)',
        opacity:    exiting ? 0 : 1,
        transition: exiting
          ? 'opacity 0.3s ease'
          : 'opacity 0.18s ease',
      }}
    >
      <div
        className="flex flex-col items-center gap-4"
        style={{
          opacity:   exiting ? 0 : 1,
          transform: exiting ? 'scale(0.92) translateY(-8px)' : 'scale(1) translateY(0)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {/* Anillo pulsante + Kiru */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full bg-white/20"
            style={{ width: 160, height: 160, animation: 'auth-ring-pulse 1s ease-in-out infinite' }}
          />
          <div
            className="absolute rounded-full bg-white/10"
            style={{ width: 200, height: 200, animation: 'auth-ring-pulse 1s ease-in-out 0.15s infinite' }}
          />
          <img
            src={isLogin ? '/kiru/kiru-feliz.webp' : '/kiru/castor-ecology.webp'}
            alt="Kiru"
            className="relative w-28 h-28 object-contain drop-shadow-2xl"
            style={{ animation: 'auth-kiru-enter 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
          />
        </div>

        {/* Texto */}
        <div
          className="text-center"
          style={{ animation: 'auth-text-enter 0.4s ease 0.15s both' }}
        >
          <p className="text-white font-display text-3xl font-bold tracking-tight drop-shadow">
            {isLogin ? `¡Hola, ${data?.nombre}!` : '¡Hasta pronto!'}
          </p>
          <p className="text-white/75 text-sm mt-1">
            {isLogin ? 'Preparando tu espacio' : 'Sigue reciclando cada día'}
          </p>
        </div>

        {/* Dots loader */}
        <div className="flex gap-1.5" style={{ animation: 'auth-text-enter 0.4s ease 0.25s both' }}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-white/80"
              style={{ animation: `auth-dot-bounce 0.7s ease ${i * 0.12}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
