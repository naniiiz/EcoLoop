import { type ReactNode, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar, BarChart, CartesianGrid, Cell,
  Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import { ArrowRight, Car, Check, Download, Leaf, Share2, ShoppingBag, Sprout, Tv } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import KiruState from '../components/kiru/KiruState'
import { getImpactoComunidad, getImpactoMensual, getImpactoPorTipo, getImpactoResumen, getPerfil } from '../services/ecoloop'
import { clampPercent, formatKg, formatNumber, getLevelBaseXp } from '../utils/format'

const TIPO_COLORS: Record<string, string> = {
  PLASTICO:    '#2563eb',
  PAPEL:       '#d97706',
  VIDRIO:      '#0891b2',
  METAL:       '#6366f1',
  ORGANICO:    '#16a34a',
  ELECTRONICO: '#dc2626',
}
const FALLBACK_COLORS = ['#7c3aed','#db2777','#65a30d','#ea580c']
const getColor = (codigo: string, i: number) =>
  TIPO_COLORS[codigo] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]

const formatMesShort = (mes: string) => {
  const [, month] = mes.split('-')
  return new Date(2000, Number(month) - 1).toLocaleDateString('es-PE', { month: 'short' })
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
  const { data: mensual = [] } = useQuery({
    queryKey: ['impacto-mensual'],
    queryFn: getImpactoMensual
  })
  const { data: comunidad } = useQuery({
    queryKey: ['impacto-comunidad'],
    queryFn: getImpactoComunidad,
    staleTime: 120_000,
  })

  const sortedPorTipo = [...porTipo].sort((a, b) => b.co2Kg - a.co2Kg)
  const baseXp = getLevelBaseXp(perfil?.nivelActual ?? 1)
  const nextXp = perfil?.xpParaSiguienteNivel ?? null
  const progress = nextXp
    ? clampPercent((((perfil?.xpTotal ?? 0) - baseXp) / (nextXp - baseXp)) * 100)
    : 100
  const loading = loadingPerfil || loadingResumen || loadingPorTipo
  const co2Total = resumen?.co2TotalKg ?? perfil?.co2TotalEvitadoKg ?? 0
  const horasTV = Math.round(co2Total / 0.05)
  const bolsas = Math.round(co2Total / 0.0022)
  const isNewUser = !loadingPerfil && (perfil?.xpTotal ?? 0) === 0
  const rachaActual = perfil?.rachaActual ?? 0
  const [pdfState, setPdfState] = useState<'idle' | 'loading' | 'done'>('idle')

  const compartirImpacto = async () => {
    setPdfState('loading')
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210

    // ── Helpers ──────────────────────────────────────────────────────────────
    const col = (hex: string) => {
      const r = parseInt(hex.slice(1,3),16)
      const g = parseInt(hex.slice(3,5),16)
      const b = parseInt(hex.slice(5,7),16)
      return [r,g,b] as [number,number,number]
    }
    const card = (x: number, y: number, w: number, h: number, fill: string, stroke?: string) => {
      doc.setFillColor(...col(fill))
      if (stroke) { doc.setDrawColor(...col(stroke)); doc.setLineWidth(0.4) }
      else doc.setDrawColor(255,255,255)
      doc.roundedRect(x, y, w, h, 3, 3, stroke ? 'FD' : 'F')
    }

    // ── HEADER ───────────────────────────────────────────────────────────────
    doc.setFillColor(...col('#16a34a'))
    doc.rect(0, 0, W, 32, 'F')

    doc.setFillColor(...col('#15803d'))
    doc.rect(0, 29, W, 3, 'F')

    doc.setTextColor(255,255,255)
    doc.setFont('helvetica','bold')
    doc.setFontSize(20)
    doc.text('EcoLoop', 14, 17)
    doc.setFont('helvetica','normal')
    doc.setFontSize(9)
    doc.text('Reporte de impacto ambiental', 14, 25)

    const fecha = new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'})
    doc.setFontSize(8)
    doc.text(fecha, W-14, 17, { align:'right' })
    doc.text(perfil?.nombre ?? '', W-14, 25, { align:'right' })

    // ── HERO RACHA ───────────────────────────────────────────────────────────
    card(14, 40, W-28, 68, '#fff7ed', '#fed7aa')          // fondo ámbar claro

    doc.setFillColor(...col('#ea580c'))
    doc.rect(14, 40, W-28, 6, 'F')                         // acento naranja arriba

    doc.setFont('helvetica','bold')
    doc.setFontSize(9)
    doc.setTextColor(...col('#9a3412'))
    doc.text('RACHA ACTUAL', W/2, 55, { align:'center' })

    doc.setFont('helvetica','bold')
    doc.setFontSize(72)
    doc.setTextColor(...col('#ea580c'))
    doc.text(String(rachaActual), W/2, 90, { align:'center' })

    doc.setFont('helvetica','normal')
    doc.setFontSize(12)
    doc.setTextColor(...col('#c2410c'))
    doc.text(rachaActual === 1 ? 'DIA CONSECUTIVO' : 'DIAS CONSECUTIVOS', W/2, 101, { align:'center' })

    // ── METRICAS ─────────────────────────────────────────────────────────────
    const mY = 118
    card(14, mY, 86, 34, '#f0fdf4', '#bbf7d0')
    card(110, mY, 86, 34, '#f0fdf4', '#bbf7d0')

    const metricLabel = (x: number, y: number, label: string) => {
      doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...col('#6b7280'))
      doc.text(label, x, y, { align:'center' })
    }
    const metricValue = (x: number, y: number, value: string) => {
      doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.setTextColor(...col('#15803d'))
      doc.text(value, x, y, { align:'center' })
    }

    metricLabel(57, mY+10, 'CO2 EVITADO')
    metricValue(57, mY+24, formatKg(resumen?.co2TotalKg ?? perfil?.co2TotalEvitadoKg, 1))
    metricLabel(153, mY+10, 'TOTAL RECICLADO')
    metricValue(153, mY+24, formatKg(resumen?.kgTotalReciclado, 1))

    // ── EQUIVALENCIAS ────────────────────────────────────────────────────────
    const eY = 162
    card(14, eY, W-28, 66, '#f8fafc', '#e2e8f0')

    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...col('#1e293b'))
    doc.text('Equivalencias ambientales', 22, eY+11)

    doc.setDrawColor(...col('#e2e8f0')); doc.setLineWidth(0.3)
    doc.line(22, eY+15, W-22, eY+15)

    const eqRow = (y: number, label: string, value: string) => {
      doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...col('#374151'))
      doc.text(label, 22, y)
      doc.setFont('helvetica','bold'); doc.setTextColor(...col('#16a34a'))
      doc.text(value, W-22, y, { align:'right' })
    }
    eqRow(eY+26, 'Arboles por año equivalentes',  formatNumber(resumen?.equivalenteArboles,2))
    eqRow(eY+40, 'Km de auto evitados',            formatNumber(resumen?.equivalenteKmAuto,1))
    eqRow(eY+54, 'Cargas de telefono equivalentes',formatNumber(resumen?.equivalenteCargasTelefono,0))

    // ── XP / NIVEL ───────────────────────────────────────────────────────────
    const xY = 238
    card(14, xY, W-28, 22, '#fefce8', '#fde68a')
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...col('#92400e'))
    doc.text('NIVEL ACTUAL', 22, xY+9)
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...col('#b45309'))
    doc.text(perfil?.nombreNivel ?? `Nivel ${perfil?.nivelActual ?? 1}`, 22, xY+17)
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...col('#92400e'))
    doc.text('XP TOTAL', W-22, xY+9, { align:'right' })
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...col('#b45309'))
    doc.text(`${perfil?.xpTotal ?? 0} XP`, W-22, xY+17, { align:'right' })

    // ── FOOTER ───────────────────────────────────────────────────────────────
    doc.setDrawColor(...col('#e5e7eb')); doc.setLineWidth(0.3)
    doc.line(14, 278, W-14, 278)
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...col('#9ca3af'))
    doc.text('Generado con EcoLoop  ·  ecoloop.app', W/2, 284, { align:'center' })
    doc.text(fecha, W/2, 290, { align:'center' })

    doc.save(`ecoloop-impacto-${new Date().toISOString().slice(0,10)}.pdf`)
    setPdfState('done')
    setTimeout(() => setPdfState('idle'), 2500)
  }

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 pb-28 space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <KiruState state={isNewUser ? 'WELCOME' : 'IMPACT'} size={106} animate />
            <div className="min-w-0">
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
              {!isNewUser && (
                <div className="mt-2 w-full max-w-xs">
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-eco-600 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>{perfil?.xpTotal ?? 0} XP</span>
                    <span>{nextXp ? `${nextXp} XP` : 'Nivel máximo'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Link
            to="/registro"
            className="w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-eco-600 px-4 text-sm font-semibold text-white hover:bg-eco-700 transition-colors"
          >
            Registrar residuo
            <ArrowRight size={16} />
          </Link>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(() => {
            const co2Kg = resumen?.co2TotalKg ?? perfil?.co2TotalEvitadoKg ?? 0
            const kgReciclado = resumen?.kgTotalReciclado ?? 0
            const diasCarga = Math.round(co2Kg / 0.005)
            const botellas = Math.round(kgReciclado * 25)
            return (<>
              <StatCard
                icon={<Leaf size={24} className="text-eco-500" />}
                label="CO2 evitado"
                value={formatKg(co2Kg, 1)}
                loading={loadingResumen}
                hint={co2Kg > 0 ? `≈ ${diasCarga} días de carga de celular` : undefined}
              />
              <StreakCard
                value={rachaActual === 1 ? '1 día' : `${rachaActual} días`}
                loading={loadingPerfil}
              />
              <StatCard
                icon={<Sprout size={24} className="text-emerald-500" />}
                label="Total reciclado"
                value={formatKg(kgReciclado, 1)}
                loading={loadingResumen}
                hint={kgReciclado > 0 ? `≈ ${botellas} botellas de plástico` : undefined}
              />
            </>)
          })()}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm min-h-[320px]">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">CO₂ evitado por tipo de residuo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">kg CO₂ evitado por cada tipo registrado</p>
              </div>
              <span className="text-xs font-medium text-gray-400">{sortedPorTipo.length} tipos</span>
            </div>
            {sortedPorTipo.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedPorTipo} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="tipoResiduo" width={100} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip formatter={(v) => [`${formatNumber(Number(v), 2)} kg CO₂`, 'CO₂ evitado']} />
                    <Bar dataKey="co2Kg" radius={[0, 4, 4, 0]}>
                      {sortedPorTipo.map((entry: { codigo: string }, i: number) => (
                        <Cell key={entry.codigo} fill={getColor(entry.codigo, i)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState loading={loading} text="Registra tu primer residuo para ver el gráfico." />
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Equivalencias ambientales</h3>
            <div className="space-y-3">
              <ImpactRow
                icon={<Car size={18} />}
                label="Km de auto evitados"
                value={formatNumber(resumen?.equivalenteKmAuto, 1)}
              />
              <ImpactRow
                icon={<Tv size={18} />}
                label="Horas de TV sin encender"
                value={formatNumber(horasTV, 0)}
              />
              <ImpactRow
                icon={<ShoppingBag size={18} />}
                label="Bolsas de plástico"
                value={formatNumber(bolsas, 0)}
              />
              <ImpactRow
                icon={<Sprout size={18} />}
                label="Árboles por año"
                value={formatNumber(resumen?.equivalenteArboles, 2)}
              />
            </div>

            <button
              onClick={compartirImpacto}
              disabled={pdfState === 'loading'}
              className={`mt-5 w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-60
                ${pdfState === 'done'
                  ? 'border-eco-500 bg-eco-50 text-eco-700 dark:border-eco-500 dark:bg-eco-900/30 dark:text-eco-400'
                  : 'border-gray-200 bg-transparent text-gray-600 hover:border-eco-400 hover:text-eco-600 hover:bg-eco-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-eco-500 dark:hover:text-eco-400 dark:hover:bg-eco-900/20'
                }`}
            >
              {pdfState === 'done'  && <><Check    size={15} className="flex-shrink-0" /> ¡PDF descargado!</>}
              {pdfState === 'loading' && <><Share2 size={15} className="flex-shrink-0 animate-spin" /> Generando PDF...</>}
              {pdfState === 'idle'  && <><Download  size={15} className="flex-shrink-0" /> Descargar mi impacto</>}
            </button>
          </div>
        </section>

        {mensual.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">CO₂ evitado por mes</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mensual} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="mes" tickFormatter={formatMesShort} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `${v}kg`} />
                  <Tooltip formatter={(v) => [`${formatNumber(Number(v), 2)} kg CO₂`, 'CO₂ evitado']} />
                  <Line dataKey="co2Kg" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {comunidad && (
          <section className="rounded-xl bg-gradient-to-br from-eco-600 to-eco-700 p-5 text-white shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Leaf size={20} className="text-eco-200" />
              <h3 className="font-semibold text-white">Impacto de la comunidad EcoLoop</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">{formatNumber(comunidad.co2TotalKg, 1)} kg</p>
                <p className="text-xs text-eco-200 mt-0.5">CO₂ evitado en total</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">{formatNumber(comunidad.kgTotales, 1)} kg</p>
                <p className="text-xs text-eco-200 mt-0.5">residuos reciclados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{comunidad.totalUsuariosActivos}</p>
                <p className="text-xs text-eco-200 mt-0.5">usuarios activos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{comunidad.totalRegistros}</p>
                <p className="text-xs text-eco-200 mt-0.5">registros totales</p>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  )
}

function FilledFlame({ size = 52, uid = 'a' }: { size?: number; uid?: string }) {
  const g = `fg-${uid}`
  const gi = `fi-${uid}`
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" aria-hidden>
      <defs>
        <linearGradient id={g} x1="26" y1="4" x2="26" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="45%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id={gi} x1="26" y1="18" x2="26" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path d="M26 4C23 11 15 18 15 28a11 11 0 0 0 22 0c0-10-8-17-11-24z" fill={`url(#${g})`} />
      <path d="M26 18C24.5 21.5 22 25 22 29a4 4 0 0 0 8 0c0-4-2.5-7.5-4-11z" fill={`url(#${gi})`} />
    </svg>
  )
}

function StreakCard({ value, loading }: { value: string; loading?: boolean }) {
  return (
    <div
      className="rounded-lg p-5 border bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800 flex flex-col items-center justify-center gap-1"
      style={{ boxShadow: '0 0 22px 6px rgba(251,146,60,0.28), 0 1px 3px 0 rgba(0,0,0,0.07)' }}
    >
      <div className="relative flex items-center justify-center">
        <div
          className="fire-aura absolute rounded-full w-16 h-16"
          style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.45) 0%, transparent 70%)', filter: 'blur(7px)' }}
        />
        <FilledFlame size={44} uid="streak" />
      </div>
      <div className="font-display text-2xl font-bold tracking-tight leading-tight text-orange-600 dark:text-orange-400 mt-1">
        {loading ? '...' : value}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 leading-tight">Racha actual</div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  loading,
  value,
  featured = false,
  hint,
}: {
  icon: ReactNode
  label: string
  loading?: boolean
  value: string
  featured?: boolean
  hint?: string
}) {
  return (
    <div className={`rounded-lg p-5 shadow-sm border transition-transform ${
      featured
        ? 'scale-105 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-gray-800 border-orange-200 dark:border-orange-800 shadow-[0_0_18px_3px_rgba(249,115,22,0.18)]'
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
    }`}>
      <div className="flex flex-col items-center justify-center gap-1 text-center">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${
          featured ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-gray-50 dark:bg-gray-700'
        }`}>
          {icon}
        </div>
        <div className={`font-display text-2xl font-bold tracking-tight leading-tight mt-1 ${
          featured ? 'text-orange-600 dark:text-orange-400' : 'text-eco-700 dark:text-eco-400'
        }`}>
          {loading ? '...' : value}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 leading-tight">{label}</div>
        {hint && !loading && (
          <div className="text-xs text-eco-600 dark:text-eco-400 leading-tight">{hint}</div>
        )}
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
