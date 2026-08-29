// Petite abstraction analytics : ne collecte rien de personnel, ne dépend d'aucun
// SDK. Pour l'instant elle logge en dev et garde un compteur local par événement
// (utile pour debug), mais l'API `trackEvent` est stable : brancher un vrai
// fournisseur (Plausible, PostHog, GA...) plus tard ne demandera de toucher que
// ce fichier.

export type AnalyticsEventName =
  | 'game_started'
  | 'game_abandoned'
  | 'help_used'
  | 'game_won'
  | 'result_shared'
  | 'challenge_created'
  | 'challenge_opened'
  | 'challenge_won'
  | 'daily_started'
  | 'daily_completed'

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>

const STORAGE_KEY = 'pixeltroll_analytics_counts'

function bumpLocalCount(name: AnalyticsEventName) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const counts = raw ? (JSON.parse(raw) as Record<string, number>) : {}
    counts[name] = (counts[name] || 0) + 1
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts))
  } catch {
    // stockage indisponible (mode privé, quota...) : on ignore silencieusement
  }
}

export function trackEvent(name: AnalyticsEventName, data?: AnalyticsPayload) {
  bumpLocalCount(name)

  // Hook d'intégration future : si un fournisseur analytics est injecté sur
  // window (ex: window.plausible, window.gtag...), on lui relaie l'événement
  // sans jamais planter le jeu si l'appel échoue.
  try {
    const w = window as any
    if (typeof w.plausible === 'function') {
      w.plausible(name, { props: data })
    } else if (typeof w.gtag === 'function') {
      w.gtag('event', name, data)
    }
  } catch {
    // un fournisseur analytics cassé ne doit jamais casser le jeu
  }

  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${name}`, data || {})
  }
}
