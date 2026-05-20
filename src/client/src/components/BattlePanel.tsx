import React from 'react'
import { useGameStore } from '../stores/gameStore'

function BattlePanel() {
  const { player, inBattle } = useGameStore()
  
  if (!player) return null
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-erosion-glow">战斗系统</h2>
      
      <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4">战斗准备</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gray-700 hover:bg-gray-600 p-6 rounded transition">
            <h4 className="font-bold text-lg mb-2">论道大会</h4>
            <p className="text-sm text-gray-400">PVP竞技场</p>
          </button>
          
          <button className="bg-gray-700 hover:bg-gray-600 p-6 rounded transition">
            <h4 className="font-bold text-lg mb-2">秘境探险</h4>
            <p className="text-sm text-gray-400">PVE副本</p>
          </button>
          
          <button className="bg-gray-700 hover:bg-gray-600 p-6 rounded transition">
            <h4 className="font-bold text-lg mb-2">世界BOSS</h4>
            <p className="text-sm text-gray-400">团队挑战</p>
          </button>
        </div>
      </div>
      
      {inBattle && (
        <div className="bg-red-900 p-6 rounded-lg border border-red-500">
          <h3 className="text-xl font-bold mb-4">战斗中...</h3>
          <p className="text-gray-300">正在与敌人战斗</p>
        </div>
      )}
    </div>
  )
}

export default BattlePanel
