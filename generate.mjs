import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ==========================================
// 1. PALIERS DE CLICS (FRANÇAIS)
// ==========================================
const clickMessagesFr = [
  // Début : Faux encouragements bienveillants (10 - 250)
  { clics: 10, texte: "Bon début ! Plus que 2 073 590 pixels à tester." },
  { clics: 30, texte: "C'est bien, tu prends tes repères. Respire." },
  { clics: 75, texte: "Belle régularité dans le geste. Garde ce rythme." },
  { clics: 150, texte: "Statistiquement, chaque clic te rapproche... en théorie." },
  { clics: 250, texte: "Un quart de millier. La patience est une vertu rare." },

  // Transition & Motivation toxique (500 - 2 500)
  { clics: 500, texte: "Et bah alors ? Continue, tu vas pas abandonner quand même. Réussis au moins un truc cette semaine." },
  { clics: 1000, texte: "1 000 clics... Allez lâche rien, prouve-toi que t'es capable de finir quelque chose." },
  { clics: 1800, texte: "Baisse pas les bras maintenant. Le pixel est peut-être sous ton prochain clic." },
  { clics: 2500, texte: "2 500 clics. Si tu quittes maintenant, tout ce temps aura servi à rien." },

  // Milieu & Prise de conscience (5 000 - 25 000)
  { clics: 5000, texte: "5 000 clics... C'est plus du jeu là, c'est une question de fierté personnelle." },
  { clics: 10000, texte: "10 000 clics. Tu vas vraiment laisser un carré de 1 pixel gagner contre toi ?" },
  { clics: 18000, texte: "18 000 trous dans l'eau. Mais ton mental d'acier commence à faire peur." },
  { clics: 25000, texte: "25 000 clics. Même un marathonien abandonnerait avant toi." },

  // Fin & Acharnement pur (50 000 - 250 000+)
  { clics: 50000, texte: "50 000 clics. À ce stade, personne n'a le droit de te juger. Continue." },
  { clics: 100000, texte: "100 000 clics. Tu es entré dans la légende du néant absolu." },
  { clics: 250000, texte: "250 000 clics. Le pixel s'incline devant ta détermination indestructible." }
]

// ==========================================
// 2. PALIERS DE CLICS (ENGLISH)
// ==========================================
const clickMessagesEn = [
  { clics: 10, texte: "Great start! Only 2,073,590 pixels left to check." },
  { clics: 30, texte: "Nice pace. Get comfortable, take a breath." },
  { clics: 75, texte: "Solid consistency. Keep that momentum going." },
  { clics: 150, texte: "Statistically, every click gets you closer... in theory." },
  { clics: 250, texte: "A quarter thousand down. Patience is a virtue." },

  { clics: 500, texte: "What's wrong? Keep going, don't quit now. Accomplish at least one thing this week." },
  { clics: 1000, texte: "1,000 misses... Don't give up, prove you can actually finish something for once." },
  { clics: 1800, texte: "Don't back down now. The pixel might literally be under your next click." },
  { clics: 2500, texte: "2,500 clicks. If you leave now, all this effort was for absolute nothing." },

  { clics: 5000, texte: "5,000 clicks... This isn't just a game anymore, it's a matter of personal pride." },
  { clics: 10000, texte: "10,000 clicks. Are you really going to let a 1px square defeat you?" },
  { clics: 18000, texte: "18,000 blank shots. Your stubborn resilience is getting scary." },
  { clics: 25000, texte: "25,000 clicks. Even a marathon runner would have tapped out." },

  { clics: 50000, texte: "50,000 clicks. At this point, nobody can judge you. Keep clicking." },
  { clics: 100000, texte: "100,000 clicks. You have officially entered the hall of fame of nothingness." },
  { clics: 250000, texte: "250,000 clicks. The pixel bows before your unbreakable willpower." }
]

// ==========================================
// 3. PALIERS DE TEMPS (FR / EN)
// ==========================================
const timeMessagesFr = [
  { temps: 30, texte: "30 secondes. La mise en jambe est faite." },
  { temps: 90, texte: "1m30... Respire un grand coup, t'as tout ton temps." },
  { temps: 240, texte: "4 minutes. Le pixel ne bouge pas, il attend." },
  { temps: 600, texte: "10 minutes de scan méthodique. Toujours fidèle au poste." },
  { temps: 1200, texte: "20 minutes. Le soleil se couche, ton clic continue." },
  { temps: 1800, texte: "30 minutes complètes. Ton niveau de persévérance est terrifiant." }
]

const timeMessagesEn = [
  { temps: 30, texte: "30 seconds in. Nice little warm-up." },
  { temps: 90, texte: "1m30... Take a deep breath, you've got all day." },
  { temps: 240, texte: "4 minutes. The pixel isn't moving, it's waiting." },
  { temps: 600, texte: "10 minutes of scanning. Still right here." },
  { temps: 1200, texte: "20 minutes. Sun is setting, clicking goes on." },
  { temps: 1800, texte: "30 full minutes. Your endurance is genuinely terrifying." }
]

// ==========================================
// ÉCRITURE DANS ./src/data
// ==========================================
const distPath = path.resolve(__dirname, 'src/data')
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true })
}

const patientFr = [...clickMessagesFr, ...timeMessagesFr]
const patientEn = [...clickMessagesEn, ...timeMessagesEn]
const impatientFr = [...clickMessagesFr, ...timeMessagesFr]
const impatientEn = [...clickMessagesEn, ...timeMessagesEn]

fs.writeFileSync(path.join(distPath, 'messagesPatient_fr.json'), JSON.stringify(patientFr, null, 2))
fs.writeFileSync(path.join(distPath, 'messagesPatient_en.json'), JSON.stringify(patientEn, null, 2))
fs.writeFileSync(path.join(distPath, 'messagesImpatient_fr.json'), JSON.stringify(impatientFr, null, 2))
fs.writeFileSync(path.join(distPath, 'messagesImpatient_en.json'), JSON.stringify(impatientEn, null, 2))

console.log('✅ Base de données JSON mise à jour.')
