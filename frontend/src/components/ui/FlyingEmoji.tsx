import { useEffect, useRef } from 'react'

interface Props {
  emoji: string
  startX: number
  startY: number
  endX: number
  endY: number
  onDone: () => void
}

export default function FlyingEmoji({ emoji, startX, startY, endX, endY, onDone }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const midX = startX * 0.5 + endX * 0.5
    const midY = Math.min(startY, endY) - 80
    const anim = el.animate(
      [
        { transform: `translate(${startX}px, ${startY}px) scale(1)`, opacity: 1 },
        { transform: `translate(${midX}px, ${midY}px) scale(1.6)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${endX}px, ${endY}px) scale(0.2)`, opacity: 0 },
      ],
      { duration: 1300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
    )
    anim.onfinish = onDone
    return () => anim.cancel()
  }, [startX, startY, endX, endY, onDone])

  return (
    <span
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        fontSize: '2rem',
        pointerEvents: 'none',
        zIndex: 9999,
        userSelect: 'none',
      }}
    >
      {emoji}
    </span>
  )
}
