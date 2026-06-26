import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Cpu,
  FileText,
  Leaf,
  PackageCheck,
  PlusCircle,
  Recycle,
  Scale,
  Sprout,
  Trophy,
  Wine
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import KiruState from '../components/kiru/KiruState'
import { getTiposResiduo, registrarResiduo } from '../services/ecoloop'
import { RegistroResponse } from '../types'
import { formatKg, formatNumber } from '../utils/format'

const typeIcons: Record<string, LucideIcon> = {
  PLASTICO: Recycle,
  PAPEL: FileText,
  VIDRIO: Wine,
  METAL: PackageCheck,
  ORGANICO: Sprout,
  ELECTRONICO: Cpu
}

export default function ResiduoPage() {
  const queryClient = useQueryClient()
  const [tipoResiduoId, setTipoResiduoId] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState('0.5')
  const [result, setResult] = useState<RegistroResponse | null>(null)

  const { data, isError, isLoading } = useQuery({
    queryKey: ['tipos-residuo'],
    queryFn: getTiposResiduo
  })
  const tipos = Array.isArray(data) ? data : []

  useEffect(() => {
    if (!tipoResiduoId && tipos.length) setTipoResiduoId(tipos[0].id)
  }, [tipoResiduoId, tipos])

  const selected = useMemo(
    () => tipos.find(tipo => tipo.id === tipoResiduoId) ?? null,
    [tipoResiduoId, tipos]
  )
  const cantidadKg = Number(cantidad)
  const validAmount = Number.isFinite(cantidadKg) && cantidadKg >= 0.01
  const co2Preview = selected && validAmount ? Number(selected.factorCo2Kg) * cantidadKg : 0
  const xpPreview = selected && validAmount ? Math.trunc(selected.xpPorKg * cantidadKg) : 0

  const mutation = useMutation({
    mutationFn: registrarResiduo,
    onSuccess: data => {
      setResult(data)
      void queryClient.invalidateQueries({ queryKey: ['perfil'] })
      void queryClient.invalidateQueries({ queryKey: ['impacto-resumen'] })
      void queryClient.invalidateQueries({ queryKey: ['impacto-mensual'] })
      void queryClient.invalidateQueries({ queryKey: ['insignias'] })
    }
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!tipoResiduoId || !validAmount) return
    mutation.mutate({ tipoResiduoId, cantidadKg })
  }

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <KiruState state={result ? 'CONFIRM' : 'WELCOME'} size={88} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registrar residuo</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                CO2 y XP se calculan al guardar.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Tipo de residuo
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {isLoading && <p className="text-sm text-gray-400 col-span-full">Cargando tipos...</p>}
                {isError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 col-span-full">
                    No se pudieron cargar los tipos de residuo. Revisa backend o sesion.
                  </p>
                )}
                {!isLoading && !isError && tipos.length === 0 && (
                  <p className="text-sm text-gray-400 col-span-full">No hay tipos de residuo disponibles.</p>
                )}
                {tipos.map(tipo => {
                  const Icon = typeIcons[tipo.codigo] ?? Leaf
                  const active = tipo.id === tipoResiduoId
                  return (
                    <button
                      key={tipo.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setTipoResiduoId(tipo.id)}
                      className={`min-h-24 rounded-lg border p-3 text-left transition-colors ${
                        active
                          ? 'border-eco-500 bg-eco-50 text-eco-800 dark:bg-gray-700 dark:text-eco-400'
                          : 'border-gray-100 hover:border-eco-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={22} className={active ? 'text-eco-600 dark:text-eco-400' : 'text-gray-400'} />
                      <div className="mt-3 font-semibold text-sm text-gray-800 dark:text-gray-100">{tipo.nombre}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{tipo.xpPorKg} XP/kg</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label htmlFor="cantidadKg" className="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Cantidad reciclada
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <Scale size={18} className="text-gray-400" />
                <input
                  id="cantidadKg"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={cantidad}
                  onChange={event => setCantidad(event.target.value)}
                  className="w-full bg-transparent text-lg font-semibold text-gray-900 dark:text-white focus:outline-none"
                />
                <span className="text-sm text-gray-500">kg</span>
              </div>
              {!validAmount && <p className="mt-2 text-sm text-red-500">Minimo 0.01 kg.</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PreviewBox label="CO2 estimado" value={formatKg(co2Preview, 2)} />
              <PreviewBox label="XP estimado" value={`${xpPreview} XP`} />
            </div>

            {mutation.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30">
                No se pudo registrar. Verifica sesion y datos.
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending || !tipoResiduoId || !validAmount}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-eco-600 px-4 text-sm font-semibold text-white hover:bg-eco-700 disabled:opacity-50 transition-colors"
            >
              <PlusCircle size={18} />
              {mutation.isPending ? 'Guardando...' : 'Guardar registro'}
            </button>
          </form>

          <aside className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <KiruState state={result ? 'CONFIRM' : 'IMPACT'} size={64} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  {result ? 'Registro confirmado' : 'Vista previa'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selected ? selected.nombre : 'Elige un tipo de residuo'}
                </p>
              </div>
            </div>

            {result ? (
              <div className="space-y-4">
                <ResultRow icon={<CheckCircle2 size={18} />} label="Residuo" value={result.tipoResiduo} />
                <ResultRow icon={<Scale size={18} />} label="Cantidad" value={formatKg(result.cantidadKg, 2)} />
                <ResultRow icon={<Leaf size={18} />} label="CO2 evitado" value={formatKg(result.co2EvitadoKg, 2)} />
                <ResultRow icon={<Trophy size={18} />} label="XP ganado" value={`${result.xpGanado} XP`} />

                {result.levelUp && (
                  <div className="rounded-lg border border-eco-200 bg-eco-50 p-3 dark:border-eco-500 dark:bg-gray-700">
                    <div className="text-sm font-semibold text-eco-700 dark:text-eco-400">Subiste de nivel</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {result.nombreNivelNuevo ?? `Nivel ${result.nivelNuevo}`}
                    </div>
                  </div>
                )}

                {result.nuevasInsignias.length > 0 && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-600 dark:bg-yellow-950/30">
                    <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Nuevas insignias</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.nuevasInsignias.map(insignia => (
                        <span key={insignia} className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-gray-800 dark:text-yellow-300">
                          {insignia}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <ResultRow icon={<Leaf size={18} />} label="Factor CO2" value={`${formatNumber(selected?.factorCo2Kg, 2)} kg/kg`} />
                <ResultRow icon={<Trophy size={18} />} label="XP por kg" value={`${selected?.xpPorKg ?? 0} XP`} />
                <ResultRow icon={<Scale size={18} />} label="Cantidad" value={validAmount ? formatKg(cantidadKg, 2) : 'Pendiente'} />
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  )
}

function PreviewBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-xl font-bold text-eco-700 dark:text-eco-400">{value}</div>
    </div>
  )
}

function ResultRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-700">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <span className="text-eco-600 dark:text-eco-400">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}
