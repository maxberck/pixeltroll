import { useEffect, useMemo, useRef, useState } from 'react'
import messagesPatientFr from '../data/messagesPatient_fr.json'
import messagesPatientEn from '../data/messagesPatient_en.json'
import messagesImpatientFr from '../data/messagesImpatient_fr.json'
import messagesImpatientEn from '../data/messagesImpatient_en.json'
import { TrollTracker, type GameMode } from '../utils/trollAnalyzer'
import { initialLang, translations, type Lang, type BaseLang } from '../utils/i18n'
import { computeAlternatingSplit, type BarrierLine, type Rect } from '../utils/barrierLines'
import { computePlayerProfile, type PlayerProfile } from '../utils/playerProfile'
import { trackEvent } from '../utils/analytics'
import { shareResult as shareResultNative, type ShareOutcome } from '../utils/shareCard'

type TrollMsg = { temps?: number; clics?: number; texte: string }
export type Dot = { id: number; x: number; y: number; fake?: boolean }

const STORAGE_KEYS = {
  activeGame: 'pixeltroll_active_game',
  totalMisses: 'pixeltroll_misses',
  totalTime: 'pixeltroll_time',
  helpsTotal: 'pixeltroll_helps',
  playerName: 'pixeltroll_player_name',
} as const

// Les victoires sont comptées séparément par mode : gagner en Patient ne doit pas
// accélérer les seuils d'aide en Impatient ou dans le Daily Pixel, et inversement.
export const winsKeyFor = (mode: GameMode) => `pixeltroll_wins_${mode}`

const TIME_AD_INTERVAL_SECONDS = 120
const HELP_PENALTY_SECONDS = 20
const HELP_START_THRESHOLD = 1000
const HELP_MIN_INTERVAL = 100

type ChallengeResult = 'beat' | 'lost' | null
type HDir = 'left' | 'right'
type VDir = 'up' | 'down'

const makeTypo = (name: string) => {
  if (name.length < 2) return name + (name[0] || 'x')
  const chars = name.split('')
  const i = Math.floor(chars.length / 2)
  const j = Math.min(i + 1, chars.length - 1)
  const tmp = chars[i]
  chars[i] = chars[j]
  chars[j] = tmp
  return chars.join('')
}

type SavedSession = {
  mode: GameMode
  pixel: { x: number; y: number }
  runTime: number
  uniquePixels: string[]
  dots: Dot[]
}

const readSavedSession = (mode: GameMode): SavedSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.activeGame)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedSession
    return parsed.mode === mode ? parsed : null
  } catch {
    return null
  }
}

