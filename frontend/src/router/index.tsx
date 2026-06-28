import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from '../store/authStore'
import RouteErrorPage from '../pages/RouteErrorPage'

const LoginPage     = lazy(() => import('../pages/LoginPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const ChatPage      = lazy(() => import('../pages/ChatPage'))
const ResiduoPage   = lazy(() => import('../pages/ResiduoPage'))
const GamificacionPage = lazy(() => import('../pages/GamificacionPage'))
const PerfilHabitosPage = lazy(() => import('../pages/PerfilHabitosPage'))
const ScannerPage = lazy(() => import('../pages/ScannerPage'))

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={null}><LoginPage /></Suspense>, errorElement: <RouteErrorPage /> },
  {
    path: '/',
    element: <PrivateRoute><Suspense fallback={null}><DashboardPage /></Suspense></PrivateRoute>,
    errorElement: <RouteErrorPage />
  },
  {
    path: '/chat',
    element: <PrivateRoute><Suspense fallback={null}><ChatPage /></Suspense></PrivateRoute>,
    errorElement: <RouteErrorPage />
  },
  {
    path: '/registro',
    element: <PrivateRoute><Suspense fallback={null}><ResiduoPage /></Suspense></PrivateRoute>,
    errorElement: <RouteErrorPage />
  },
  {
    path: '/logros',
    element: <PrivateRoute><Suspense fallback={null}><GamificacionPage /></Suspense></PrivateRoute>,
    errorElement: <RouteErrorPage />
  },
  {
    path: '/perfil',
    element: <PrivateRoute><Suspense fallback={null}><PerfilHabitosPage /></Suspense></PrivateRoute>,
    errorElement: <RouteErrorPage />
  },
  {
    path: '/scanner',
    element: <PrivateRoute><Suspense fallback={null}><ScannerPage /></Suspense></PrivateRoute>,
    errorElement: <RouteErrorPage />
  },
  { path: '*', element: <Navigate to="/" replace /> }
])
