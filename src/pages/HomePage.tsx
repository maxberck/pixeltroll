import { useEffect, useState } from 'react'
import { initialLang, translations } from '../utils/i18n'

type Props = {
  onPatient: () => void
  onImpatient: () => void
  onDaily: () => void
}

const t = translations[initialLang]

function HomePage({ onPatient, onImpatient, onDaily }: Props) {
  const [possibilities, setPossibilities] = useState(
    () => window.innerWidth * window.innerHeight,
  )

  useEffect(() => {
    const onResize = () => setPossibilities(window.innerWidth * window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Les victoires sont stockées séparément par mode depuis la correction du bug de
  // seuil d'aide partagé ; on les additionne ici juste pour l'affichage global.
  const wins =
    Number(localStorage.getItem('pixeltroll_wins_patient') || 0) +
    Number(localStorage.getItem('pixeltroll_wins_impatient') || 0) +
    Number(localStorage.getItem('pixeltroll_wins_daily') || 0)
  const time = Number(localStorage.getItem('pixeltroll_time') || 0)
  const misses = Number(localStorage.getItem('pixeltroll_misses') || 0)

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center bg-[#F4F4F0] p-3 sm:p-6 font-sans text-black select-none">
      <div 
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 w-full max-w-lg md:max-w-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b-2 border-black bg-black px-3 py-1.5 sm:px-4 sm:py-2 text-white">
          <span className="font-mono text-[11px] sm:text-xs font-bold tracking-wider">
            PIXEL_TROLL / V1.0
          </span>
          <div className="flex gap-1.5">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 border border-white bg-transparent" />
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 bg-white" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8 text-center">
          <span className="border border-black bg-[#F4F4F0] px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wide">
            {t.subTagline}
          </span>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            {t.possibilitiesBefore}
            <span className="bg-[#FF2A2A] px-1.5 py-0.5 text-white inline-block my-1">
              {possibilities.toLocaleString(initialLang === 'fr' ? 'fr-FR' : 'en-US')}
            </span>
            {t.possibilitiesAfter}
          </h1>

          <p className="max-w-md font-mono text-[11px] sm:text-xs text-zinc-600">
            {t.homeSubtitle}
          </p>

          <div className="flex w-full flex-col gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onImpatient}
              className="group border-2 border-black bg-white p-3 sm:p-4 text-left shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs sm:text-sm text-black">
                  {t.modeFragileTitle}
                </span>
                <span className="border border-black px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold shrink-0">
                  {t.modeFragileBadge}
                </span>
              </div>
              <span className="mt-1 block font-mono text-[10px] sm:text-xs text-zinc-500">
                {t.modeFragileDesc}
              </span>
            </button>

            <button
              type="button"
              onClick={onPatient}
              className="group border-2 border-black bg-black p-3 sm:p-4 text-left text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs sm:text-sm text-white">
                  {t.modePatientTitle}
                </span>
                <span className="border border-white bg-white px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold text-black shrink-0">
                  {t.modePatientBadge}
                </span>
              </div>
              <span className="mt-1 block font-mono text-[10px] sm:text-xs text-zinc-400">
                {t.modePatientDesc}
              </span>
            </button>

            <button
              type="button"
              onClick={onDaily}
              className="group border-2 border-black bg-[#F4F4F0] p-3 sm:p-4 text-left shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs sm:text-sm text-black">
                  {t.dailyModeTitle}
                </span>
                <span className="border border-black bg-[#FF2A2A] text-white px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold shrink-0">
                  {t.dailyModeBadge}
                </span>
              </div>
              <span className="mt-1 block font-mono text-[10px] sm:text-xs text-zinc-500">
                {t.dailyModeDesc}
              </span>
            </button>
          </div>

          <div className="w-full border-t border-black/10 pt-3 sm:pt-4 font-mono text-[11px] sm:text-xs text-zinc-500">
            {t.statsLabel}
            <b className="text-black">{misses}</b>{t.statsClicks} • <b className="text-black">{time}</b>{t.statsSecs}
            <b className="text-[#FF2A2A]">{t.statsWins(wins)}</b>
          </div>

          {/* Soutien du projet — remplace YOUR_USERNAME par ton vrai identifiant Buy Me a Coffee. */}
          <a
            href="https://www.buymeacoffee.com/YOUR_USERNAME"
            target="_blank"
            rel="noreferrer"
            className="mt-3 sm:mt-4 flex w-full items-center justify-center gap-2 border-2 border-black bg-[#FFDD57] px-3 py-2 font-mono text-[11px] sm:text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform"
          >
            {t.coffeeSupportLabel}
          </a>
        </div>
      </div>
    </div>
  )
}

export default HomePage
