import { useMemo, useRef, useState } from 'react'
import ShareCardCanvas from './ShareCardCanvas'
import type { PlayerProfile } from '../utils/playerProfile'
import type { ShareOutcome } from '../utils/shareCard'
import { getNextTitleProgress } from '../utils/winTier'

export type VictoryModalProps = {
  mode: 'patient' | 'impatient'
  runTime: number
  runMisses: number
  wins: number
  t: any
  customDesc?: string | null
  helpCount: number
  bumperLevel: number
  cps: number
  usedOtherKeys: boolean
  mouseClicks: number
  spaceClicks: number
  grade: string
  gradeComment: string
  challengeResult?: 'beat' | 'lost' | null
  incomingChallengeName?: string | null
  profile: PlayerProfile | null
  playerName: string
  shareStep: 'idle' | 'name' | 'confirmName' | 'ready'
  nameDraft: string
  setNameDraft: (v: string) => void
  pseudoConfirmTypo: string | null
  pseudoJoke: string | null
  lastShareOutcome: ShareOutcome | null
  onClearShareOutcome: () => void
  onStartShare: () => void
  onChangeName: () => void
  onSubmitPseudoName: (name: string) => void
  onAcceptPseudoTypo: () => void
  onForcePseudoSpelling: () => void
  onShareResult: (canvas: HTMLCanvasElement | null) => void
  onBeatMyScore: () => void
  onCloseShareFlow: () => void
  onReplay: () => void
  onHome: () => void
}

