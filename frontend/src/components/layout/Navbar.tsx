import { NavLink, Link, useNavigate } from 'react-router-dom'
import { type ReactNode, useState, useCallback } from 'react'
import {
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PlusCircle,
  Recycle,
  Trophy,
  UserRound
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/registro', label: 'Residuos', icon: Recycle },
  { to: '/logros', label: 'Logros', icon: Trophy },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
  { to: '/chat', label: 'Kiru', icon: MessageCircle }
]

function KiruToggleIcon({ theme, animating }: { theme: string; animating: boolean }) {
  // light mode → show moon (will switch to dark), dark mode → show sun (will switch to light)
  const src = theme === 'light' ? '/kiru/kiru-luna.png' : '/kiru/kiru-sol.png'
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
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src="/kiru/castor-botella.webp" alt="Kiru" width={32} height={32} className="object-contain" />
            <span className="text-xl font-bold text-eco-700 dark:text-eco-400">EcoLoop</span>
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <IconButton onClick={handleToggleTheme} title="Cambiar tema" extraClass="dark:bg-[#1f2937] dark:hover:bg-[#1f2937]">
              <KiruToggleIcon theme={theme} animating={animating} />
            </IconButton>
            <IconButton onClick={handleLogout} title="Salir" danger>
              <LogOut size={18} />
            </IconButton>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-eco-100 text-eco-700 dark:bg-gray-700 dark:text-eco-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-eco-700 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/registro"
            title="Nuevo registro"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-eco-600 text-white hover:bg-eco-700 transition-colors"
          >
            <PlusCircle size={18} />
          </NavLink>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <IconButton onClick={handleToggleTheme} title="Cambiar tema">
            <KiruToggleIcon theme={theme} animating={animating} />
          </IconButton>
          <span className="max-w-32 truncate text-sm text-gray-400 dark:text-gray-500">{nombre}</span>
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
