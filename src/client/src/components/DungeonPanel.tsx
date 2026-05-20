import { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { api } from '../api/client'

function DungeonPanel() {
  const { player, startBattle } = useGameStore()
  const [dungeons, setDungeons] = useState<any[]>([])
  const [activeRun, setActiveRun] = useState<any>(null)
  const [enemies, setEnemies] = useState<any[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadDungeons()
  }, [])

  const loadDungeons = async () => {
    const result = await api.dungeon.getDungeons()
    if (result.data?.dungeons) {
      setDungeons(result.data.dungeons)
    }
  }

  const startDungeon = async (dungeon: any) => {
    if (!player) return
    
    setError('')
    
    const result = await api.dungeon.startDungeon(dungeon.id, player.id)
    
    if (result.data) {
      setActiveRun({
        runId: result.data.runId,
        dungeon: result.data.dungeon
      })
      setEnemies(result.data.enemies)
      setSuccess('副本已开始！')
      startBattle()
    } else if (result.error) {
      setError(result.error)
    }
  }

  const attackEnemy = async (targetId: string) => {
    if (!player || !activeRun) return
    
    const damage = Math.floor(player.attack * (0.8 + Math.random() * 0.4))
    
    const result = await api.dungeon.attackInDungeon(
      activeRun.dungeon.id,
      activeRun.runId,
      player.id,
      targetId,
      damage
    )
    
    if (result.data) {
      if (result.data.completed) {
        setSuccess(`副本完成！获得 ${result.data.rewards?.experience} 经验, ${result.data.rewards?.gold} 金币`)
        setActiveRun(null)
        setEnemies([])
      } else {
        setEnemies(result.data.enemies)
        setSuccess(`攻击成功！造成 ${damage} 点伤害`)
      }
    } else if (result.error) {
      setError(result.error)
    }
  }

  const leaveDungeon = async () => {
    if (!player || !activeRun) return
    
    const result = await api.dungeon.leaveDungeon(
      activeRun.dungeon.id,
      activeRun.runId,
      player.id
    )
    
    if (result.data) {
      setSuccess('已离开副本')
      setActiveRun(null)
      setEnemies([])
    } else if (result.error) {
      setError(result.error)
    }
  }

  const getErosionTypeColor = (erosionType: string) => {
    switch (erosionType) {
      case '灰蚀': return 'text-gray-400'
      case '猩蚀': return 'text-red-400'
      case '苍白之蚀': return 'text-white'
      case '深黯之蚀': return 'text-purple-400'
      default: return 'text-gray-300'
    }
  }

  if (!player) return null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-erosion-glow">副本系统</h2>

      {error && (
        <div className="bg-red-900 border border-red-500 p-3 rounded text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900 border border-green-500 p-3 rounded text-green-300">
          {success}
        </div>
      )}

      {activeRun ? (
        <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-300">
              {activeRun.dungeon.name}
            </h3>
            <p className="text-gray-400">{activeRun.dungeon.description}</p>
          </div>
          <button
            onClick={leaveDungeon}
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
          >
            离开副本
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-300 mb-4">敌人</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enemies.map((enemy) => (
              <div
                key={enemy.id}
                className="bg-gray-800 p-4 rounded border-2 border-red-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-red-400">{enemy.name}</h5>
                  <span className="text-gray-400 text-sm">
                    {enemy.currentHealth}/{enemy.health} HP
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-3">
                  <div
                    className="bg-red-600 h-2.5 rounded-full"
                    style={{
                      width: `${(enemy.currentHealth / enemy.health) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  <div>攻击: {enemy.attack}</div>
                  <div>防御: {enemy.defense}</div>
                </div>
                <button
                  onClick={() => attackEnemy(enemy.id)}
                  className="w-full bg-erosion-glow hover:bg-red-600 py-2 rounded"
                >
                  攻击
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-300">选择副本</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dungeons.map((dungeon) => {
            const canEnter = player.level >= dungeon.minLevel
            return (
              <div
                key={dungeon.id}
                className={`bg-erosion-gray p-6 rounded-lg shadow-xl border-2 ${
                  canEnter ? 'border-erosion-glow' : 'border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className={`text-xl font-bold ${getErosionTypeColor(dungeon.erosionType)}`}>
                      {dungeon.name}
                    </h4>
                    <div className="text-sm text-gray-400">
                      {dungeon.erosionType}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-400">等级: {dungeon.minLevel}-{dungeon.maxLevel}</div>
                    <div className="text-gray-400">推荐人数: {dungeon.recommendedPlayers}</div>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">{dungeon.description}</p>
                <div className="border-t border-gray-600 pt-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">奖励:</div>
                  <div className="text-xs">
                    <div>经验: {dungeon.rewards.experience}</div>
                    <div>金币: {dungeon.rewards.gold}</div>
                    <div>物品: {dungeon.rewards.items.join(', ')}</div>
                  </div>
                </div>
                <div className="border-t border-gray-600 pt-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">敌人:</div>
                  <div className="flex flex-wrap gap-2">
                    {dungeon.enemies.map((enemy: any, index: number) => (
                      <div key={index} className="text-xs text-red-400">
                        {enemy.name}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => startDungeon(dungeon)}
                  disabled={!canEnter}
                  className={`w-full py-3 rounded ${
                    canEnter
                      ? 'bg-erosion-glow hover:bg-red-600'
                      : 'bg-gray-600'
                  }`}
                >
                  {canEnter ? '进入副本' : `等级不足 (需要${dungeon.minLevel}级)`}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )}
  </div>
)
}

export default DungeonPanel
