import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const sects = await Promise.all([
    prisma.sect.create({
      data: {
        name: '残烬殿',
        type: '灰蚀',
        level: 1
      }
    }),
    prisma.sect.create({
      data: {
        name: '血渊阁',
        type: '猩蚀',
        level: 1
      }
    }),
    prisma.sect.create({
      data: {
        name: '虚痕宗',
        type: '苍白之蚀',
        level: 1
      }
    }),
    prisma.sect.create({
      data: {
        name: '低语教',
        type: '深黯之蚀',
        level: 1
      }
    })
  ])

  const skills = await Promise.all([
    prisma.skill.create({
      data: {
        name: '灰蚀冲击',
        description: '释放灰蚀能量，对敌人造成腐蚀伤害',
        type: '蚀熵技能',
        erosionType: '灰蚀',
        level: 1,
        damage: 20,
        cooldown: 5
      }
    }),
    prisma.skill.create({
      data: {
        name: '猩红撕裂',
        description: '猩蚀爆发，造成大量伤害但降低理智',
        type: '蚀熵技能',
        erosionType: '猩蚀',
        level: 1,
        damage: 35,
        cooldown: 8
      }
    })
  ])

  const items = await Promise.all([
    prisma.item.create({
      data: {
        name: '蚀熵晶核',
        description: '蕴含蚀熵能量的晶核，是制造和交易的基础材料',
        type: '材料',
        rarity: '普通',
        value: 10
      }
    }),
    prisma.item.create({
      data: {
        name: '灰蚀碎片',
        description: '灰蚀侵蚀的碎片，可用于制造腐蚀类装备',
        type: '材料',
        rarity: '普通',
        value: 15
      }
    }),
    prisma.item.create({
      data: {
        name: '猩红结晶',
        description: '猩红能量的凝结，可用于制造攻击类装备',
        type: '材料',
        rarity: '稀有',
        value: 30
      }
    }),
    prisma.item.create({
      data: {
        name: '苍白尘沙',
        description: '时空扭曲产生的奇特物质，可用于制造辅助类物品',
        type: '材料',
        rarity: '稀有',
        value: 40
      }
    }),
    prisma.item.create({
      data: {
        name: '深黯精华',
        description: '来自宇宙之外的神秘能量，可用于制造强大装备',
        type: '材料',
        rarity: '传说',
        value: 80
      }
    }),
    prisma.item.create({
      data: {
        name: '血肉之刃',
        description: '吞蚀者的初级武器，攻击力+15',
        type: '武器',
        rarity: '普通',
        value: 50,
        effect: { attack: 15 }
      }
    }),
    prisma.item.create({
      data: {
        name: '腐蚀之衣',
        description: '灰蚀能量编织的防具，防御力+10',
        type: '防具',
        rarity: '普通',
        value: 45,
        effect: { defense: 10 }
      }
    }),
    prisma.item.create({
      data: {
        name: '蚀魂护符',
        description: '保护精神的护符，异化抗性+5%',
        type: '饰品',
        rarity: '稀有',
        value: 70,
        effect: { erosionResistance: 5 }
      }
    }),
    prisma.item.create({
      data: {
        name: '生命回复药',
        description: '恢复30点生命值',
        type: '消耗品',
        rarity: '普通',
        value: 20,
        effect: { heal: 30 }
      }
    }),
    prisma.item.create({
      data: {
        name: '异化稳定剂',
        description: '降低10%异化值',
        type: '消耗品',
        rarity: '稀有',
        value: 35,
        effect: { reduceErosion: 10 }
      }
    })
  ])

  const recipes = await Promise.all([
    prisma.craftingRecipe.create({
      data: {
        name: '血肉之刃',
        description: '将蚀熵晶核和灰蚀碎片融合，制造一把强大的武器',
        resultId: items[5].id,
        ingredient1Id: items[0].id,
        ingredient1Quantity: 3,
        ingredient2Id: items[1].id,
        ingredient2Quantity: 2,
        levelRequired: 1,
        cost: 20
      }
    }),
    prisma.craftingRecipe.create({
      data: {
        name: '腐蚀之衣',
        description: '用灰蚀碎片和蚀熵晶核编织的防具',
        resultId: items[6].id,
        ingredient1Id: items[0].id,
        ingredient1Quantity: 2,
        ingredient2Id: items[1].id,
        ingredient2Quantity: 3,
        levelRequired: 1,
        cost: 25
      }
    }),
    prisma.craftingRecipe.create({
      data: {
        name: '蚀魂护符',
        description: '融合苍白尘沙和深黯精华的神秘护符',
        resultId: items[7].id,
        ingredient1Id: items[3].id,
        ingredient1Quantity: 2,
        ingredient2Id: items[4].id,
        ingredient2Quantity: 1,
        levelRequired: 5,
        cost: 50
      }
    }),
    prisma.craftingRecipe.create({
      data: {
        name: '生命回复药',
        description: '简单但实用的回复药剂',
        resultId: items[8].id,
        ingredient1Id: items[0].id,
        ingredient1Quantity: 1,
        levelRequired: 1,
        cost: 10
      }
    }),
    prisma.craftingRecipe.create({
      data: {
        name: '异化稳定剂',
        description: '珍贵的药剂，可以降低异化值',
        resultId: items[9].id,
        ingredient1Id: items[3].id,
        ingredient1Quantity: 1,
        ingredient2Id: items[4].id,
        ingredient2Quantity: 1,
        levelRequired: 3,
        cost: 30
      }
    })
  ])

  console.log('Database seeded successfully!')
  console.log(`Created ${sects.length} sects, ${skills.length} skills, ${items.length} items, ${recipes.length} recipes`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
