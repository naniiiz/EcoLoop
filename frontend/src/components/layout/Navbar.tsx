import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const { nombre, logout, theme, toggleTheme } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-eco-700 dark:text-eco-400">
          🌱 EcoLoop
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/"     className="text-sm text-gray-600 dark:text-gray-300 hover:text-eco-600 transition-colors">Dashboard</Link>
          <Link to="/chat" className="text-sm text-gray-600 dark:text-gray-300 hover:text-eco-600 transition-colors">Chat IA</Link>
          <button onClick={toggleTheme} className="text-lg" title="Cambiar tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span className="text-sm text-gray-400 dark:text-gray-500">{nombre}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium">
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
