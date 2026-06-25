import { useState, useRef, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import api from '../services/api'
import { ChatMessage } from '../types'
import { useAuthStore } from '../store/authStore'

const WELCOME: ChatMessage = {
  rol: 'assistant',
  contenido: '¡Hola! Soy EcoLoop 🌱 Tu agente de reciclaje personal. ¿En qué puedo ayudarte hoy?'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  // TODO: replace with real usuarioId from auth/profile endpoint
  const _email = useAuthStore(s => s.email)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const mensaje = input.trim()
    setInput('')
    setMessages(prev => [...prev, { rol: 'user', contenido: mensaje }])
    setLoading(true)
    try {
      const { data } = await api.post('/agente/chat', { usuarioId: 1, mensaje })
      setMessages(prev => [...prev, { rol: 'assistant', contenido: data.respuesta }])
    } catch {
      setMessages(prev => [...prev, {
        rol: 'assistant',
        contenido: 'Tuve un problema de conexión. ¡Pero sigue reciclando! 🌿'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-4 gap-3">
        <div className="flex-1 overflow-y-auto space-y-3 pb-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap
                ${m.rol === 'user'
                  ? 'bg-eco-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none shadow-sm'}`}>
                {m.contenido}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                <span className="animate-pulse text-eco-500 text-sm">EcoLoop está pensando...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm">
          <input type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-sm dark:text-white placeholder-gray-400" />
          <button onClick={handleSend} disabled={loading}
            className="px-4 py-2 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
