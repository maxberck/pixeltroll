import { initialLang, type BaseLang } from './i18n'

type Position = { x: number; y: number }
export type GameMode = 'patient' | 'impatient' | 'daily'

export type TriggerType =
  | 'AFK_RETURN'
  | 'FORCE_EX_SPAM'
  | 'FORCE_SPAM_MID'
  | 'FORCE_SPAM_HEAVY'
  | 'FORCE_SPAM_LEGEND'
  | 'FORCE_SPAM_ULTRA'
  | 'FORCE_SPAM_GODLIKE'
  | 'DELIBERATE_REPEAT'
  | 'CORNER_INJUNCTION'
  | 'BORDER_CONSECUTIVE'
  | 'HIGH_CPS'
  | 'NEAR_MISS'
  | 'NEAR_MISS_FAIL_1000'
  | 'PATTERN_SNAKE_LINES'
  | 'PATTERN_VERTICAL_LINES'
  | 'PATTERN_DIAGONAL'
  | 'PATTERN_SPIRAL'
  | 'QUADRANT_OBSESSION'
  | 'CENTER_GRAVITATION'
  | 'GRID_COVERAGE'

type ClickRecord = { x: number; y: number; time: number }

const ROAST_POOLS = {
  AFK_RETURN: {
    fr: [
      "Et bah... rapide pour une pause. Allez, remets-toi au travail.",
      "T'étais parti pleurer ou chercher un tuto sur YouTube ?",
      "De retour ? Le pixel a profité de ton absence pour ne pas bouger d'un millimètre.",
      "Une pause aussi longue pour revenir rater au même endroit... Chapeau.",
      "On t'a manqué ? Rassure-toi, le vide blanc était toujours là à t'attendre.",
    ],
    en: [
      "Well... quick break. Come on, back to work.",
      "Were you crying in the bathroom or looking for a YouTube tutorial?",
      "Back already? The pixel took advantage of your break to stay completely still.",
      "Taking a 2-minute break just to resume missing right here... Majestic.",
      "Did you miss us? Don't worry, the white void was patiently waiting for you.",
    ],
  },
  FORCE_EX_SPAM: {
    fr: [
      "Et bah... même pour ton ex t'as pas autant forcé.",
      "200 clics sur 1 cm²... Tu penses qu'il va pousser comme une plante ?",
      "Tu cliques avec un marteau-piqueur ou c'est juste de l'obstination pure ?",
      "Spoiler : insister sur le même millimètre ne va pas changer le code source.",
      "C'est un pixel caché, pas un bouton d'ascenseur en panne. Calme-toi.",
    ],
    en: [
      "Damn... not even for your ex did you try this hard.",
      "200 clicks on 1 cm²... You expecting it to sprout like a flower?",
      "Are you using a jackhammer or is this just pure stubbornness?",
      "Spoiler: hammering the exact same millimeter won't rewrite the DOM.",
      "It's a hidden pixel, not a broken elevator button. Relax.",
    ],
  },
  FORCE_SPAM_MID: {
    fr: [
      "500 clics pile ici. Tu creuses pour trouver du pétrole ou quoi ?",
      "500 impacts au même endroit... Ton écran OLED commence à perdre des sous-pixels.",
      "Ce n'est plus de la recherche, c'est du harcèlement spatial caractérisé.",
      "Tu penses créer un trou noir à force de concentrer toute ton énergie ici ?",
      "500 clics. La définition clinique de la folie selon Einstein, en direct.",
    ],
    en: [
      "500 clicks right here. Digging for oil or what?",
      "500 impacts in the same spot... Your screen is physically denting.",
      "This isn't searching anymore, this is certified spatial harassment.",
      "Trying to open a micro black hole by focusing all your rage on one point?",
      "500 clicks. Einstein's definition of insanity playing out in real time.",
    ],
  },
  FORCE_SPAM_HEAVY: {
    fr: [
      "1 000 clics au même point. Psychiatre ou ophtalmo, choisis vite.",
      "1 000 clics sans bouger d'un millimètre. Ton index a fusionné avec la souris ?",
      "Même une intelligence artificielle sous sédatif aurait changé de zone.",
      "Tu tentes une perforation thermique de ta dalle tactile ?",
      "1 000 impacts. Le pixel n'est pas là, mais ton honneur est définitivement parti.",
    ],
    en: [
      "1,000 clicks right here. Eye doctor or therapist, pick one fast.",
      "1,000 clicks without moving a millimeter. Did your finger fuse to the mouse?",
      "Even a heavily sedated neural network would have explored another area.",
      "Are you trying to physically burn through your monitor's glass?",
      "1,000 impacts. The pixel is absent, but your dignity is officially gone.",
    ],
  },
  FORCE_SPAM_LEGEND: {
    fr: [
      "2 500 clics sur le même point. On prévient le Livre Guinness ou les urgences ?",
      "Ce point précis est désormais classé monument historique de l'échec.",
      "Tu viens de passer 5 minutes à tabasser 4 pixels inertes. Respect.",
      "2 500 clics... Ton switch gauche ne survivra pas à cette partie.",
      "Le pixel te regarde depuis l'autre bout de l'écran avec une profonde pitié.",
    ],
    en: [
      "2,500 clicks in one spot. Calling Guinness World Records or paramedics?",
      "This exact coordinate has officially been designated a historic monument of failure.",
      "You just spent 5 solid minutes battering 4 lifeless pixels. Majestic.",
      "2,500 clicks... That left switch won't survive this session.",
      "The pixel is watching you from the other side of the display in pure pity.",
    ],
  },
  FORCE_SPAM_ULTRA: {
    fr: [
      "4 000 clics au même endroit. Il y a de l'obstination, et il y a ça.",
      "Ton doigt a dépassé le stade de la fatigue, il est en grève générale.",
      "4 000 impacts. Un archéologue du futur va dater cette zone au carbone 14.",
      "À ce niveau, ce n'est plus un jeu, c'est une performance artistique.",
      "Le pixel a écrit ses mémoires pendant que tu cliquais toujours au même endroit.",
    ],
    en: [
      "4,000 clicks on the exact same spot. There's stubbornness, and then there's this.",
      "Your finger left 'tired' behind a while ago and is now on strike.",
      "4,000 impacts. Future archaeologists will carbon-date this exact spot.",
      "At this point it's not a game anymore, it's performance art.",
      "The pixel wrote its memoirs while you kept clicking the exact same place.",
    ],
  },
  FORCE_SPAM_GODLIKE: {
    fr: [
      "7 000 clics. Officiellement, tu ne joues plus, tu vis ici maintenant.",
      "7 000 tentatives identiques. Même les statistiques ont abandonné de te suivre.",
      "Ton écran a probablement une case mémoire dédiée rien qu'à ce pixel-là.",
      "On a dépassé le stade du troll, on est en pleine étude de cas clinique.",
      "7 000 clics au même endroit. Le pixel a fini par te trouver touchant, dans le mauvais sens du terme.",
    ],
    en: [
      "7,000 clicks. Officially, you don't play here anymore, you live here.",
      "7,000 identical attempts. Even the statistics gave up tracking you.",
      "Your screen probably has a dedicated memory cell just for this one pixel.",
      "We're past trolling now, this is a full clinical case study.",
      "7,000 clicks on the same spot. The pixel finds you touching, in the worst way.",
    ],
  },
  DELIBERATE_REPEAT: {
    fr: [
      "Tu le fais exprès, avoue.",
      "À ce stade tu le fais clairement exprès, avoue-le.",
      "Personne n'est aussi malchanceux naturellement. Tu le fais exprès.",
      "Avoue, tu cliques ici juste pour voir jusqu'où je vais aller.",
      "Tu le refais encore... c'est un choix de vie, pas un accident.",
    ],
    en: [
      "You're doing this on purpose, admit it.",
      "At this point you're clearly doing it on purpose, just admit it.",
      "Nobody is naturally this unlucky. You're doing this on purpose.",
      "Admit it, you're clicking here just to see how far I'll go.",
      "You're doing it again... that's a lifestyle choice, not an accident.",
    ],
  },
  CORNER_INJUNCTION: {
    fr: [
      "Sors de ce coin immédiatement. C'est une injonction, pas une suggestion.",
      "Tu te caches dans l'angle comme si la maîtresse t'avait puni.",
      "Les coins sont vides. Reviens dans l'espace aérien normal.",
      "Pourquoi cette obsession pour les angles ? T'as peur du vide au milieu ?",
      "200 clics tassés dans l'angle. Tu collectionnes la poussière virtuelle ?",
    ],
    en: [
      "Get out of that corner immediately. That is an order, not a suggestion.",
      "Hiding in the corner like you got put in timeout at kindergarten.",
      "Corners are completely empty. Return to active screen airspace.",
      "Why this corner obsession? Terrified of the vast open center?",
      "200 clicks crammed into an angle. Collecting digital dust bunnies?",
    ],
  },
  BORDER_CONSECUTIVE: {
    fr: [
      "Plus de 200 clics à raser les plinthes... C'est pas une thérapie de groupe, reviens au milieu.",
      "Tu longes les murs comme si l'écran était miné au centre.",
      "Le pixel n'est pas caché derrière le cadre en plastique de ton écran, arrête.",
      "Raser les bordures à l'infini : stratégie zéro, fatigue maximale.",
      "Tu fais le tour du propriétaire ou tu cherches vraiment à gagner ?",
    ],
    en: [
      "Over 200 wall-scrapes in a row... Not group therapy, come back to the center.",
      "Hugging the borders like the entire middle section is a minefield.",
      "The pixel is not hiding inside your physical monitor bezel, stop.",
      "Endlessly sweeping the screen edges: zero strategy, maximum wrist strain.",
      "Are you doing a perimeter security check or actually trying to find it?",
    ],
  },
  NEAR_MISS: {
    fr: [
      "Tu viens de le frôler à quelques pixels. Tes yeux te trahissent.",
      "C'était brûlant. Tu as respiré sur le pixel sans le voir.",
      "À 15 pixels près, tu devenais un héros. Tu es resté un inconnu.",
      "Tu es passé tellement près qu'il a senti le vent de ton curseur.",
    ],
    en: [
      "You just skimmed it by a couple pixels. Your eyes deceive you.",
      "That was blistering hot. You literally breathed on the pixel and missed.",
      "15 pixels away from glory. Yet you remain totally empty-handed.",
      "You flew so close the pixel felt the wind of your cursor.",
    ],
  },
  NEAR_MISS_FAIL_1000: {
    fr: [
      "1 000 clics après l'indice et toujours rien... Le malaise est total.",
      "On t'a dit que t'étais tout près il y a 1 000 clics, et t'es parti à l'opposé.",
      "Avoir l'information et réussir à rater 1 000 fois de suite : le talent brut.",
    ],
    en: [
      "1,000 clicks past the hint and still nothing... Pure cringe.",
      "We told you you were right next to it 1,000 clicks ago, and you ran the other way.",
      "Having prime intel and still finding a way to miss 1,000 times: raw talent.",
    ],
  },
  PATTERN_SNAKE_LINES: {
    fr: [
      "Balayage en lignes horizontales détecté... Tu te prends pour une imprimante matricielle ?",
      "Ligne par ligne, pixel par pixel... Tu fais ta déclaration d'impôts ?",
      "Beau balayage d'aspirateur robot. La poussière s'en va, le pixel reste.",
    ],
    en: [
      "Horizontal line scanning detected... You think you're a dot-matrix printer?",
      "Row by row, line by line... Are you filling out a digital spreadsheet?",
      "Impressive Roomba impression. Clean floors, still zero pixels.",
    ],
  },
  PATTERN_VERTICAL_LINES: {
    fr: [
      "Balayage vertical systématique... On dirait une pluie d'échecs en colonnes.",
      "Tu scannes en colonnes comme pour lire un code-barres géant.",
    ],
    en: [
      "Systematic vertical sweeps... Looks like a rainstorm of failure in columns.",
      "Scanning top-to-bottom like you're reading a giant barcode.",
    ],
  },
  PATTERN_DIAGONAL: {
    fr: [
      "Une belle diagonale à 45°. Jolie figure de style, mais toujours aucun pixel.",
      "Tracer des diagonales parfaites ne débloque aucun bonus géométrique.",
    ],
    en: [
      "A clean 45-degree diagonal. Nice artistic expression, still zero pixels.",
      "Drawing neat diagonal vectors unlocks zero hidden bonuses.",
    ],
  },
  PATTERN_SPIRAL: {
    fr: [
      "Technique de l'entonnoir vers le centre. C'est mignon d'avoir une stratégie.",
      "Spirale descendante vers le néant... Métaphore de ta session de jeu.",
    ],
    en: [
      "Inward spiral technique detected. Cute that you brought a strategy.",
      "A downward spiral into nothingness... Pure poetry for this session.",
    ],
  },
  QUADRANT_OBSESSION: {
    fr: [
      "Tu sais qu'il y a 3 autres quarts d'écran à explorer, ou ton écran est coupé en deux ?",
      "Tu as élu domicile dans ce quart d'écran ? Le loyer est gratuit au moins ?",
      "80% de tes clics dans la même moitié... Le reste de l'écran se sent abandonné.",
    ],
    en: [
      "You aware there are 3 other quadrants available, or is your screen cut in half?",
      "Setting up permanent residency in this corner? Is the rent free at least?",
      "80% of your activity locked in the same half... The other side feels neglected.",
    ],
  },
  CENTER_GRAVITATION: {
    fr: [
      "Le centre de l'écran n'est pas le nombril du monde. Écarte-toi.",
      "Tout droit au milieu... L'absence totale de créativité dans le clic.",
    ],
    en: [
      "The exact screen center is not the center of the universe. Spread out.",
      "Right down the middle... Peak lack of creative spatial imagination.",
    ],
  },
  GRID_10: {
    fr: [
      "10% de l'écran balayé. Tu viens à peine d'effleurer la surface du désert.",
      "10% de la surface couverte. L'illusion du progrès commence ici.",
    ],
    en: [
      "10% of the display swept. Barely scratching the surface of the desert.",
      "10% coverage. The illusion of momentum begins right here.",
    ],
  },
  GRID_25: {
    fr: [
      "25% de la surface couverte. Un quart de l'écran repeint pour zéro résultat.",
      "Un quart complet de l'écran passé au crible. La persévérance sans la réussite.",
    ],
    en: [
      "25% surface coverage. A quarter of the canvas checked for zero return.",
      "One full quarter scanned. Top-tier discipline, bottom-tier payoff.",
    ],
  },
  GRID_50: {
    fr: [
      "50% de l'écran quadrillé. Pile une chance sur deux de rater, et tu excelles dedans.",
      "La moitié de l'écran est recouverte de rouge. Statistiquement admirable d'échouer encore.",
    ],
    en: [
      "50% of the screen mapped. Exactly 50/50 odds of missing, and you're excelling at it.",
      "Half the canvas is red dots. Statistically impressive to remain completely empty-handed.",
    ],
  },
  GRID_75: {
    fr: [
      "75% de l'écran scanné. Ton moniteur ressemble à un cas sévère de varicelle.",
      "Trois quarts balayés. Tu contournes méthodiquement le seul pixel gagnant.",
    ],
    en: [
      "75% of the display covered. Your monitor looks like full-blown chickenpox.",
      "Three quarters cleared. You are methodically dancing around the winning coordinate.",
    ],
  },
  GRID_90: {
    fr: [
      "90% de la surface sous tes points rouges. Trouver le vide est devenu ton métier.",
      "90% de l'écran éliminé. À ce niveau de précision dans l'erreur, c'est presque du génie.",
    ],
    en: [
      "90% of the canvas marked. Finding absolute void has become your full-time job.",
      "90% eliminated. Failing with this much mathematical precision is basically genius.",
    ],
  },
  GRID_98: {
    fr: [
      "98% de l'écran est rouge. Tu as méthodiquement esquivé le seul pixel gagnant de tout l'univers.",
      "Presque 100% de la dalle scannée. Le pixel est en train de se moquer ouvertement de toi.",
    ],
    en: [
      "98% of the screen is covered. You methodically dodged the single winning pixel in the universe.",
      "Near 100% canvas saturated. The pixel is openly laughing at you from the 2% gap.",
    ],
  },
  HIGH_CPS: {
    fr: [
      "Calme tes spasmes sur ta souris, tu te fais du mal.",
      "Cadence métronomique détectée... Range ton macro Python.",
      "30 clics par seconde pour ne rien toucher. L'art du gaspillage d'énergie.",
    ],
    en: [
      "Calm your spasms on that mouse, you're hurting yourself.",
      "Metronomic cadence detected... Put the Python macro away.",
      "30 clicks per second just to hit thin air. Peak energy waste.",
    ],
  },
} as const

