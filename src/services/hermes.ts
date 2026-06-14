// Service de communication avec Hermes Agent (local)
// Version Pote : tout tourne sur localhost

import { getAgentName as getCustomAgentName } from './renames'

const HERMES_BASE_URL = 'http://localhost:8080'

interface Agent {
  id: string
  name: string
  type: 'manager' | 'commercial' | 'marketing' | 'judiciaire' | 'techdata'
  status: 'active' | 'inactive'
  profile: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatResponse {
  message: Message
  agent: Agent
}

class HermesService {
  private baseUrl: string

  constructor(baseUrl: string = HERMES_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Vérifier si Hermes tourne
  async isRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch {
      return false
    }
  }

  // Lister les agents actifs
  async getAgents(): Promise<Agent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles`)
      if (!response.ok) throw new Error('Failed to fetch agents')
      
      const data = await response.json()
      return data.profiles.map((p: any) => ({
        id: p.name,
        name: getCustomAgentName(p.name),
        type: this.getAgentType(p.name),
        status: 'active',
        profile: p.name
      }))
    } catch (error) {
      console.error('Error fetching agents:', error)
      return []
    }
  }

  // Envoyer un message à un agent
  async sendMessage(agentId: string, content: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      
      return {
        message: {
          id: data.id || Date.now().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        },
        agent: {
          id: agentId,
          name: getCustomAgentName(agentId),
          type: this.getAgentType(agentId),
          status: 'active',
          profile: agentId
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Récupérer l'historique d'un agent
  async getHistory(agentId: string): Promise<Message[]> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${agentId}`)
      if (!response.ok) throw new Error('Failed to fetch history')
      
      const data = await response.json()
      return data.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp)
      }))
    } catch (error) {
      console.error('Error fetching history:', error)
      return []
    }
  }

  // Helpers
  private getAgentType(profileName: string): 'manager' | 'commercial' | 'marketing' | 'judiciaire' | 'techdata' {
    if (['manager', 'commercial', 'marketing', 'judiciaire', 'techdata'].includes(profileName)) {
      return profileName as 'manager' | 'commercial' | 'marketing' | 'judiciaire' | 'techdata'
    }
    return 'manager'
  }
}

export const hermesService = new HermesService()
export type { Agent, Message, ChatResponse }
