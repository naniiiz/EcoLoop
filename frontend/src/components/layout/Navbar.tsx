import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, LogOut, LayoutDashboard, MessageCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const { nombre, logout, theme, toggleTheme } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/kiru/castor-botella.webp" alt="Kiru" width={32} height={32} className="object-contain" />
          <span className="text-xl font-bold text-eco-700 dark:text-eco-400">EcoLoop</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-eco-600 transition-colors">
            <LayoutDashboard size={15} />
            Dashboard
          </Link>
          <Link to="/chat" className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-eco-600 transition-colors">
            <MessageCircle size={15} />
            Chat IA
          </Link>
          <button onClick={toggleTheme} title="Cambiar tema"
            className="text-gray-500 dark:text-gray-400 hover:text-eco-600 transition-colors">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <span className="text-sm text-gray-400 dark:text-gray-500">{nombre}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
            <LogOut size={15} />
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
