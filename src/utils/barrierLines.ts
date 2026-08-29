export type Rect = { x: number; y: number; w: number; h: number }
export type BarrierLine = { x1: number; y1: number; x2: number; y2: number; axis: 'h' | 'v' }

/**
 * Découpe récursivement une zone en alternant coupe verticale (axe "h", gauche/droite)
 * et coupe horizontale (axe "v", haut/bas), en resserrant à chaque étape vers un coin.
 * `pickSide` décide de quel côté on va à chaque étape (gauche/droite ou haut/bas).
 */
export function computeAlternatingSplit(
  steps: number,
  screenW: number,
  screenH: number,
  topOffset: number,
  pickSide: (axis: 'h' | 'v', zone: Rect, stepIndex: number) => 'left' | 'right' | 'up' | 'down'
): { lines: BarrierLine[]; zone: Rect } {
  let zone: Rect = { x: 0, y: topOffset, w: screenW, h: Math.max(1, screenH - topOffset) }
  const lines: BarrierLine[] = []

  for (let i = 1; i <= steps; i++) {
    const axis: 'h' | 'v' = i % 2 === 1 ? 'h' : 'v'

    if (axis === 'h') {
      const midX = zone.x + zone.w / 2
      lines.push({ x1: midX, y1: zone.y, x2: midX, y2: zone.y + zone.h, axis: 'h' })
      const side = pickSide('h', zone, i)
      const halfW = zone.w / 2
      zone = side === 'left' ? { ...zone, w: halfW } : { x: zone.x + halfW, y: zone.y, w: halfW, h: zone.h }
    } else {
      const midY = zone.y + zone.h / 2
      lines.push({ x1: zone.x, y1: midY, x2: zone.x + zone.w, y2: midY, axis: 'v' })
      const side = pickSide('v', zone, i)
      const halfH = zone.h / 2
      zone = side === 'up' ? { ...zone, h: halfH } : { x: zone.x, y: zone.y + halfH, w: zone.w, h: halfH }
    }
  }

  return { lines, zone }
}
