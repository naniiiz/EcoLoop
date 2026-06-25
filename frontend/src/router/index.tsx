import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from '../store/authStore'

const LoginPage     = lazy(() => import('../pages/LoginPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const ChatPage      = lazy(() => import('../pages/ChatPage'))

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={null}><LoginPage /></Suspense> },
  {
    path: '/',
    element: <PrivateRoute><Suspense fallback={null}><DashboardPage /></Suspense></PrivateRoute>
  },
  {
    path: '/chat',
    element: <PrivateRoute><Suspense fallback={null}><ChatPage /></Suspense></PrivateRoute>
  },
  { path: '*', element: <Navigate to="/" replace /> }
])
