import { useEffect, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { api } from '../api/client'

interface Sect {
  id: string
  name: string
  type: string
  level: number
  memberCount: number
}

interface LawNode {
  id: string
  name: string
  erosionType: string
  bonus: { [key: string]: number }
  ownerId: string | null
}

function SectPanel() {
  const { player, currentSect, setCurrentSect } = useGameStore()
  const [sects, setSects] = useState<Sect[]>([])
  const [lawNodes, setLawNodes] = useState<LawNode[]>([])
  const [warStatus, setWarStatus] = useState<any>(null)
  const [selectedNode, setSelectedNode] = useState<LawNode | null>(null)
  const [attackerCount, setAttackerCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  useEffect(() => {
    loadSects()
    loadLawNodes()
  }, [])
  
  useEffect(() => {
    if (currentSect) {
      loadWarStatus()
    }
  }, [currentSect])
  
  const loadSects = async () => {
    const result = await api.sect.getAll()
    if (result.data?.sects) {
      setSects(result.data.sects)
    }
  }
  
  const loadLawNodes = async () => {
    const result = await api.sect.getLawNodes()
    if (result.data?.nodes) {
      setLawNodes(result.data.nodes)
    }
  }
  
  const loadWarStatus = async () => {
    if (!currentSect) return
    const result = await api.sect.getWarStatus(currentSect.id)
    if (result.data) {
      setWarStatus(result.data)
    }
  }
  
  const handleJoinSect = async (sectId: string) => {
    if (!player) return
    setLoading(true)
    
    const result = await api.sect.join(sectId, player.id)
    if (result.data?.player) {
      const sect = sects.find(s => s.id === sectId)
      if (sect) {
        setCurrentSect(sect)
      }
      loadSects()
      setSuccess('加入宗门成功！')
    } else if (result.error) {
      setError(result.error)
    }
    
    setLoading(false)
  }
  
  const handleClaimNode = async (node: LawNode) => {
    if (!currentSect) return
    
    const result = await api.sect.claimNode(currentSect.id, node.id)
    if (result.data) {
      setSuccess(result.data.message)
      loadLawNodes()
      loadWarStatus()
    } else if (result.error) {
      setError(result.error)
    }
  }
  
  const handleCaptureNode = async () => {
    if (!currentSect || !selectedNode) return
    
    const result = await api.sect.captureNode(currentSect.id, selectedNode.id, attackerCount)
    if (result.data) {
      if (result.data.battleResult?.victory) {
        setSuccess(result.data.message)
      } else {
        setError(result.data.message)
      }
      loadLawNodes()
      loadWarStatus()
    } else if (result.error) {
      setError(result.error)
    }
    
    setSelectedNode(null)
  }
  
  const handleUpgradeSect = async () => {
    if (!currentSect) return
    
    const result = await api.sect.upgrade(currentSect.id)
    if (result.data) {
      setSuccess(result.data.message)
      const updatedSect = sects.find(s => s.id === currentSect.id)
      if (updatedSect) {
        setCurrentSect({ ...updatedSect, level: result.data.sect.level })
      }
      loadSects()
    } else if (result.error) {
      setError(result.error)
    }
  }
  
  if (!player) return null
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-erosion-glow">宗门系统</h2>
      
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
      
      {currentSect ? (
        <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">当前宗门：{currentSect.name}</h3>
            <button
              onClick={handleUpgradeSect}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              宗门升级
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-gray-300">宗门类型：</span>
              <span className="text-white">{currentSect.type}</span>
            </div>
            <div>
              <span className="text-gray-300">宗门等级：</span>
              <span className="text-white">Lv.{currentSect.level}/10</span>
            </div>
            <div>
              <span className="text-gray-300">成员数量：</span>
              <span className="text-white">{currentSect.memberCount}</span>
            </div>
          </div>
          
          {warStatus && (
            <div className="border-t border-gray-600 pt-4">
              <h4 className="text-lg font-bold text-gray-300 mb-3">宗门战争状态</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-400">占领节点数</div>
                  <div className="text-2xl font-bold text-white">{warStatus.nodeCount}/6</div>
                </div>
                <div className="bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-400">总加成</div>
                  <div className="text-sm">
                    {Object.entries(warStatus.totalBonus as Record<string, number>).map(([key, value]) => (
                      <div key={key} className="text-gray-300">
                        {key}: +{value}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold mb-4">你还没有加入宗门</h3>
        </div>
      )}
      
      <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4">四大宗门</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sects.map((sect) => (
            <div
              key={sect.id}
              className={`bg-gray-700 p-4 rounded border-2 ${
                currentSect?.id === sect.id ? 'border-erosion-glow' : 'border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">{sect.name}</h4>
                {currentSect?.id === sect.id && (
                  <span className="text-erosion-glow text-sm">已加入</span>
                )}
              </div>
              
              <div className="space-y-1 text-sm text-gray-300 mb-3">
                <p>类型：{sect.type}</p>
                <p>等级：Lv.{sect.level}</p>
                <p>成员：{sect.memberCount}</p>
              </div>
              
              {currentSect?.id !== sect.id && (
                <button
                  onClick={() => handleJoinSect(sect.id)}
                  disabled={loading}
                  className="w-full bg-erosion-glow hover:bg-red-600 disabled:bg-gray-600 py-2 rounded transition"
                >
                  {loading ? '加入中...' : '加入宗门'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4">法则节点</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {lawNodes.map((node) => {
            const isOwned = node.ownerId === currentSect?.id
            const ownerSect = sects.find(s => s.id === node.ownerId)
            
            return (
              <div
                key={node.id}
                className={`p-4 rounded border-2 cursor-pointer transition ${
                  isOwned 
                    ? 'bg-green-900 border-green-500' 
                    : node.ownerId 
                      ? 'bg-red-900 border-red-500'
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => {
                  if (!isOwned && node.ownerId && currentSect) {
                    setSelectedNode(node)
                  }
                }}
              >
                <h4 className="font-bold text-white mb-2">{node.name}</h4>
                <div className="text-sm text-gray-400 mb-2">
                  类型：{node.erosionType}
                </div>
                <div className="text-sm text-gray-300 mb-2">
                  <div>加成：</div>
                  {Object.entries(node.bonus).map(([key, value]) => (
                    <div key={key}>- {key}: +{value}%</div>
                  ))}
                </div>
                <div className="text-xs">
                  {isOwned ? (
                    <span className="text-green-400">已占领</span>
                  ) : node.ownerId ? (
                    <span className="text-red-400">被 {ownerSect?.name || '未知'} 占领</span>
                  ) : (
                    <span className="text-gray-500">无人占领</span>
                  )}
                </div>
                
                {!isOwned && !node.ownerId && currentSect && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClaimNode(node)
                    }}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm"
                  >
                    占领节点
                  </button>
                )}
              </div>
            )
          })}
        </div>
        
        {selectedNode && (
          <div className="bg-red-900 border border-red-500 p-4 rounded">
            <h4 className="font-bold text-white mb-3">进攻 {selectedNode.name}</h4>
            <div className="mb-3">
              <label className="text-sm text-gray-300">进攻人数：</label>
              <input
                type="number"
                min="1"
                value={attackerCount}
                onChange={(e) => setAttackerCount(parseInt(e.target.value) || 1)}
                className="w-20 bg-gray-800 border border-gray-600 rounded px-3 py-1 ml-2"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCaptureNode}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                发起进攻
              </button>
              <button
                onClick={() => setSelectedNode(null)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SectPanel
