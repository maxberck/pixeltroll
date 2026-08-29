import { getTodayKey } from './dailyPixel'

const STREAK_KEY = 'pixeltroll_daily_streak'

type StreakData = { count: number; lastDate: string }

function parseDateKey(key: string): number {
  // "YYYY-MM-DD" -> timestamp minuit local, pour calculer un écart en jours simple.
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1).getTime()
}

function readStreak(): StreakData | null {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StreakData
  } catch {
    return null
  }
}

function writeStreak(data: StreakData) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data))
  } catch {
    // stockage indisponible : le streak reste juste discret et n'est pas persistant
  }
}

/**
 * À appeler une fois le Daily Pixel du jour terminé (gagné). Incrémente le
 * streak si le dernier jour joué était hier, le remet à 1 si un jour a été
 * sauté, ne fait rien si déjà compté aujourd'hui. Renvoie le streak à jour.
 */
export function registerDailyCompletion(): number {
  const today = getTodayKey()
  const prev = readStreak()

  if (prev && prev.lastDate === today) return prev.count

  if (prev) {
    const dayMs = 24 * 60 * 60 * 1000
    const gapDays = Math.round((parseDateKey(today) - parseDateKey(prev.lastDate)) / dayMs)
    const nextCount = gapDays === 1 ? prev.count + 1 : 1
    writeStreak({ count: nextCount, lastDate: today })
    return nextCount
  }

  writeStreak({ count: 1, lastDate: today })
  return 1
}

/** Lecture seule, pour affichage (ex: sur l'écran "déjà joué aujourd'hui"). */
export function getCurrentStreak(): number {
  const today = getTodayKey()
  const data = readStreak()
  if (!data) return 0
  const dayMs = 24 * 60 * 60 * 1000
  const gapDays = Math.round((parseDateKey(today) - parseDateKey(data.lastDate)) / dayMs)
  // Le streak reste affiché le jour même et le lendemain (avant d'avoir rejoué) ;
  // au-delà de 2 jours d'écart, il est considéré comme cassé.
  if (gapDays <= 1) return data.count
  return 0
}
