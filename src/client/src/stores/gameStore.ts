import { create } from 'zustand'

export interface Player {
  id: string
  username: string
  level: number
  realmLevel: number
  realmName: string
  classType: string
  erosionValue: number
  health: number
  maxHealth: number
  attack: number
  defense: number
  speed: number
  sectId?: string
}

interface Sect {
  id: string
  name: string
  type: string
  level: number
  memberCount: number
}

interface Skill {
  id: string
  name: string
  description: string
  type: string
  erosionType: string
  level: number
  damage: number
  cooldown: number
}

interface GameState {
  player: Player | null
  currentSect: Sect | null
  skills: Skill[]
  inBattle: boolean
  currentBattleId: string | null
  
  setPlayer: (player: Player | null) => void
  updatePlayer: (updates: Partial<Player>) => void
  setCurrentSect: (sect: Sect | null) => void
  setSkills: (skills: Skill[]) => void
  enterBattle: (battleId: string) => void
  exitBattle: () => void
  addErosion: (amount: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  player: null,
  currentSect: null,
  skills: [],
  inBattle: false,
  currentBattleId: null,
  
  setPlayer: (player) => {
    if (player) {
      localStorage.setItem('devour-realm-player', JSON.stringify(player))
    } else {
      localStorage.removeItem('devour-realm-player')
    }
    set({ player })
  },
  
  updatePlayer: (updates) => set((state) => ({
    player: state.player ? { ...state.player, ...updates } : null
  })),
  
  setCurrentSect: (sect) => set({ currentSect: sect }),
  
  setSkills: (skills) => set({ skills }),
  
  enterBattle: (battleId) => set({ inBattle: true, currentBattleId: battleId }),
  
  exitBattle: () => set({ inBattle: false, currentBattleId: null }),
  
  addErosion: (amount) => set((state) => ({
    player: state.player ? {
      ...state.player,
      erosionValue: Math.min(100, state.player.erosionValue + amount)
    } : null
  }))
}))
