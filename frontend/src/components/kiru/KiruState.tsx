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

const POP_STATES: KiruStateType[] = ['CELEBRATE', 'CONFIRM']

interface Props {
  state: KiruStateType
  size?: number
  className?: string
  animate?: boolean
}

export default function KiruState({ state, size = 100, className = '', animate }: Props) {
  const shouldPop = animate ?? POP_STATES.includes(state)
  return (
    <img
      key={state}
      src={KIRU_IMAGES[state]}
      alt={`Kiru ${state.toLowerCase()}`}
      width={size}
      height={size}
      className={`object-contain transition-opacity duration-300 ${shouldPop ? 'kiru-pop' : ''} ${className}`}
    />
  )
}
