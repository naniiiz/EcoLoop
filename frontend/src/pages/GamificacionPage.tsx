import {} from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Award,
  BadgeCheck,
  FileText,
  Flame,
  LockKeyhole,
  Recycle,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Wine,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import KiruState from '../components/kiru/KiruState'
import { getInsignias, getPerfil } from '../services/ecoloop'
import { clampPercent, formatDate, getLevelBaseXp } from '../utils/format'

const badgeIcons: Record<string, LucideIcon> = {
  'first-step': BadgeCheck,
  plastic:      Recycle,
  glass:        Wine,
  paper:        FileText,
  'streak-7':   Flame,
  'streak-30':  Flame,
  'eco-hero':   ShieldCheck,
  'all-types':  Sparkles,
}

const diasStr = (n: number) => n === 1 ? '1 día' : `${n} días`

export default function GamificacionPage() {
  const { data: perfil, isLoading: loadingPerfil } = useQuery({ queryKey: ['perfil'], queryFn: getPerfil })
  const { data: insignias = [], isLoading: loadingInsignias } = useQuery({
    queryKey: ['insignias'],
    queryFn: getInsignias,
  })

  const baseXp      = getLevelBaseXp(perfil?.nivelActual ?? 1)
  const nextXp      = perfil?.xpParaSiguienteNivel ?? null
  const progress    = nextXp
    ? clampPercent((((perfil?.xpTotal ?? 0) - baseXp) / (nextXp - baseXp)) * 100)
    : 100
  const isMaxLevel  = !nextXp
  const desbloqueadas = insignias.filter(i => i.desbloqueada)
  const loading     = loadingPerfil || loadingInsignias

  // Próximo objetivo: insignia bloqueada con menor xpBonus (más asequible)
  const proximoObjetivo = insignias
    .filter(i => !i.desbloqueada)
    .sort((a, b) => a.xpBonus - b.xpBonus)[0] ?? null

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <KiruState state="CELEBRATE" size={96} />
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Gamificación</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {desbloqueadas.length}/{insignias.length || 8} insignias desbloqueadas
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-4">

          {/* Tarjeta de nivel y progreso */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  {perfil?.nombreNivel ?? 'Nivel actual'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nivel {perfil?.nivelActual ?? 1}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-eco-100 text-eco-700 dark:bg-gray-700 dark:text-eco-400">
                <Trophy size={24} />
              </div>
            </div>

            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold text-xp-600 dark:text-xp-400">{perfil?.xpTotal ?? 0} XP</span>
              <span className={`text-sm font-medium ${isMaxLevel ? 'text-xp-500 dark:text-xp-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {isMaxLevel ? 'Nivel máximo ✦' : `${nextXp} XP`}
              </span>
            </div>
            <div className={`h-4 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden ${isMaxLevel ? 'level-max-glow' : ''}`}>
              <div
                className={`h-full transition-all ${isMaxLevel ? 'bg-gradient-to-r from-xp-400 to-orange-400' : 'bg-xp-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Racha actual" value={diasStr(perfil?.rachaActual ?? 0)} />
              <MiniStat label="Mejor racha"  value={diasStr(perfil?.mejorRacha  ?? 0)} />
            </div>
          </div>

          {/* Próximo objetivo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-eco-600 dark:text-eco-400" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Próximo objetivo</h3>
            </div>

            {loading && (
              <p className="text-sm text-gray-400">Cargando...</p>
            )}

            {!loading && !proximoObjetivo && (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <Sparkles size={32} className="text-yellow-400" />
                <p className="font-semibold text-gray-800 dark:text-gray-100">¡Todo desbloqueado!</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Has conseguido todas las insignias.</p>
              </div>
            )}

            {!loading && proximoObjetivo && (() => {
              const Icon = badgeIcons[proximoObjetivo.icono] ?? Award
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-700">
                      <Icon size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{proximoObjetivo.nombre}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{proximoObjetivo.descripcion}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-600 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <LockKeyhole size={14} />
                      <span className="text-xs">Bloqueada</span>
                    </div>
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">+{proximoObjetivo.xpBonus} XP al desbloquear</span>
                  </div>

                  {insignias.filter(i => !i.desbloqueada).length > 1 && (
                    <p className="text-xs text-gray-400 text-right">
                      +{insignias.filter(i => !i.desbloqueada).length - 1} insignia{insignias.filter(i => !i.desbloqueada).length - 1 !== 1 ? 's' : ''} más por desbloquear
                    </p>
                  )}
                </div>
              )
            })()}
          </div>
        </section>

        {/* Cuadrícula de insignias — todas, bloqueadas en gris */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Insignias</h3>
            <span className="text-xs font-medium text-gray-400">
              {loading ? 'Cargando...' : `${desbloqueadas.length}/${insignias.length} desbloqueadas`}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {insignias.map(insignia => {
              const Icon = badgeIcons[insignia.icono] ?? Award
              return (
                <article
                  key={insignia.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    insignia.desbloqueada
                      ? 'border-eco-200 bg-eco-50 dark:border-eco-500 dark:bg-gray-700'
                      : 'border-gray-100 bg-white opacity-50 grayscale dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                      insignia.desbloqueada
                        ? 'bg-eco-600 text-white'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                    }`}>
                      {insignia.desbloqueada ? <Icon size={22} /> : <LockKeyhole size={22} />}
                    </div>
                    {insignia.desbloqueada
                      ? <BadgeCheck size={18} className="text-eco-600 dark:text-eco-400" />
                      : <LockKeyhole size={18} className="text-gray-300" />
                    }
                  </div>
                  <h4 className="mt-4 font-semibold text-gray-900 dark:text-white">{insignia.nombre}</h4>
                  <p className="mt-1 min-h-10 text-sm text-gray-500 dark:text-gray-400">{insignia.descripcion}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-semibold text-yellow-600 dark:text-yellow-300">+{insignia.xpBonus} XP</span>
                    <span className="text-gray-400">
                      {insignia.desbloqueada ? formatDate(insignia.fechaDesbloqueada) : 'Bloqueada'}
                    </span>
                  </div>
                </article>
              )
            })}
            {!loading && insignias.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400 dark:border-gray-700">
                No hay insignias configuradas.
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  )
}