function pickRoast(pool: readonly string[]): string {
  const idx = Math.floor(Math.random() * pool.length)
  return pool[idx]
}

export class TrollTracker {
  private history: ClickRecord[] = []
  private visitedCells = new Set<string>()
  private lastTriggerTime = 0

  private totalClicksTracked = 0
  private lastClickTimestamp = Date.now()
  private consecutiveBorderClicks = 0

  private hasTriggeredNearMiss = false
  private clicksSinceNearMiss = 0
  private hasMockedAfter1000 = false

  private reachedGridPaliers = new Set<number>()
  private consecutiveSpaceHits = 0
  private detectedPatterns = new Set<string>()
  // Empêche un même commentaire de ressortir deux fois dans la partie
  private shownTriggers = new Set<TriggerType>()
  // Nombre de paliers de répétition "exprès" déjà signalés au-delà du dernier vrai palier
  private deliberateRepeatSteps = 0
  // Compteurs O(1) pour les séries au même endroit / dans un coin (pas de filtre sur tout l'historique)
  private sameSpotAnchor: Position | null = null
  private sameSpotStreakCount = 0
  private cornerStreakCount = 0

  // Pics jamais redescendus, utilisés uniquement pour le profil "stats absurdes"
  // affiché à la victoire (Patience/Obsession/Luck/Dignity) — n'affecte jamais le gameplay.
  private maxSameSpotStreak = 0
  private maxCornerStreak = 0
  private maxConsecutiveSpaceHits = 0

