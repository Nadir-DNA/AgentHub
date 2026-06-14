import { describe, it, expect } from 'vitest'
import { TOOLS, ROLES, toolName } from './catalog'

describe('catalog', () => {
  it('expose les outils avec des champs requis', () => {
    expect(TOOLS.length).toBeGreaterThan(0)
    for (const t of TOOLS) {
      expect(t.id).toBeTruthy()
      expect(t.name).toBeTruthy()
      expect(t.category).toBeTruthy()
    }
  })

  it('ids d\'outils uniques', () => {
    const ids = TOOLS.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('toolName renvoie le nom lisible ou l\'id en repli', () => {
    expect(toolName('whatsapp')).toBe('WhatsApp')
    expect(toolName('inconnu')).toBe('inconnu')
  })

  it('couvre les 5 rôles du noyau', () => {
    expect(ROLES.map(r => r.id)).toEqual(
      expect.arrayContaining(['manager', 'commercial', 'marketing', 'judiciaire', 'techdata']),
    )
  })
})
