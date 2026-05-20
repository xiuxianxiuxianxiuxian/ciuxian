import { FastifyInstance } from 'fastify'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function setupSocketIO(fastify: FastifyInstance) {
  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: '*'
    }
  })
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    
    socket.on('player:online', async (data: { playerId: string }) => {
      socket.join(`player:${data.playerId}`)
      io.emit('player:status', {
        playerId: data.playerId,
        status: 'online'
      })
    })
    
    socket.on('battle:join', async (data: { playerId: string, battleId: string }) => {
      socket.join(`battle:${data.battleId}`)
      socket.to(`battle:${data.battleId}`).emit('battle:player-joined', {
        playerId: data.playerId
      })
    })
    
    socket.on('battle:skill', async (data: {
      playerId: string,
      battleId: string,
      skillId: string,
      targetId: string
    }) => {
      const skill = await prisma.skill.findUnique({ where: { id: data.skillId } })
      
      io.to(`battle:${data.battleId}`).emit('battle:skill-used', {
        playerId: data.playerId,
        skillId: data.skillId,
        damage: skill?.damage || 0,
        targetId: data.targetId
      })
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
