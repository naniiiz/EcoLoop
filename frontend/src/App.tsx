import { RouterProvider } from 'react-router-dom'
import { useEffect } from 'react'
import { router } from './router'
import { useAuthStore } from './store/authStore'
import TransitionOverlay from './components/ui/TransitionOverlay'

export default function App() {
  const theme = useAuthStore(s => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <>
      <RouterProvider router={router} />
      <TransitionOverlay />
    </>
  )
}
