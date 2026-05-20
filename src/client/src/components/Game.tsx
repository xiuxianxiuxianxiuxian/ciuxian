import React, { useEffect, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { api } from '../api/client'
import CharacterPanel from './CharacterPanel'
import SectPanel from './SectPanel'
import BattlePanel from './BattlePanel'

function Game() {
  const { player, currentSect, setCurrentSect, inBattle } = useGameStore()
  const [activePanel, setActivePanel] = useState<'character' | 'sect' | 'battle'>('character')
  
  useEffect(() => {
    if (player?.sectId) {
      loadSect()
    }
  }, [player?.sectId])
  
  const loadSect = async () => {
    if (!player?.sectId) return
    const result = await api.sect.getAll()
    if (result.data?.sects) {
      const sect = result.data.sects.find((s: any) => s.id === player.sectId)
      if (sect) {
        setCurrentSect(sect)
      }
    }
  }
  
  if (!player) return null
  
  return (
    <div className="min-h-screen bg-erosion-dark text-white">
      <nav className="bg-erosion-gray p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-erosion-glow">噬界</h1>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setActivePanel('character')}
              className={`px-4 py-2 rounded ${
                activePanel === 'character' ? 'bg-erosion-glow' : 'bg-gray-700'
              }`}
            >
              角色
            </button>
            <button
              onClick={() => setActivePanel('sect')}
              className={`px-4 py-2 rounded ${
                activePanel === 'sect' ? 'bg-erosion-glow' : 'bg-gray-700'
              }`}
            >
              宗门
            </button>
            <button
              onClick={() => setActivePanel('battle')}
              className={`px-4 py-2 rounded ${
                activePanel === 'battle' ? 'bg-erosion-glow' : 'bg-gray-700'
              }`}
            >
              战斗
            </button>
          </div>
          
          <div className="text-gray-300">
            {player.username} - {player.realmName} {player.realmLevel}境
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto p-8">
        {inBattle ? (
          <BattlePanel />
        ) : (
          <>
            {activePanel === 'character' && <CharacterPanel />}
            {activePanel === 'sect' && <SectPanel />}
            {activePanel === 'battle' && <BattlePanel />}
          </>
        )}
      </div>
    </div>
  )
}

export default Game
