// Service mock pour développement (sans Hermes réel)

import type { Agent, Message, ChatResponse } from './hermes'
import { getAgentName } from './renames'

class MockHermesService {
  private mockAgents: Agent[] = [
    {
      id: 'manager',
      name: getAgentName('manager'),
      type: 'manager',
      status: 'active',
      profile: 'manager'
    },
    {
      id: 'comptable',
      name: getAgentName('comptable'),
      type: 'commercial',
      status: 'active',
      profile: 'comptable'
    },
    {
      id: 'marketing',
      name: getAgentName('marketing'),
      type: 'marketing',
      status: 'inactive',
      profile: 'marketing'
    },
    {
      id: 'juridique',
      name: getAgentName('juridique'),
      type: 'judiciaire',
      status: 'active',
      profile: 'juridique'
    }
  ]

  async isRunning(): Promise<boolean> {
    return true // Mock toujours disponible
  }

  async getAgents(): Promise<Agent[]> {
    await this.delay(300)
    return this.mockAgents
  }

  async sendMessage(agentId: string, _content: string): Promise<ChatResponse> {
    await this.delay(1000) // Simuler latence

    const agent = this.mockAgents.find(a => a.id === agentId)
    if (!agent) throw new Error('Agent not found')

    const responses: Record<string, string[]> = {
      manager: [
        "J'ai analysé votre planning. Vous avez 8 RDV aujourd'hui, avec un trou de 2h entre 14h et 16h. Voulez-vous que je propose des créneaux à vos clients ?",
        "Martin arrive dans 20 minutes pour une coupe + barbe. Sa fiche est prête. Voulez-vous que je vous envoie un rappel WhatsApp ?",
        "Bilan du jour : 7/8 RDV effectués, CA : 420€. Le client de 16h n'est pas venu. Je prépare une relance ?"
      ],
      comptable: [
        "Solde actuel : 12 450€. Entrées ce mois : 8 200€. Sorties : 6 800€. Prévisionnel fin de mois : +1 850€.",
        "J'ai catégorisé vos 23 transactions du jour. 3 dépenses > 500€ à vérifier. Voulez-vous le détail ?",
        "Votre facture #2024-042 pour Martin (180€) est en retard de 7 jours. Je prépare une relance ?"
      ],
      marketing: [
        "Nouvel avis Google 5 étoiles de Marie : 'Super accueil, coupe parfaite !'. Je propose : 'Merci Marie ! Ravi que vous ayez apprécié. À bientôt !' Je publie ?",
        "J'ai préparé 3 idées de posts Instagram pour cette semaine. Voulez-vous les voir ?",
        "Votre post d'hier a fait 234 vues et 12 likes. Mieux que la moyenne (180 vues). Je continue sur ce type de contenu ?"
      ],
      juridique: [
        "J'ai analysé votre contrat type. 2 clauses méritent une mise à jour : la clause de confidentialité (art. 7) et les conditions de résiliation (art. 12). Je vous prépare les modifications ?",
        "La RGPD impose une mise à jour de votre politique de confidentialité tous les 12 mois. La vôtre date de 14 mois. Je rédige la nouvelle version ?",
        "Attention : le délai de rétractation pour vos prestations est de 14 jours selon l'art. L221-18 du Code de la consommation. Vos CGV actuelles mentionnent 7 jours seulement."
      ]
    }

    const agentResponses = responses[agentId] || responses.manager
    const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)]

    return {
      message: {
        id: Date.now().toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      },
      agent
    }
  }

  async getHistory(_agentId: string): Promise<Message[]> {
    await this.delay(200)
    return [
      {
        id: '1',
        role: 'user',
        content: 'Bonjour, tu peux m\'aider ?',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Bonjour ! Bien sûr, je suis là pour vous aider. Que puis-je faire pour vous ?',
        timestamp: new Date(Date.now() - 3599000)
      }
    ]
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const mockHermesService = new MockHermesService()
