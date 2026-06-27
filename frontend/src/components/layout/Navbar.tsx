import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { type ReactNode, useState, useCallback, useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  LogOut,
  Recycle,
  Trophy,
  UserRound,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import KiruChatWidget from '../kiru/KiruChatWidget'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/registro', label: 'Residuos', icon: Recycle },
  { to: '/logros', label: 'Logros', icon: Trophy },
]

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

export default function Navbar() {
  const { nombre, logout, theme, toggleTheme } = useAuthStore()
  const navigate = useNavigate()
  const [animating, setAnimating] = useState(false)
  const [kiruOpen, setKiruOpen] = useState(false)
  const location = useLocation()
  const navRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)

  useEffect(() => {
    const container = navRef.current
    if (!container) return
    const active = container.querySelector<HTMLElement>('[aria-current="page"]')
    if (active) setPill({ left: active.offsetLeft, width: active.offsetWidth })
  }, [location.pathname])

  const handleToggleTheme = useCallback(() => {
    setAnimating(true)
    toggleTheme()
    setTimeout(() => setAnimating(false), 500)
  }, [toggleTheme])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img src="/kiru/castor-botella.webp" alt="Kiru" width={32} height={32} className="object-contain" />
              <span className="font-display text-xl font-bold text-eco-700 dark:text-eco-400 tracking-tight">EcoLoop</span>
            </Link>
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                to="/perfil"
                className="flex items-center gap-1.5 max-w-28 rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-eco-100 hover:text-eco-700 dark:hover:bg-gray-600 transition-colors"
              >
                <UserRound size={14} className="shrink-0" />
                <span className="truncate">{nombre}</span>
              </Link>
              <IconButton onClick={handleToggleTheme} title="Cambiar tema" extraClass="dark:bg-[#1f2937] dark:hover:bg-[#1f2937]">
                <KiruToggleIcon theme={theme} animating={animating} />
              </IconButton>
              <IconButton onClick={handleLogout} title="Salir" danger>
                <LogOut size={18} />
              </IconButton>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-none pb-0.5 lg:pb-0">
            <div ref={navRef} className="relative flex items-center gap-1 bg-eco-600 rounded-full px-2 py-1.5 shadow-lg w-max mx-auto">
              {pill && (
                <span
                  className="absolute top-1.5 h-8 bg-white rounded-full pointer-events-none transition-all duration-300 ease-in-out"
                  style={{ left: pill.left, width: pill.width }}
                />
              )}
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  id={to === '/' ? 'nav-dashboard' : undefined}
                  className={({ isActive }) =>
                    `relative flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive ? 'text-eco-700' : 'text-white/90 hover:text-white'
                    }`
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <IconButton onClick={handleToggleTheme} title="Cambiar tema">
              <KiruToggleIcon theme={theme} animating={animating} />
            </IconButton>
            <Link
              to="/perfil"
              className="flex items-center gap-1.5 max-w-32 rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-eco-100 hover:text-eco-700 dark:hover:bg-gray-600 transition-colors"
            >
              <UserRound size={14} className="shrink-0" />
              <span className="truncate">{nombre}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </nav>

      <KiruChatWidget open={kiruOpen} onClose={() => setKiruOpen(false)} />

      <button
        onClick={() => setKiruOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-eco-600 px-4 py-3 text-white shadow-lg hover:bg-eco-700 transition-colors"
      >
        <img src="/kiru/castor-botella.webp" alt="Kiru" width={28} height={28} className="object-contain" />
        <span className="text-sm font-semibold">Kiru</span>
      </button>
    </>
  )
}

function IconButton({
  children,
  danger = false,
  onClick,
  title,
  extraClass = ''
}: {
  children: ReactNode
  danger?: boolean
  onClick: () => void
  title: string
  extraClass?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
        danger
          ? 'text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30'
          : 'text-gray-500 hover:bg-gray-50 hover:text-eco-700 dark:text-gray-400 dark:hover:bg-gray-700'
      } ${extraClass}`}
    >
      {children}
    </button>
  )
}
