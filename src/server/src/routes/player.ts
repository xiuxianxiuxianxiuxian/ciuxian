import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function playerRoutes(fastify: FastifyInstance) {
  
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        sect: true,
        mentor: true,
        mentees: true,
        bondPartner: true
      }
    })
    
    if (!player) {
      return reply.status(404).send({ error: '玩家不存在' })
    }
    
    return reply.send({ player })
  })
  
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    const updates = request.body as any
    
    const player = await prisma.player.update({
      where: { id },
      data: updates
    })
    
    return reply.send({ player })
  })
  
  fastify.get('/:id/skills', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    
    const skills = await prisma.skill.findMany({
      where: {
        level: { lte: 5 }
      }
    })
    
    return reply.send({ skills })
  })
  
  fastify.post('/:id/absorb-erosion', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    const { erosionType, amount } = request.body as any
    
    const player = await prisma.player.findUnique({ where: { id } })
    if (!player) {
      return reply.status(404).send({ error: '玩家不存在' })
    }
    
    const erosionField = `${erosionType.replace('-', '')}Erosion`
    const updateData: any = {}
    updateData[erosionField] = { increment: amount }
    
    const newPlayer = await prisma.player.update({
      where: { id },
      data: {
        ...updateData,
        erosionValue: {
          increment: amount * 0.1
        }
      }
    })
    
    return reply.send({
      message: '吞噬成功',
      player: newPlayer
    })
  })
}
