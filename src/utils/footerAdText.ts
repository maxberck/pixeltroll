export const FOOTER_AD_STAGE_CLICKS = 250
export const CHEAT_LINK_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1'

/**
 * Renvoie l'index de l'étape à afficher dans l'espace pub vide, en fonction du
 * nombre de clics ratés (pas du temps). Une fois toutes les étapes de texte
 * épuisées, l'appelant doit afficher le lien "triche" à la place.
 */
export function getFooterAdStage(misses: number, stagesCount: number): number {
  return Math.min(stagesCount, Math.floor(misses / FOOTER_AD_STAGE_CLICKS))
}