  public registerSpaceHit(lang: BaseLang = initialLang): string | null {
    this.consecutiveSpaceHits++
    this.maxConsecutiveSpaceHits = Math.max(this.maxConsecutiveSpaceHits, this.consecutiveSpaceHits)
    if (this.consecutiveSpaceHits >= 250 && this.consecutiveSpaceHits % 250 === 0) {
      const pool =
        lang === 'fr'
          ? [
              "Tu penses vraiment battre l'algo en appuyant sur la barre la plus grosse ?",
              "La barre espace n'a pas plus de chance que ta souris, tu sais.",
              "Ton pouce doit commencer à fatiguer, non ?",
              "Toujours en train d'essayer la triche du pauvre, à ce que je vois.",
              "Le clavier ne va pas trouver le pixel à ta place, désolé.",
              "Appuyer plus fort ne change rien aux probabilités, promis.",
              "Ta barre espace pourrait bien te laisser tomber avant le pixel.",
            ]
          : [
              "You really think you'll beat the RNG hammering the widest key on the board?",
              "The space bar isn't any luckier than your mouse, you know.",
              "Your thumb must be getting tired by now, right?",
              "Still trying the poor man's cheat, I see.",
              "The keyboard won't find the pixel for you, sorry.",
              "Pressing harder doesn't change the odds, promise.",
              "Your space bar might give out before the pixel does.",
            ]
      return pool[Math.floor(Math.random() * pool.length)]
    }
    return null
  }