export function usePixelGame(
  mode: GameMode,
  topOffset: number,
  fixedPixel?: { x: number; y: number },
  startMessage?: (totalPixels: number) => string,
  bottomOffset: number = 0
) {
  const saved = useMemo(() => readSavedSession(mode), [mode])

  const [lang, setLang] = useState<Lang>(initialLang)
  const [wins, setWins] = useState(() => Number(localStorage.getItem(winsKeyFor(mode))) || 0)
  const [runTime, setRunTime] = useState(() => saved?.runTime || 0)
  const [uniquePixels, setUniquePixels] = useState<Set<string>>(() => new Set(saved?.uniquePixels || []))
  const [fakeMissesBonus, setFakeMissesBonus] = useState(0)
  const [dots, setDots] = useState<Dot[]>(() => saved?.dots || [])
  const [pixel, setPixel] = useState(() => {
    if (saved?.pixel) return saved.pixel
    if (fixedPixel) return fixedPixel
    const w = typeof window !== 'undefined' ? Math.max(1, window.innerWidth - 1) : 1920
    const h = typeof window !== 'undefined' ? Math.max(1, window.innerHeight - topOffset - bottomOffset - 1) : 1080
    return { x: Math.floor(Math.random() * w), y: topOffset + Math.floor(Math.random() * h) }
  })

  const [activeMsg, setActiveMsg] = useState<string | null>(null)
  const [showAd, setShowAd] = useState(false)
  const [adLeft, setAdLeft] = useState(5)
  const [showWarn, setShowWarn] = useState(false)
  const [adWarnText, setAdWarnText] = useState('')
  const [victory, setVictory] = useState(false)
  const [winCustomMsg, setWinCustomMsg] = useState<string | null>(null)

  // Abandon fuyant
  const [giveUpAttempted, setGiveUpAttempted] = useState(false)
  const [giveUpPos, setGiveUpPos] = useState({ x: 0, y: 0 })

  // Aide : indication de direction (avec mensonge occasionnel et moquerie)
  const [helpCount, setHelpCount] = useState(0)
  const [helpButtonVisible, setHelpButtonVisible] = useState(false)
  const [helpThreshold, setHelpThreshold] = useState(HELP_START_THRESHOLD)
  const helpLiedRef = useRef(false)
  const helpClicksSinceHintRef = useRef(0)
  const helpAwaitingTeaseRef = useRef(false)
  const helpTrueHorizontalRef = useRef<HDir>('left')
  // Un côté choisi par aide prise (pas juste 2 valeurs), pour que l'alternance
  // horizontal/vertical puisse recommencer sur une zone déjà réduite (3e aide, 5e...).
  const [helpSides, setHelpSides] = useState<Array<'left' | 'right' | 'up' | 'down'>>([])

  // Couloirs de bowling : après 300 clics sans succès depuis la dernière aide,
  // on grignote la zone jouable d'une ligne de coupe supplémentaire (même principe
  // que l'aide : coin progressif), mais sans mensonge, toujours vers le vrai pixel.
  const [bumperLevel, setBumperLevel] = useState(0)
  const clicksSinceHintForBumperRef = useRef(0)
  // Un seul déclenchement de couloir par indice pris ; il faut reprendre une aide pour le réarmer.
  const bumperArmedRef = useRef(false)

  // Petits easter eggs déclenchés par des suites de touches (ex: "bb", "bbc")
  const keySequenceBufferRef = useRef('')

  // Défi reçu par lien (?battle=...)
  const [incomingChallenge, setIncomingChallenge] = useState<{ time: number; misses: number; name: string } | null>(null)
  const [challengeResult, setChallengeResult] = useState<ChallengeResult>(null)
  // Écran "X CHALLENGES YOU / ACCEPT CHALLENGE" affiché avant de pouvoir jouer,
  // seulement si on arrive via un lien de défi valide pour ce mode.
  const [challengeAccepted, setChallengeAccepted] = useState(true)
  const acceptChallenge = () => setChallengeAccepted(true)

  const gameStartTrackedRef = useRef(false)

  const t = translations[lang]
  const safeLang: BaseLang = lang === 'morse' ? initialLang : lang
  const adThreshold = useMemo(() => {
    if (mode !== 'patient') return 0
    const mod = runTime % TIME_AD_INTERVAL_SECONDS
    return mod === 0 && runTime > 0 ? TIME_AD_INTERVAL_SECONDS : TIME_AD_INTERVAL_SECONDS - mod
  }, [mode, runTime])

  const nextClick = useRef(0)
  const nextTime = useRef(0)
  const isBusy = useRef(false)
  const adCount = useRef(0)
  const dotId = useRef(saved?.dots?.length || 0)
  const keyCount = useRef(0)
  const spaceDiscovered = useRef(false)
  const duplicateClicksCount = useRef(0)
  const tracker = useRef(new TrollTracker())
  const isHoldingSpace = useRef(false)
  const hasTriggeredScriptTroll = useRef(false)
  const totalClicksRef = useRef(0)
  const spaceClicksRef = useRef(0)

  // Lecture d'un défi reçu par lien partagé (?battle=...) — on ignore le défi si
  // le lien vient d'un autre mode (Patient/Impatient/Daily n'ont pas le même pixel
  // ni la même mécanique, comparer leurs scores n'aurait aucun sens).
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const raw = params.get('battle')
      if (!raw) return
      const decoded = JSON.parse(decodeURIComponent(atob(raw))) as {
        t: number
        m: number
        n: string
        md?: GameMode
      }
      if (typeof decoded.t === 'number' && typeof decoded.m === 'number' && decoded.md === mode) {
        setIncomingChallenge({ time: decoded.t, misses: decoded.m, name: decoded.n || '???' })
        setChallengeAccepted(false)
        trackEvent('challenge_opened', { mode })
      }
    } catch {
      // lien invalide, on ignore silencieusement
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Un seul événement "game_started" par montage réel de partie (pas à chaque
  // reprise de session sauvegardée après un simple reload).
  useEffect(() => {
    if (gameStartTrackedRef.current) return
    gameStartTrackedRef.current = true
    if (!saved) trackEvent('game_started', { mode })
    if (mode === 'daily' && !saved) trackEvent('daily_started', {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [totalScreenPixels, setTotalScreenPixels] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1920
    const h = typeof window !== 'undefined' ? Math.max(1, window.innerHeight - topOffset - bottomOffset) : 1080
    return Math.max(1, w * h)
  })

  // Taille de fenêtre réactive : utilisée pour recalculer les lignes de coupe
  // (aide + couloirs de bowling) au redimensionnement, sans quoi elles pouvaient
  // finir mal placées ou hors écran.
  const [viewportSize, setViewportSize] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  }))

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      const h = Math.max(1, window.innerHeight - topOffset - bottomOffset)
      setTotalScreenPixels(Math.max(1, w * h))
      setViewportSize({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [topOffset])

  const realMisses = uniquePixels.size
  const exploredPercent = (realMisses / totalScreenPixels) * 100
  const displayMisses = realMisses + fakeMissesBonus

  const rawList = useMemo(() => {
    if (mode === 'patient') {
      return (safeLang === 'fr' ? messagesPatientFr : messagesPatientEn) as TrollMsg[]
    }
    return (safeLang === 'fr' ? messagesImpatientFr : messagesImpatientEn) as TrollMsg[]
  }, [mode, safeLang])

  const clickPaliers = useMemo(
    () => rawList.filter((m) => m.clics != null).sort((a, b) => (a.clics || 0) - (b.clics || 0)),
    [rawList]
  )
  const timePaliers = useMemo(
    () => rawList.filter((m) => m.temps != null).sort((a, b) => (a.temps || 0) - (b.temps || 0)),
    [rawList]
  )

  const showOverlay = (txt: string) => {
    isBusy.current = true
    setActiveMsg(txt)
  }

  // Remplace les jetons dynamiques dans les messages scriptés (ex: le vrai nombre
  // de pixels restants, qui dépend de l'écran de la personne, pas d'un chiffre figé).
  const resolvePalierText = (text: string, currentMisses: number) => {
    if (!text.includes('{{REMAINING}}')) return text
    const remaining = Math.max(0, totalScreenPixels - currentMisses)
    return text.replace('{{REMAINING}}', remaining.toLocaleString(safeLang === 'fr' ? 'fr-FR' : 'en-US'))
  }

  // Corrige le bug de rechargement : sans ça, les compteurs de palier repartaient de 0
  // et redéclenchaient en rafale tous les messages déjà vus dès les premiers clics.
  useEffect(() => {
    if (!saved) return
    const savedMisses = saved.uniquePixels.length
    const clickIdx = clickPaliers.findIndex((p) => (p.clics || 0) > savedMisses)
    nextClick.current = clickIdx === -1 ? clickPaliers.length : clickIdx
    const timeIdx = timePaliers.findIndex((p) => (p.temps || 0) > saved.runTime)
    nextTime.current = timeIdx === -1 ? timePaliers.length : timeIdx
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Message de démarrage (ex: Daily Pixel) avec le vrai nombre de pixels de l'écran —
  // seulement sur une partie fraîche, jamais en reprenant une session sauvegardée.
  useEffect(() => {
    if (saved || !startMessage) return
    showOverlay(startMessage(totalScreenPixels))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sauvegarde Reload
  useEffect(() => {
    if (victory) return
    const session: SavedSession = {
      mode,
      pixel,
      runTime,
      uniquePixels: Array.from(uniquePixels),
      dots,
    }
    localStorage.setItem(STORAGE_KEYS.activeGame, JSON.stringify(session))
  }, [mode, pixel, runTime, uniquePixels, dots, victory])

  const resetRound = (msg?: string) => {
    localStorage.removeItem(STORAGE_KEYS.activeGame)
    const w = Math.max(1, window.innerWidth - 1)
    const h = Math.max(1, window.innerHeight - topOffset - bottomOffset - 1)
    // Le Daily Pixel garde toujours le même pixel du jour, même après "rejouer".
    const newPix = fixedPixel ?? { x: Math.floor(Math.random() * w), y: topOffset + Math.floor(Math.random() * h) }

    setPixel(newPix)
    setRunTime(0)
    setUniquePixels(new Set())
    setFakeMissesBonus(0)
    setDots([])
    setShowAd(false)
    setShowWarn(false)
    setVictory(false)
    setShareStep('idle')
    setPseudoConfirmTypo(null)
    setPseudoJoke(null)
    setLastShareOutcome(null)
    setLang(initialLang)
    setWinCustomMsg(null)
    setGiveUpAttempted(false)
    setGiveUpPos({ x: 0, y: 0 })
    setHelpCount(0)
    setHelpButtonVisible(false)
    setHelpThreshold(HELP_START_THRESHOLD)
    helpLiedRef.current = false
    helpClicksSinceHintRef.current = 0
    helpAwaitingTeaseRef.current = false
    setHelpSides([])
    bumperArmedRef.current = false
    setBumperLevel(0)
    clicksSinceHintForBumperRef.current = 0
    keySequenceBufferRef.current = ''
    setChallengeResult(null)
    nextClick.current = 0
    nextTime.current = 0
    adCount.current = 0
    keyCount.current = 0
    spaceDiscovered.current = false
    duplicateClicksCount.current = 0
    hasTriggeredScriptTroll.current = false
    isBusy.current = false
    totalClicksRef.current = 0
    spaceClicksRef.current = 0
    tracker.current.reset()
    if (msg) showOverlay(msg)
    else setActiveMsg(null)
  }

  // Anti-DevTools immédiat
  useEffect(() => {
    const handleKeyDownAntiCheat = (e: KeyboardEvent) => {
      if (
        e.code === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.code === 'KeyI' || e.code === 'KeyJ' || e.code === 'KeyC')) ||
        (e.metaKey && e.altKey && (e.code === 'KeyI' || e.code === 'KeyJ' || e.code === 'KeyC'))
      ) {
        e.preventDefault()
        showOverlay(
          safeLang === 'fr'
            ? "Non non... Pas de triche par ici."
            : "No no... No cheating around here."
        )
      }
    }

    let devtoolsOpen = false
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160
      const heightThreshold = window.outerHeight - window.innerHeight > 160
      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        devtoolsOpen = true
        showOverlay(
          safeLang === 'fr'
            ? "Non non... Pas de triche par ici."
            : "No no... No cheating around here."
        )
      }
    }

    const interval = window.setInterval(checkDevTools, 2000)
    window.addEventListener('keydown', handleKeyDownAntiCheat)
    return () => {
      window.removeEventListener('keydown', handleKeyDownAntiCheat)
      window.clearInterval(interval)
    }
  }, [safeLang])

  // Honeypot Console
  useEffect(() => {
    console.log(
      "%c[DEBUG PIXEL] Automation helper available: window.__PIXEL_SOLVER_RUN()",
      "color: #FF2A2A; font-family: monospace; font-size: 11px;"
    )

    ;(window as any).__PIXEL_SOLVER_RUN = () => {
      if (hasTriggeredScriptTroll.current) return "Script halted."
      hasTriggeredScriptTroll.current = true

      let step = 0
      const scriptInterval = window.setInterval(() => {
        step++
        setDots((d) => [
          ...d,
          {
            id: ++dotId.current,
            x: Math.floor(Math.random() * window.innerWidth),
            y: Math.floor(topOffset + Math.random() * (window.innerHeight - topOffset - bottomOffset)),
            fake: true,
          },
        ])

        if (step >= 7) {
          window.clearInterval(scriptInterval)
          setDots((d) => d.filter((dot) => !dot.fake))
          setDots((d) => [...d, { id: ++dotId.current, x: 100, y: topOffset + 100 }])
          setUniquePixels((prev) => new Set(prev).add(`100,${topOffset + 100}`))

          showOverlay(
            safeLang === 'fr'
              ? "Allez annule ton script et retourne-y... Je suis gentil, je te laisse un pixel déjà cliqué pour l'effort."
              : "Go ahead, cancel your script and get back to clicking... I'm nice, here's 1 free dot for your effort."
          )
        }
      }, 1000)

      return "Scanning engine running..."
    }

    return () => {
      delete (window as any).__PIXEL_SOLVER_RUN
    }
  }, [topOffset, safeLang])

  // Chrono
  useEffect(() => {
    if (victory) return
    const id = window.setInterval(() => {
      setRunTime((prev) => {
        const next = prev + 1
        const target = timePaliers[nextTime.current]
        if (target && target.temps != null && next >= target.temps) {
          nextTime.current++
          if (!isBusy.current && !showAd && lang !== 'morse') {
            showOverlay(target.texte)
          }
        }
        // Pub toutes les 2 minutes de jeu (remplace l'ancien seuil basé sur les clics)
        if (mode === 'patient' && !showAd) {
          const secondsToNextAd = TIME_AD_INTERVAL_SECONDS - (next % TIME_AD_INTERVAL_SECONDS)
          if (secondsToNextAd === 5) {
            const pool = t.adWarnPool as readonly string[]
            setAdWarnText(pool[Math.floor(Math.random() * pool.length)])
            setShowWarn(true)
          } else {
            setShowWarn(false)
          }
          if (next > 0 && next % TIME_AD_INTERVAL_SECONDS === 0) {
            setShowWarn(false)
            setShowAd(true)
          }
        }
        return next
      })

      const totalTime = (Number(localStorage.getItem(STORAGE_KEYS.totalTime)) || 0) + 1
      localStorage.setItem(STORAGE_KEYS.totalTime, String(totalTime))
    }, 1000)
    return () => window.clearInterval(id)
  }, [victory, showAd, lang, timePaliers])

  // Publicité Patient
  useEffect(() => {
    if (!showAd) return
    setAdLeft(5)
    adCount.current += 1
    const secondsPlayed = adCount.current * TIME_AD_INTERVAL_SECONDS

    const id = window.setInterval(() => {
      setAdLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id)
          setShowAd(false)
          if (lang !== 'morse') {
            const phrases = [
              t.postAd1(secondsPlayed),
              t.postAd2(secondsPlayed),
              t.postAd3(secondsPlayed),
            ]
            showOverlay(phrases[Math.floor(Math.random() * phrases.length)])
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [showAd, t, lang])

  // Clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (victory || showAd || isBusy.current) return

      if (e.code === 'Space') {
        e.preventDefault()

        if (giveUpAttempted) {
          setGiveUpAttempted(false)
          setGiveUpPos({ x: 0, y: 0 })
        }

        if (e.repeat) {
          isHoldingSpace.current = true
          setFakeMissesBonus((prev) => prev + 1)
          const fakeX = Math.floor(Math.random() * window.innerWidth)
          const fakeY = Math.floor(topOffset + Math.random() * (window.innerHeight - topOffset - bottomOffset))
          setDots((d) => [...d, { id: ++dotId.current, x: fakeX, y: fakeY, fake: true }])
          return
        }

        const spaceRect = getSpaceRandomRect()
        const rx = Math.floor(spaceRect.x + Math.random() * spaceRect.w)
        const ry = Math.floor(spaceRect.y + Math.random() * spaceRect.h)
        totalClicksRef.current++
        spaceClicksRef.current++
        registerHelpClick(rx < window.innerWidth / 2 ? 'left' : 'right')

        if (rx === pixel.x && ry === pixel.y) {
          onWin()
          return
        }

        const coordKey = `${rx},${ry}`
        if (!uniquePixels.has(coordKey)) {
          setUniquePixels((prev) => new Set(prev).add(coordKey))
        }

        setDots((d) => [...d, { id: ++dotId.current, x: rx, y: ry }])
        const nextMisses = uniquePixels.size + 1
        const tot = (Number(localStorage.getItem(STORAGE_KEYS.totalMisses)) || 0) + 1
        localStorage.setItem(STORAGE_KEYS.totalMisses, String(tot))

        if (lang !== 'morse') {
          const target = clickPaliers[nextClick.current]
          if (target && target.clics != null && nextMisses >= target.clics) {
            if (!isBusy.current) {
              nextClick.current++
              showOverlay(resolvePalierText(target.texte, nextMisses))
            }
            // sinon : un message est déjà en cours, on retente au clic suivant
            // plutôt que de le couper en plein milieu.
          } else if (!spaceDiscovered.current) {
            spaceDiscovered.current = true
            showOverlay(t.spaceFirst)
          } else {
            const roast = tracker.current.registerSpaceHit(safeLang)
            if (roast) showOverlay(roast)
          }
        }
        return
      }

      if (!spaceDiscovered.current) return

      if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault()
        if (lang !== 'morse') {
          setLang('morse')
          showOverlay(translations.fr.morseIntroMsg)
        } else {
          setLang(initialLang)
          showOverlay(translations[initialLang].morseRoastReturn)
        }
        return
      }

      // Petits easter eggs sur des suites de touches tapées (ex: "bb", "bbc")
      if (lang !== 'morse' && e.key.length === 1) {
        keySequenceBufferRef.current = (keySequenceBufferRef.current + e.key.toLowerCase()).slice(-12)
        const jokes = t.keySequenceJokes as Record<string, string>
        const matched = Object.keys(jokes)
          .sort((a, b) => b.length - a.length)
          .find((pattern) => keySequenceBufferRef.current.endsWith(pattern))
        if (matched && !isBusy.current) {
          keySequenceBufferRef.current = ''
          showOverlay(jokes[matched])
        }
      }

      if (lang !== 'morse') {
        keyCount.current++
        const c = keyCount.current
        if (c === 23) resetRound(t.keyReset23)
        else if (c === 20) showOverlay(t.keyWarn20)
        else if (c === 5) showOverlay(t.keyWarn5)
        else if (c === 1) showOverlay(t.keyWarn1)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isHoldingSpace.current) {
        isHoldingSpace.current = false
        setFakeMissesBonus(0)
        setDots((d) => d.filter((dot) => !dot.fake))
        showOverlay(
          safeLang === 'fr'
            ? "T'y as cru avoue..."
            : "You really thought that would work, admit it..."
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [victory, showAd, pixel, wins, adThreshold, lang, t, safeLang, mode, topOffset, clickPaliers, giveUpAttempted, uniquePixels])

  // Clics souris
  const onMiss = (e: React.MouseEvent<HTMLDivElement>) => {
    if (victory || showAd || e.clientY < topOffset) return
    totalClicksRef.current++
    registerHelpClick(e.clientX < window.innerWidth / 2 ? 'left' : 'right')

    if (giveUpAttempted) {
      setGiveUpAttempted(false)
      setGiveUpPos({ x: 0, y: 0 })
    }

    const coordKey = `${e.clientX},${e.clientY}`
    const isNewPixel = !uniquePixels.has(coordKey)

    if (isNewPixel) {
      setUniquePixels((prev) => new Set(prev).add(coordKey))
      setDots((d) => [...d, { id: ++dotId.current, x: e.clientX, y: e.clientY }])
      duplicateClicksCount.current = 0

      const nextMisses = realMisses + 1
      const tot = (Number(localStorage.getItem(STORAGE_KEYS.totalMisses)) || 0) + 1
      localStorage.setItem(STORAGE_KEYS.totalMisses, String(tot))

      if (lang !== 'morse') {
        const target = clickPaliers[nextClick.current]
        if (target && target.clics != null && nextMisses >= target.clics && !isBusy.current) {
          nextClick.current++
          showOverlay(resolvePalierText(target.texte, nextMisses))
          return
        }
      }
    } else {
      duplicateClicksCount.current++

      if (duplicateClicksCount.current === 5) {
        showOverlay(
          safeLang === 'fr'
            ? "Regarde ton compteur : 0 progression. Cliquer deux fois sur le même pixel ne compte pas."
            : "Look at your counter: 0 progress. Clicking the same pixel twice doesn't count."
        )
        return
      }
    }

    if (!isBusy.current && lang !== 'morse') {
      const ev = tracker.current.checkContext(
        { x: e.clientX, y: e.clientY },
        pixel,
        window.innerWidth,
        window.innerHeight,
        topOffset,
        isNewPixel,
        exploredPercent,
        mode,
        safeLang
      )
      if (ev) showOverlay(ev.text)
    }
  }

  const onWin = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (victory || showAd || isHoldingSpace.current) return
    localStorage.removeItem(STORAGE_KEYS.activeGame)
    const nextWins = wins + 1
    setWins(nextWins)
    localStorage.setItem(winsKeyFor(mode), String(nextWins))

    const isFr = safeLang === 'fr'
    let customMsg: string = mode === 'patient' ? t.winDescPatient : t.winDescFragile

    if (realMisses <= 15) {
      customMsg = isFr
        ? `Trouvé en seulement ${realMisses} clics et ${runTime}s ! 1 chance sur ${totalScreenPixels.toLocaleString('fr-FR')}... Va jouer au loto.`
        : `Found in just ${realMisses} clicks and ${runTime}s! 1 in ${totalScreenPixels.toLocaleString('en-US')} odds... Buy a lottery ticket.`
    } else if (exploredPercent >= 20) {
      customMsg = isFr
        ? `Trouvé après avoir couvert ${exploredPercent.toFixed(2)}% de l'écran (${realMisses.toLocaleString('fr-FR')} pixels uniques). Respect pour l'endurance.`
        : `Located after covering ${exploredPercent.toFixed(2)}% of the canvas (${realMisses.toLocaleString('en-US')} unique pixels). Respect for the grind.`
    }

    setWinCustomMsg(customMsg)
    setVictory(true)
    trackEvent('game_won', { mode, time: runTime, misses: realMisses })

    if (incomingChallenge) {
      const beat = runTime <= incomingChallenge.time
      setChallengeResult(beat ? 'beat' : 'lost')
      if (beat) trackEvent('challenge_won', { mode })
    }
  }

  const handleGiveUpClick = (onHomeCallback: () => void) => {
    if (!giveUpAttempted) {
      setGiveUpAttempted(true)
      const safeOffsetX = Math.floor(35 + Math.random() * 45)
      const safeOffsetY = Math.floor(15 + Math.random() * 25)
      setGiveUpPos({ x: safeOffsetX, y: safeOffsetY })

      showOverlay(
        safeLang === 'fr'
          ? "Allez vas-y... je te laisse cette fois."
          : "Go ahead... I'll let you off the hook this time."
      )
    } else {
      localStorage.removeItem(STORAGE_KEYS.activeGame)
      trackEvent('game_abandoned', { mode, time: runTime, misses: realMisses })
      onHomeCallback()
    }
  }

  // Ligne de coupe supplémentaire dans les couloirs de bowling (comme des bumpers) :
  // pas de mensonge ici, on resserre toujours vers le vrai pixel.
  const triggerBumperEscalation = () => {
    setBumperLevel((prev) => prev + 1)
    if (lang !== 'morse') showOverlay(t.bumperMsg)
  }

  // Suit chaque clic pour déclencher l'apparition du bouton aide, la correction du
  // mensonge après 5 clics, la moquerie si le joueur ne suit pas l'indication, et
  // l'escalade des couloirs de bowling après 300 clics sans succès depuis une aide.
  const registerHelpClick = (clickHorizontal: HDir) => {
    if (!helpButtonVisible && totalClicksRef.current >= helpThreshold) {
      setHelpButtonVisible(true)
    }

    if (helpLiedRef.current) {
      helpClicksSinceHintRef.current++
      if (helpClicksSinceHintRef.current >= 5) {
        helpLiedRef.current = false
        helpAwaitingTeaseRef.current = true
        helpClicksSinceHintRef.current = 0
        setHelpSides((prev) => (prev.length > 0 ? [helpTrueHorizontalRef.current, ...prev.slice(1)] : prev))
        if (lang !== 'morse' && !isBusy.current) {
          showOverlay(t.helpCorrection(helpTrueHorizontalRef.current))
        }
      }
    } else if (helpAwaitingTeaseRef.current) {
      helpAwaitingTeaseRef.current = false
      if (clickHorizontal !== helpTrueHorizontalRef.current && lang !== 'morse' && !isBusy.current) {
        showOverlay(t.helpTease)
      }
    }

    if (bumperArmedRef.current) {
      clicksSinceHintForBumperRef.current++
      if (clicksSinceHintForBumperRef.current >= 300) {
        clicksSinceHintForBumperRef.current = 0
        bumperArmedRef.current = false
        triggerBumperEscalation()
      }
    }
  }

  // Zone de coupe de l'aide (lignes verticales/horizontales en alternance, resserrement
  // progressif vers un coin). Un côté par aide prise : le tout premier (horizontal)
  // peut refléter le mensonge en cours, corrigé en place une fois révélé.
  const helpSplit = useMemo(() => {
    if (helpSides.length === 0) return { lines: [] as BarrierLine[], zone: null as Rect | null }
    return computeAlternatingSplit(helpSides.length, viewportSize.w, viewportSize.h - bottomOffset, topOffset, (_axis, _zone, stepIndex) => helpSides[stepIndex - 1])
  }, [helpSides, topOffset, bottomOffset, viewportSize])

  // Zone des couloirs de bowling : même principe, mais toujours vers le vrai pixel (pas de mensonge).
  const bumperSplit = useMemo(() => {
    if (bumperLevel === 0) return { lines: [] as BarrierLine[], zone: null as Rect | null }
    return computeAlternatingSplit(bumperLevel, viewportSize.w, viewportSize.h - bottomOffset, topOffset, (axis, zone) =>
      axis === 'h'
        ? pixel.x < zone.x + zone.w / 2 ? 'left' : 'right'
        : pixel.y < zone.y + zone.h / 2 ? 'up' : 'down'
    )
  }, [bumperLevel, pixel, topOffset, bottomOffset, viewportSize])

  // Calcule la zone dans laquelle un clic "espace" peut tomber : intersection de la
  // zone d'aide (qui suit la direction indiquée, y compris si elle ment encore) et
  // de la zone des couloirs de bowling actifs le cas échéant.
  const getSpaceRandomRect = () => {
    let rect: Rect = { x: 0, y: topOffset, w: viewportSize.w, h: Math.max(1, viewportSize.h - topOffset - bottomOffset) }

    if (helpSplit.zone) rect = helpSplit.zone

    if (bumperSplit.zone) {
      const x1 = Math.max(rect.x, bumperSplit.zone.x)
      const y1 = Math.max(rect.y, bumperSplit.zone.y)
      const x2 = Math.min(rect.x + rect.w, bumperSplit.zone.x + bumperSplit.zone.w)
      const y2 = Math.min(rect.y + rect.h, bumperSplit.zone.y + bumperSplit.zone.h)
      rect = x2 > x1 && y2 > y1 ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : bumperSplit.zone
    }

    return rect
  }

  // Aide : donne une indication de direction, un seul axe à la fois (horizontal,
  // puis vertical, en alternance — et ça recommence si on reprend une aide après
  // avoir déjà affiné les deux axes, en resserrant encore davantage). La toute
  // première aide (toujours horizontale) ment sur gauche/droite, se corrige après
  // 5 clics, puis teste si le joueur y croit.
  const requestHelp = () => {
    if (victory || showAd || !helpButtonVisible) return
    setHelpButtonVisible(false)
    trackEvent('help_used', { mode })

    const newCount = helpCount + 1
    setHelpCount(newCount)

    const totalLifetime = (Number(localStorage.getItem(STORAGE_KEYS.helpsTotal)) || 0) + 1
    localStorage.setItem(STORAGE_KEYS.helpsTotal, String(totalLifetime))

    const helpDecrement = mode === 'patient' ? 50 : 20
    const nextInterval = Math.max(HELP_MIN_INTERVAL, HELP_START_THRESHOLD - wins * helpDecrement)
    setHelpThreshold(totalClicksRef.current + nextInterval)

    bumperArmedRef.current = true
    clicksSinceHintForBumperRef.current = 0

    const stepIndex = helpSides.length + 1
    const axis: 'h' | 'v' = stepIndex % 2 === 1 ? 'h' : 'v'
    const currentZone = helpSplit.zone ?? {
      x: 0,
      y: topOffset,
      w: viewportSize.w,
      h: Math.max(1, viewportSize.h - topOffset - bottomOffset),
    }

    let hintText = ''
    let newSide: 'left' | 'right' | 'up' | 'down'

    if (axis === 'h') {
      const trueSide: HDir = pixel.x < currentZone.x + currentZone.w / 2 ? 'left' : 'right'
      const isFirstHintOfRound = newCount === 1
      newSide = isFirstHintOfRound ? (trueSide === 'left' ? 'right' : 'left') : trueSide

      helpTrueHorizontalRef.current = trueSide
      helpLiedRef.current = isFirstHintOfRound
      helpClicksSinceHintRef.current = 0
      helpAwaitingTeaseRef.current = false
      hintText = t.helpDirectionHintHorizontal(newSide)
    } else {
      const trueSide: VDir = pixel.y < currentZone.y + currentZone.h / 2 ? 'up' : 'down'
      newSide = trueSide
      hintText = t.helpDirectionHintVertical(trueSide)
    }

    setHelpSides((prev) => [...prev, newSide])

    if (lang !== 'morse') {
      const flavor = (t.helpRoasts as readonly string[])[Math.min(newCount - 1, t.helpRoasts.length - 1)]
      showOverlay(`${hintText} ${flavor}`)
    }
  }

  // Stats "honteuses" calculées à la fin de la partie
  const computeFinalStats = () => {
    const cps = totalClicksRef.current / Math.max(runTime, 1)
    const usedOtherKeys = keyCount.current > 0
    const adjustedTime = runTime + helpCount * HELP_PENALTY_SECONDS
    return {
      misses: realMisses,
      totalClicks: totalClicksRef.current,
      cps,
      usedOtherKeys,
      spaceClicks: spaceClicksRef.current,
      helpCount,
      bumperLevel,
      adjustedTime,
    }
  }

  const gradeFromStats = (stats: ReturnType<typeof computeFinalStats>) => {
    let penalty = 0
    penalty += Math.min(stats.cps * 5, 30)
    penalty += stats.helpCount * 15
    penalty += stats.bumperLevel * 20
    penalty += stats.usedOtherKeys ? 10 : 0
    penalty += Math.min(stats.misses / 20, 25)

    const grades = ['D-', 'D', 'D--', 'F', 'F-', 'F--', 'F---']
    const idx = Math.max(0, Math.min(grades.length - 1, Math.floor(penalty / 15)))
    const grade = grades[idx]

    let comment: string
    if (stats.bumperLevel >= 1) comment = t.gradeCommentBumper(stats.bumperLevel)
    else if (stats.helpCount >= 1) comment = t.gradeCommentHelp(stats.helpCount)
    else if (stats.cps >= 3) comment = t.gradeCommentCps(stats.cps.toFixed(1))
    else if (stats.usedOtherKeys) comment = t.gradeCommentKeys
    else comment = t.gradeCommentDefault(stats.misses)

    return { grade, comment }
  }

  const buildChallengeLink = (stats: ReturnType<typeof computeFinalStats>, name: string) => {
    try {
      const payload = { t: runTime, m: stats.misses, n: name || '???', md: mode }
      const encoded = btoa(encodeURIComponent(JSON.stringify(payload)))
      const url = new URL(window.location.href)
      url.searchParams.set('battle', encoded)
      url.hash = ''
      return url.toString()
    } catch {
      return typeof window !== 'undefined' ? window.location.href : ''
    }
  }

  // Flow de partage : saisie du pseudo (mémorisé, redemandé seulement si l'utilisateur
  // veut le changer) -> petite confirmation avec coquille volontaire (humour de marque,
  // ne bloque jamais plus d'un tap) -> écran "ready" avec carte + partage natif en 1 clic.
  const [shareStep, setShareStep] = useState<'idle' | 'name' | 'confirmName' | 'ready'>('idle')
  const [nameDraft, setNameDraft] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.playerName) || ''
    } catch {
      return ''
    }
  })
  const [pseudoConfirmTypo, setPseudoConfirmTypo] = useState<string | null>(null)
  const [pseudoJoke, setPseudoJoke] = useState<string | null>(null)
  const [lastShareOutcome, setLastShareOutcome] = useState<ShareOutcome | null>(null)
  const pseudoRealNameRef = useRef('')

  // Démarre le flux de partage : si un pseudo est déjà connu (partie précédente),
  // on saute directement à l'écran "ready" — pas besoin de le redemander à chaque victoire.
  const startShareFlow = () => {
    let saved = ''
    try {
      saved = localStorage.getItem(STORAGE_KEYS.playerName) || ''
    } catch {
      // ignore
    }
    if (saved) {
      pseudoRealNameRef.current = saved
      setShareStep('ready')
      return
    }
    setNameDraft('')
    setShareStep('name')
  }

  // Permet de revenir sur le pseudo mémorisé sans repasser par tout le flow.
  const changeName = () => {
    setNameDraft(pseudoRealNameRef.current)
    setShareStep('name')
  }

  const submitPseudoName = (raw: string) => {
    const clean = raw.trim().slice(0, 24) || (safeLang === 'fr' ? 'Anonyme' : 'Anonymous')
    pseudoRealNameRef.current = clean
    try {
      localStorage.setItem(STORAGE_KEYS.playerName, clean)
    } catch {
      // stockage indisponible : le pseudo sera juste redemandé la prochaine fois
    }
    setPseudoConfirmTypo(makeTypo(clean))
    setShareStep('confirmName')
  }

  const resolvePseudoChoice = (joke: string) => {
    setPseudoJoke(joke)
    window.setTimeout(() => {
      setPseudoJoke(null)
      setPseudoConfirmTypo(null)
      setShareStep('ready')
    }, 1100)
  }

  // Peu importe le bouton choisi, le vrai pseudo (sans coquille) est utilisé au final —
  // seule la blague affichée change.
  const acceptPseudoTypo = () => resolvePseudoChoice(t.pseudoAcceptJoke)
  const forcePseudoSpelling = () => resolvePseudoChoice(t.pseudoForceJoke)

  const closeShareFlow = () => setShareStep('idle')

  const finalStats = computeFinalStats()

  // Profil "stats absurdes" (Patience/Obsession/Luck/Dignity) + titre, calculé une
  // fois la partie gagnée à partir du comportement réel du joueur.
  const profile: PlayerProfile | null = useMemo(() => {
    if (!victory) return null
    return computePlayerProfile(
      {
        runTime,
        totalClicks: finalStats.totalClicks,
        realMisses,
        cps: finalStats.cps,
        helpCount: finalStats.helpCount,
        bumperLevel: finalStats.bumperLevel,
        usedOtherKeys: finalStats.usedOtherKeys,
        spaceClicks: finalStats.spaceClicks,
        exploredPercent,
        wins,
        trackerSummary: tracker.current.getSummary(),
      },
      safeLang
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [victory])

  const currentName = () => pseudoRealNameRef.current || (safeLang === 'fr' ? 'Anonyme' : 'Anonymous')

  // Partage le résultat en un clic : image (si le navigateur le supporte) + texte
  // + lien de défi, via l'API native, avec repli automatique sur le presse-papiers.
  const shareTheResult = async (canvas?: HTMLCanvasElement | null) => {
    if (!profile) return
    const name = currentName()
    const link = buildChallengeLink(finalStats, name)
    const titleLabel = `${profile.emoji} ${(t.profileTitleNames as Record<string, string>)[profile.titleKey]}`
    const text = t.shareResultText(name, finalStats.totalClicks, runTime, titleLabel, profile.quip, link)
    const outcome = await shareResultNative({
      title: 'PIXELTROLL',
      text,
      url: link,
      canvas,
    })
    setLastShareOutcome(outcome)
    if (outcome !== 'failed') trackEvent('result_shared', { mode, method: outcome })
  }

  // "BEAT MY SCORE" : même lien de défi, texte orienté challenge plutôt que résultat.
  const shareBeatMyScore = async () => {
    const name = currentName()
    const link = buildChallengeLink(finalStats, name)
    const text = t.beatMyScoreText(name, finalStats.totalClicks, runTime, link)
    trackEvent('challenge_created', { mode })
    const outcome = await shareResultNative({ title: 'PIXELTROLL', text, url: link })
    setLastShareOutcome(outcome)
  }
  const { grade, comment: gradeComment } = gradeFromStats(finalStats)

  return {
    t,
    lang,
    wins,
    runTime,
    runMisses: displayMisses,
    uniqueExploredCount: realMisses,
    exploredPercent,
    totalScreenPixels,
    dots,
    pixel,
    activeMsg,
    showAd,
    adLeft,
    adBreakNumber: adCount.current,
    showWarn,
    adWarnText,
    victory,
    winCustomMsg,
    adThreshold,
    giveUpPos,
    giveUpAttempted,
    handleGiveUpClick,
    onMiss,
    onWin,
    resetRound,
    // Partage : pseudo mémorisé -> carte de résultat -> partage natif en 1 clic
    shareStep,
    nameDraft,
    setNameDraft,
    pseudoConfirmTypo,
    pseudoJoke,
    startShareFlow,
    changeName,
    submitPseudoName,
    onAcceptPseudoTypo: acceptPseudoTypo,
    onForcePseudoSpelling: forcePseudoSpelling,
    closeShareFlow,
    profile,
    playerName: currentName(),
    shareTheResult,
    shareBeatMyScore,
    lastShareOutcome,
    clearShareOutcome: () => setLastShareOutcome(null),
    // Aide
    helpCount,
    helpButtonVisible,
    requestHelp,
    // Couloirs de bowling
    bumperLevel,
    bumperLines: bumperSplit.lines,
    helpLines: helpSplit.lines,
    // Stats honteuses + note
    cps: finalStats.cps,
    usedOtherKeys: finalStats.usedOtherKeys,
    mouseClicks: finalStats.totalClicks - finalStats.spaceClicks,
    spaceClicks: finalStats.spaceClicks,
    grade,
    gradeComment,
    // Défi reçu par lien
    incomingChallenge,
    challengeResult,
    challengeAccepted,
    acceptChallenge,
    onCompleteMsg: () => {
      isBusy.current = false
      setActiveMsg(null)
    },
  }
}
