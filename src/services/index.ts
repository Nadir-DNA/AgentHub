// Service de détection automatique : serveur Hermes réel ou mock

import { hermesService } from './hermes'
import { mockHermesService } from './mock-hermes'
import type { Agent, Message, ChatResponse } from './hermes'

type HermesProvider = {
  isRunning: () => Promise<boolean>
  getAgents: () => Promise<Agent[]>
  sendMessage: (agentId: string, content: string) => Promise<ChatResponse>
  getHistory: (agentId: string) => Promise<Message[]>
}

class AdaptiveHermesService implements HermesProvider {
  private useMock = false
  private checked = false

  private async detect(): Promise<HermesProvider> {
    if (this.checked) {
      return this.useMock ? mockHermesService : hermesService
    }
    this.checked = true

    try {
      const running = await hermesService.isRunning()
      if (running) {
        console.log('✅ AgentHub Server détecté sur localhost:8080')
        this.useMock = false
        return hermesService
      }
    } catch {
      // Pas de serveur, on utilise le mock
    }

    console.log('⚠️  Serveur non disponible, utilisation du mode démo')
    this.useMock = true
    return mockHermesService
  }

  /** Retourne true si le service utilise le mode démo (pas de serveur réel) */
  async isMockMode(): Promise<boolean> {
    await this.detect()
    return this.useMock
  }

  async isRunning(): Promise<boolean> {
    const provider = await this.detect()
    return provider.isRunning()
  }

  async getAgents(): Promise<Agent[]> {
    const provider = await this.detect()
    return provider.getAgents()
  }

  async sendMessage(agentId: string, content: string): Promise<ChatResponse> {
    const provider = await this.detect()
    // Laisser les erreurs remonter au caller (pas de catch ici)
    return provider.sendMessage(agentId, content)
  }

  async getHistory(agentId: string): Promise<Message[]> {
    const provider = await this.detect()
    return provider.getHistory(agentId)
  }
}

export const hermesAPI = new AdaptiveHermesService()
export type { Agent, Message, ChatResponse }
