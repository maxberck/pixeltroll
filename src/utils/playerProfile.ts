import type { BaseLang } from './i18n'
import { getPlayerTitle, type PlayerTitleKey } from './winTier'

export type ProfileInput = {
  runTime: number
  totalClicks: number
  realMisses: number
  cps: number
  helpCount: number
  bumperLevel: number
  usedOtherKeys: boolean
  spaceClicks: number
  exploredPercent: number
  wins: number
  trackerSummary: {
    maxSameSpotStreak: number
    maxCornerStreak: number
    maxConsecutiveSpaceHits: number
    patternsDetected: number
    triggersShown: number
  }
}

export type AbsurdStat = { key: 'patience' | 'obsession' | 'luck' | 'dignity'; value: number }

export type PlayerProfile = {
  titleKey: PlayerTitleKey
  emoji: string
  stats: AbsurdStat[]
  quip: string
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)))

/**
 * Calcule 4 "stats absurdes" (0-100) à partir du comportement réel de la partie.
 * Aucune de ces valeurs n'affecte le jeu : c'est purement pour la carte de partage.
 */
function computeAbsurdStats(input: ProfileInput): AbsurdStat[] {
  const { runTime, realMisses, helpCount, bumperLevel, usedOtherKeys, spaceClicks, trackerSummary } = input

  const patience = clamp(runTime / 6 - helpCount * 8 - bumperLevel * 10)
  const obsession = clamp(
    trackerSummary.maxSameSpotStreak / 30 +
      trackerSummary.maxCornerStreak / 8 +
      trackerSummary.patternsDetected * 10 +
      (spaceClicks > 100 ? 15 : 0)
  )
  const luck = clamp(100 - Math.log2(realMisses + 1) * 7)
  const dignity = clamp(
    100 -
      helpCount * 14 -
      bumperLevel * 18 -
      (usedOtherKeys ? 10 : 0) -
      trackerSummary.triggersShown * 6 -
      (spaceClicks > 50 ? 12 : 0)
  )

  return [
    { key: 'patience', value: patience },
    { key: 'obsession', value: obsession },
    { key: 'luck', value: luck },
    { key: 'dignity', value: dignity },
  ]
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const QUIPS: Record<BaseLang, Record<PlayerTitleKey, (i: ProfileInput) => string>> = {
  fr: {
    rookie: (i) => `Trouvé en ${formatDuration(i.runTime)}. Pas mal pour un début, mais on a vu des enfants faire mieux.`,
    addict: (i) => `${i.wins} victoires. Tu commences officiellement à connaître ce pixel personnellement.`,
    degenerate: (i) =>
      `Tu as passé ${formatDuration(i.runTime)} à chercher un carré de 1px. La société s'en souviendra.`,
    legend: (i) => `${i.wins} pixels trouvés dans ta vie. Ton entourage devrait s'inquiéter, poliment.`,
    god: (i) => `${i.wins} victoires. Il n'y a plus de mot pour ça. Juste... respect, et de l'inquiétude.`,
  },
  en: {
    rookie: (i) => `Found in ${formatDuration(i.runTime)}. Not bad for a first try, but kids have done better.`,
    addict: (i) => `${i.wins} wins. You're officially on a first-name basis with this pixel.`,
    degenerate: (i) => `You spent ${formatDuration(i.runTime)} looking for a 1px square. Society will remember.`,
    legend: (i) => `${i.wins} pixels found in your lifetime. Your loved ones should politely worry.`,
    god: (i) => `${i.wins} wins. There isn't really a word for this anymore. Just... respect, and concern.`,
  },
}

export function computePlayerProfile(input: ProfileInput, lang: BaseLang): PlayerProfile {
  const title = getPlayerTitle(input.wins)
  const stats = computeAbsurdStats(input)
  const quip = QUIPS[lang][title.key](input)
  return { titleKey: title.key, emoji: title.emoji, stats, quip }
}

export { formatDuration }
