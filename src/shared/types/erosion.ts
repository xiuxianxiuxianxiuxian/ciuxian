export type ErosionType = 'gray' | 'crimson' | 'pale' | 'dark'

export interface ErosionState {
  grayErosion: number
  crimsonErosion: number
  paleErosion: number
  darkErosion: number
  totalErosion: number
  erosionValue: number
}

export interface ErosionConfig {
  gray: {
    name: string
    source: string
    power: string
    risk: string
  }
  crimson: {
    name: string
    source: string
    power: string
    risk: string
  }
  pale: {
    name: string
    source: string
    power: string
    risk: string
  }
  dark: {
    name: string
    source: string
    power: string
    risk: string
  }
}

export const EROSION_CONFIG: ErosionConfig = {
  gray: {
    name: '灰蚀',
    source: '死亡、衰败、遗忘等残渣',
    power: '腐蚀、衰老、即死诅咒',
    risk: '活尸化'
  },
  crimson: {
    name: '猩蚀',
    source: '杀戮、痛苦、恐惧等残响',
    power: '狂暴、嗜血、战斗力飙升',
    risk: '理智丧失'
  },
  pale: {
    name: '苍白之蚀',
    source: '扭曲的时空残片',
    power: '预知、扭曲、因果逆反',
    risk: '时间放逐'
  },
  dark: {
    name: '深黯之蚀',
    source: '宇宙之外的未知低语',
    power: '精神操控、召唤异物',
    risk: '成为容器'
  }
}

export function calculateErosionValue(erosions: Omit<ErosionState, 'totalErosion' | 'erosionValue'>): number {
  const totalErosion = 
    erosions.grayErosion +
    erosions.crimsonErosion +
    erosions.paleErosion +
    erosions.darkErosion
  
  return Math.min(100, totalErosion * 0.1)
}

export function getErosionRiskLevel(erosionValue: number): string {
  if (erosionValue < 25) return '安全'
  if (erosionValue < 50) return '轻度异化'
  if (erosionValue < 75) return '中度异化'
  if (erosionValue < 100) return '重度异化'
  return '彻底异化'
}
