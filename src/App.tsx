import { useState } from 'react'
import HomePage from './pages/HomePage'
import PatientPage from './pages/PatientPage'
import ImpatientPage from './pages/ImpatientPage'
import DailyPixelPage from './pages/DailyPixelPage'

export type Page = 'home' | 'patient' | 'impatient' | 'daily'

const ACTIVE_GAME_KEY = 'pixeltroll_active_game'

// Si un lien de défi ("Beat My Score") a été ouvert, on route direct vers le bon
// mode : sans ça, l'utilisateur atterrissait sur l'accueil et devait deviner
// lui-même dans quel mode cliquer pour que le défi soit pris en compte.
const readChallengeModeFromUrl = (): Page | null => {
  try {
    const raw = new URLSearchParams(window.location.search).get('battle')
    if (!raw) return null
    const decoded = JSON.parse(decodeURIComponent(atob(raw))) as { md?: Page }
    if (decoded.md === 'patient' || decoded.md === 'impatient' || decoded.md === 'daily') return decoded.md
    return null
  } catch {
    return null
  }
}

// Si une partie était en cours au moment du rechargement, on y retourne directement
// au lieu de renvoyer l'utilisateur à l'accueil.
const readActivePage = (): Page => {
  const challengeMode = readChallengeModeFromUrl()
  if (challengeMode) return challengeMode
  try {
    const raw = localStorage.getItem(ACTIVE_GAME_KEY)
    if (!raw) return 'home'
    const parsed = JSON.parse(raw) as { mode?: Page }
    if (parsed.mode === 'patient' || parsed.mode === 'impatient' || parsed.mode === 'daily') return parsed.mode
    return 'home'
  } catch {
    return 'home'
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => readActivePage())

  if (currentPage === 'patient') {
    return <PatientPage onHome={() => setCurrentPage('home')} />
  }

  if (currentPage === 'impatient') {
    return <ImpatientPage onHome={() => setCurrentPage('home')} />
  }

  if (currentPage === 'daily') {
    return <DailyPixelPage onHome={() => setCurrentPage('home')} />
  }

  return (
    <HomePage
      onPatient={() => setCurrentPage('patient')}
      onImpatient={() => setCurrentPage('impatient')}
      onDaily={() => setCurrentPage('daily')}
    />
  )
}

export default App
