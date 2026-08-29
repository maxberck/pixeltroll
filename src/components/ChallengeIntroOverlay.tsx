type Props = {
  name: string
  misses: number
  t: any
  onAccept: () => void
}

/**
 * Écran plein écran affiché quand on arrive via un lien "?battle=..." : le joueur
 * voit immédiatement contre qui il joue avant de pouvoir toucher l'écran, au lieu
 * de découvrir le défi au hasard dans la barre du haut en pleine partie.
 */
export default function ChallengeIntroOverlay({ name, misses, t, onAccept }: Props) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 text-center select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm border-2 border-white bg-black p-6 shadow-[6px_6px_0px_0px_rgba(255,42,42,1)]">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">PIXELTROLL</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{t.challengeIntroTitle(name)}</h2>
        <p className="mt-3 font-mono text-lg font-black text-[#FF2A2A]">{t.challengeIntroClicks(misses)}</p>
        <button
          type="button"
          onClick={onAccept}
          className="mt-6 w-full border-2 border-white bg-[#FF2A2A] p-3 font-mono text-sm font-black text-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform"
        >
          {t.acceptChallengeBtn}
        </button>
      </div>
    </div>
  )
}
