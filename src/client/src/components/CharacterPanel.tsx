import React from 'react'
import { useGameStore } from '../stores/gameStore'
import { api } from '../api/client'

function CharacterPanel() {
  const { player, updatePlayer } = useGameStore()
  
  if (!player) return null
  
  const handleAbsorbErosion = async (type: string) => {
    const result = await api.player.absorbErosion(player.id, type, 10)
    if (result.data?.player) {
      updatePlayer(result.data.player)
    }
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-erosion-glow mb-4">角色信息</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-300">境界：</span>
            <span className="text-white font-bold">
              {player.realmName} {player.realmLevel}境
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-300">等级：</span>
            <span className="text-white font-bold">Lv.{player.level}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-300">职业：</span>
            <span className="text-white font-bold">{player.classType}</span>
          </div>
          
          <div className="border-t border-gray-600 pt-4 mt-4">
            <h3 className="text-lg font-bold text-gray-300 mb-2">基础属性</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>生命：</span>
                <span>{player.health}/{player.maxHealth}</span>
              </div>
              <div className="flex justify-between">
                <span>攻击：</span>
                <span>{player.attack}</span>
              </div>
              <div className="flex justify-between">
                <span>防御：</span>
                <span>{player.defense}</span>
              </div>
              <div className="flex justify-between">
                <span>速度：</span>
                <span>{player.speed}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-600 pt-4 mt-4">
            <h3 className="text-lg font-bold text-gray-300 mb-2">蚀熵吸收</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleAbsorbErosion('gray')}
                className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded transition"
              >
                吸收灰蚀 (+10)
              </button>
              <button
                onClick={() => handleAbsorbErosion('crimson')}
                className="w-full bg-red-800 hover:bg-red-900 py-2 rounded transition"
              >
                吸收猩蚀 (+10)
              </button>
              <button
                onClick={() => handleAbsorbErosion('pale')}
                className="w-full bg-gray-400 hover:bg-gray-500 py-2 rounded transition"
              >
                吸收苍白之蚀 (+10)
              </button>
              <button
                onClick={() => handleAbsorbErosion('dark')}
                className="w-full bg-purple-900 hover:bg-purple-950 py-2 rounded transition"
              >
                吸收深黯之蚀 (+10)
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-erosion-glow mb-4">异化状态</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">异化值：</span>
              <span className="text-white font-bold">
                {player.erosionValue.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  player.erosionValue < 25 ? 'bg-green-500' :
                  player.erosionValue < 50 ? 'bg-yellow-500' :
                  player.erosionValue < 75 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${player.erosionValue}%` }}
              />
            </div>
          </div>
          
          {player.erosionValue >= 25 && (
            <div className="bg-red-900 p-4 rounded border border-red-500">
              <h4 className="font-bold text-red-400 mb-2">⚠️ 异化警告</h4>
              <p className="text-sm text-gray-300">
                {player.erosionValue >= 75 && '你正在失去人类的身份...'}
                {player.erosionValue >= 50 && player.erosionValue < 75 && '你的人形正在崩解...'}
                {player.erosionValue >= 25 && player.erosionValue < 50 && '非人特征开始显现...'}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-300">异化天赋</h3>
            
            {player.erosionValue >= 25 && (
              <div className="bg-gray-700 p-3 rounded">
                <h4 className="font-bold text-green-400">血肉堡垒</h4>
                <p className="text-sm text-gray-400">生命+200%</p>
                <p className="text-xs text-red-400 mt-1">无法穿戴防具</p>
              </div>
            )}
            
            {player.erosionValue >= 50 && (
              <div className="bg-gray-700 p-3 rounded">
                <h4 className="font-bold text-yellow-400">低语先知</h4>
                <p className="text-sm text-gray-400">听到怪物/NPC心声</p>
                <p className="text-xs text-red-400 mt-1">持续扣减理智值</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterPanel
