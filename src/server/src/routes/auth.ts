import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function authRoutes(fastify: FastifyInstance) {
  
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, email, password } = request.body as any
    
    const existingUser = await prisma.player.findFirst({
      where: { OR: [{ username }, { email }] }
    })
    
    if (existingUser) {
      return reply.status(400).send({ error: '用户名或邮箱已存在' })
    }
    
    const passwordHash = await bcrypt.hash(password, 10)
    
    const player = await prisma.player.create({
      data: {
        username,
        email,
        passwordHash,
        level: 1,
        realmLevel: 1,
        realmName: '蚀感',
        erosionValue: 5.0,
        classType: '吞蚀者'
      }
    })
    
    return reply.send({
      message: '注册成功',
      player: {
        id: player.id,
        username: player.username,
        level: player.level,
        realmLevel: player.realmLevel,
        realmName: player.realmName
      }
    })
  })
  
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, password } = request.body as any
    
    const player = await prisma.player.findUnique({
      where: { username }
    })
    
    if (!player) {
      return reply.status(401).send({ error: '用户不存在' })
    }
    
    const validPassword = await bcrypt.compare(password, player.passwordHash)
    
    if (!validPassword) {
      return reply.status(401).send({ error: '密码错误' })
    }
    
    return reply.send({
      message: '登录成功',
      player: {
        id: player.id,
        username: player.username,
        level: player.level,
        realmLevel: player.realmLevel,
        realmName: player.realmName,
        classType: player.classType,
        erosionValue: player.erosionValue
      }
    })
  })
}
