import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, AlertCircle, CalendarDays, Leaf, Pencil, Save, Scale, ShieldCheck, Target, TrendingUp, X } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import KiruState from '../components/kiru/KiruState'
import { getImpactoMensual, getImpactoPorTipo, getImpactoResumen, getPerfil, getTiposResiduo, updatePerfil } from '../services/ecoloop'
import { formatKg, formatNumber } from '../utils/format'

const diasStr = (n: number) => n === 1 ? '1 día' : `${n} días`

const formatMes = (mes: string) => {
  if (!mes || mes === 'Sin datos') return mes
  const [year, month] = mes.split('-')
  if (!year || !month) return mes
  const label = new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function PerfilHabitosPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState('')
  const [meta, setMeta] = useState('')

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
  const { data: porTipo = [] } = useQuery({ queryKey: ['impacto-por-tipo'], queryFn: getImpactoPorTipo })

  const habits = useMemo(() => {
    const months = mensual.length
    const totalKg  = mensual.reduce((sum, item) => sum + item.kgReciclado, 0)
    const totalCo2 = mensual.reduce((sum, item) => sum + item.co2Kg, 0)
    const bestMonth = mensual.reduce(
      (best, item) => (item.co2Kg > best.co2Kg ? item : best),
      mensual[0] ?? { mes: 'Sin datos', co2Kg: 0, kgReciclado: 0, xpGanado: 0 }
    )
    const highImpactType = [...tipos].sort((a, b) => Number(b.factorCo2Kg) - Number(a.factorCo2Kg))[0]
    const codigosRegistrados = new Set(porTipo.map((p: { codigo: string }) => p.codigo))
    const tipoAusente = tipos.find(t => !codigosRegistrados.has(t.codigo)) ?? null
    return {
      avgKg: months ? totalKg / months : 0,
      avgCo2: months ? totalCo2 / months : 0,
      bestMonth,
      highImpactType,
      tipoAusente,
    }
  }, [mensual, tipos, porTipo])

  useEffect(() => {
    if (perfil && !editing) {
      setNombre(perfil.nombre)
      setMeta(String(perfil.metaSemanalKg))
    }
  }, [perfil, editing])

  const updateMutation = useMutation({
    mutationFn: updatePerfil,
    onSuccess: updated => {
      void queryClient.setQueryData(['perfil'], updated)
      setEditing(false)
    }
  })

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    const metaNum = Number(meta)
    if (!nombre.trim() || !Number.isFinite(metaNum) || metaNum < 0.1) return
    updateMutation.mutate({ nombre: nombre.trim(), metaSemanalKg: metaNum })
  }

  const loading = loadingPerfil || loadingResumen || loadingMensual

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <KiruState state="ANALYZE" size={96} animate />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil de hábitos</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {perfil?.nombre ?? 'Usuario'} - {perfil?.nombreNivel ?? 'Nivel actual'}
              </p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors self-start sm:self-auto"
            >
              <Pencil size={15} />
              Editar perfil
            </button>
          )}
        </section>

        {editing && (
          <section className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Editar perfil</h3>
            <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
              </div>
              <div className="w-full sm:w-44">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Meta semanal (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={meta}
                  onChange={e => setMeta(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
              </div>
              <div className="flex gap-2 items-end">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700 disabled:opacity-50 transition-colors"
                >
                  <Save size={15} />
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={15} />
                  Cancelar
                </button>
              </div>
            </form>
            {updateMutation.isError && (
              <p className="mt-3 text-sm text-red-500">No se pudo guardar. Intenta de nuevo.</p>
            )}
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProfileCard
            icon={<Activity size={22} />}
            label="Racha actual"
            value={diasStr(perfil?.rachaActual ?? 0)}
            detail={`Mejor: ${diasStr(perfil?.mejorRacha ?? 0)}`}
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
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Lectura de hábitos</h3>
            <div className="space-y-3">
              <InsightRow
                icon={<Scale size={18} />}
                title="Promedio mensual"
                value={`${formatKg(habits.avgKg, 1)} reciclados`}
                detail={`${formatKg(habits.avgCo2, 1)} CO2 evitado`}
              />
              <InsightRow
                icon={<CalendarDays size={18} />}
                title="Mes más fuerte"
                value={formatMes(habits.bestMonth.mes)}
                detail={`${formatKg(habits.bestMonth.co2Kg, 1)} CO2`}
              />
              <InsightRow
                icon={<ShieldCheck size={18} />}
                title="Mayor impacto por kg"
                value={habits.highImpactType?.nombre ?? 'Sin tipos'}
                detail={`${formatNumber(habits.highImpactType?.factorCo2Kg, 2)} kg CO₂/kg`}
              />
              <InsightRow
                icon={<AlertCircle size={18} />}
                title="Tipo sin registrar"
                value={habits.tipoAusente?.nombre ?? 'Todos registrados'}
                detail={habits.tipoAusente ? `Potencial: ${formatNumber(habits.tipoAusente.factorCo2Kg, 2)} kg CO₂/kg` : 'Excelente variedad'}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <KiruState state="ANALYZE" size={64} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Señales de Kiru</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Cargando datos...' : 'Basado en tus registros actuales'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <KiruSignal
                type="streak"
                emoji="🔥"
                text={
                  (perfil?.rachaActual ?? 0) > 0
                    ? `Racha activa de ${diasStr(perfil?.rachaActual ?? 0)}. Mantener ritmo suma XP constante.`
                    : 'Primer registro pendiente. Un registro hoy activa racha y XP.'
                }
              />
              <KiruSignal
                type="goal"
                emoji="🎯"
                text={
                  (resumen?.kgTotalReciclado ?? 0) >= (perfil?.metaSemanalKg ?? 0)
                    ? 'Meta semanal base ya superada con tu acumulado registrado.'
                    : `Meta visible: ${formatKg(perfil?.metaSemanalKg, 1)} por semana.`
                }
              />
              <KiruSignal
                type="tip"
                emoji="💡"
                text={
                  habits.tipoAusente
                    ? `Aún no registras ${habits.tipoAusente.nombre}. Factor CO₂: ${formatNumber(habits.tipoAusente.factorCo2Kg, 2)} kg CO₂/kg. Añadir variedad mejora tu perfil.`
                    : habits.highImpactType
                      ? `${habits.highImpactType.nombre} tiene mayor CO₂ por kg. Priorizarlo maximiza impacto.`
                      : 'Catálogo de residuos pendiente de cargar.'
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
                <div className="font-semibold text-gray-900 dark:text-white">{formatMes(item.mes)}</div>
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
                Aún no hay meses con registros.
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}

function ProfileCard({
  detail, icon, label, loading, value
}: {
  detail: string; icon: ReactNode; label: string; loading?: boolean; value: string
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
  detail, icon, title, value
}: {
  detail: string; icon: ReactNode; title: string; value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-700">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-eco-600 dark:text-eco-400 flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{detail}</div>
        </div>
      </div>
      <span className="text-sm font-bold text-gray-900 dark:text-white text-right shrink-0">{value}</span>
    </div>
  )
}

const signalStyles = {
  streak: {
    border:  'border-l-orange-400',
    bg:      'bg-orange-50 dark:bg-orange-950/20',
    text:    'text-orange-900 dark:text-orange-200',
  },
  goal: {
    border:  'border-l-blue-400',
    bg:      'bg-blue-50 dark:bg-blue-950/20',
    text:    'text-blue-900 dark:text-blue-200',
  },
  tip: {
    border:  'border-l-eco-500',
    bg:      'bg-eco-50 dark:bg-eco-900/20',
    text:    'text-eco-900 dark:text-eco-200',
  },
} as const

function KiruSignal({ emoji, text, type }: { emoji: string; text: string; type: keyof typeof signalStyles }) {
  const s = signalStyles[type]
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border-l-4 p-3 ${s.border} ${s.bg}`}>
      <span className="text-base leading-snug flex-shrink-0">{emoji}</span>
      <p className={`text-sm leading-snug ${s.text}`}>{text}</p>
    </div>
  )
}
