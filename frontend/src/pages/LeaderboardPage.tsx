import { useQuery } from '@tanstack/react-query'
import { Trophy } from 'lucide-react'
import api from '../services/api'
import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../store/authStore'

interface LeaderboardEntry {
  posicion: number
  nombre: string
  xpSemana: number
  nivelActual: string
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>('/leaderboard/semanal')
  return data
}

const MEDAL_STYLES = [
  { bg: 'bg-yellow-400', text: 'text-yellow-900' },
  { bg: 'bg-gray-300',   text: 'text-gray-700'   },
  { bg: 'bg-amber-600',  text: 'text-white'       },
]
function MedalBadge({ pos }: { pos: number }) {
  const s = MEDAL_STYLES[pos - 1]
  return (
    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
      {pos}
    </span>
  )
}

const AVATAR_COLORS = [
  'bg-eco-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
]

export default function LeaderboardPage() {
  const { nombre: miNombre } = useAuthStore()

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 60_000,
  })

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-28 space-y-6">
        <div className="flex items-center gap-4">
          <img src="/kiru/kiru-ranking.webp" alt="Kiru" className="w-32 h-32 object-contain drop-shadow-sm" />
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Ranking Semanal</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Top 10 por XP ganado en los últimos 7 días</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-eco-600 border-t-transparent" />
          </div>
        )}

        {isError && (
          <p className="text-center text-red-500 py-8">No se pudo cargar el ranking.</p>
        )}

        {!isLoading && !isError && data.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Aún no hay datos.</p>
        )}

        {data.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            {/* Podio top 3 */}
            <div className="flex items-end justify-center gap-4 bg-gradient-to-b from-eco-600 to-eco-500 px-6 pt-6 pb-8">
              {[data[1], data[0], data[2]].filter(Boolean).map((entry, i) => {
                const order = [1, 0, 2]
                const heights = ['h-28', 'h-20', 'h-16']
                const realIdx = order[i]
                return (
                  <div key={entry.posicion} className="flex flex-col items-center gap-2">
                    <MedalBadge pos={entry.posicion} />
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg ${AVATAR_COLORS[(entry.posicion - 1) % AVATAR_COLORS.length]} ring-2 ring-white`}>
                      {entry.nombre.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-white font-semibold text-sm max-w-[80px] truncate text-center">{entry.nombre}</p>
                    <p className="text-eco-100 text-xs">{entry.xpSemana ?? 0} XP</p>
                    <div className={`w-16 rounded-t-lg bg-white/20 ${heights[realIdx]}`} />
                  </div>
                )
              })}
            </div>

            {/* Tabla posiciones 4-10 */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left w-12">#</th>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-right">XP</th>
                  <th className="px-4 py-3 text-right">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(3).map(entry => {
                  const esMio = entry.nombre === miNombre
                  return (
                    <tr
                      key={entry.posicion}
                      className={`border-b border-gray-50 dark:border-gray-700/50 transition-colors ${
                        esMio
                          ? 'bg-eco-50 dark:bg-eco-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500 font-mono font-medium">
                        {entry.posicion}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold shrink-0 ${AVATAR_COLORS[(entry.posicion - 1) % AVATAR_COLORS.length]}`}>
                            {entry.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className={`font-medium ${esMio ? 'text-eco-700 dark:text-eco-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            {entry.nombre}
                            {esMio && <span className="ml-2 text-xs text-eco-500">(tú)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                        {(entry.xpSemana ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="rounded-full bg-eco-100 dark:bg-eco-900/40 px-2 py-0.5 text-xs font-medium text-eco-700 dark:text-eco-400">
                          {entry.nivelActual}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* También resalta si el usuario está en top 3 */}
            {data.slice(0, 3).some(e => e.nombre === miNombre) && (
              <p className="px-4 py-3 text-center text-xs text-eco-600 dark:text-eco-400 font-medium border-t border-gray-100 dark:border-gray-700">
                <Trophy size={14} className="inline mr-1" />
              ¡Estás en el podio!
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
