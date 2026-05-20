import { useEffect } from 'react'
import { useGameStore } from './stores/gameStore'
import Login from './components/Login'
import Game from './components/Game'

function App() {
  const { player, setPlayer } = useGameStore()
  
  useEffect(() => {
    const savedPlayer = localStorage.getItem('devour-realm-player')
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer))
    }
  }, [setPlayer])
  
  return (
    <div className="app">
      {player ? <Game /> : <Login />}
    </div>
  )
}

export default App
