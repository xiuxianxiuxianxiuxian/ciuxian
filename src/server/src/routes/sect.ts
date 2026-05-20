import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function sectRoutes(fastify: FastifyInstance) {
  
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const sects = await prisma.sect.findMany({
      orderBy: { memberCount: 'desc' }
    })
    
    return reply.send({ sects })
  })
  
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, type, leaderId } = request.body as any
    
    const sect = await prisma.sect.create({
      data: {
        name,
        type,
        memberCount: 1
      }
    })
    
    return reply.send({ sect })
  })
  
  fastify.post('/:sectId/join', async (request: FastifyRequest, reply: FastifyReply) => {
    const { sectId } = request.params as any
    const { playerId } = request.body as any
    
    const player = await prisma.player.update({
      where: { id: playerId },
      data: { sectId }
    })
    
    await prisma.sect.update({
      where: { id: sectId },
      data: { memberCount: { increment: 1 } }
    })
    
    return reply.send({ message: '加入宗门成功', player })
  })
  
  fastify.post('/:sectId/leave', async (request: FastifyRequest, reply: FastifyReply) => {
    const { sectId } = request.params as any
    const { playerId } = request.body as any
    
    const player = await prisma.player.update({
      where: { id: playerId },
      data: { sectId: null }
    })
    
    await prisma.sect.update({
      where: { id: sectId },
      data: { memberCount: { decrement: 1 } }
    })
    
    return reply.send({ message: '离开宗门成功', player })
  })
}
