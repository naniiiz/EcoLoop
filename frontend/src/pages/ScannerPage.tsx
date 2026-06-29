import { type ReactNode, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera, CheckCircle2, ImageUp, Lightbulb, RefreshCw, Scale, ScanLine, Sparkles } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import KiruState from '../components/kiru/KiruState'
import {
  getTiposResiduo,
  identificarResiduo,
  registrarResiduo,
  VisionResponse,
} from '../services/ecoloop'

const CATEGORIA_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PLASTICO:    { bg: 'bg-yellow-100 dark:bg-yellow-900/40',  text: 'text-yellow-800 dark:text-yellow-300', label: 'Plástico' },
  PAPEL:       { bg: 'bg-blue-100 dark:bg-blue-900/40',      text: 'text-blue-800 dark:text-blue-300',     label: 'Papel' },
  VIDRIO:      { bg: 'bg-green-100 dark:bg-green-900/40',    text: 'text-green-800 dark:text-green-300',   label: 'Vidrio' },
  METAL:       { bg: 'bg-gray-200 dark:bg-gray-700',         text: 'text-gray-700 dark:text-gray-200',     label: 'Metal' },
  ORGANICO:    { bg: 'bg-amber-100 dark:bg-amber-900/40',    text: 'text-amber-800 dark:text-amber-300',   label: 'Orgánico' },
  ELECTRONICO: { bg: 'bg-purple-100 dark:bg-purple-900/40',  text: 'text-purple-800 dark:text-purple-300', label: 'Electrónico' },
}

type Phase = 'idle' | 'preview' | 'scanning' | 'result' | 'registered'

