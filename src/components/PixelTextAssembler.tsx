import { useEffect, useRef } from 'react'

type Props = {
  text: string
  onComplete?: () => void
}

type Particle = {
  x: number
  y: number
  originX: number
  originY: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  size: number
}

export default function PixelTextAssembler({ text, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !text) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width
    canvas.height = height

    // Canvas virtuel hors-champ
    const offCanvas = document.createElement('canvas')
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })
    if (!offCtx) return

    offCanvas.width = width
    offCanvas.height = height

    // Taille de police nette
    const fontSize = Math.min(Math.max(Math.floor(width / 24), 22), 38)
    const lineHeight = fontSize * 1.35
    const maxLineWidth = Math.min(width * 0.85, 750)

    offCtx.font = `900 ${fontSize}px "Courier New", monospace, sans-serif`
    offCtx.fillStyle = '#000000'
    offCtx.textAlign = 'center'
    offCtx.textBaseline = 'middle'

    // Word wrap multi-lignes
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = words[0] || ''

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const testLine = currentLine + ' ' + word
      const metrics = offCtx.measureText(testLine)
      if (metrics.width > maxLineWidth) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)

    // Positionnement vertical centré
    const totalBlockHeight = lines.length * lineHeight
    const startY = height / 2 - totalBlockHeight / 2 + lineHeight / 2

    lines.forEach((line, index) => {
      offCtx.fillText(line, width / 2, startY + index * lineHeight)
    })

    // Extraction des pixels avec un échantillonnage fin (step = 2)
    const imgData = offCtx.getImageData(0, 0, width, height)
    const data = imgData.data
    const particles: Particle[] = []
    const step = 2 // Micro-pixels fins (au lieu de 4)
    const pixelSize = 2 // Taille de chaque grain

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4
        const alpha = data[index + 3]

        if (alpha > 120) {
          const startX = x + (Math.random() - 0.5) * 300
          const startY = Math.random() * -250 - 20

          particles.push({
            x: startX,
            y: startY,
            originX: startX,
            originY: startY,
            targetX: x,
            targetY: y,
            vx: (Math.random() - 0.5) * 2.5,
            vy: Math.random() * 2 + 1,
            size: pixelSize,
          })
        }
      }
    }

    const startTime = performance.now()
    const DURATION_ASSEMBLE = 1400 // 1.4s pour s'assembler
    const DURATION_HOLD = 3500     // 3.5s net et lisible au centre
    const DURATION_DISPERSE = 200 // 1.2s dispersion finale
    const TOTAL_DURATION = DURATION_ASSEMBLE + DURATION_HOLD + DURATION_DISPERSE

    const render = (time: number) => {
      const elapsed = time - startTime
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#000000'

      if (elapsed < DURATION_ASSEMBLE) {
        const progress = Math.min(elapsed / DURATION_ASSEMBLE, 1)
        const ease = 1 - Math.pow(1 - progress, 3)

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          p.x = p.originX + (p.targetX - p.originX) * ease
          p.y = p.originY + (p.targetY - p.originY) * ease
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
        }
      } else if (elapsed < DURATION_ASSEMBLE + DURATION_HOLD) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          ctx.fillRect(Math.round(p.targetX), Math.round(p.targetY), p.size, p.size)
        }
      } else if (elapsed < TOTAL_DURATION) {
        const disperseElapsed = (elapsed - (DURATION_ASSEMBLE + DURATION_HOLD)) / 1000
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          p.x += p.vx * 3
          p.y += p.vy * 3 + 9.8 * disperseElapsed * disperseElapsed * 20
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
        }
      } else {
        if (onCompleteRef.current) {
          onCompleteRef.current()
        }
        return
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [text])

  return (
    <canvas
      ref={canvasRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 cursor-not-allowed select-none pointer-events-auto"
    />
  )
}
