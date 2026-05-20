const API_BASE = 'http://localhost:4000/api'

interface ApiResponse<T> {
  data?: T
  error?: string
}

interface AuthResponse {
  message: string
  player: any
}

interface PlayerResponse {
  player: any
}

interface SkillsResponse {
  skills: any[]
}

interface SectsResponse {
  sects: any[]
}

interface SectResponse {
  sect: any
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json()
  
  if (!response.ok) {
    return { error: data.error || '请求失败' }
  }
  
  return { data }
}

export const api = {
  auth: {
    register: async (username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      return handleResponse<AuthResponse>(response)
    },
    
    login: async (username: string, password: string): Promise<ApiResponse<AuthResponse>> => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      return handleResponse<AuthResponse>(response)
    }
  },
  
  player: {
    getById: async (id: string): Promise<ApiResponse<PlayerResponse>> => {
      const response = await fetch(`${API_BASE}/players/${id}`)
      return handleResponse<PlayerResponse>(response)
    },
    
    update: async (id: string, updates: any): Promise<ApiResponse<PlayerResponse>> => {
      const response = await fetch(`${API_BASE}/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      return handleResponse<PlayerResponse>(response)
    },
    
    getSkills: async (id: string): Promise<ApiResponse<SkillsResponse>> => {
      const response = await fetch(`${API_BASE}/players/${id}/skills`)
      return handleResponse<SkillsResponse>(response)
    },
    
    absorbErosion: async (id: string, erosionType: string, amount: number): Promise<ApiResponse<PlayerResponse>> => {
      const response = await fetch(`${API_BASE}/players/${id}/absorb-erosion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ erosionType, amount })
      })
      return handleResponse<PlayerResponse>(response)
    },
    
    breakthrough: async (id: string): Promise<ApiResponse<PlayerResponse & { message: string, newRealm: string, newAbilities: string[], cost?: string }>> => {
      const response = await fetch(`${API_BASE}/players/${id}/breakthrough`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      return handleResponse(response)
    },
    
    becomeMentor: async (id: string, menteeId: string): Promise<ApiResponse<{ message: string, mentor: string, mentee: string }>> => {
      const response = await fetch(`${API_BASE}/players/${id}/become-mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menteeId })
      })
      return handleResponse(response)
    },
    
    acceptMentor: async (id: string, mentorId: string): Promise<ApiResponse<{ message: string, player: PlayerResponse }>> => {
      const response = await fetch(`${API_BASE}/players/${id}/accept-mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId })
      })
      return handleResponse(response)
    },
    
    getMentees: async (id: string): Promise<ApiResponse<{ mentees: any[] }>> => {
      const response = await fetch(`${API_BASE}/players/${id}/mentees`)
      return handleResponse(response)
    },
    
    revokeMentor: async (id: string): Promise<ApiResponse<{ message: string, player: PlayerResponse }>> => {
      const response = await fetch(`${API_BASE}/players/${id}/revoke-mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      return handleResponse(response)
    },
    
    bond: async (id: string, targetId: string): Promise<ApiResponse<{ message: string, player1: string, player2: string }>> => {
      const response = await fetch(`${API_BASE}/players/${id}/bond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId })
      })
      return handleResponse(response)
    },
    
    unbond: async (id: string): Promise<ApiResponse<{ message: string, player: PlayerResponse }>> => {
      const response = await fetch(`${API_BASE}/players/${id}/unbond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      return handleResponse(response)
    }
  },
  
  sect: {
    getAll: async (): Promise<ApiResponse<SectsResponse>> => {
      const response = await fetch(`${API_BASE}/sects`)
      return handleResponse(response)
    },
    
    create: async (name: string, type: string, leaderId: string): Promise<ApiResponse<SectResponse>> => {
      const response = await fetch(`${API_BASE}/sects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, leaderId })
      })
      return handleResponse(response)
    },
    
    join: async (sectId: string, playerId: string): Promise<ApiResponse<{ message: string, player: PlayerResponse }>> => {
      const response = await fetch(`${API_BASE}/sects/${sectId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
      return handleResponse(response)
    },
    
    getLawNodes: async (): Promise<ApiResponse<{ nodes: any[] }>> => {
      const response = await fetch(`${API_BASE}/sects/law-nodes`)
      return handleResponse(response)
    },
    
    claimNode: async (sectId: string, nodeId: string): Promise<ApiResponse<{ message: string, node: any, bonus: any }>> => {
      const response = await fetch(`${API_BASE}/sects/${sectId}/claim-node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId })
      })
      return handleResponse(response)
    },
    
    captureNode: async (sectId: string, nodeId: string, attackerCount: number): Promise<ApiResponse<{ message: string, node?: any, bonus?: any, battleResult?: any }>> => {
      const response = await fetch(`${API_BASE}/sects/${sectId}/capture-node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, attackerCount })
      })
      return handleResponse(response)
    },
    
    getWarStatus: async (sectId: string): Promise<ApiResponse<{ sect: string, ownedNodes: any[], totalBonus: any, nodeCount: number }>> => {
      const response = await fetch(`${API_BASE}/sects/${sectId}/war-status`)
      return handleResponse(response)
    },
    
    upgrade: async (sectId: string): Promise<ApiResponse<{ message: string, sect: any }>> => {
      const response = await fetch(`${API_BASE}/sects/${sectId}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      return handleResponse(response)
    }
  },

  economy: {
    getPlayerInventory: async (playerId: string): Promise<ApiResponse<{ inventory: any[] }>> => {
      const response = await fetch(`${API_BASE}/economy/player/${playerId}/inventory`)
      return handleResponse(response)
    },

    addItemToInventory: async (playerId: string, itemId: string, quantity: number): Promise<ApiResponse<{ inventoryItem: any }>> => {
      const response = await fetch(`${API_BASE}/economy/player/${playerId}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity })
      })
      return handleResponse(response)
    },

    removeItemFromInventory: async (playerId: string, itemId: string, quantity: number): Promise<ApiResponse<{ message: string }>> => {
      const response = await fetch(`${API_BASE}/economy/player/${playerId}/inventory/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      })
      return handleResponse(response)
    },

    equipItem: async (playerId: string, itemId: string, equipped: boolean): Promise<ApiResponse<{ inventoryItem: any }>> => {
      const response = await fetch(`${API_BASE}/economy/player/${playerId}/inventory/${itemId}/equip`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipped })
      })
      return handleResponse(response)
    },

    getMarket: async (): Promise<ApiResponse<{ listings: any[] }>> => {
      const response = await fetch(`${API_BASE}/economy/market`)
      return handleResponse(response)
    },

    createMarketListing: async (sellerId: string, itemId: string, quantity: number, price: number): Promise<ApiResponse<{ listing: any }>> => {
      const response = await fetch(`${API_BASE}/economy/market`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, itemId, quantity, price })
      })
      return handleResponse(response)
    },

    buyMarketItem: async (listingId: string, buyerId: string): Promise<ApiResponse<{ message: string }>> => {
      const response = await fetch(`${API_BASE}/economy/market/${listingId}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId })
      })
      return handleResponse(response)
    },

    cancelMarketListing: async (listingId: string, sellerId: string): Promise<ApiResponse<{ message: string }>> => {
      const response = await fetch(`${API_BASE}/economy/market/${listingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId })
      })
      return handleResponse(response)
    },

    getCraftingRecipes: async (): Promise<ApiResponse<{ recipes: any[] }>> => {
      const response = await fetch(`${API_BASE}/economy/crafting/recipes`)
      return handleResponse(response)
    },

    craftItem: async (playerId: string, recipeId: string, quantity: number): Promise<ApiResponse<{ message: string, resultItem: any, quantity: number }>> => {
      const response = await fetch(`${API_BASE}/economy/crafting/craft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, recipeId, quantity })
      })
      return handleResponse(response)
    },

    getItems: async (): Promise<ApiResponse<{ items: any[] }>> => {
      const response = await fetch(`${API_BASE}/economy/items`)
      return handleResponse(response)
    },

    getItem: async (itemId: string): Promise<ApiResponse<{ item: any }>> => {
      const response = await fetch(`${API_BASE}/economy/items/${itemId}`)
      return handleResponse(response)
    }
  },

  dungeon: {
    getDungeons: async (): Promise<ApiResponse<{ dungeons: any[] }>> => {
      const response = await fetch(`${API_BASE}/dungeons`)
      return handleResponse(response)
    },

    getDungeon: async (dungeonId: string): Promise<ApiResponse<{ dungeon: any }>> => {
      const response = await fetch(`${API_BASE}/dungeons/${dungeonId}`)
      return handleResponse(response)
    },

    startDungeon: async (dungeonId: string, playerId: string, partyMembers?: string[]): Promise<ApiResponse<{ message: string, runId: string, dungeon: any, enemies: any[] }>> => {
      const response = await fetch(`${API_BASE}/dungeons/${dungeonId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, partyMembers })
      })
      return handleResponse(response)
    },

    attackInDungeon: async (dungeonId: string, runId: string, playerId: string, targetId: string, damage: number): Promise<ApiResponse<{ message: string, target?: any, enemies: any[], enemyAttack?: any, completed?: boolean, rewards?: any }>> => {
      const response = await fetch(`${API_BASE}/dungeons/${dungeonId}/${runId}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, targetId, damage })
      })
      return handleResponse(response)
    },

    leaveDungeon: async (dungeonId: string, runId: string, playerId: string): Promise<ApiResponse<{ message: string }>> => {
      const response = await fetch(`${API_BASE}/dungeons/${dungeonId}/${runId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
      return handleResponse(response)
    },

    getDungeonStatus: async (dungeonId: string, runId: string): Promise<ApiResponse<{ dungeonRun: any }>> => {
      const response = await fetch(`${API_BASE}/dungeons/${dungeonId}/${runId}/status`)
      return handleResponse(response)
    }
  }
}
