import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Zap, Key, CheckCircle } from 'lucide-react'

const METIERS = [
  { id: 'avocat', label: 'Avocat', icon: '⚖️' },
  { id: 'coiffure', label: 'Coiffure', icon: '💇' },
  { id: 'garage', label: 'Garage', icon: '🔧' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'medical', label: 'Médical', icon: '🏥' },
  { id: 'autre', label: 'Autre', icon: '💼' },
]

const AGENTS = [
  { id: 'manager', label: 'Manager', desc: 'Direction, stratégie, décisions', icon: '🛡️' },
  { id: 'commercial', label: 'Commercial', desc: 'Prospection, deals, relances', icon: '💼' },
  { id: 'marketing', label: 'Marketing', desc: 'Contenu, réseaux, visibilité', icon: '🥷' },
  { id: 'judiciaire', label: 'Judiciaire', desc: 'Contrats, conformité, RGPD', icon: '⚖️' },
  { id: 'techdata', label: 'Tech & Data', desc: 'Tech, données, automatisation', icon: '🚀' },
]

export default function Wizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [metier, setMetier] = useState('')
  const [agents, setAgents] = useState<string[]>(['manager'])
  const [apiKey, setApiKey] = useState('')

  const toggleAgent = (id: string) => {
    setAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const handleFinish = () => {
    const config = { metier, agents, apiKey, installed: true }
    localStorage.setItem('agenthub-config', JSON.stringify(config))
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="progress-bar mb-3">
            <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Étape {step} sur 4</p>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
              style={{ background: 'linear-gradient(135deg, var(--orange-500), #e65c00)', boxShadow: '0 8px 40px rgba(255, 107, 0, 0.3)' }}
            >
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Bienvenue sur AgentHub</h1>
            <p className="text-lg mb-10" style={{ color: 'var(--text-muted)' }}>
              Vos assistants IA professionnels, installés sur votre poste.
            </p>
            <button onClick={() => setStep(2)} className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4">
              Commencer
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Métier */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Quel est votre métier ?</h2>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Cela nous aide à personnaliser vos assistants.</p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {METIERS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMetier(m.id)}
                  className={`wizard-card text-left ${metier === m.id ? 'selected' : ''}`}
                >
                  <div className="text-3xl mb-2">{m.icon}</div>
                  <div className="font-semibold" style={{ color: metier === m.id ? 'var(--orange-300)' : 'var(--text-primary)' }}>{m.label}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" /> Retour
              </button>
              <button onClick={() => setStep(3)} disabled={!metier} className="btn-primary inline-flex items-center gap-2">
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Agents */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Choisissez vos assistants</h2>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Vous pourrez en ajouter d'autres plus tard.</p>

            <div className="space-y-3 mb-10">
              {AGENTS.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={`wizard-card w-full text-left ${agents.includes(agent.id) ? 'selected' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{agent.icon}</div>
                      <div>
                        <h3 className="font-semibold" style={{ color: agents.includes(agent.id) ? 'var(--orange-300)' : 'var(--text-primary)' }}>{agent.label}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{agent.desc}</p>
                      </div>
                    </div>
                    {agents.includes(agent.id) && (
                      <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--orange-500)' }} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" /> Retour
              </button>
              <button onClick={() => setStep(4)} disabled={agents.length === 0} className="btn-primary inline-flex items-center gap-2">
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: API key */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Votre clé OpenCode Go</h2>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
              AgentHub utilise votre propre clé API pour fonctionner.
            </p>

            <div className="mb-10">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Clé API</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="***"
                  className="input-field"
                  style={{ paddingLeft: 48 }}
                />
              </div>
              <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
                Obtenez votre clé sur{' '}
                <a href="https://opencode.ai/auth" target="_blank" rel="noreferrer" style={{ color: 'var(--orange-400)' }}>
                  opencode.ai/auth
                </a>
              </p>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" /> Retour
              </button>
              <button onClick={handleFinish} className="btn-primary inline-flex items-center gap-2">
                Terminer l'installation <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
