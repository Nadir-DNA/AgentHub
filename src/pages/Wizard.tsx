import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Zap, Key, CheckCircle, Users } from 'lucide-react'
import * as api from '../services/api'
import type { PackInfo } from '../services/api'

export default function Wizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [packs, setPacks] = useState<PackInfo[]>([])
  const [metier, setMetier] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listPacks().then(setPacks).catch(() => setPacks([]))
  }, [])

  const selectedPack = packs.find(p => p.id === metier)

  const finish = async () => {
    setBusy(true)
    setError(null)
    try {
      await api.applyPack(metier)
      if (apiKey.trim()) await api.setApiKey(apiKey.trim())
      const cfg = await api.getConfig()
      await api.saveConfig({ ...cfg, installed: true })
      navigate('/')
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Une erreur est survenue.')
    } finally {
      setBusy(false)
    }
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
              Votre équipe d'assistants IA, installée sur votre poste, configurée pour votre métier.
            </p>
            <button onClick={() => setStep(2)} className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4">
              Commencer <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Métier (pack) */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Quel est votre métier ?</h2>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>On configure votre équipe d'assistants en conséquence.</p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {packs.map(p => (
                <button
                  key={p.id}
                  onClick={() => setMetier(p.id)}
                  className={`wizard-card text-left ${metier === p.id ? 'selected' : ''}`}
                >
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <div className="font-semibold" style={{ color: metier === p.id ? 'var(--orange-300)' : 'var(--text-primary)' }}>{p.label}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{p.description}</div>
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

        {/* Step 3: Pack preview */}
        {step === 3 && selectedPack && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Votre équipe est prête</h2>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Vous pourrez tout personnaliser ensuite (noms, prompts, outils, tâches).</p>

            <div className="settings-section mb-10">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedPack.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedPack.label}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedPack.description}</p>
                  <p className="text-sm mt-2 inline-flex items-center gap-1.5" style={{ color: 'var(--orange-300)' }}>
                    <Users className="w-4 h-4" /> {selectedPack.agent_count} assistants inclus
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" /> Retour
              </button>
              <button onClick={() => setStep(4)} className="btn-primary inline-flex items-center gap-2">
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
              AgentHub utilise votre propre clé API. Vous pouvez aussi l'ajouter plus tard dans les Paramètres.
            </p>

            <div className="mb-10">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Clé API (optionnel)</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-…"
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
              {error && <p className="text-sm mt-3" style={{ color: '#fca5a5' }}>⚠️ {error}</p>}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="btn-secondary inline-flex items-center gap-2" disabled={busy}>
                <ArrowLeft className="w-5 h-5" /> Retour
              </button>
              <button onClick={finish} disabled={busy} className="btn-primary inline-flex items-center gap-2">
                {busy ? 'Installation…' : "Terminer l'installation"} <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
