import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../store/authStore'
import { useUserStore } from '../store/userStore'

export default function DashboardPage() {
  const nombre   = useAuthStore(s => s.nombre)
  const usuario  = useUserStore(s => s.usuario)

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          ¡Hola, {nombre}! 🌱
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon="⚡" label="XP Total"       value={String(usuario?.xpTotal ?? 0)} />
          <StatCard icon="🔥" label="Racha"           value={`${usuario?.rachaActual ?? 0} días`} />
          <StatCard icon="🌍" label="CO₂ Evitado"    value="0 kg" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Actividad reciente
          </h3>
          <p className="text-gray-400 text-sm">
            Aún no tienes registros. ¡Empieza reciclando hoy!
          </p>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm text-center">
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-eco-700 dark:text-eco-400">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  )
}