export default function VictoryModal({
  mode,
  runTime,
  runMisses,
  wins,
  t,
  customDesc,
  helpCount,
  bumperLevel,
  cps,
  usedOtherKeys,
  mouseClicks,
  spaceClicks,
  grade,
  gradeComment,
  challengeResult,
  incomingChallengeName,
  profile,
  playerName,
  shareStep,
  nameDraft,
  setNameDraft,
  pseudoConfirmTypo,
  pseudoJoke,
  lastShareOutcome,
  onClearShareOutcome,
  onStartShare,
  onChangeName,
  onSubmitPseudoName,
  onAcceptPseudoTypo,
  onForcePseudoSpelling,
  onShareResult,
  onBeatMyScore,
  onCloseShareFlow,
  onReplay,
  onHome,
}: VictoryModalProps) {
  const description = customDesc || (mode === 'patient' ? t.winDescPatient : t.winDescFragile)
  const cardCanvasRef = useRef<HTMLCanvasElement>(null)
  const [sharing, setSharing] = useState(false)

  const titleLabel = profile ? (t.profileTitleNames as Record<string, string>)[profile.titleKey] : ''
  const nextTitle = useMemo(() => getNextTitleProgress(wins), [wins])

  const statLabelFor = (key: string) => {
    if (key === 'patience') return t.statPatience
    if (key === 'obsession') return t.statObsession
    if (key === 'luck') return t.statLuck
    return t.statDignity
  }

  const shareCardData = useMemo(() => {
    if (!profile) return null
    return {
      name: playerName,
      totalClicksLabel: `${runMisses.toLocaleString()} ${mode === 'patient' ? t.winMisses : t.statMouseClicks}`.trim(),
      timeLabel: `${runTime}s`,
      stats: profile.stats.map((s) => ({ label: statLabelFor(s.key), value: s.value })),
      titleLabel,
      emoji: profile.emoji,
      quip: profile.quip,
      siteLabel: t.shareCardSiteUrl,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, playerName, runMisses, runTime, titleLabel])

  const handleShare = async () => {
    setSharing(true)
    await onShareResult(cardCanvasRef.current)
    setSharing(false)
  }

  const handleBeat = async () => {
    setSharing(true)
    await onBeatMyScore()
    setSharing(false)
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm max-h-[90dvh] overflow-y-auto border-2 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-lg sm:text-xl font-black tracking-tight text-black">{t.winTitle}</h2>
        <p className="mt-1 font-mono text-[11px] sm:text-xs text-zinc-600 leading-snug">{description}</p>

        {challengeResult && incomingChallengeName && (
          <div className="blink-alert mt-3 text-center">
            <span className="border-2 border-black bg-[#FF2A2A] px-3 py-1 font-mono text-xs font-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              {challengeResult === 'beat'
                ? t.challengeBeatMsg(incomingChallengeName)
                : t.challengeLostMsg(incomingChallengeName)}
            </span>
          </div>
        )}

        {/* Titre + stats absurdes, calculés à partir du comportement réel */}
        {profile && (
          <div className="my-3 border-2 border-black bg-black p-2.5 text-center">
            <span className="font-mono text-sm font-black text-white">
              {profile.emoji} {titleLabel}
            </span>
            {nextTitle.next && (
              <p className="mt-1 font-mono text-[10px] text-zinc-400">
                {t.nextTitleProgress(nextTitle.winsNeeded, (t.profileTitleNames as Record<string, string>)[nextTitle.next.key])}
              </p>
            )}
          </div>
        )}

        <div className="my-3 sm:my-4 border border-black bg-[#F4F4F0] p-3 font-mono text-xs space-y-1.5">
          <p className="flex justify-between">
            <span>{t.winTime}</span>
            <b className="text-black">{runTime}s</b>
          </p>
          <p className="flex justify-between">
            <span>{t.winMisses}</span>
            <b className="text-black">{runMisses.toLocaleString()}</b>
          </p>
          <p className="flex justify-between">
            <span>{t.winTotalWins}</span>
            <b className="text-[#FF2A2A]">{wins}</b>
          </p>

          {profile && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-zinc-300 pt-1.5">
              {profile.stats.map((s) => (
                <p key={s.key} className="flex justify-between">
                  <span>{statLabelFor(s.key)}</span>
                  <b className="text-black">{s.value}/100</b>
                </p>
              ))}
            </div>
          )}

          <p className="flex justify-between border-t border-zinc-300 pt-1.5">
            <span>{t.statCps}</span>
            <b className="text-black">{cps.toFixed(2)}</b>
          </p>
          <p className="flex justify-between">
            <span>{t.statMouseClicks}</span>
            <b className="text-black">{mouseClicks.toLocaleString()}</b>
          </p>
          <p className="flex justify-between">
            <span>{t.statSpaceClicks}</span>
            <b className="text-black">{spaceClicks.toLocaleString()}</b>
          </p>
          <p className="flex justify-between">
            <span>{t.statHelps}</span>
            <b className="text-black">{helpCount}</b>
          </p>
          {bumperLevel > 0 && (
            <p className="flex justify-between">
              <span>{t.statBumper}</span>
              <b className="text-black">{bumperLevel}</b>
            </p>
          )}
          <p className="flex justify-between">
            <span>{t.statKeys}</span>
            <b className="text-black">{usedOtherKeys ? '✅' : '—'}</b>
          </p>
          <p className="flex justify-between border-t border-zinc-300 pt-1.5">
            <span>{t.gradeLabel}</span>
            <b className="text-[#FF2A2A]">{grade}</b>
          </p>
          <p className="text-zinc-600">{gradeComment}</p>
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs font-bold">
          {shareStep === 'idle' && (
            <button
              type="button"
              onClick={onStartShare}
              className="border-2 border-black bg-[#FF2A2A] p-2.5 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform"
            >
              {t.shareResultBtn}
            </button>
          )}

          {shareStep === 'name' && (
            <div className="border-2 border-black bg-[#F4F4F0] p-2.5">
              <p className="mb-1.5 font-mono text-[11px] font-bold text-black">{t.askPseudoLabel}</p>
              <input
                type="text"
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSubmitPseudoName(nameDraft)
                }}
                placeholder={t.askPseudoPlaceholder}
                maxLength={24}
                className="mb-2 w-full border-2 border-black bg-white px-2 py-1.5 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => onSubmitPseudoName(nameDraft)}
                className="w-full border-2 border-black bg-black p-2 font-mono text-xs font-bold text-white active:translate-x-0.5 active:translate-y-0.5 transition-transform"
              >
                {t.askPseudoConfirmBtn}
              </button>
            </div>
          )}

          {shareStep === 'confirmName' && pseudoConfirmTypo && (
            <div className="border-2 border-black bg-[#F4F4F0] p-2.5 text-center">
              {pseudoJoke ? (
                <p className="font-mono text-[11px] font-bold text-black">{pseudoJoke}</p>
              ) : (
                <>
                  <p className="mb-2 font-mono text-xs font-bold text-black">{t.confirmPseudoQuestion(pseudoConfirmTypo)}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onAcceptPseudoTypo}
                      className="flex-1 border-2 border-black bg-black p-2 font-mono text-[10px] sm:text-[11px] font-bold text-white active:translate-x-0.5 active:translate-y-0.5 transition-transform"
                    >
                      {t.confirmPseudoYes}
                    </button>
                    <button
                      type="button"
                      onClick={onForcePseudoSpelling}
                      className="flex-1 border-2 border-black bg-white p-2 font-mono text-[10px] sm:text-[11px] font-bold text-black hover:bg-zinc-100 active:translate-x-0.5 active:translate-y-0.5 transition-transform"
                    >
                      {t.confirmPseudoNo}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {shareStep === 'ready' && shareCardData && (
            <div className="border-2 border-black bg-[#F4F4F0] p-2.5">
              <ShareCardCanvas ref={cardCanvasRef} data={shareCardData} />
              <button type="button" onClick={onChangeName} className="mt-2 w-full text-center text-[10px] text-zinc-500 underline">
                {t.changeNameLink}
              </button>

              {lastShareOutcome && (
                <p className="mt-2 text-center font-mono text-[10px] font-bold text-[#FF2A2A]">
                  {lastShareOutcome === 'copied'
                    ? t.copiedToast
                    : lastShareOutcome === 'failed'
                      ? t.shareFailedToast
                      : t.sharedToast}
                </p>
              )}

              <button
                type="button"
                disabled={sharing}
                onClick={handleShare}
                onBlur={onClearShareOutcome}
                className="mt-2 w-full border-2 border-black bg-[#FF2A2A] p-2.5 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform disabled:opacity-60"
              >
                {t.shareResultBtn}
              </button>
              <button
                type="button"
                disabled={sharing}
                onClick={handleBeat}
                className="mt-2 w-full border-2 border-black bg-black p-2.5 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform disabled:opacity-60"
              >
                {challengeResult ? t.challengeSomeoneBtn : t.beatMyScoreBtn}
              </button>
              <button type="button" onClick={onCloseShareFlow} className="mt-1 w-full py-1 text-center text-[10px] text-zinc-500 hover:text-black">
                {t.shareResultCloseBtn}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onReplay}
            className="border-2 border-black bg-black p-2.5 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform"
          >
            {t.replayBtn}
          </button>
          <button type="button" onClick={onHome} className="py-1 text-zinc-500 hover:text-black transition-colors">
            {t.homeBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
