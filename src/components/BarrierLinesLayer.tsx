import type { BarrierLine } from '../utils/barrierLines'

/**
 * Dessine des lignes fines (pas de carré, pas de zone grisée) : une barre verticale
 * pleine hauteur pour une coupe horizontale (gauche/droite), une barre horizontale
 * pleine largeur pour une coupe verticale (haut/bas).
 */
export default function BarrierLinesLayer({ lines, color = '#FF2A2A' }: { lines: BarrierLine[]; color?: string }) {
  if (lines.length === 0) return null

  return (
    <>
      {lines.map((line, i) =>
        line.axis === 'h' ? (
          <div
            key={i}
            className="pointer-events-none absolute z-20"
            style={{ left: line.x1 - 1, top: line.y1, width: 2, height: line.y2 - line.y1, background: color }}
          />
        ) : (
          <div
            key={i}
            className="pointer-events-none absolute z-20"
            style={{ left: line.x1, top: line.y1 - 1, width: line.x2 - line.x1, height: 2, background: color }}
          />
        )
      )}
    </>
  )
}
