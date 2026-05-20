import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function economyRoutes(fastify: FastifyInstance) {
  
  // 获取玩家背包
  fastify.get('/player/:playerId/inventory', async (request: FastifyRequest, reply: FastifyReply) => {
    const { playerId } = request.params as any
    
    const inventory = await prisma.playerInventoryItem.findMany({
      where: { playerId },
      include: { item: true }
    })
    
    return reply.send({ inventory })
  })
  
  // 给玩家添加物品
  fastify.post('/player/:playerId/inventory', async (request: FastifyRequest, reply: FastifyReply) => {
    const { playerId } = request.params as any
    const { itemId, quantity } = request.body as any
    
    const existingItem = await prisma.playerInventoryItem.findFirst({
      where: { playerId, itemId }
    })
    
    let inventoryItem
    if (existingItem) {
      inventoryItem = await prisma.playerInventoryItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity || 1 } },
        include: { item: true }
      })
    } else {
      inventoryItem = await prisma.playerInventoryItem.create({
        data: { playerId, itemId, quantity: quantity || 1 },
        include: { item: true }
      })
    }
    
    return reply.send({ inventoryItem })
  })
  
  // 从玩家背包移除物品
  fastify.delete('/player/:playerId/inventory/:itemId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { playerId, itemId } = request.params as any
    const { quantity } = request.body as any
    
    const existingItem = await prisma.playerInventoryItem.findFirst({
      where: { playerId, itemId }
    })
    
    if (!existingItem) {
      return reply.status(404).send({ error: '物品不存在' })
    }
    
    const removeQuantity = quantity || 1
    if (existingItem.quantity <= removeQuantity) {
      await prisma.playerInventoryItem.delete({
        where: { id: existingItem.id }
      })
    } else {
      await prisma.playerInventoryItem.update({
        where: { id: existingItem.id },
        data: { quantity: { decrement: removeQuantity } }
      })
    }
    
    return reply.send({ message: '物品已移除' })
  })
  
  // 装备/卸下物品
  fastify.put('/player/:playerId/inventory/:itemId/equip', async (request: FastifyRequest, reply: FastifyReply) => {
    const { playerId, itemId } = request.params as any
    const { equipped } = request.body as any
    
    const existingItem = await prisma.playerInventoryItem.findFirst({
      where: { playerId, itemId }
    })
    
    if (!existingItem) {
      return reply.status(404).send({ error: '物品不存在' })
    }
    
    const inventoryItem = await prisma.playerInventoryItem.update({
      where: { id: existingItem.id },
      data: { equipped },
      include: { item: true }
    })
    
    return reply.send({ inventoryItem })
  })
  
  // 获取市场列表
  fastify.get('/market', async (request: FastifyRequest, reply: FastifyReply) => {
    const listings = await prisma.marketListing.findMany({
      where: { active: true },
      include: { item: true, seller: true },
      orderBy: { createdAt: 'desc' }
    })
    
    return reply.send({ listings })
  })
  
  // 创建市场列表
  fastify.post('/market', async (request: FastifyRequest, reply: FastifyReply) => {
    const { sellerId, itemId, quantity, price } = request.body as any
    
    const inventoryItem = await prisma.playerInventoryItem.findFirst({
      where: { playerId: sellerId, itemId }
    })
    
    if (!inventoryItem || inventoryItem.quantity < quantity) {
      return reply.status(400).send({ error: '背包物品不足' })
    }
    
    const listing = await prisma.marketListing.create({
      data: { sellerId, itemId, quantity, price },
      include: { item: true, seller: true }
    })
    
    await prisma.playerInventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantity: { decrement: quantity } }
    })
    
    return reply.send({ listing })
  })
  
  // 购买市场物品
  fastify.post('/market/:listingId/buy', async (request: FastifyRequest, reply: FastifyReply) => {
    const { listingId } = request.params as any
    const { buyerId } = request.body as any
    
    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId },
      include: { item: true, seller: true }
    })
    
    if (!listing || !listing.active) {
      return reply.status(400).send({ error: '商品不可购买' })
    }
    
    const buyer = await prisma.player.findUnique({ where: { id: buyerId } })
    if (!buyer) {
      return reply.status(404).send({ error: '买家不存在' })
    }
    
    if (buyer.gold < listing.price) {
      return reply.status(400).send({ error: '金币不足' })
    }
    
    const buyerInventoryItem = await prisma.playerInventoryItem.findFirst({
      where: { playerId: buyerId, itemId: listing.itemId }
    })
    
    if (buyerInventoryItem) {
      await prisma.playerInventoryItem.update({
        where: { id: buyerInventoryItem.id },
        data: { quantity: { increment: listing.quantity } }
      })
    } else {
      await prisma.playerInventoryItem.create({
        data: { playerId: buyerId, itemId: listing.itemId, quantity: listing.quantity }
      })
    }
    
    await prisma.player.update({
      where: { id: buyerId },
      data: { gold: { decrement: listing.price } }
    })
    
    await prisma.player.update({
      where: { id: listing.sellerId },
      data: { gold: { increment: listing.price } }
    })
    
    await prisma.marketListing.update({
      where: { id: listingId },
      data: { active: false, buyerId, soldAt: new Date() }
    })
    
    return reply.send({ message: '购买成功' })
  })
  
  // 取消市场列表
  fastify.delete('/market/:listingId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { listingId } = request.params as any
    const { sellerId } = request.body as any
    
    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId }
    })
    
    if (!listing || listing.sellerId !== sellerId || !listing.active) {
      return reply.status(400).send({ error: '商品不可取消' })
    }
    
    const sellerInventoryItem = await prisma.playerInventoryItem.findFirst({
      where: { playerId: sellerId, itemId: listing.itemId }
    })
    
    if (sellerInventoryItem) {
      await prisma.playerInventoryItem.update({
        where: { id: sellerInventoryItem.id },
        data: { quantity: { increment: listing.quantity } }
      })
    } else {
      await prisma.playerInventoryItem.create({
        data: { playerId: sellerId, itemId: listing.itemId, quantity: listing.quantity }
      })
    }
    
    await prisma.marketListing.update({
      where: { id: listingId },
      data: { active: false }
    })
    
    return reply.send({ message: '商品已下架' })
  })
  
  // 获取所有制造配方
  fastify.get('/crafting/recipes', async (request: FastifyRequest, reply: FastifyReply) => {
    const recipes = await prisma.craftingRecipe.findMany({
      include: { 
        result: true,
        ingredient1: true,
        ingredient2: true,
        ingredient3: true
      }
    })
    
    return reply.send({ recipes })
  })
  
  // 制造物品
  fastify.post('/crafting/craft', async (request: FastifyRequest, reply: FastifyReply) => {
    const { playerId, recipeId, quantity } = request.body as any
    
    const recipe = await prisma.craftingRecipe.findUnique({
      where: { id: recipeId },
      include: { 
        result: true,
        ingredient1: true,
        ingredient2: true,
        ingredient3: true
      }
    })
    
    if (!recipe) {
      return reply.status(404).send({ error: '配方不存在' })
    }
    
    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player) {
      return reply.status(404).send({ error: '玩家不存在' })
    }
    
    if (player.level < recipe.levelRequired) {
      return reply.status(400).send({ error: '等级不足' })
    }
    
    if (player.gold < recipe.cost * quantity) {
      return reply.status(400).send({ error: '金币不足' })
    }
    
    const ingredients = [
      recipe.ingredient1Id ? { id: recipe.ingredient1Id, quantity: recipe.ingredient1Quantity * quantity } : null,
      recipe.ingredient2Id ? { id: recipe.ingredient2Id, quantity: recipe.ingredient2Quantity * quantity } : null,
      recipe.ingredient3Id ? { id: recipe.ingredient3Id, quantity: recipe.ingredient3Quantity * quantity } : null
    ].filter(Boolean) as { id: string; quantity: number }[]
    
    for (const ingredient of ingredients) {
      const inventoryItem = await prisma.playerInventoryItem.findFirst({
        where: { playerId, itemId: ingredient.id }
      })
      
      if (!inventoryItem || inventoryItem.quantity < ingredient.quantity) {
        return reply.status(400).send({ error: '材料不足' })
      }
    }
    
    for (const ingredient of ingredients) {
      const inventoryItem = await prisma.playerInventoryItem.findFirst({
        where: { playerId, itemId: ingredient.id }
      })
      
      if (inventoryItem) {
        if (inventoryItem.quantity <= ingredient.quantity) {
          await prisma.playerInventoryItem.delete({
            where: { id: inventoryItem.id }
          })
        } else {
          await prisma.playerInventoryItem.update({
            where: { id: inventoryItem.id },
            data: { quantity: { decrement: ingredient.quantity } }
          })
        }
      }
    }
    
    await prisma.player.update({
      where: { id: playerId },
      data: { gold: { decrement: recipe.cost * quantity } }
    })
    
    const existingResultItem = await prisma.playerInventoryItem.findFirst({
      where: { playerId, itemId: recipe.resultId }
    })
    
    if (existingResultItem) {
      await prisma.playerInventoryItem.update({
        where: { id: existingResultItem.id },
        data: { quantity: { increment: quantity } }
      })
    } else {
      await prisma.playerInventoryItem.create({
        data: { playerId, itemId: recipe.resultId, quantity }
      })
    }
    
    await prisma.craftingRecord.create({
      data: {
        playerId,
        recipeId,
        resultId: recipe.resultId,
        quantity
      }
    })
    
    return reply.send({ 
      message: '制造成功', 
      resultItem: recipe.result, 
      quantity 
    })
  })
  
  // 获取所有物品
  fastify.get('/items', async (request: FastifyRequest, reply: FastifyReply) => {
    const items = await prisma.item.findMany({
      orderBy: { rarity: 'asc' }
    })
    
    return reply.send({ items })
  })
  
  // 获取单个物品
  fastify.get('/items/:itemId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { itemId } = request.params as any
    
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })
    
    if (!item) {
      return reply.status(404).send({ error: '物品不存在' })
    }
    
    return reply.send({ item })
  })
}
