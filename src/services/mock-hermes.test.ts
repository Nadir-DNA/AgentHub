// Tests pour le service mock Hermes

import { describe, it, expect, beforeEach } from 'vitest'
import { mockHermesService } from './mock-hermes'

beforeEach(() => {
  localStorage.clear()
})

describe('mockHermesService', () => {
  it('isRunning retourne true', async () => {
    expect(await mockHermesService.isRunning()).toBe(true)
  })

  it('getAgents retourne 4 agents', async () => {
    const agents = await mockHermesService.getAgents()
    expect(agents).toHaveLength(4)
    expect(agents.map(a => a.id)).toEqual(['manager', 'comptable', 'marketing', 'juridique'])
  })

  it('sendMessage retourne une réponse pour chaque agent', async () => {
    const agentIds = ['manager', 'comptable', 'marketing', 'juridique']
    for (const id of agentIds) {
      const response = await mockHermesService.sendMessage(id, 'test')
      expect(response.message).toHaveProperty('content')
      expect(response.message.role).toBe('assistant')
      expect(response.agent.id).toBe(id)
    }
  })

  it('sendMessage lance une erreur pour un agent inconnu', async () => {
    await expect(mockHermesService.sendMessage('unknown', 'test')).rejects.toThrow('Agent not found')
  })

  it('getHistory retourne un historique non vide', async () => {
    const history = await mockHermesService.getHistory('manager')
    expect(history.length).toBeGreaterThan(0)
  })
})
