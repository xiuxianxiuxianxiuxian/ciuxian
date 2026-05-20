const API_BASE = 'http://localhost:4000/api'

interface ApiResponse<T> {
  data?: T
  error?: string
}

interface AuthResponse {
  message: string
  player: {
    id: string
    username: string
    level: number
    realmLevel: number
    realmName: string
    classType?: string
    erosionValue?: number
  }
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
  }
}
