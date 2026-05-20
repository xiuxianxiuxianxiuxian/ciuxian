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

  console.log('Database seeded successfully!')
  console.log(`Created ${sects.length} sects and ${skills.length} skills`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
