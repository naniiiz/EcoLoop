export function formatNumber(value: number | null | undefined, digits = 1) {
  return (value ?? 0).toLocaleString('es-PE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

export function formatKg(value: number | null | undefined, digits = 1) {
  return `${formatNumber(value, digits)} kg`
}

export function formatDate(value: string | null | undefined) {
  if (!value) return 'Pendiente'
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value))
}

export function clampPercent(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

export function getLevelBaseXp(nivelActual: number) {
  const levels: Record<number, number> = {
    1: 0,
    2: 500,
    3: 1500,
    4: 3500,
    5: 7000
  }
  return levels[nivelActual] ?? 0
}
