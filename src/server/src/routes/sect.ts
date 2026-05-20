import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface LawNode {
  id: string
  name: string
  erosionType: string
  bonus: {
    [key: string]: number
  }
  ownerId: string | null
}

const LAW_NODES: LawNode[] = [
  { id: 'node-1', name: '蚀熵泉眼', erosionType: 'gray', bonus: { erosionResistance: 10 }, ownerId: null },
  { id: 'node-2', name: '猩红祭坛', erosionType: 'crimson', bonus: { attack: 15 }, ownerId: null },
  { id: 'node-3', name: '时空裂隙', erosionType: 'pale', bonus: { speed: 20 }, ownerId: null },
  { id: 'node-4', name: '深渊之门', erosionType: 'dark', bonus: { maxHealth: 25 }, ownerId: null },
  { id: 'node-5', name: '法则核心', erosionType: 'gray', bonus: { allStats: 10 }, ownerId: null },
  { id: 'node-6', name: '血月祭坛', erosionType: 'crimson', bonus: { criticalRate: 15 }, ownerId: null },
]

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
  
  fastify.get('/law-nodes', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ nodes: LAW_NODES })
  })
  
  fastify.post('/:sectId/claim-node', async (request: FastifyRequest, reply: FastifyReply) => {
    const { sectId } = request.params as any
    const { nodeId } = request.body as any
    
    const node = LAW_NODES.find(n => n.id === nodeId)
    if (!node) {
      return reply.status(404).send({ error: '法则节点不存在' })
    }
    
    if (node.ownerId && node.ownerId !== sectId) {
      return reply.status(400).send({ error: '该节点已被其他宗门占领' })
    }
    
    node.ownerId = sectId
    
    return reply.send({
      message: `成功占领法则节点: ${node.name}`,
      node,
      bonus: node.bonus
    })
  })
  
  fastify.post('/:sectId/capture-node', async (request: FastifyRequest, reply: FastifyReply) => {
    const { sectId } = request.params as any
    const { nodeId, attackerCount } = request.body as any
    
    const node = LAW_NODES.find(n => n.id === nodeId)
    if (!node) {
      return reply.status(404).send({ error: '法则节点不存在' })
    }
    
    if (!node.ownerId) {
      return reply.status(400).send({ error: '该节点无人占领，直接占领即可' })
    }
    
    if (node.ownerId === sectId) {
      return reply.status(400).send({ error: '这是你们宗门的节点' })
    }
    
    const defenderSect = await prisma.sect.findUnique({ where: { id: node.ownerId } })
    if (!defenderSect) {
      return reply.status(404).send({ error: '防守宗门不存在' })
    }
    
    const defenderPower = defenderSect.memberCount * 10
    const attackerPower = attackerCount * 15
    
    if (attackerPower > defenderPower) {
      node.ownerId = sectId
      
      return reply.send({
        message: `成功夺取法则节点: ${node.name}`,
        node,
        bonus: node.bonus,
        battleResult: {
          attackerPower,
          defenderPower,
          victory: true
        }
      })
    } else {
      return reply.send({
        message: '进攻失败！敌方防守成功',
        battleResult: {
          attackerPower,
          defenderPower,
          victory: false
        }
      })
    }
  })
  
  fastify.get('/:sectId/war-status', async (request: FastifyRequest, reply: FastifyReply) => {
    const { sectId } = request.params as any
    
    const sect = await prisma.sect.findUnique({ where: { id: sectId } })
    if (!sect) {
      return reply.status(404).send({ error: '宗门不存在' })
    }
    
    const ownedNodes = LAW_NODES.filter(n => n.ownerId === sectId)
    
    let totalBonus: { [key: string]: number } = {}
    ownedNodes.forEach(node => {
      Object.entries(node.bonus).forEach(([key, value]) => {
        totalBonus[key] = (totalBonus[key] || 0) + value
      })
    })
    
    return reply.send({
      sect: sect.name,
      ownedNodes,
      totalBonus,
      nodeCount: ownedNodes.length
    })
  })
  
  fastify.post('/:sectId/upgrade', async (request: FastifyRequest, reply: FastifyReply) => {
    const { sectId } = request.params as any
    
    const sect = await prisma.sect.findUnique({ where: { id: sectId } })
    if (!sect) {
      return reply.status(404).send({ error: '宗门不存在' })
    }
    
    if (sect.level >= 10) {
      return reply.status(400).send({ error: '宗门已达到最高等级' })
    }
    
    const upgradeCost = sect.level * 100
    
    const updatedSect = await prisma.sect.update({
      where: { id: sectId },
      data: { level: { increment: 1 } }
    })
    
    return reply.send({
      message: `宗门升级成功！当前等级: ${updatedSect.level}`,
      sect: updatedSect
    })
  })
}
