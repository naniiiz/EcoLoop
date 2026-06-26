import { Link, useRouteError } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'

export default function RouteErrorPage() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : 'Error inesperado'

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-sm dark:bg-gray-800">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30">
          <AlertTriangle size={24} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Algo fallo</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        <Link
          to="/"
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-eco-600 px-4 text-sm font-semibold text-white hover:bg-eco-700 transition-colors"
        >
          <Home size={16} />
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