  public checkContext(
    click: Position,
    pixelTarget: Position,
    screenW: number,
    screenH: number,
    topOffset: number = 0,
    _isNewPixel: boolean = true,
    exploredPercent: number = 0,
    _mode: GameMode = 'patient',
    lang: BaseLang = initialLang
  ): { type: TriggerType; text: string } | null {

    const now = Date.now()
    const relY = click.y - topOffset
    const effectiveH = screenH - topOffset
    const elapsedSinceLastClick = now - this.lastClickTimestamp
    this.lastClickTimestamp = now
    this.totalClicksTracked++

    this.history.push({ x: click.x, y: click.y, time: now })
    // Seules les patterns récentes (80 derniers clics) et le CPS (1 dernière seconde)
    // ont encore besoin d'un historique : pas la peine de le garder long.
    if (this.history.length > 300) this.history.shift()

    const tileSize = 32
    const cellX = Math.floor(click.x / tileSize)
    const cellY = Math.floor(relY / tileSize)
    this.visitedCells.add(`${cellX}:${cellY}`)

    // 1. RETOUR D'AFK (≥ 90s d'inactivité)
    if (elapsedSinceLastClick > 90000 && this.totalClicksTracked >= 100 && !this.shownTriggers.has('AFK_RETURN')) {
      this.shownTriggers.add('AFK_RETURN')
      this.lastTriggerTime = now
      return {
        type: 'AFK_RETURN',
        text: pickRoast(ROAST_POOLS.AFK_RETURN[lang]),
      }
    }

    // 2. NEAR MISS (< 20px)
    const dist = Math.hypot(click.x - pixelTarget.x, click.y - pixelTarget.y)
    if (this.hasTriggeredNearMiss && !this.hasMockedAfter1000) {
      this.clicksSinceNearMiss++
      if (this.clicksSinceNearMiss >= 1000) {
        this.hasMockedAfter1000 = true
        this.lastTriggerTime = now
        return {
          type: 'NEAR_MISS_FAIL_1000',
          text: pickRoast(ROAST_POOLS.NEAR_MISS_FAIL_1000[lang]),
        }
      }
    }

    if (dist > 1 && dist < 20 && !this.hasTriggeredNearMiss) {
      this.hasTriggeredNearMiss = true
      this.clicksSinceNearMiss = 0
      this.lastTriggerTime = now
      return {
        type: 'NEAR_MISS',
        text: pickRoast(ROAST_POOLS.NEAR_MISS[lang]),
      }
    }

    // Cooldown global strict de 45s & pas de trolls situationnels avant 200 clics
    if (this.totalClicksTracked < 200 || now - this.lastTriggerTime < 45000) {
      return null
    }

    // 3. ROASTS AU MÊME ENDROIT (compteur O(1), pas un filtre sur tout l'historique)
    if (this.sameSpotAnchor && Math.hypot(click.x - this.sameSpotAnchor.x, click.y - this.sameSpotAnchor.y) <= 25) {
      this.sameSpotStreakCount++
    } else {
      this.sameSpotAnchor = { x: click.x, y: click.y }
      this.sameSpotStreakCount = 1
    }
    const sameSpotClicks = this.sameSpotStreakCount
    this.maxSameSpotStreak = Math.max(this.maxSameSpotStreak, sameSpotClicks)

    if (sameSpotClicks >= 2500 && !this.shownTriggers.has('FORCE_SPAM_LEGEND')) {
      this.shownTriggers.add('FORCE_SPAM_LEGEND')
      this.lastTriggerTime = now
      return {
        type: 'FORCE_SPAM_LEGEND',
        text: pickRoast(ROAST_POOLS.FORCE_SPAM_LEGEND[lang]),
      }
    }

    if (sameSpotClicks >= 4000 && !this.shownTriggers.has('FORCE_SPAM_ULTRA')) {
      this.shownTriggers.add('FORCE_SPAM_ULTRA')
      this.lastTriggerTime = now
      return {
        type: 'FORCE_SPAM_ULTRA',
        text: pickRoast(ROAST_POOLS.FORCE_SPAM_ULTRA[lang]),
      }
    }

    if (sameSpotClicks >= 7000 && !this.shownTriggers.has('FORCE_SPAM_GODLIKE')) {
      this.shownTriggers.add('FORCE_SPAM_GODLIKE')
      this.lastTriggerTime = now
      return {
        type: 'FORCE_SPAM_GODLIKE',
        text: pickRoast(ROAST_POOLS.FORCE_SPAM_GODLIKE[lang]),
      }
    }

    // Au-delà de tous les paliers, si la personne insiste ENCORE au même endroit,
    // ce commentaire peut revenir (contrairement aux autres, jamais définitivement acquis) :
    // c'est le seul cas où la répétition du même reproche est voulue.
    if (sameSpotClicks >= 9000) {
      const extraSteps = Math.floor((sameSpotClicks - 9000) / 2000)
      if (extraSteps > this.deliberateRepeatSteps) {
        this.deliberateRepeatSteps = extraSteps
        this.lastTriggerTime = now
        return {
          type: 'DELIBERATE_REPEAT',
          text: pickRoast(ROAST_POOLS.DELIBERATE_REPEAT[lang]),
        }
      }
    }

    if (sameSpotClicks >= 1000 && !this.shownTriggers.has('FORCE_SPAM_HEAVY')) {
      this.shownTriggers.add('FORCE_SPAM_HEAVY')
      this.lastTriggerTime = now
      return {
        type: 'FORCE_SPAM_HEAVY',
        text: pickRoast(ROAST_POOLS.FORCE_SPAM_HEAVY[lang]),
      }
    }

    if (sameSpotClicks >= 500 && !this.shownTriggers.has('FORCE_SPAM_MID')) {
      this.shownTriggers.add('FORCE_SPAM_MID')
      this.lastTriggerTime = now
      return {
        type: 'FORCE_SPAM_MID',
        text: pickRoast(ROAST_POOLS.FORCE_SPAM_MID[lang]),
      }
    }

    if (sameSpotClicks >= 200 && !this.shownTriggers.has('FORCE_EX_SPAM')) {
      this.shownTriggers.add('FORCE_EX_SPAM')
      this.lastTriggerTime = now
      return {
        type: 'FORCE_EX_SPAM',
        text: pickRoast(ROAST_POOLS.FORCE_EX_SPAM[lang]),
      }
    }

    // 4. INJONCTION DES COINS (compteur O(1) au lieu d'un filtre sur tout l'historique)
    const isCorner =
      (click.x < 100 || click.x > screenW - 100) &&
      (relY < 100 || relY > effectiveH - 100)

    if (isCorner) {
      this.cornerStreakCount++
      this.maxCornerStreak = Math.max(this.maxCornerStreak, this.cornerStreakCount)
      if (this.cornerStreakCount >= 200 && !this.shownTriggers.has('CORNER_INJUNCTION')) {
        this.shownTriggers.add('CORNER_INJUNCTION')
        this.lastTriggerTime = now
        return {
          type: 'CORNER_INJUNCTION',
          text: pickRoast(ROAST_POOLS.CORNER_INJUNCTION[lang]),
        }
      }
    } else {
      this.cornerStreakCount = 0
    }

    // 5. THÉRAPIE DES MURS
    const isBorder = click.x < 35 || click.x > screenW - 35 || relY < 35 || relY > effectiveH - 35
    if (isBorder) {
      this.consecutiveBorderClicks++
      if (this.consecutiveBorderClicks >= 250 && !this.shownTriggers.has('BORDER_CONSECUTIVE')) {
      this.shownTriggers.add('BORDER_CONSECUTIVE')
        this.lastTriggerTime = now
        return {
          type: 'BORDER_CONSECUTIVE',
          text: pickRoast(ROAST_POOLS.BORDER_CONSECUTIVE[lang]),
        }
      }
    } else {
      this.consecutiveBorderClicks = 0
    }

    // 6. COUVERTURE DE SURFACE (En % réel)
    const effectivePercent = exploredPercent > 0 ? exploredPercent : (this.visitedCells.size / (Math.ceil(screenW / tileSize) * Math.ceil(effectiveH / tileSize))) * 100

    const gridPaliers = [98, 90, 75, 50, 25, 10]
    for (const palier of gridPaliers) {
      if (effectivePercent >= palier && !this.reachedGridPaliers.has(palier)) {
        this.reachedGridPaliers.add(palier)
        this.lastTriggerTime = now
        const poolKey = `GRID_${palier}` as keyof typeof ROAST_POOLS
        return {
          type: 'GRID_COVERAGE',
          text: pickRoast((ROAST_POOLS[poolKey] as any)[lang]),
        }
      }
    }

    // 7. TECHNIQUES & PATTERNS
    if (this.history.length >= 80) {
      const recent80 = this.history.slice(-80)

      const halfW = screenW / 2
      const halfH = effectiveH / 2
      const qCounts = [0, 0, 0, 0]

      recent80.forEach((c) => {
        const cRelY = c.y - topOffset
        if (c.x < halfW && cRelY < halfH) qCounts[0]++
        else if (c.x >= halfW && cRelY < halfH) qCounts[1]++
        else if (c.x < halfW && cRelY >= halfH) qCounts[2]++
        else qCounts[3]++
      })

      if (Math.max(...qCounts) >= 68 && !this.detectedPatterns.has('QUADRANT')) {
        this.detectedPatterns.add('QUADRANT')
        this.lastTriggerTime = now
        return {
          type: 'QUADRANT_OBSESSION',
          text: pickRoast(ROAST_POOLS.QUADRANT_OBSESSION[lang]),
        }
      }

      const centerX = screenW / 2
      const centerY = effectiveH / 2
      const centerClicks = recent80.filter(
        (c) => Math.hypot(c.x - centerX, c.y - topOffset - centerY) < 100
      ).length

      if (centerClicks >= 50 && !this.detectedPatterns.has('CENTER')) {
        this.detectedPatterns.add('CENTER')
        this.lastTriggerTime = now
        return {
          type: 'CENTER_GRAVITATION',
          text: pickRoast(ROAST_POOLS.CENTER_GRAVITATION[lang]),
        }
      }

      const dyAvg = recent80.reduce((acc, c, i, arr) => (i === 0 ? 0 : acc + Math.abs(c.y - arr[i - 1].y)), 0) / 80
      const dxSpread = Math.max(...recent80.map((c) => c.x)) - Math.min(...recent80.map((c) => c.x))

      if (dyAvg < 6 && dxSpread > screenW * 0.5 && !this.detectedPatterns.has('SNAKE')) {
        this.detectedPatterns.add('SNAKE')
        this.lastTriggerTime = now
        return {
          type: 'PATTERN_SNAKE_LINES',
          text: pickRoast(ROAST_POOLS.PATTERN_SNAKE_LINES[lang]),
        }
      }

      const dxAvg = recent80.reduce((acc, c, i, arr) => (i === 0 ? 0 : acc + Math.abs(c.x - arr[i - 1].x)), 0) / 80
      const dySpread = Math.max(...recent80.map((c) => c.y)) - Math.min(...recent80.map((c) => c.y))

      if (dxAvg < 6 && dySpread > effectiveH * 0.5 && !this.detectedPatterns.has('VERTICAL')) {
        this.detectedPatterns.add('VERTICAL')
        this.lastTriggerTime = now
        return {
          type: 'PATTERN_VERTICAL_LINES',
          text: pickRoast(ROAST_POOLS.PATTERN_VERTICAL_LINES[lang]),
        }
      }

      let isDiagonal = true
      for (let i = 1; i < 30; i++) {
        const dx = Math.abs(recent80[i].x - recent80[i - 1].x)
        const dy = Math.abs(recent80[i].y - recent80[i - 1].y)
        if (Math.abs(dx - dy) > 12 || dx === 0) {
          isDiagonal = false
          break
        }
      }

      if (isDiagonal && !this.detectedPatterns.has('DIAGONAL')) {
        this.detectedPatterns.add('DIAGONAL')
        this.lastTriggerTime = now
        return {
          type: 'PATTERN_DIAGONAL',
          text: pickRoast(ROAST_POOLS.PATTERN_DIAGONAL[lang]),
        }
      }

      const centerDists = recent80.map((c) => Math.hypot(c.x - centerX, c.y - topOffset - centerY))
      if (centerDists[0] - centerDists[centerDists.length - 1] > 250 && !this.detectedPatterns.has('SPIRAL')) {
        this.detectedPatterns.add('SPIRAL')
        this.lastTriggerTime = now
        return {
          type: 'PATTERN_SPIRAL',
          text: pickRoast(ROAST_POOLS.PATTERN_SPIRAL[lang]),
        }
      }
    }

    // 8. AUTOCLICK BOT (≥ 30 clics/s)
    const last1Sec = this.history.filter((c) => now - c.time <= 1000)
    if (last1Sec.length >= 30 && !this.shownTriggers.has('HIGH_CPS')) {
      this.shownTriggers.add('HIGH_CPS')
      this.lastTriggerTime = now
      return {
        type: 'HIGH_CPS',
        text: pickRoast(ROAST_POOLS.HIGH_CPS[lang]),
      }
    }

    return null
  }

