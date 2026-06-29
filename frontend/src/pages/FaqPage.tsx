import { useState } from 'react'
import { ChevronDown, Flame, HelpCircle, Leaf, MessageCircle, ScanLine, ShieldCheck, Star, Handshake } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../store/authStore'

const FAQS = [
  {
    icon: <Flame size={18} className="text-orange-500" />,
    q: '¿Para qué sirve la racha?',
    a: (
      <div className="space-y-3">
        <p>
          Tu racha crece cada día que registras al menos un residuo. Mantenerla activa incrementa
          tu XP diario y desbloquea insignias especiales como "7 días seguidos" y "30 días seguidos".
        </p>
        <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 flex gap-3">
          <Handshake size={20} className="text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-700 dark:text-orange-300 text-sm">Próximamente: canjes en negocios aliados</p>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-0.5">
              Estamos trabajando en alianzas con negocios de sostenibilidad para que puedas
              canjear tu racha acumulada por descuentos exclusivos o productos eco-friendly.
              Mientras más larga tu racha, mayor será el beneficio. ¡Pronto más novedades!
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <Star size={18} className="text-yellow-500" />,
    q: '¿Cómo funciona el XP y los niveles?',
    a: (
      <p>
        Ganas XP cada vez que registras un residuo. La cantidad depende del tipo de material
        y el peso — materiales más difíciles de reciclar como el electrónico o el vidrio
        dan más XP por kg. Al acumular suficiente XP subes de nivel, desbloqueando nuevas
        insignias y aumentando tu rango en el leaderboard.
      </p>
    ),
  },
  {
    icon: <ShieldCheck size={18} className="text-eco-600 dark:text-eco-400" />,
    q: '¿Qué son las insignias?',
    a: (
      <p>
        Las insignias son logros desbloqueables por hitos específicos: tu primer registro,
        reciclar todos los tipos de residuo, mantener una racha de 7 o 30 días, y más.
        Cada insignia otorga XP bonus al desbloquearse y aparece en tu perfil.
      </p>
    ),
  },
  {
    icon: <Flame size={18} className="text-red-400" />,
    q: '¿Qué pasa si pierdo mi racha?',
    a: (
      <p>
        Si no registras ningún residuo en un día, tu racha vuelve a 0. Tu mejor racha
        histórica se guarda y siempre es visible en tu perfil de Logros. Para no perderla,
        con registrar aunque sea 0.1 kg de cualquier tipo es suficiente.
      </p>
    ),
  },
  {
    icon: <ScanLine size={18} className="text-purple-500" />,
    q: '¿Cómo funciona el scanner de IA?',
    a: (
      <p>
        El scanner usa visión por computadora (Groq Vision con Llama 4 Scout) para analizar
        la foto que tomas. Identifica el tipo de residuo, el contenedor correcto donde
        depositarlo y si es reciclable, además de darte un consejo personalizado.
        Funciona mejor con buena iluminación y el residuo centrado en el encuadre.
      </p>
    ),
  },
  {
    icon: <Leaf size={18} className="text-eco-600 dark:text-eco-400" />,
    q: '¿Cómo se calcula el CO₂ evitado?',
    a: (
      <p>
        Cada tipo de residuo tiene un factor de conversión basado en estándares ambientales
        internacionales (kg CO₂ evitado por kg reciclado). Por ejemplo, reciclar plástico
        evita aproximadamente 1.5 kg de CO₂ por kg reciclado. El total acumulado aparece
        en tu dashboard junto a equivalencias visuales como árboles o km de auto.
      </p>
    ),
  },
  {
    icon: <HelpCircle size={18} className="text-gray-400" />,
    q: '¿Mis datos son privados?',
    a: (
      <p>
        Tu nombre y estadísticas de reciclaje son visibles en el leaderboard comunitario.
        El impacto agregado de la comunidad (CO₂ total, kg totales) es público y no está
        vinculado a tu cuenta individualmente. Tu email nunca se muestra a otros usuarios.
      </p>
    ),
  },
]

export default function FaqPage() {
  const setKiruOpen = useAuthStore(s => s.setKiruOpen)
  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-28 space-y-6">

        <section className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-eco-100 dark:bg-gray-800">
            <HelpCircle size={28} className="text-eco-600 dark:text-eco-400" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Preguntas frecuentes
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Todo lo que necesitas saber sobre EcoLoop
            </p>
          </div>
        </section>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} icon={faq.icon} q={faq.q} a={faq.a} defaultOpen={i === 0} />
          ))}
        </div>

        <div className="rounded-xl bg-gradient-to-br from-eco-600 to-eco-700 p-5 text-white text-center space-y-2">
          <p className="font-semibold">¿Tienes otra pregunta?</p>
          <p className="text-sm text-eco-200">Habla con Kiru, nuestro asistente de IA.</p>
          <button
            onClick={() => setKiruOpen(true)}
            className="inline-flex items-center gap-2 mt-1 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-semibold transition-colors"
          >
            <MessageCircle size={15} />
            Chatear con Kiru
          </button>
        </div>

      </main>
    </div>
  )
}

function FaqItem({ icon, q, a, defaultOpen = false }: {
  icon: React.ReactNode
  q: string
  a: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <span className="shrink-0">{icon}</span>
        <span className="flex-1 font-semibold text-gray-800 dark:text-gray-100 text-sm">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}
