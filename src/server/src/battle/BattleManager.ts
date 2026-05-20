interface Battle {
  id: string
  players: string[]
  turn: number
  isActive: boolean
  log: string[]
  health: { [playerId: string]: number }
}

export class BattleManager {
  private battles: Map<string, Battle> = new Map()
  private io: any
  
  constructor(io: any) {
    this.io = io
  }
  
  createBattle(battleId: string, players: string[]): Battle {
    const battle: Battle = {
      id: battleId,
      players,
      turn: 0,
      isActive: true,
      log: [],
      health: {}
    }
    
    // 初始化玩家血量
    players.forEach(playerId => {
      battle.health[playerId] = 100 // 默认100血量
    })
    
    this.battles.set(battleId, battle)
    
    this.io.to(`battle:${battleId}`).emit('battle:created', {
      battleId,
      players,
      health: battle.health
    })
    
    this.addBattleLog(battleId, '战斗开始！')
    
    return battle
  }
  
  async useSkill(battleId: string, playerId: string, skillId: string, targetId: string): Promise<{ damage: number; success: boolean }> {
    const battle = this.battles.get(battleId)
    if (!battle) {
      throw new Error('战斗不存在')
    }
    
    if (!battle.isActive) {
      throw new Error('战斗已结束')
    }
    
    if (!battle.players.includes(playerId)) {
      throw new Error('你不在这场战斗中')
    }
    
    if (!battle.players.includes(targetId)) {
      throw new Error('目标不在这场战斗中')
    }
    
    // 计算伤害（暂时随机，后面根据技能配置）
    const damage = Math.floor(Math.random() * 30) + 10
    
    // 应用伤害
    battle.health[targetId] = Math.max(0, battle.health[targetId] - damage)
    
    this.addBattleLog(battleId, `${playerId} 使用 ${skillId} 对 ${targetId} 造成 ${damage} 点伤害`)
    
    // 检查是否死亡
    if (battle.health[targetId] <= 0) {
      this.addBattleLog(battleId, `${targetId} 被击败！`)
      
      // 检查是否还有其他玩家
      const remainingPlayers = battle.players.filter(p => battle.health[p] > 0)
      if (remainingPlayers.length <= 1) {
        this.endBattle(battleId, remainingPlayers[0])
      }
    }
    
    // 广播技能使用
    this.io.to(`battle:${battleId}`).emit('battle:skill-used', {
      playerId,
      skillId,
      damage,
      targetId,
      health: battle.health
    })
    
    battle.turn++
    
    return { damage, success: true }
  }
  
  private addBattleLog(battleId: string, message: string) {
    const battle = this.battles.get(battleId)
    if (battle) {
      battle.log.push(message)
      
      this.io.to(`battle:${battleId}`).emit('battle:log', {
        message,
        time: Date.now()
      })
    }
  }
  
  endBattle(battleId: string, winnerId?: string) {
    const battle = this.battles.get(battleId)
    if (battle) {
      battle.isActive = false
      
      this.io.to(`battle:${battleId}`).emit('battle:ended', {
        winner: winnerId || '平局',
        finalHealth: battle.health
      })
      
      if (winnerId) {
        this.addBattleLog(battleId, `${winnerId} 获胜！`)
      } else {
        this.addBattleLog(battleId, '战斗平局')
      }
      
      // 不立即删除，保留记录
    }
  }
  
  getBattle(battleId: string): Battle | undefined {
    return this.battles.get(battleId)
  }
  
  getActiveBattles(): Battle[] {
    return Array.from(this.battles.values()).filter(b => b.isActive)
  }
}
