import { useEffect, useRef } from 'react'

export type DotPoint = { x: number; y: number; size?: number; color?: string }

/**
 * Dessine tous les points sur un seul <canvas> au lieu d'un <span> par point.
 * Avec des parties qui peuvent désormais atteindre plusieurs milliers de clics
 * (paliers de spam, couloirs de bowling...), un <span> par clic devenait un vrai
 * problème de performance (des milliers de nœuds DOM réels, jamais nettoyés).
 */
export default function PixelDotsCanvas({ points }: { points: DotPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef(points)
  pointsRef.current = points

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    const targetW = Math.round(w * dpr)
    const targetH = Math.round(h * dpr)
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW
      canvas.height = targetH
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    for (const p of pointsRef.current) {
      ctx.fillStyle = p.color || '#FF2A2A'
      const size = p.size ?? 2
      ctx.fillRect(p.x, p.y, size, size)
    }
  }

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points])

  useEffect(() => {
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-10" aria-hidden="true" />
}
