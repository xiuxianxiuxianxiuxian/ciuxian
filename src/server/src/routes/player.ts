import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { calculateErosionValue, ErosionType } from '../../../shared/types/erosion'

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
    
    const erosionFieldMap: Record<ErosionType, string> = {
      gray: 'grayErosion',
      crimson: 'crimsonErosion',
      pale: 'paleErosion',
      dark: 'darkErosion'
    }
    
    const field = erosionFieldMap[erosionType as ErosionType]
    if (!field) {
      return reply.status(400).send({ error: '无效的蚀熵类型' })
    }
    
    const updateData: any = {}
    updateData[field] = { increment: amount }
    
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: updateData
    })
    
    const totalErosionValue = calculateErosionValue({
      grayErosion: updatedPlayer.grayErosion,
      crimsonErosion: updatedPlayer.crimsonErosion,
      paleErosion: updatedPlayer.paleErosion,
      darkErosion: updatedPlayer.darkErosion
    })
    
    const finalPlayer = await prisma.player.update({
      where: { id },
      data: {
        erosionValue: totalErosionValue
      }
    })
    
    if (totalErosionValue >= 100) {
      return reply.send({
        message: '吞噬成功！但你已经彻底异化！',
        player: finalPlayer,
        fullyAlienated: true
      })
    }
    
    return reply.send({
      message: '吞噬成功',
      player: finalPlayer
    })
  })
}
