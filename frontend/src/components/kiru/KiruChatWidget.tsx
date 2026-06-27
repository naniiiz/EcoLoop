import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Send, X } from 'lucide-react'
import KiruState from './KiruState'
import { enviarMensajeKiru, getPerfil } from '../../services/ecoloop'
import type { ChatMessage } from '../../types'

const WELCOME: ChatMessage = {
  rol: 'assistant',
  contenido: 'Hola! Soy Kiru, tu asesor personal de reciclaje de EcoLoop. ¿En qué puedo ayudarte hoy?'
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function KiruChatWidget({ open, onClose }: Props) {
  const { data: perfil } = useQuery({ queryKey: ['perfil'], queryFn: getPerfil })
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const mensaje = input.trim()
    setInput('')
    setMessages(prev => [...prev, { rol: 'user', contenido: mensaje }])
    setLoading(true)
    try {
      const data = await enviarMensajeKiru(mensaje)
      setMessages(prev => [...prev, { rol: 'assistant', contenido: data.respuesta }])
    } catch {
      setMessages(prev => [...prev, {
        rol: 'assistant',
        contenido: 'Tuve un problema de conexión. Intenta de nuevo en un momento.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={onClose} />}

      <div
        className={`fixed bottom-24 right-6 z-50 w-80 h-[480px] lg:w-[480px] lg:h-[620px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-eco-600 rounded-t-3xl">
          <KiruState state={loading ? 'THINKING' : 'RECOMMEND'} size={34} animate />
          <span className="font-semibold text-sm text-white flex-1 truncate">
            {loading ? 'Kiru está pensando…' : `Kiru${perfil?.nombre ? ` · ${perfil.nombre}` : ''}`}
          </span>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.rol === 'assistant' && (
                <img src="/kiru/castor-idea.webp" alt="Kiru" width={24} height={24}
                  className="object-contain self-end mr-1.5 flex-shrink-0" />
              )}
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                m.rol === 'user'
                  ? 'bg-eco-600 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
              }`}>
                {m.contenido}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start items-end gap-1.5">
              <img src="/kiru/castor-escribiendo.webp" alt="Kiru escribiendo" width={28} height={28}
                className="object-contain animate-pulse" />
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl rounded-bl-none text-sm text-eco-500">
                Kiru esta escribiendo...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 p-3 border-t border-gray-100 dark:border-gray-700">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none dark:text-white placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-3 py-2 bg-eco-600 hover:bg-eco-700 text-white rounded-xl disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </>
  )
}
