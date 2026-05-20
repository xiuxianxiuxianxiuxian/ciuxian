import { FastifyInstance } from 'fastify'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import { BattleManager } from './battle/BattleManager'

const prisma = new PrismaClient()

export function setupSocketIO(fastify: FastifyInstance) {
  const io = new SocketIOServer({
    cors: {
      origin: '*'
    },
    path: '/socket.io/'
  })
  
  io.attach(fastify.server)
  
  const battleManager = new BattleManager(io)
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    
    socket.on('player:online', async (data: { playerId: string }) => {
      socket.join(`player:${data.playerId}`)
      io.emit('player:status', {
        playerId: data.playerId,
        status: 'online'
      })
    })
    
    socket.on('battle:create', async (data: { playerId: string }) => {
      const battleId = `battle-${Date.now()}`
      socket.join(`battle:${battleId}`)
      
      const battle = battleManager.createBattle(battleId, [data.playerId])
      socket.emit('battle:created', { battleId })
    })
    
    socket.on('battle:join', async (data: { playerId: string, battleId: string }) => {
      const existingBattle = battleManager.getBattle(data.battleId)
      if (!existingBattle) {
        socket.emit('battle:error', { error: '战斗不存在' })
        return
      }
      
      socket.join(`battle:${data.battleId}`)
      
      // 如果战斗只有一个玩家，加入新玩家
      if (existingBattle.players.length === 1 && !existingBattle.players.includes(data.playerId)) {
        existingBattle.players.push(data.playerId)
        existingBattle.health[data.playerId] = 100
        
        io.to(`battle:${data.battleId}`).emit('battle:player-joined', {
          playerId: data.playerId,
          players: existingBattle.players,
          health: existingBattle.health
        })
      }
    })
    
    socket.on('battle:skill', async (data: {
      playerId: string,
      battleId: string,
      skillId: string,
      targetId: string
    }) => {
      try {
        const result = await battleManager.useSkill(
          data.battleId,
          data.playerId,
          data.skillId,
          data.targetId
        )
        socket.emit('battle:skill-result', result)
      } catch (error) {
        socket.emit('battle:error', { error: (error as Error).message })
      }
    })
    
    socket.on('battle:end', async (data: { battleId: string }) => {
      battleManager.endBattle(data.battleId)
    })
    
    socket.on('player:offline', async (data: { playerId: string }) => {
      io.emit('player:status', {
        playerId: data.playerId,
        status: 'offline'
      })
    })
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
  
  return io
}
