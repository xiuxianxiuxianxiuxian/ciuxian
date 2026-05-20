import { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { api } from '../api/client'

function SocialPanel() {
  const { player } = useGameStore()
  const [mentees, setMentees] = useState<any[]>([])
  const [mentor, setMentor] = useState<any>(null)
  const [bondPartner, setBondPartner] = useState<any>(null)
  const [searchPlayer, setSearchPlayer] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [searchBondTarget, setSearchBondTarget] = useState('')
  const [selectedBondTarget, setSelectedBondTarget] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  useEffect(() => {
    if (player) {
      loadMentor()
      loadMentees()
      loadBondPartner()
    }
  }, [player])
  
  const loadBondPartner = async () => {
    if ((player as any)?.bondPartnerId) {
      const result = await api.player.getById((player as any).bondPartnerId)
      if (result.data?.player) {
        setBondPartner(result.data.player)
      }
    }
  }
  
  const loadMentor = async () => {
    if ((player as any)?.mentorId) {
      const result = await api.player.getById((player as any).mentorId)
      if (result.data?.player) {
        setMentor(result.data.player)
      }
    }
  }
  
  const loadMentees = async () => {
    if (player) {
      const result = await api.player.getMentees(player.id)
      if (result.data?.mentees) {
        setMentees(result.data.mentees)
      }
    }
  }
  
  const handleSearchPlayer = async () => {
    if (!searchPlayer.trim()) return
    
    const result = await api.player.getById(searchPlayer)
    if (result.data?.player) {
      setSelectedPlayer(result.data.player)
      setError('')
    } else {
      setError('玩家不存在')
      setSelectedPlayer(null)
    }
  }
  
  const handleBecomeMentor = async () => {
    if (!player || !selectedPlayer) return
    
    const result = await api.player.becomeMentor(player.id, selectedPlayer.id)
    if (result.data) {
      setSuccess(result.data.message)
      loadMentees()
      setSelectedPlayer(null)
      setSearchPlayer('')
    } else if (result.error) {
      setError(result.error)
    }
  }
  
  const handleAcceptMentor = async () => {
    if (!player || !selectedPlayer) return
    
    const result = await api.player.acceptMentor(player.id, selectedPlayer.id)
    if (result.data) {
      setSuccess(result.data.message)
      setMentor(selectedPlayer)
      setSelectedPlayer(null)
      setSearchPlayer('')
    } else if (result.error) {
      setError(result.error)
    }
  }
  
  const handleRevokeMentor = async () => {
    if (!player) return
    
    const result = await api.player.revokeMentor(player.id)
    if (result.data) {
      setSuccess(result.data.message)
      setMentor(null)
    } else if (result.error) {
      setError(result.error)
    }
  }
  
  const handleSearchBondTarget = async () => {
    if (!searchBondTarget.trim()) return
    
    const result = await api.player.getById(searchBondTarget)
    if (result.data?.player) {
      setSelectedBondTarget(result.data.player)
      setError('')
    } else {
      setError('玩家不存在')
      setSelectedBondTarget(null)
    }
  }
  
  const handleBond = async () => {
    if (!player || !selectedBondTarget) return
    
    const result = await api.player.bond(player.id, selectedBondTarget.id)
    if (result.data) {
      setSuccess(result.data.message)
      setBondPartner(selectedBondTarget)
      setSelectedBondTarget(null)
      setSearchBondTarget('')
    } else if (result.error) {
      setError(result.error)
    }
  }
  
  const handleUnbond = async () => {
    if (!player) return
    
    const result = await api.player.unbond(player.id)
    if (result.data) {
      setSuccess(result.data.message)
      setBondPartner(null)
    } else if (result.error) {
      setError(result.error)
    }
  }
  
  if (!player) return null
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-erosion-glow">社交系统</h2>
      
      {/* 错误/成功提示 */}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 师徒关系 */}
        <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold text-gray-300 mb-4">师徒传承</h3>
          
          {/* 当前师傅 */}
          <div className="mb-6">
            <h4 className="text-sm text-gray-400 mb-2">当前师傅</h4>
            {mentor ? (
              <div className="bg-gray-800 p-4 rounded">
                <div className="font-bold text-white">{mentor.username}</div>
                <div className="text-sm text-gray-400">
                  {mentor.realmName} {mentor.realmLevel}境
                </div>
                <button 
                  onClick={handleRevokeMentor}
                  className="mt-2 text-xs text-red-400 hover:text-red-300"
                >
                  解除师徒关系
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 p-4 rounded text-gray-500">
                暂无师傅
              </div>
            )}
          </div>
          
          {/* 徒弟列表 */}
          <div className="mb-6">
            <h4 className="text-sm text-gray-400 mb-2">徒弟 ({mentees.length})</h4>
            {mentees.length > 0 ? (
              <div className="space-y-2">
                {mentees.map((mentee) => (
                  <div key={mentee.id} className="bg-gray-800 p-3 rounded">
                    <div className="font-bold text-white">{mentee.username}</div>
                    <div className="text-xs text-gray-400">
                      {mentee.realmName} {mentee.realmLevel}境
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 p-4 rounded text-gray-500">
                暂无徒弟
              </div>
            )}
          </div>
          
          {/* 搜索玩家 */}
          <div>
            <h4 className="text-sm text-gray-400 mb-2">搜索玩家</h4>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchPlayer}
                onChange={(e) => setSearchPlayer(e.target.value)}
                placeholder="输入玩家ID"
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2"
              />
              <button
                onClick={handleSearchPlayer}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                搜索
              </button>
            </div>
            
            {selectedPlayer && (
              <div className="bg-gray-800 p-4 rounded">
                <div className="font-bold text-white">{selectedPlayer.username}</div>
                <div className="text-sm text-gray-400">
                  {selectedPlayer.realmName} {selectedPlayer.realmLevel}境
                </div>
                <div className="flex gap-2 mt-3">
                  {!mentor && (
                    <button
                      onClick={handleAcceptMentor}
                      className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded"
                    >
                      拜师
                    </button>
                  )}
                  {mentees.length < 3 && (
                    <button
                      onClick={handleBecomeMentor}
                      className="flex-1 bg-erosion-glow hover:bg-red-600 py-2 rounded"
                    >
                      收徒
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 师徒加成说明 */}
          <div className="mt-4 bg-gray-800 p-3 rounded">
            <h4 className="text-sm font-bold text-gray-300 mb-1">师徒加成</h4>
            <div className="text-xs text-gray-400">
              • 师徒共享10%异化抗性
              <br />
              • 徒弟失控时师傅承受50%惩罚
              <br />
              • 师傅最多收3名徒弟
            </div>
          </div>
        </div>
        
        {/* 结缘系统 */}
        <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold text-gray-300 mb-4">结缘系统</h3>
          
          {bondPartner ? (
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded">
                <div className="font-bold text-white">结缘对象</div>
                <div className="text-sm text-gray-400">
                  {bondPartner.username}
                </div>
                <div className="text-xs text-gray-500">
                  {bondPartner.realmName} {bondPartner.realmLevel}境
                </div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-sm font-bold text-gray-300 mb-1">结缘加成</h4>
                <div className="text-xs text-gray-400">
                  • 战斗共享领域效果
                  <br />
                  • 异化值互相影响
                  <br />
                  • 可解除结缘
                </div>
              </div>
              
              <button 
                onClick={handleUnbond}
                className="w-full bg-red-800 hover:bg-red-900 py-2 rounded"
              >
                解除结缘
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded text-gray-500">
                暂无结缘对象
              </div>
              
              <div>
                <h4 className="text-sm text-gray-400 mb-2">搜索结缘对象</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={searchBondTarget}
                    onChange={(e) => setSearchBondTarget(e.target.value)}
                    placeholder="输入玩家ID"
                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2"
                  />
                  <button
                    onClick={handleSearchBondTarget}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    搜索
                  </button>
                </div>
                
                {selectedBondTarget && (
                  <div className="bg-gray-800 p-4 rounded">
                    <div className="font-bold text-white">{selectedBondTarget.username}</div>
                    <div className="text-sm text-gray-400">
                      {selectedBondTarget.realmName} {selectedBondTarget.realmLevel}境
                    </div>
                    <button 
                      onClick={handleBond}
                      className="mt-3 w-full bg-pink-600 hover:bg-pink-700 py-2 rounded"
                    >
                      发起结缘
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-sm font-bold text-gray-300 mb-1">结缘说明</h4>
                <div className="text-xs text-gray-400">
                  • 缔结蚀熵契约
                  <br />
                  • 双方战斗时共享领域
                  <br />
                  • 异化值互相影响（风险与机遇并存）
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SocialPanel
