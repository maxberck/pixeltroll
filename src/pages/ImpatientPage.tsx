import { useMemo, useState } from 'react'
import PixelTextAssembler from '../components/PixelTextAssembler'
import PixelDotsCanvas, { type DotPoint } from '../components/PixelDotsCanvas'
import BarrierLinesLayer from '../components/BarrierLinesLayer'
import VictoryModal from '../components/VictoryModal'
import ChallengeIntroOverlay from '../components/ChallengeIntroOverlay'
import { usePixelGame, winsKeyFor } from '../hooks/usePixelGame'
import { getWinTier } from '../utils/winTier'
import { translations, initialLang } from '../utils/i18n'
import { getFooterAdStage, CHEAT_LINK_URL } from '../utils/footerAdText'

export default function ImpatientPage({ onHome }: { onHome: () => void }) {
  const [abandonHover, setAbandonHover] = useState(false)

  const [tier] = useState(() => {
    const wins = Number(localStorage.getItem(winsKeyFor('impatient'))) || 0
    return { ...getWinTier(wins), wins }
  })

  const g = usePixelGame(
    'impatient',
    56,
    undefined,
    () => {
      const t = translations[initialLang]
      return t.winTierMsg(t.winTierNames[tier.key], tier.wins)
    },
    56
  )

  const dotPoints = useMemo<DotPoint[]>(
    () => g.dots.map((d) => ({ x: d.x, y: d.y, size: 2, color: tier.color })),
    [g.dots, tier.color]
  )

  return (
    <div
      className="relative h-[100dvh] w-screen overflow-hidden bg-white select-none font-sans touch-manipulation cursor-crosshair"
      onClick={g.onMiss}
    >
      <div
        className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between px-2 sm:px-4 bg-white/90 border-b border-black/10 backdrop-blur-sm cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton Abandonner avec esquive animée */}
        <button
          type="button"
          style={{
            transform: `translate(${g.giveUpPos.x}px, ${g.giveUpPos.y}px)`,
            transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onMouseEnter={() => setAbandonHover(true)}
          onMouseLeave={() => setAbandonHover(false)}
          onClick={() => g.handleGiveUpClick(onHome)}
          className="shrink-0 border border-black bg-white px-2 sm:px-2.5 py-1 font-mono text-[10px] sm:text-xs font-bold text-zinc-600 transition-all hover:border-[#FF2A2A] hover:bg-[#FF2A2A] hover:text-white"
        >
          {abandonHover ? g.t.giveUpHover : g.t.giveUp}
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 font-mono text-xs font-black tracking-wider text-black">
          {g.t.modeFragileLabel}
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {g.incomingChallenge && (
            <div className="max-w-[110px] sm:max-w-none truncate border border-black bg-white px-2 sm:px-2.5 py-1 font-mono text-[9px] sm:text-xs font-bold text-[#FF2A2A] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {g.t.challengeLiveLabel(g.incomingChallenge.name, g.incomingChallenge.misses, g.runMisses)}
            </div>
          )}
          {g.helpButtonVisible && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                g.requestHelp()
              }}
              className="shrink-0 border border-black bg-white px-2 sm:px-2.5 py-1 font-mono text-[9px] sm:text-xs font-bold text-zinc-600 transition-all hover:border-[#FF2A2A] hover:bg-[#FF2A2A] hover:text-white"
            >
              {g.t.helpBtn}
            </button>
          )}
          <div className="border border-black bg-white px-2.5 py-1 font-mono text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {g.t.statusBarFragile(g.runTime, g.runMisses)}
          </div>
        </div>
      </div>

      {/* Points de clics + couloirs de bowling : tout rendu sur un seul canvas,
          pas un <span> par clic (des milliers de nœuds DOM plombaient les longues parties). */}
      <PixelDotsCanvas points={dotPoints} />
      {/* Seuls les couloirs de bowling se voient — l'aide sépare bien la zone en deux
          (utilisée pour biaiser la barre espace) mais reste invisible tant que le
          couloir de bowling ne matérialise pas une coupe après 300 clics. */}
      <BarrierLinesLayer lines={g.bumperLines} />

      <button
        type="button"
        aria-label="pixel"
        onClick={g.onWin}
        className="absolute z-10 cursor-crosshair border-0 p-0"
        style={{ left: g.pixel.x, top: g.pixel.y, width: 1, height: 1, background: 'transparent' }}
      />

      {g.incomingChallenge && !g.challengeAccepted && (
        <ChallengeIntroOverlay
          name={g.incomingChallenge.name}
          misses={g.incomingChallenge.misses}
          t={g.t}
          onAccept={g.acceptChallenge}
        />
      )}

      {g.activeMsg && <PixelTextAssembler text={g.activeMsg} onComplete={g.onCompleteMsg} />}

      {/* Emplacement pub vide (pas de vraie pub branchée) : au lieu d'un faux "PUB · AdinPlay",
          le texte évolue au fil du temps, avec une pointe finale en guise de blague. */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-2 sm:px-4 gap-2 bg-white/90 border-t border-black/10 backdrop-blur-sm cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href="https://www.buymeacoffee.com/YOUR_USERNAME"
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="max-w-[38%] truncate border border-black bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-zinc-600 underline"
        >
          {g.t.footerCoffeeLabel}
        </a>
        {(() => {
          const stages = g.t.footerAdStages as readonly string[]
          const stage = getFooterAdStage(g.runMisses, stages.length)
          if (stage >= stages.length) {
            return (
              <a
                href={CHEAT_LINK_URL}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="border border-black bg-white px-2.5 py-1 font-mono text-[10px] sm:text-xs font-black text-[#FF2A2A] underline"
              >
                {g.t.footerAdCheatLabel}
              </a>
            )
          }
          return (
            <span className="max-w-[60%] truncate border border-black bg-white px-2.5 py-1 font-mono text-[10px] sm:text-xs font-bold text-zinc-500">
              {stages[stage]}
            </span>
          )
        })()}
      </div>

      {g.victory && (
        <VictoryModal
          mode="impatient"
          runTime={g.runTime}
          runMisses={g.runMisses}
          wins={g.wins}
          t={g.t}
          helpCount={g.helpCount}
          bumperLevel={g.bumperLevel}
          cps={g.cps}
          usedOtherKeys={g.usedOtherKeys}
          mouseClicks={g.mouseClicks}
          spaceClicks={g.spaceClicks}
          grade={g.grade}
          gradeComment={g.gradeComment}
          challengeResult={g.challengeResult}
          incomingChallengeName={g.incomingChallenge?.name}
          profile={g.profile}
          playerName={g.playerName}
          shareStep={g.shareStep}
          nameDraft={g.nameDraft}
          setNameDraft={g.setNameDraft}
          pseudoConfirmTypo={g.pseudoConfirmTypo}
          pseudoJoke={g.pseudoJoke}
          lastShareOutcome={g.lastShareOutcome}
          onClearShareOutcome={g.clearShareOutcome}
          onStartShare={g.startShareFlow}
          onChangeName={g.changeName}
          onSubmitPseudoName={g.submitPseudoName}
          onAcceptPseudoTypo={g.onAcceptPseudoTypo}
          onForcePseudoSpelling={g.onForcePseudoSpelling}
          onShareResult={g.shareTheResult}
          onBeatMyScore={g.shareBeatMyScore}
          onCloseShareFlow={g.closeShareFlow}
          onReplay={() => g.resetRound()}
          onHome={onHome}
        />
      )}
    </div>
  )
}
