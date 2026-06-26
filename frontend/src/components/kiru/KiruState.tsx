const KIRU_IMAGES = {
  WELCOME:   '/kiru/castor-botella.webp',
  CONFIRM:   '/kiru/castor-botella.webp',
  THINKING:  '/kiru/castor-escribiendo.webp',
  RECOMMEND: '/kiru/castor-idea.webp',
  IMPACT:    '/kiru/castor-ecology.webp',
  ANALYZE:   '/kiru/castor-leyendo.webp',
  CELEBRATE: '/kiru/castor-malabares.webp',
  DOWN:      '/kiru/castor-down.webp',
} as const

export type KiruStateType = keyof typeof KIRU_IMAGES

interface Props {
  state: KiruStateType
  size?: number
  className?: string
}

export default function KiruState({ state, size = 100, className = '' }: Props) {
  return (
    <img
      src={KIRU_IMAGES[state]}
      alt={`Kiru ${state.toLowerCase()}`}
      width={size}
      height={size}
      className={`object-contain transition-opacity duration-300 ${className}`}
    />
  )
}