function compressImage(file: File, maxPx = 1024, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => resolve(new File([blob!], 'image.jpg', { type: 'image/jpeg' })),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export default function ScannerPage() {
  const queryClient = useQueryClient()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [vision, setVision] = useState<VisionResponse | null>(null)
  const [cantidad, setCantidad] = useState('0.5')
  const [levelUp, setLevelUp] = useState(false)
  const [scanFailed, setScanFailed] = useState(false)

  const { data: tipos = [] } = useQuery({ queryKey: ['tipos-residuo'], queryFn: getTiposResiduo })

  const scanMutation = useMutation({
    mutationFn: identificarResiduo,
    onSuccess: (data) => {
      if (data.nombre === 'Desconocido') {
        setScanFailed(true)
        setPhase('preview')
      } else {
        setVision(data)
        setPhase('result')
      }
    },
    onError: () => { setScanFailed(true); setPhase('preview') },
  })

  const registrarMutation = useMutation({
    mutationFn: registrarResiduo,
    onSuccess: (data) => {
      setLevelUp(data.levelUp)
      setPhase('registered')
      void queryClient.invalidateQueries({ queryKey: ['registros'] })
      void queryClient.invalidateQueries({ queryKey: ['perfil'] })
      void queryClient.invalidateQueries({ queryKey: ['impacto-resumen'] })
      void queryClient.invalidateQueries({ queryKey: ['impacto-mensual'] })
      void queryClient.invalidateQueries({ queryKey: ['impacto-por-tipo'] })
      void queryClient.invalidateQueries({ queryKey: ['insignias'] })
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVision(null)
    setScanFailed(false)
    setPreviewUrl(URL.createObjectURL(file))
    setPhase('preview')
    const compressed = await compressImage(file)
    setSelectedFile(compressed)
  }

  const handleScan = () => {
    if (!selectedFile) return
    setPhase('scanning')
    scanMutation.mutate(selectedFile)
  }

  const handleRegistrar = () => {
    if (!vision) return
    const tipo = tipos.find(t => t.codigo === vision.categoria)
    if (!tipo) return
    const cantidadKg = parseFloat(cantidad)
    if (!Number.isFinite(cantidadKg) || cantidadKg < 0.01) return
    registrarMutation.mutate({ tipoResiduoId: tipo.id, cantidadKg })
  }

  const handleReset = () => {
    setPhase('idle')
    setPreviewUrl(null)
    setSelectedFile(null)
    setVision(null)
    setScanFailed(false)
    setCantidad('0.5')
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const categoriaStyle = vision ? (CATEGORIA_STYLES[vision.categoria] ?? CATEGORIA_STYLES['PLASTICO']) : null


  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8 pb-28 space-y-6">
        <section className="flex items-center gap-4">
          <img src="/kiru/kiru-scanner.webp" alt="Kiru" className="w-32 h-32 object-contain drop-shadow-sm" />
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Scanner de residuos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {phase === 'scanning' ? 'Kiru está analizando...' :
               phase === 'registered' ? (levelUp ? '¡Subiste de nivel!' : '¡Residuo registrado!') :
               'Foto un residuo y Kiru lo identifica'}
            </p>
          </div>
        </section>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {phase === 'idle' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-eco-600 px-4 py-5 text-sm font-semibold text-white shadow-lg hover:bg-eco-700 transition-colors"
              >
                <Camera size={28} />
                Tomar foto
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-eco-600 px-4 py-5 text-sm font-semibold text-eco-600 dark:text-eco-400 hover:bg-eco-50 dark:hover:bg-eco-900/20 transition-colors"
              >
                <ImageUp size={28} />
                Subir imagen
              </button>
            </div>

            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Cómo funciona</h3>
              <div className="space-y-3">
                <Step icon={<Camera size={18} className="text-eco-600 dark:text-eco-400" />} n="1" title="Fotografía el residuo" desc="Usa la cámara o sube una imagen desde tu galería." />
                <Step icon={<Sparkles size={18} className="text-purple-500" />} n="2" title="Kiru lo analiza con IA" desc="Identifica el tipo, el contenedor correcto y si es reciclable." />
                <Step icon={<CheckCircle2 size={18} className="text-eco-600 dark:text-eco-400" />} n="3" title="Registra e impacta" desc="Confirma el peso, gana XP y reduce tu huella de carbono." />
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                <Lightbulb size={15} />
                Consejos para mejores resultados
              </div>
              <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                <li className="flex items-start gap-2"><ScanLine size={14} className="mt-0.5 shrink-0" /> Centra el residuo en el encuadre</li>
                <li className="flex items-start gap-2"><ScanLine size={14} className="mt-0.5 shrink-0" /> Buena iluminación, evita sombras fuertes</li>
                <li className="flex items-start gap-2"><ScanLine size={14} className="mt-0.5 shrink-0" /> Foto nítida, sin desenfoque</li>
              </ul>
            </div>
          </div>
        )}

        {(phase === 'preview' || phase === 'scanning') && previewUrl && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <img src={previewUrl} alt="Preview" className="w-full object-cover max-h-72" />
            </div>
            {scanFailed && (
              <p className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                Kiru no pudo identificar el residuo. Intenta con otra foto más clara o con mejor iluminación.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <RefreshCw size={15} />
                Cambiar foto
              </button>
              <button
                onClick={handleScan}
                disabled={phase === 'scanning'}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-eco-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-eco-700 disabled:opacity-60 transition-colors"
              >
                {phase === 'scanning' ? 'Analizando...' : 'Analizar con Kiru'}
              </button>
            </div>
          </div>
        )}

        {phase === 'result' && vision && categoriaStyle && (
          <div className="space-y-4">
            {previewUrl && (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <img src={previewUrl} alt="Preview" className="w-full object-cover max-h-48" />
              </div>
            )}

            <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Residuo identificado</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{vision.nombre}</h3>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${categoriaStyle.bg} ${categoriaStyle.text}`}>
                  {categoriaStyle.label}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span
                  className="rounded-full w-3 h-3 inline-block border border-gray-200"
                  style={{ background: vision.contenedor }}
                />
                <span className="text-gray-600 dark:text-gray-300">
                  Contenedor: <strong className="text-gray-800 dark:text-white capitalize">{vision.contenedor}</strong>
                </span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
                  vision.reciclable
                    ? 'bg-eco-100 text-eco-700 dark:bg-eco-900/40 dark:text-eco-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                }`}>
                  {vision.reciclable ? 'Reciclable' : 'No reciclable'}
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{vision.consejo}"</p>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Cantidad a registrar
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                  <Scale size={16} className="text-gray-400" />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={cantidad}
                    onChange={e => setCantidad(e.target.value)}
                    className="w-full bg-transparent text-lg font-semibold text-gray-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-sm text-gray-500">kg</span>
                </div>
                {registrarMutation.isError && (
                  <p className="text-sm text-red-500">No se pudo registrar. Intenta de nuevo.</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <RefreshCw size={15} />
                    Nueva foto
                  </button>
                  <button
                    onClick={handleRegistrar}
                    disabled={registrarMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-eco-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-eco-700 disabled:opacity-60 transition-colors"
                  >
                    <CheckCircle2 size={16} />
                    {registrarMutation.isPending ? 'Registrando...' : 'Registrar este residuo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'registered' && (
          <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm p-6 text-center space-y-4">
            <KiruState state={levelUp ? 'CELEBRATE' : 'CONFIRM'} size={120} className="mx-auto" animate />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {levelUp ? '¡Subiste de nivel!' : '¡Registrado con éxito!'}
            </h3>
            {vision && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {vision.nombre} · {cantidad} kg
              </p>
            )}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-eco-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-eco-700 transition-colors"
            >
              <Camera size={16} />
              Escanear otro residuo
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function Step({ icon, n, title, desc }: { icon: ReactNode; n: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-eco-50 dark:bg-gray-700">
        {icon}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{n}. {title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
