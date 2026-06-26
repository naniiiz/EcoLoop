import { type ReactNode, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, CalendarDays, Leaf, Scale, ShieldCheck, Target, TrendingUp } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import KiruState from '../components/kiru/KiruState'
import { getImpactoMensual, getImpactoResumen, getPerfil, getTiposResiduo } from '../services/ecoloop'
import { formatKg, formatNumber } from '../utils/format'

export default function PerfilHabitosPage() {
  const { data: perfil, isLoading: loadingPerfil } = useQuery({ queryKey: ['perfil'], queryFn: getPerfil })
  const { data: resumen, isLoading: loadingResumen } = useQuery({
    queryKey: ['impacto-resumen'],
    queryFn: getImpactoResumen
  })
  const { data: mensual = [], isLoading: loadingMensual } = useQuery({
    queryKey: ['impacto-mensual'],
    queryFn: getImpactoMensual
  })
  const { data: tipos = [] } = useQuery({ queryKey: ['tipos-residuo'], queryFn: getTiposResiduo })

  const habits = useMemo(() => {
    const months = mensual.length
    const totalKg = mensual.reduce((sum, item) => sum + item.kgReciclado, 0)
    const totalCo2 = mensual.reduce((sum, item) => sum + item.co2Kg, 0)
    const bestMonth = mensual.reduce(
      (best, item) => (item.co2Kg > best.co2Kg ? item : best),
      mensual[0] ?? { mes: 'Sin datos', co2Kg: 0, kgReciclado: 0, xpGanado: 0 }
    )
    const highImpactType = [...tipos].sort((a, b) => Number(b.factorCo2Kg) - Number(a.factorCo2Kg))[0]

    return {
      avgKg: months ? totalKg / months : 0,
      avgCo2: months ? totalCo2 / months : 0,
      bestMonth,
      highImpactType
    }
  }, [mensual, tipos])

  const loading = loadingPerfil || loadingResumen || loadingMensual

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <section className="flex items-center gap-4">
          <KiruState state="ANALYZE" size={96} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil de habitos</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {perfil?.nombre ?? 'Usuario'} - {perfil?.nombreNivel ?? 'Nivel actual'}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProfileCard
            icon={<Activity size={22} />}
            label="Racha actual"
            value={`${perfil?.rachaActual ?? 0} dias`}
            detail={`Mejor: ${perfil?.mejorRacha ?? 0} dias`}
            loading={loadingPerfil}
          />
          <ProfileCard
            icon={<Leaf size={22} />}
            label="CO2 total evitado"
            value={formatKg(resumen?.co2TotalKg ?? perfil?.co2TotalEvitadoKg, 1)}
            detail={`${resumen?.totalRegistros ?? 0} registros`}
            loading={loadingResumen}
          />
          <ProfileCard
            icon={<Target size={22} />}
            label="Meta semanal"
            value={formatKg(perfil?.metaSemanalKg, 1)}
            detail={`${perfil?.xpTotal ?? 0} XP acumulado`}
            loading={loadingPerfil}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Lectura de habitos</h3>
            <div className="space-y-3">
              <InsightRow
                icon={<Scale size={18} />}
                title="Promedio mensual"
                value={`${formatKg(habits.avgKg, 1)} reciclados`}
                detail={`${formatKg(habits.avgCo2, 1)} CO2 evitado`}
              />
              <InsightRow
                icon={<CalendarDays size={18} />}
                title="Mes mas fuerte"
                value={habits.bestMonth.mes}
                detail={`${formatKg(habits.bestMonth.co2Kg, 1)} CO2`}
              />
              <InsightRow
                icon={<ShieldCheck size={18} />}
                title="Mayor impacto por kg"
                value={habits.highImpactType?.nombre ?? 'Sin tipos'}
                detail={`${formatNumber(habits.highImpactType?.factorCo2Kg, 2)} kg CO2/kg`}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <KiruState state="ANALYZE" size={64} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Senales de Kiru</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Cargando datos...' : 'Basado en tus registros actuales'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <KiruSignal
                text={
                  (perfil?.rachaActual ?? 0) > 0
                    ? `Racha activa de ${perfil?.rachaActual ?? 0} dias. Mantener ritmo suma XP constante.`
                    : 'Primer registro pendiente. Un registro hoy activa racha y XP.'
                }
              />
              <KiruSignal
                text={
                  (resumen?.kgTotalReciclado ?? 0) >= (perfil?.metaSemanalKg ?? 0)
                    ? 'Meta semanal base ya superada con tu acumulado registrado.'
                    : `Meta visible: ${formatKg(perfil?.metaSemanalKg, 1)} por semana.`
                }
              />
              <KiruSignal
                text={
                  habits.highImpactType
                    ? `${habits.highImpactType.nombre} tiene mayor CO2 evitado por kg en el catalogo.`
                    : 'Catalogo de residuos pendiente de cargar.'
                }
              />
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-eco-600 dark:text-eco-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Meses registrados</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mensual.map(item => (
              <div key={item.mes} className="rounded-lg border border-gray-100 p-4 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">{item.mes}</div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {formatKg(item.kgReciclado, 1)} reciclados
                </div>
                <div className="text-sm text-eco-700 dark:text-eco-400">
                  {formatKg(item.co2Kg, 1)} CO2 - {item.xpGanado} XP
                </div>
              </div>
            ))}
            {!loading && mensual.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400 dark:border-gray-700">
                Aun no hay meses con registros.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function ProfileCard({
  detail,
  icon,
  label,
  loading,
  value
}: {
  detail: string
  icon: ReactNode
  label: string
  loading?: boolean
  value: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-eco-100 text-eco-700 dark:bg-gray-700 dark:text-eco-400">
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{loading ? '...' : value}</div>
          <div className="text-xs text-gray-400">{detail}</div>
        </div>
      </div>
    </div>
  )
}

function InsightRow({
  detail,
  icon,
  title,
  value
}: {
  detail: string
  icon: ReactNode
  title: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-700">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-eco-600 dark:text-eco-400">{icon}</span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{detail}</div>
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">{value}</span>
    </div>
  )
}

function KiruSignal({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
      {text}
    </div>
  )
}
