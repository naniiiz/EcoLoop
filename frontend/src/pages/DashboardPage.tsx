import { type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { ArrowRight, BatteryCharging, Car, Flame, Leaf, Sprout, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import KiruState from '../components/kiru/KiruState'
import { getImpactoPorTipo, getImpactoResumen, getPerfil } from '../services/ecoloop'
import { clampPercent, formatKg, formatNumber, getLevelBaseXp } from '../utils/format'

const PIE_COLORS = [
  '#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#6366f1',
]

function SmallLegend({ payload }: { payload?: Array<{ color: string; value: string }> }) {
  if (!payload) return null
  return (
    <ul className="flex flex-col gap-1 pl-2">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 truncate max-w-[70px] sm:max-w-[120px]">{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}

export default function DashboardPage() {
  const { data: perfil, isLoading: loadingPerfil } = useQuery({ queryKey: ['perfil'], queryFn: getPerfil })
  const { data: resumen, isLoading: loadingResumen } = useQuery({
    queryKey: ['impacto-resumen'],
    queryFn: getImpactoResumen
  })

  const { data: porTipo = [], isLoading: loadingPorTipo } = useQuery({
    queryKey: ['impacto-por-tipo'],
    queryFn: getImpactoPorTipo
  })

  const baseXp = getLevelBaseXp(perfil?.nivelActual ?? 1)
  const nextXp = perfil?.xpParaSiguienteNivel ?? null
  const progress = nextXp
    ? clampPercent((((perfil?.xpTotal ?? 0) - baseXp) / (nextXp - baseXp)) * 100)
    : 100
  const loading = loadingPerfil || loadingResumen || loadingPorTipo
  const isNewUser = !loadingPerfil && (perfil?.xpTotal ?? 0) === 0

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <KiruState state={isNewUser ? 'WELCOME' : 'IMPACT'} size={106} animate />
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {isNewUser
                  ? `Hola, ${perfil?.nombre ?? 'reciclador'}! Soy Kiru, tu asesor de reciclaje.`
                  : `Hola, ${perfil?.nombre ?? 'reciclador'}`}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isNewUser
                  ? 'Registra tu primer residuo y empieza a ganar XP.'
                  : `${perfil?.nombreNivel ?? 'Cargando nivel'} - ${formatNumber(progress, 0)}% al siguiente tramo`}
              </p>
            </div>
          </div>
          <Link
            to="/registro"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-eco-600 px-4 text-sm font-semibold text-white hover:bg-eco-700 transition-colors"
          >
            Registrar residuo
            <ArrowRight size={16} />
          </Link>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Zap size={24} className="text-xp-500" />}
            label="XP total"
            value={String(perfil?.xpTotal ?? 0)}
            loading={loadingPerfil}
            accent
          />
          <StatCard
            icon={<Flame size={24} className="text-orange-500" />}
            label="Racha actual"
            value={`${perfil?.rachaActual ?? 0} dias`}
            loading={loadingPerfil}
          />
          <StatCard
            icon={<Leaf size={24} className="text-eco-500" />}
            label="CO2 evitado"
            value={formatKg(resumen?.co2TotalKg ?? perfil?.co2TotalEvitadoKg, 1)}
            loading={loadingResumen}
          />
          <StatCard
            icon={<Sprout size={24} className="text-emerald-500" />}
            label="Kg reciclados"
            value={formatKg(resumen?.kgTotalReciclado, 1)}
            loading={loadingResumen}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm min-h-[320px]">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Impacto por tipo de residuo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">CO2 evitado por cada tipo registrado</p>
              </div>
              <span className="text-xs font-medium text-gray-400">{porTipo.length} tipos</span>
            </div>
            {porTipo.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={porTipo}
                      dataKey="co2Kg"
                      nameKey="tipoResiduo"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                    >
                      {porTipo.map((_: unknown, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${formatNumber(Number(value), 2)} kg CO2`, name]} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" content={<SmallLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState loading={loading} text="Registra tu primer residuo para ver el grafico." />
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Equivalencias</h3>
            <div className="space-y-3">
              <ImpactRow
                icon={<Sprout size={18} />}
                label="Arboles por ano"
                value={formatNumber(resumen?.equivalenteArboles, 2)}
              />
              <ImpactRow
                icon={<Car size={18} />}
                label="Km de auto evitados"
                value={formatNumber(resumen?.equivalenteKmAuto, 1)}
              />
              <ImpactRow
                icon={<BatteryCharging size={18} />}
                label="Cargas de telefono"
                value={formatNumber(resumen?.equivalenteCargasTelefono, 0)}
              />
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">{perfil?.nombreNivel ?? 'Nivel'}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {nextXp ? `${perfil?.xpTotal ?? 0}/${nextXp} XP` : 'Nivel maximo'}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div className="h-full bg-eco-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

function StatCard({
  icon,
  label,
  loading,
  value,
  accent = false
}: {
  icon: ReactNode
  label: string
  loading?: boolean
  value: string
  accent?: boolean
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent ? 'bg-xp-bg dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-700'}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className={`font-display text-2xl font-bold tracking-tight ${accent ? 'text-xp-600 dark:text-xp-400' : 'text-eco-700 dark:text-eco-400'}`}>
            {loading ? '...' : value}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  )
}

function ImpactRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
      <div className="flex items-center gap-2 min-w-0 text-gray-600 dark:text-gray-300">
        <span className="text-eco-600 dark:text-eco-400">{icon}</span>
        <span className="text-sm truncate">{label}</span>
      </div>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

function EmptyState({ loading, text }: { loading: boolean; text: string }) {
  return (
    <div className="h-64 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm text-gray-400 px-4 text-center">
      {loading ? 'Cargando datos...' : text}
    </div>
  )
}
