import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import io from 'socket.io-client'

function BattlePanel() {
  const { 
    player, 
    inBattle, 
    currentBattleId, 
    battleState,
    enterBattle, 
    exitBattle,
    updateBattleState,
    addBattleLog
  } = useGameStore()
  
  const [socket, setSocket] = useState<any>(null)
  const [battleError, setBattleError] = useState<string>('')
  const [targetPlayer, setTargetPlayer] = useState<string>('')
  const logRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // 初始化Socket连接
    const newSocket = io('http://localhost:4000')
    setSocket(newSocket)
    
    // 监听Socket事件
    newSocket.on('battle:created', (data: { battleId: string }) => {
      enterBattle(data.battleId)
    })
    
    newSocket.on('battle:player-joined', (data: any) => {
      updateBattleState({ 
        players: data.players,
        health: data.health
      })
    })
    
    newSocket.on('battle:skill-used', (data: any) => {
      updateBattleState({ 
        health: data.health,
        turn: (battleState?.turn || 0) + 1
      })
    })
    
    newSocket.on('battle:log', (data: any) => {
      addBattleLog(data)
    })
    
    newSocket.on('battle:ended', (data: any) => {
      addBattleLog({ message: `战斗结束！${data.winner} 获胜！`, time: Date.now() })
      setBattleError(`战斗结束！${data.winner} 获胜！`)
    })
    
    newSocket.on('battle:error', (data: any) => {
      setBattleError(data.error)
    })
    
    return () => {
      newSocket.disconnect()
    }
  }, [])
  
  useEffect(() => {
    // 自动滚动日志
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [battleState?.log])
  
  if (!player) return null
  
  const createBattle = () => {
    if (socket) {
      socket.emit('battle:create', { playerId: player.id })
    }
  }
  
  const joinBattle = (battleId: string) => {
    if (socket) {
      socket.emit('battle:join', { playerId: player.id, battleId })
      enterBattle(battleId)
    }
  }
  
  const useSkill = (skillId: string) => {
    if (!socket || !currentBattleId) return
    if (!targetPlayer) {
      setBattleError('请先选择目标')
      return
    }
    
    socket.emit('battle:skill', {
      playerId: player.id,
      battleId: currentBattleId,
      skillId,
      targetId: targetPlayer
    })
  }
  
  const endBattle = () => {
    if (socket && currentBattleId) {
      socket.emit('battle:end', { battleId: currentBattleId })
      exitBattle()
    }
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-erosion-glow">战斗系统</h2>
      
      {!inBattle ? (
        <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold mb-4">战斗准备</h3>
          
          {battleError && (
            <div className="bg-red-900 border border-red-500 p-3 rounded text-red-300 mb-4">
              {battleError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button 
              onClick={createBattle}
              className="bg-erosion-glow hover:bg-red-600 p-6 rounded transition"
            >
              <h4 className="font-bold text-lg mb-2">创建战斗</h4>
              <p className="text-sm text-gray-200">开启新的战斗</p>
            </button>
            
            <div className="bg-gray-700 p-6 rounded">
              <h4 className="font-bold text-lg mb-2">加入战斗</h4>
              <p className="text-sm text-gray-400 mb-3">输入战斗ID加入</p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="输入战斗ID"
                  className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2"
                  id="battleIdInput"
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('battleIdInput') as HTMLInputElement
                    if (input?.value) {
                      joinBattle(input.value)
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                >
                  加入
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-600 pt-4">
            <h4 className="text-lg font-bold text-gray-300 mb-3">战斗模式</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded">
                <h5 className="font-bold text-white mb-1">论道大会</h5>
                <p className="text-xs text-gray-400">PVP竞技场</p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <h5 className="font-bold text-white mb-1">秘境探险</h5>
                <p className="text-xs text-gray-400">PVE副本</p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <h5 className="font-bold text-white mb-1">世界BOSS</h5>
                <p className="text-xs text-gray-400">团队挑战</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左侧：技能面板 */}
          <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold text-erosion-glow mb-4">技能</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => useSkill('erosion-strike')}
                className="w-full bg-gray-700 hover:bg-gray-600 p-4 rounded text-left transition"
              >
                <div className="font-bold text-white">侵蚀打击</div>
                <div className="text-sm text-gray-400">对目标造成伤害</div>
              </button>
              
              <button 
                onClick={() => useSkill('dark-pulse')}
                className="w-full bg-gray-700 hover:bg-gray-600 p-4 rounded text-left transition"
              >
                <div className="font-bold text-white">黑暗脉冲</div>
                <div className="text-sm text-gray-400">释放黑暗能量</div>
              </button>
              
              <button 
                onClick={() => useSkill('soul-drain')}
                className="w-full bg-gray-700 hover:bg-gray-600 p-4 rounded text-left transition"
              >
                <div className="font-bold text-white">灵魂汲取</div>
                <div className="text-sm text-gray-400">吸取目标生命</div>
              </button>
            </div>
            
            <button 
              onClick={endBattle}
              className="w-full mt-6 bg-red-800 hover:bg-red-900 py-2 rounded transition"
            >
              结束战斗
            </button>
          </div>
          
          {/* 中间：战斗画面 */}
          <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold text-erosion-glow mb-4">
              战斗中 - {currentBattleId}
            </h3>
            
            {battleError && (
              <div className="bg-red-900 border border-red-500 p-3 rounded text-red-300 mb-4">
                {battleError}
              </div>
            )}
            
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">选择目标:</div>
              <div className="space-y-2">
                {battleState?.players.filter(p => p !== player.id).map(playerId => (
                  <button
                    key={playerId}
                    onClick={() => setTargetPlayer(playerId)}
                    className={`w-full p-3 rounded text-left transition ${
                      targetPlayer === playerId 
                        ? 'bg-red-900 border border-red-500' 
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="font-bold text-white">{playerId}</div>
                    <div className="text-sm">
                      血量: {battleState?.health[playerId] || 0}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-400">当前回合</div>
                <div className="text-2xl font-bold text-white">{battleState?.turn || 0}</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-400">你的血量</div>
                <div className="text-2xl font-bold text-white">
                  {battleState?.health[player.id] || 100}
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-500">
              (战斗可视化区域)
            </div>
          </div>
          
          {/* 右侧：战斗日志 */}
          <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold text-erosion-glow mb-4">战斗日志</h3>
            
            <div 
              ref={logRef}
              className="bg-gray-800 p-4 rounded h-80 overflow-y-auto"
            >
              {battleState?.log.length === 0 ? (
                <div className="text-gray-500 text-center py-10">
                  等待战斗开始...
                </div>
              ) : (
                <div className="space-y-2">
                  {battleState?.log.map((log, i) => (
                    <div key={i} className="text-sm text-gray-300">
                      [{new Date(log.time).toLocaleTimeString()}] {log.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BattlePanel
