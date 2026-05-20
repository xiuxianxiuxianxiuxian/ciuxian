import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { calculateErosionValue, ErosionType } from '../../../shared/types/erosion'
import { getRealmByLevel, canBreakthrough, getNextRealm } from '../../../shared/types/realm'

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
  
  fastify.post('/:id/breakthrough', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    
    const player = await prisma.player.findUnique({ where: { id } })
    if (!player) {
      return reply.status(404).send({ error: '玩家不存在' })
    }
    
    const currentRealm = getRealmByLevel(player.level)
    
    if (!canBreakthrough(player.realmLevel, player.level)) {
      return reply.status(400).send({
        error: '尚未达到突破条件',
        currentLevel: player.level,
        requiredLevel: currentRealm.maxLevel,
        currentRealm: currentRealm.name
      })
    }
    
    const nextRealm = getNextRealm(player.realmLevel)
    if (!nextRealm) {
      return reply.status(400).send({ error: '已达到最高境界' })
    }
    
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        realmLevel: { increment: 1 },
        realmName: nextRealm.name
      }
    })
    
    return reply.send({
      message: `突破成功！晋升为 ${nextRealm.name}！`,
      player: updatedPlayer,
      newRealm: nextRealm.name,
      newAbilities: nextRealm.abilities,
      cost: nextRealm.cost
    })
  })
  
  fastify.post('/:id/become-mentor', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    const { menteeId } = request.body as any
    
    const mentor = await prisma.player.findUnique({ where: { id } })
    const mentee = await prisma.player.findUnique({ where: { id: menteeId } })
    
    if (!mentor || !mentee) {
      return reply.status(404).send({ error: '玩家不存在' })
    }
    
    if (mentee.mentorId) {
      return reply.status(400).send({ error: '该玩家已有师傅' })
    }
    
    if (mentor.id === mentee.id) {
      return reply.status(400).send({ error: '不能收自己为徒' })
    }
    
    const updatedMentee = await prisma.player.update({
      where: { id: menteeId },
      data: { mentorId: id }
    })
    
    return reply.send({
      message: '收徒成功！师徒共享异化抗性',
      mentor: mentor.username,
      mentee: updatedMentee.username
    })
  })
  
  fastify.post('/:id/accept-mentor', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    const { mentorId } = request.body as any
    
    const player = await prisma.player.findUnique({ where: { id } })
    const mentor = await prisma.player.findUnique({ where: { id: mentorId } })
    
    if (!player || !mentor) {
      return reply.status(404).send({ error: '玩家不存在' })
    }
    
    if (player.mentorId) {
      return reply.status(400).send({ error: '你已经有师傅了' })
    }
    
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: { mentorId }
    })
    
    return reply.send({
      message: `成功拜 ${mentor.username} 为师！获得异化抗性加成`,
      player: updatedPlayer
    })
  })
  
  fastify.get('/:id/mentees', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    
    const mentees = await prisma.player.findMany({
      where: { mentorId: id },
      select: { id: true, username: true, level: true, realmName: true }
    })
    
    return reply.send({ mentees })
  })
  
  fastify.post('/:id/revoke-mentor', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    
    const player = await prisma.player.findUnique({ where: { id } })
    if (!player) {
      return reply.status(404).send({ error: '玩家不存在' })
    }
    
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: { mentorId: null }
    })
    
    return reply.send({
      message: '已解除师徒关系',
      player: updatedPlayer
    })
  })
  
  fastify.post('/:id/bond', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    const { targetId } = request.body as any
    
    const player = await prisma.player.findUnique({ where: { id } })
    const target = await prisma.player.findUnique({ where: { id: targetId } })
    
    if (!player || !target) {
      return reply.status(404).send({ error: '玩家不存在' })
    }
    
    if (player.id === target.id) {
      return reply.status(400).send({ error: '不能与自己结缘' })
    }
    
    if (player.bondPartnerId) {
      return reply.status(400).send({ error: '你已经有结缘对象了' })
    }
    
    if (target.bondPartnerId) {
      return reply.status(400).send({ error: '对方已经有结缘对象了' })
    }
    
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: { bondPartnerId: targetId }
    })
    
    const updatedTarget = await prisma.player.update({
      where: { id: targetId },
      data: { bondPartnerId: id }
    })
    
    return reply.send({
      message: '结缘成功！双方战斗共享领域效果',
      player1: updatedPlayer.username,
      player2: updatedTarget.username
    })
  })
  
  fastify.post('/:id/unbond', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any
    
    const player = await prisma.player.findUnique({ where: { id } })
    if (!player) {
      return reply.status(404).send({ error: '玩家不存在' })
    }
    
    if (!player.bondPartnerId) {
      return reply.status(400).send({ error: '你没有结缘对象' })
    }
    
    const targetId = player.bondPartnerId
    
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: { bondPartnerId: null }
    })
    
    await prisma.player.update({
      where: { id: targetId },
      data: { bondPartnerId: null }
    })
    
    return reply.send({
      message: '已解除结缘',
      player: updatedPlayer
    })
  })
}