  /**
   * Instantané utilisé uniquement pour générer le profil "stats absurdes"
   * (Patience/Obsession/Luck/Dignity) affiché à la victoire — lecture seule,
   * ne modifie jamais l'état du tracker.
   */
  public getSummary() {
    return {
      maxSameSpotStreak: this.maxSameSpotStreak,
      maxCornerStreak: this.maxCornerStreak,
      maxConsecutiveSpaceHits: this.maxConsecutiveSpaceHits,
      patternsDetected: this.detectedPatterns.size,
      triggersShown: this.shownTriggers.size,
      totalClicksTracked: this.totalClicksTracked,
    }
  }

  public reset() {
    this.history = []
    this.visitedCells.clear()
    this.reachedGridPaliers.clear()
    this.detectedPatterns.clear()
    this.shownTriggers.clear()
    this.deliberateRepeatSteps = 0
    this.sameSpotAnchor = null
    this.sameSpotStreakCount = 0
    this.cornerStreakCount = 0
    this.maxSameSpotStreak = 0
    this.maxCornerStreak = 0
    this.maxConsecutiveSpaceHits = 0
    this.totalClicksTracked = 0
    this.lastTriggerTime = 0
    this.hasTriggeredNearMiss = false
    this.clicksSinceNearMiss = 0
    this.hasMockedAfter1000 = false
    this.consecutiveSpaceHits = 0
    this.consecutiveBorderClicks = 0
    this.lastClickTimestamp = Date.now()
  }
}
