export type WinTierKey = 'bronze' | 'silver' | 'gold' | 'prestige'
export type WinTier = { key: WinTierKey; color: string }

// Paliers fixes, purement cosmétiques (couleur des points cliqués) — n'affectent
// jamais la difficulté du jeu.
export function getWinTier(wins: number): WinTier {
  if (wins >= 15) return { key: 'prestige', color: '#FF2A2A' }
  if (wins >= 10) return { key: 'gold', color: '#FFD700' }
  if (wins >= 5) return { key: 'silver', color: '#B0B0B8' }
  return { key: 'bronze', color: '#CD7F32' }
}

// Progression de "titre" affichée dans le profil de victoire / la carte de partage.
// 1 victoire -> Rookie, 3 -> Addict, 10 -> Degenerate, 25 -> Legend, 50 -> God.
export type PlayerTitleKey = 'rookie' | 'addict' | 'degenerate' | 'legend' | 'god'
export type PlayerTitle = { key: PlayerTitleKey; emoji: string; threshold: number }

const TITLE_LADDER: PlayerTitle[] = [
  { key: 'god', emoji: '👑', threshold: 50 },
  { key: 'legend', emoji: '🏆', threshold: 25 },
  { key: 'degenerate', emoji: '💀', threshold: 10 },
  { key: 'addict', emoji: '🔥', threshold: 3 },
  { key: 'rookie', emoji: '🟢', threshold: 1 },
]

export function getPlayerTitle(wins: number): PlayerTitle {
  for (const tier of TITLE_LADDER) {
    if (wins >= tier.threshold) return tier
  }
  return { key: 'rookie', emoji: '🟢', threshold: 1 }
}

// Renvoie le prochain palier à atteindre (ou null si le joueur a déjà tout débloqué),
// et le nombre de victoires qu'il reste à faire pour l'atteindre.
export function getNextTitleProgress(wins: number): { next: PlayerTitle | null; winsNeeded: number } {
  const ascending = [...TITLE_LADDER].reverse()
  for (const tier of ascending) {
    if (wins < tier.threshold) return { next: tier, winsNeeded: tier.threshold - wins }
  }
  return { next: null, winsNeeded: 0 }
}
