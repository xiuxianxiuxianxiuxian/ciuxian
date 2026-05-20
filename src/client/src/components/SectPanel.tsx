import React, { useEffect, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { api } from '../api/client'

interface Sect {
  id: string
  name: string
  type: string
  level: number
  memberCount: number
}

function SectPanel() {
  const { player, currentSect, setCurrentSect } = useGameStore()
  const [sects, setSects] = useState<Sect[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    loadSects()
  }, [])
  
  const loadSects = async () => {
    const result = await api.sect.getAll()
    if (result.data?.sects) {
      setSects(result.data.sects)
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
    }
    
    setLoading(false)
  }
  
  if (!player) return null
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-erosion-glow">宗门系统</h2>
      
      {currentSect ? (
        <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold mb-4">当前宗门：{currentSect.name}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-300">宗门类型：</span>
              <span className="text-white">{currentSect.type}</span>
            </div>
            <div>
              <span className="text-gray-300">宗门等级：</span>
              <span className="text-white">Lv.{currentSect.level}</span>
            </div>
            <div>
              <span className="text-gray-300">成员数量：</span>
              <span className="text-white">{currentSect.memberCount}</span>
            </div>
          </div>
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
    </div>
  )
}

export default SectPanel
