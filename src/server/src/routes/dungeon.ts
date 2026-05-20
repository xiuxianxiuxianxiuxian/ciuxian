import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DUNGEONS = [
  {
    id: 'dungeon-1',
    name: '残烬废墟',
    description: '概念神尸体外层的废墟，充满了灰蚀能量',
    erosionType: '灰蚀',
    minLevel: 1,
    maxLevel: 10,
    recommendedPlayers: 1,
    rewards: {
      experience: 100,
      gold: 50,
      items: ['蚀熵晶核', '灰蚀碎片']
    },
    enemies: [
      { name: '灰烬亡灵', health: 50, attack: 10, defense: 5 },
      { name: '腐蚀魔像', health: 80, attack: 15, defense: 10 }
    ]
  },
  {
    id: 'dungeon-2',
    name: '猩红深渊',
    description: '内层界的杀戮之地，猩蚀能量肆虐',
    erosionType: '猩蚀',
    minLevel: 10,
    maxLevel: 30,
    recommendedPlayers: 2,
    rewards: {
      experience: 300,
      gold: 150,
      items: ['蚀熵晶核', '猩红结晶']
    },
    enemies: [
      { name: '血色猎手', health: 100, attack: 25, defense: 15 },
      { name: '痛苦聚合体', health: 150, attack: 30, defense: 20 },
      { name: '疯狂领主', health: 300, attack: 40, defense: 25 }
    ]
  },
  {
    id: 'dungeon-3',
    name: '时空裂隙',
    description: '概念神尸体的时空扭曲区域',
    erosionType: '苍白之蚀',
    minLevel: 30,
    maxLevel: 60,
    recommendedPlayers: 3,
    rewards: {
      experience: 800,
      gold: 400,
      items: ['蚀熵晶核', '苍白尘沙', '蚀魂护符']
    },
    enemies: [
      { name: '时空幻影', health: 180, attack: 45, defense: 30 },
      { name: '扭曲畸变体', health: 250, attack: 50, defense: 35 },
      { name: '裂隙守护者', health: 500, attack: 60, defense: 40 }
    ]
  },
  {
    id: 'dungeon-4',
    name: '深黯虚空',
    description: '概念神尸体的核心区域，宇宙之外的低语在此回响',
    erosionType: '深黯之蚀',
    minLevel: 60,
    maxLevel: 100,
    recommendedPlayers: 4,
    rewards: {
      experience: 2000,
      gold: 1000,
      items: ['蚀熵晶核', '深黯精华', '异化稳定剂']
    },
    enemies: [
      { name: '虚空使者', health: 350, attack: 70, defense: 45 },
      { name: '深渊领主', health: 600, attack: 80, defense: 55 },
      { name: '概念残响', health: 1000, attack: 100, defense: 70 }
    ]
  }
]

let activeRuns = new Map()

export async function dungeonRoutes(fastify: FastifyInstance) {
  
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ dungeons: DUNGEONS })
  })

  fastify.get('/:dungeonId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { dungeonId } = request.params as any
    const dungeon = DUNGEONS.find(d => d.id === dungeonId)
    
    if (!dungeon) {
      return reply.status(404).send({ error: '副本不存在' })
    }
    
    return reply.send({ dungeon })
  })

  fastify.post('/:dungeonId/start', async (request: FastifyRequest, reply: FastifyReply) => {
    const { dungeonId } = request.params as any
    const { playerId, partyMembers } = request.body as any
    
    const dungeon = DUNGEONS.find(d => d.id === dungeonId)
    if (!dungeon) {
      return reply.status(404).send({ error: '副本不存在' })
    }
    
    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player) {
      return reply.status(404).send({ error: '玩家不存在' })
    }
    
    if (player.level < dungeon.minLevel) {
      return reply.status(400).send({ 
        error: `等级不足，需要至少 ${dungeon.minLevel} 级` 
      })
    }
    
    const runId = `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const party = [playerId, ...(partyMembers || [])]
    const enemies = dungeon.enemies.map((enemy, index) => ({
      ...enemy,
      id: `enemy-${index}`,
      currentHealth: enemy.health
    }))
    
    const dungeonRun = {
      id: runId,
      dungeonId,
      dungeonName: dungeon.name,
      party,
      enemies,
      currentWave: 0,
      completed: false,
      startTime: new Date()
    }
    
    activeRuns.set(runId, dungeonRun)
    
    return reply.send({
      message: '副本已开始',
      runId,
      dungeon,
      enemies
    })
  })

  fastify.post('/:dungeonId/:runId/attack', async (request: FastifyRequest, reply: FastifyReply) => {
    const { dungeonId, runId } = request.params as any
    const { playerId, targetId, damage } = request.body as any
    
    const dungeonRun = activeRuns.get(runId)
    if (!dungeonRun) {
      return reply.status(404).send({ error: '副本不存在或已结束' })
    }
    
    if (!dungeonRun.party.includes(playerId)) {
      return reply.status(400).send({ error: '你不在这个副本中' })
    }
    
    const target = dungeonRun.enemies.find((e: any) => e.id === targetId)
    if (!target) {
      return reply.status(404).send({ error: '目标不存在' })
    }
    
    target.currentHealth -= damage
    
    if (target.currentHealth <= 0) {
      dungeonRun.enemies = dungeonRun.enemies.filter((e: any) => e.id !== targetId)
    }
    
    const allEnemiesDefeated = dungeonRun.enemies.length === 0
    
    if (allEnemiesDefeated) {
      dungeonRun.completed = true
      activeRuns.delete(runId)
      
      const dungeon = DUNGEONS.find(d => d.id === dungeonId)
      if (!dungeon) {
        return reply.status(404).send({ error: '副本不存在' })
      }
      
      const player = await prisma.player.findUnique({ where: { id: playerId } })
      if (player) {
        await prisma.player.update({
          where: { id: playerId },
          data: {
            experience: { increment: dungeon.rewards.experience },
            gold: { increment: dungeon.rewards.gold }
          }
        })
      }
      
      return reply.send({
        message: '副本完成！',
        completed: true,
        rewards: dungeon.rewards
      })
    }
    
    const enemyAttack = dungeonRun.enemies[0]
    if (enemyAttack) {
      return reply.send({
        message: '攻击成功',
        target,
        enemies: dungeonRun.enemies,
        enemyAttack: {
          damage: enemyAttack.attack,
          attacker: enemyAttack.name
        }
      })
    }
    
    return reply.send({
      message: '攻击成功',
      target,
      enemies: dungeonRun.enemies
    })
  })

  fastify.post('/:dungeonId/:runId/leave', async (request: FastifyRequest, reply: FastifyReply) => {
    const { runId } = request.params as any
    const { playerId } = request.body as any
    
    const dungeonRun = activeRuns.get(runId)
    if (!dungeonRun) {
      return reply.status(404).send({ error: '副本不存在' })
    }
    
    if (!dungeonRun.party.includes(playerId)) {
      return reply.status(400).send({ error: '你不在这个副本中' })
    }
    
    if (dungeonRun.party.length === 1) {
      activeRuns.delete(runId)
    } else {
      dungeonRun.party = dungeonRun.party.filter((id: string) => id !== playerId)
    }
    
    return reply.send({ message: '已离开副本' })
  })

  fastify.get('/:dungeonId/:runId/status', async (request: FastifyRequest, reply: FastifyReply) => {
    const { runId } = request.params as any
    
    const dungeonRun = activeRuns.get(runId)
    if (!dungeonRun) {
      return reply.status(404).send({ error: '副本不存在或已结束' })
    }
    
    return reply.send({ dungeonRun })
  })
}
