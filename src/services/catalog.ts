// Catalogue d'outils intégrables (déclaratif en v1 — branchements réels ultérieurs).

export interface ToolDef {
  id: string
  name: string
  icon: string
  category: string
}

export const TOOLS: ToolDef[] = [
  { id: 'planity', name: 'Planity', icon: '📅', category: 'Planning' },
  { id: 'doctolib', name: 'Doctolib', icon: '📅', category: 'Planning' },
  { id: 'google-agenda', name: 'Google Agenda', icon: '📅', category: 'Planning' },
  { id: 'qonto', name: 'Qonto', icon: '💰', category: 'Compta' },
  { id: 'pennylane', name: 'Pennylane', icon: '💰', category: 'Compta' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', category: 'Messagerie' },
  { id: 'google-avis', name: 'Google Avis', icon: '⭐', category: 'Visibilité' },
  { id: 'instagram', name: 'Instagram', icon: '📸', category: 'Réseaux' },
  { id: 'google-drive', name: 'Google Drive', icon: '☁️', category: 'Stockage' },
  { id: 'yousign', name: 'Yousign', icon: '✍️', category: 'Signature' },
]

export const ROLES = [
  { id: 'manager', label: 'Manager' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'judiciaire', label: 'Juridique' },
  { id: 'techdata', label: 'Tech & Data' },
]

export const toolName = (id: string): string => TOOLS.find(t => t.id === id)?.name ?? id
