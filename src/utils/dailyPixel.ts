export type Breakpoint = 'phone' | 'tablet' | 'desktop'

export function getBreakpoint(width: number): Breakpoint {
  if (width < 640) return 'phone'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h >>> 0
}

// PRNG déterministe (mulberry32) : même seed => toujours la même suite de nombres.
function mulberry32(seed: number) {
  let state = seed
  return function () {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Position du pixel du jour en pourcentage (0-1) de l'écran, pas en pixels bruts :
 * ça s'adapte automatiquement à n'importe quelle taille d'écran. Le seed dépend
 * du jour ET du type d'appareil (téléphone / tablette / desktop), donc chaque
 * catégorie a bien "son" pixel du jour, cohérent avec sa mise en page.
 */
export function getDailyPixelPercent(dateKey: string, breakpoint: Breakpoint): { px: number; py: number } {
  const seed = hashString(`${dateKey}:${breakpoint}`)
  const rand = mulberry32(seed)
  // Marge de 5% sur les bords pour que le pixel reste confortablement cliquable.
  const px = 0.05 + rand() * 0.9
  const py = 0.05 + rand() * 0.9
  return { px, py }
}
