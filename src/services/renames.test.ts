import { describe, it, expect, beforeEach } from 'vitest'
import { getAgentName, getAgentShort, renameAgent, getAllNames } from './renames'

describe('renames', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getAgentName', () => {
    it('returns default name for known agents', () => {
      expect(getAgentName('manager')).toBe('Cap le Manager')
      expect(getAgentName('commercial')).toBe('Marc le Commercial')
      expect(getAgentName('marketing')).toBe('Shadow le Marketing')
      expect(getAgentName('judiciaire')).toBe('Claude le Juridique')
      expect(getAgentName('techdata')).toBe('Nova le Tech')
    })

    it('returns custom name when set', () => {
      renameAgent('manager', 'Custom Manager')
      expect(getAgentName('manager')).toBe('Custom Manager')
    })

    it('returns id for unknown agent', () => {
      expect(getAgentName('unknown')).toBe('unknown')
    })
  })

  describe('getAgentShort', () => {
    it('returns short name for known agents', () => {
      expect(getAgentShort('manager')).toBe('Cap')
      expect(getAgentShort('commercial')).toBe('Marc')
      expect(getAgentShort('marketing')).toBe('Shadow')
      expect(getAgentShort('judiciaire')).toBe('Claude')
      expect(getAgentShort('techdata')).toBe('Nova')
    })

    it('returns first word of custom name', () => {
      renameAgent('manager', 'Jean-Pierre')
      expect(getAgentShort('manager')).toBe('Jean-Pierre')
    })
  })

  describe('renameAgent', () => {
    it('persists custom name to localStorage', () => {
      renameAgent('commercial', 'Custom Commercial')
      const stored = JSON.parse(localStorage.getItem('agenthub-names') || '{}')
      expect(stored.commercial).toBe('Custom Commercial')
    })

    it('removes override when set to default', () => {
      renameAgent('manager', 'Cap le Manager')
      const stored = JSON.parse(localStorage.getItem('agenthub-names') || '{}')
      expect(stored.manager).toBeUndefined()
    })
  })

  describe('getAllNames', () => {
    it('returns defaults + overrides', () => {
      renameAgent('manager', 'Custom')
      const names = getAllNames()
      expect(names.manager).toBe('Custom')
      expect(names.commercial).toBe('Marc le Commercial')
    })
  })
})
