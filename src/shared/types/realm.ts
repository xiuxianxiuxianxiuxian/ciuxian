export interface RealmLevel {
  level: number
  name: string
  minLevel: number
  maxLevel: number
  abilities: string[]
  cost?: string
}

export const REALM_SYSTEM: RealmLevel[] = [
  {
    level: 1,
    name: '蚀感',
    minLevel: 1,
    maxLevel: 20,
    abilities: ['感知蚀熵', '蚀感视觉']
  },
  {
    level: 2,
    name: '蚀刻',
    minLevel: 21,
    maxLevel: 50,
    abilities: ['刻下法则铭文', '获得主动技能'],
    cost: '选择职业流派（不可逆）'
  },
  {
    level: 3,
    name: '蚀骨',
    minLevel: 51,
    maxLevel: 90,
    abilities: ['骨骼法则化', '解锁终极技能树'],
    cost: '献祭一种情感'
  },
  {
    level: 4,
    name: '蚀脏',
    minLevel: 91,
    maxLevel: 140,
    abilities: ['内脏异化为法则器官']
  },
  {
    level: 5,
    name: '蚀魂',
    minLevel: 141,
    maxLevel: 200,
    abilities: ['获得领域能力'],
    cost: '献祭记忆'
  },
  {
    level: 6,
    name: '蚀名',
    minLevel: 201,
    maxLevel: 260,
    abilities: ['成为模因污染'],
    cost: '献祭真名'
  },
  {
    level: 7,
    name: '蚀道',
    minLevel: 261,
    maxLevel: 300,
    abilities: ['补完残缺天道', '形成绝对法则领域'],
    cost: '吞噬同境修士或BOSS'
  },
  {
    level: 8,
    name: '蚀律',
    minLevel: 301,
    maxLevel: 400,
    abilities: ['纂改现实']
  },
  {
    level: 9,
    name: '蚀源',
    minLevel: 401,
    maxLevel: 550,
    abilities: ['触及蚀熵源头', '解锁内层界']
  },
  {
    level: 10,
    name: '蚀我',
    minLevel: 551,
    maxLevel: 700,
    abilities: ['自我纂改']
  },
  {
    level: 11,
    name: '蚀轮回',
    minLevel: 701,
    maxLevel: 900,
    abilities: ['概念播种', '创建独立副本']
  },
  {
    level: 12,
    name: '蚀尽',
    minLevel: 901,
    maxLevel: 1000,
    abilities: ['循环抉择'],
    cost: '坍缩/飞升/寂灭'
  }
]

export function getRealmByLevel(level: number): RealmLevel {
  const realm = REALM_SYSTEM.find(
    r => level >= r.minLevel && level <= r.maxLevel
  )
  return realm || REALM_SYSTEM[REALM_SYSTEM.length - 1]
}

export function canBreakthrough(currentRealm: number, currentLevel: number): boolean {
  const realm = getRealmByLevel(currentLevel)
  return currentLevel >= realm.maxLevel && currentRealm < REALM_SYSTEM.length
}

export function getNextRealm(currentRealm: number): RealmLevel | null {
  const nextIndex = currentRealm
  if (nextIndex >= REALM_SYSTEM.length) {
    return null
  }
  return REALM_SYSTEM[nextIndex]
}
