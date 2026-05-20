import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { playerRoutes } from './routes/player'
import { sectRoutes } from './routes/sect'
import { authRoutes } from './routes/auth'
import { economyRoutes } from './routes/economy'
import { dungeonRoutes } from './routes/dungeon'
import { setupSocketIO } from './socket'

const fastify = Fastify({
  logger: true
})

await fastify.register(cors, {
  origin: true
})

await fastify.register(websocket)

fastify.register(authRoutes, { prefix: '/api/auth' })
fastify.register(playerRoutes, { prefix: '/api/players' })
fastify.register(sectRoutes, { prefix: '/api/sects' })
fastify.register(economyRoutes, { prefix: '/api/economy' })
fastify.register(dungeonRoutes, { prefix: '/api/dungeons' })

setupSocketIO(fastify)

const start = async () => {
  try {
    await fastify.listen({ port: 4000 })
    console.log('Server running at http://localhost:4000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
