// ponytail: localStorage rename system deleted — DB (Rust) is the source of truth.
// Only AGENT_META survives: prompts, tools, titles, short names per role.

export const AGENT_META: Record<string, {
  short: string
  emoji: string
  desc: string
  title: string
  prompts: { label: string; icon: string; text: string }[]
  tools: string[]
}> = {
  manager: {
    short: 'Cap',
    emoji: '🛡️',
    desc: 'Direction, stratégie, décisions',
    title: 'Manager',
    prompts: [
      { label: 'Bilan du jour', icon: '📊', text: "Quel est le bilan de la journée ?" },
      { label: 'Stratégie', icon: '🎯', text: "Quelles sont les priorités cette semaine ?" },
      { label: 'Briefing', icon: '📋', text: "Prépare-moi un briefing pour l'équipe" },
      { label: 'Décision', icon: '⚡', text: "J'ai besoin d'aide pour une décision importante" },
    ],
    tools: ['google-agenda', 'google-drive'],
  },
  commercial: {
    short: 'Marc',
    emoji: '💼',
    desc: 'Prospection, deals, relances',
    title: 'Commercial',
    prompts: [
      { label: 'Prospection', icon: '🎯', text: "Combien de prospects en cours ?" },
      { label: 'Relance', icon: '📩', text: 'Quels clients faut-il relancer cette semaine ?' },
      { label: 'Nouveau deal', icon: '🤝', text: "J'ai un prospect chaud, prépare-moi une offre" },
      { label: 'Pipeline', icon: '📈', text: "Où en est le pipeline commercial ?" },
    ],
    tools: ['whatsapp', 'planity'],
  },
  marketing: {
    short: 'Shadow',
    emoji: '🥷',
    desc: 'Contenu, réseaux, visibilité',
    title: 'Marketing',
    prompts: [
      { label: 'Avis Google', icon: '⭐', text: "J'ai un nouvel avis Google, tu réponds ?" },
      { label: 'Post Instagram', icon: '📸', text: 'Propose-moi un post Instagram' },
      { label: 'Statistiques', icon: '📈', text: 'Comment se porte ma visibilité en ligne ?' },
      { label: 'Contenu', icon: '✍️', text: "Quelles idées de contenu tu me proposes ?" },
    ],
    tools: ['google-avis', 'instagram'],
  },
  judiciaire: {
    short: 'Claude',
    emoji: '⚖️',
    desc: 'Contrats, conformité, RGPD',
    title: 'Judiciaire',
    prompts: [
      { label: 'Contrat', icon: '📝', text: 'Je dois rédiger un contrat pour un nouveau client' },
      { label: 'RGPD', icon: '🔒', text: 'Ma politique de confidentialité est-elle à jour ?' },
      { label: 'Conformité', icon: '✅', text: 'Vérifie la conformité de mes CGV' },
      { label: 'Veille', icon: '📰', text: "Quels sont les changements juridiques récents pour mon métier ?" },
    ],
    tools: ['yousign', 'google-drive'],
  },
  techdata: {
    short: 'Nova',
    emoji: '🚀',
    desc: 'Tech, données, automatisation',
    title: 'Tech & Data',
    prompts: [
      { label: 'Automatisation', icon: '⚙️', text: "Quelles tâches peut-on automatiser ?" },
      { label: 'Données', icon: '📊', text: "Analyse mes données du mois" },
      { label: 'Intégration', icon: '🔗', text: "Connecte-moi un nouvel outil" },
      { label: 'Rapport', icon: '📋', text: "Génère un rapport technique" },
    ],
    tools: ['google-drive'],
  },
}