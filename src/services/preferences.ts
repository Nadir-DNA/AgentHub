// ponytail: theme + i18n in one file — localStorage, no Rust round-trip, no dep

// ===== THEME =====
export const ACCENTS = [
  { name: 'Orange', color: '#ff6b00', glow: 'rgba(255,107,0,0.15)', glowStrong: 'rgba(255,107,0,0.32)', light: '#ff8c1a', lighter: '#ffb24d' },
  { name: 'Émeraude', color: '#10b981', glow: 'rgba(16,185,129,0.15)', glowStrong: 'rgba(16,185,129,0.32)', light: '#34d399', lighter: '#6ee7b7' },
  { name: 'Bleu', color: '#3b82f6', glow: 'rgba(59,130,246,0.15)', glowStrong: 'rgba(59,130,246,0.32)', light: '#60a5fa', lighter: '#93c5fd' },
  { name: 'Violet', color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)', glowStrong: 'rgba(139,92,246,0.32)', light: '#a78bfa', lighter: '#c4b5fd' },
  { name: 'Rose', color: '#ec4899', glow: 'rgba(236,72,153,0.15)', glowStrong: 'rgba(236,72,153,0.32)', light: '#f472b6', lighter: '#f9a8d4' },
  { name: 'Rouge', color: '#ef4444', glow: 'rgba(239,68,68,0.15)', glowStrong: 'rgba(239,68,68,0.32)', light: '#f87171', lighter: '#fca5a5' },
] as const

export type AccentName = typeof ACCENTS[number]['name']

function applyAccent(a: typeof ACCENTS[number]) {
  const r = document.documentElement.style
  r.setProperty('--orange-500', a.color)
  r.setProperty('--orange-400', a.light)
  r.setProperty('--orange-300', a.lighter)
  r.setProperty('--orange-glow', a.glow)
  r.setProperty('--orange-glow-strong', a.glowStrong)
}

function applyMode(mode: 'dark' | 'light') {
  const r = document.documentElement.style
  if (mode === 'light') {
    r.setProperty('--bg-primary', '#f5f4f6')
    r.setProperty('--bg-secondary', '#eeedf0')
    r.setProperty('--bg-card', '#ffffff')
    r.setProperty('--bg-elevated', '#f9f8fa')
    r.setProperty('--border-subtle', '#e0dde3')
    r.setProperty('--border-hover', '#d0ccd5')
    r.setProperty('--text-primary', '#1a1a1a')
    r.setProperty('--text-secondary', '#635d68')
    r.setProperty('--text-muted', '#9a949f')
  } else {
    r.setProperty('--bg-primary', '#0b0a0c')
    r.setProperty('--bg-secondary', '#141316')
    r.setProperty('--bg-card', '#17161a')
    r.setProperty('--bg-elevated', '#1e1d22')
    r.setProperty('--border-subtle', '#262329')
    r.setProperty('--border-hover', '#38343d')
    r.setProperty('--text-primary', '#f4f2f5')
    r.setProperty('--text-secondary', '#9a949f')
    r.setProperty('--text-muted', '#635d68')
  }
}

export function initPreferences() {
  const accent = localStorage.getItem('agenthub-accent') || 'Orange'
  const mode = (localStorage.getItem('agenthub-mode') as 'dark' | 'light') || 'dark'
  const lang = (localStorage.getItem('agenthub-lang') as 'fr' | 'en') || 'fr'
  const a = ACCENTS.find(x => x.name === accent) || ACCENTS[0]
  applyAccent(a)
  applyMode(mode)
  return { accent, mode, lang }
}

export function setAccent(name: AccentName) {
  const a = ACCENTS.find(x => x.name === name) || ACCENTS[0]
  localStorage.setItem('agenthub-accent', name)
  applyAccent(a)
}

export function setMode(mode: 'dark' | 'light') {
  localStorage.setItem('agenthub-mode', mode)
  applyMode(mode)
}

export function setLang(lang: 'fr' | 'en') {
  localStorage.setItem('agenthub-lang', lang)
}

// ===== i18n =====
type Dict = Record<string, { fr: string; en: string }>

const DICT: Dict = {
  // Nav
  hub: { fr: 'Hub', en: 'Hub' },
  settings: { fr: 'Paramètres', en: 'Settings' },
  // Hub
  askTeam: { fr: 'Demander à l\'équipe…', en: 'Ask the team…' },
  agents: { fr: 'Vos assistants', en: 'Your assistants' },
  tasks: { fr: 'tâches planifiées', en: 'scheduled tasks' },
  // Settings
  model: { fr: 'Modèle IA', en: 'AI Model' },
  apiKey: { fr: 'Clé API OpenCode Go', en: 'API Key OpenCode Go' },
  yourAgents: { fr: 'Vos assistants', en: 'Your assistants' },
  account: { fr: 'Compte', en: 'Account' },
  lastName: { fr: 'Prénom', en: 'First name' },
  email: { fr: 'Email', en: 'Email' },
  businessPack: { fr: 'Pack métier', en: 'Business pack' },
  disconnect: { fr: 'Se déconnecter', en: 'Disconnect' },
  appearance: { fr: 'Apparence', en: 'Appearance' },
  accentColor: { fr: 'Couleur d\'accent', en: 'Accent color' },
  darkMode: { fr: 'Mode sombre', en: 'Dark mode' },
  lightMode: { fr: 'Mode clair', en: 'Light mode' },
  language: { fr: 'Langue', en: 'Language' },
  // Agent config
  configure: { fr: 'Configurer', en: 'Configure' },
  // Wizard
  welcome: { fr: 'Bienvenue sur AgentHub', en: 'Welcome to AgentHub' },
  welcomeSub: { fr: 'Votre équipe d\'assistants IA, installée sur votre poste, configurée pour votre métier.', en: 'Your team of AI assistants, installed on your workstation, configured for your business.' },
  start: { fr: 'Commencer →', en: 'Start →' },
  step: { fr: 'Étape', en: 'Step' },
  outOf: { fr: 'sur', en: 'out of' },
  chooseBusiness: { fr: 'Choisissez votre métier', en: 'Choose your business' },
  next: { fr: 'Suivant →', en: 'Next →' },
  back: { fr: '← Retour', en: '← Back' },
  finish: { fr: 'Terminer', en: 'Finish' },
  apiKeyPrompt: { fr: 'Entrez votre clé API', en: 'Enter your API key' },
  apiKeyHelp: { fr: 'La clé est stockée localement, hors du navigateur. Obtenez-la sur', en: 'The key is stored locally. Get yours at' },
  // Misc
  saved: { fr: 'Enregistré', en: 'Saved' },
  loading: { fr: 'Chargement…', en: 'Loading…' },
  noKey: { fr: 'Aucune clé', en: 'No key' },
  configured: { fr: 'Configurée', en: 'Configured' },
  addKey: { fr: 'Ajouter votre clé', en: 'Add your key' },
  replaceKey: { fr: 'Remplacer la clé', en: 'Replace key' },
  save: { fr: 'Enregistrer', en: 'Save' },
  delete: { fr: 'Supprimer', en: 'Delete' },
  deleteBtn: { fr: 'Supprimer', en: 'Remove' },
  requestsThisMonth: { fr: 'Requêtes ce mois', en: 'Requests this month' },
}

export function t(key: string, lang: 'fr' | 'en'): string {
  return DICT[key]?.[lang] ?? key
}