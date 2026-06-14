import { Link } from 'react-router-dom'
import { ArrowLeft, Key, Cpu, User, Check, X, Pencil } from 'lucide-react'
import { useState } from 'react'
import { getAgentName, renameAgent, AGENT_META } from '../services/renames'
import AgentAvatar from '../components/AgentAvatar'

const AGENT_IDS = ['manager', 'commercial', 'marketing', 'judiciaire', 'techdata']

export default function Settings() {
  const [usage] = useState({ current: 342, limit: 5000 })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [, forceUpdate] = useState(0)

  const usagePercent = (usage.current / usage.limit) * 100

  const commitRename = (id: string) => {
    renameAgent(id, editValue)
    setEditingId(null)
    forceUpdate(n => n + 1)
    window.dispatchEvent(new CustomEvent('agenthub-rename'))
  }

  const startEdit = (id: string) => {
    setEditingId(id)
    setEditValue(getAgentName(id))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="p-2 rounded-lg transition-all"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Paramètres</h1>
      </div>

      <div className="space-y-5">
        {/* AI model */}
        <div className="settings-section">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange-glow)' }}>
              <Cpu className="w-5 h-5" style={{ color: 'var(--orange-400)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Assistant IA</h2>
          </div>

          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Modèle utilisé</label>
          <select className="input-field mb-5">
            <option>DeepSeek V4 — recommandé</option>
            <option>GPT-4o mini (plus rapide, moins précis)</option>
            <option>Claude Haiku (équilibré)</option>
            <option>Gemini Flash (économique)</option>
          </select>

          <div className="flex items-center justify-between pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Version installée</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>1.0.0 — Dernière : 1.0.0 ✅</p>
            </div>
            <button className="btn-secondary text-sm">🔄 Vérifier les mises à jour</button>
          </div>
        </div>

        {/* API key */}
        <div className="settings-section">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange-glow)' }}>
              <Key className="w-5 h-5" style={{ color: 'var(--orange-400)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Abonnement OpenCode Go</h2>
          </div>

          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Clé API</label>
          <div className="flex gap-2 mb-5">
            <input
              type="password"
              defaultValue="sk-xxxx...xxxx"
              readOnly
              className="input-field flex-1"
            />
            <button className="btn-secondary text-sm">Modifier</button>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Statut</span>
              <span style={{ color: 'var(--orange-300)' }} className="font-semibold">✅ Active</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Utilisation ce mois</span>
              <span style={{ color: 'var(--text-primary)' }} className="font-semibold">{usage.current} / {usage.limit} requêtes</span>
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${usagePercent}%` }} />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{usagePercent.toFixed(1)}% utilisé</p>
        </div>

        {/* Agents list */}
        <div className="settings-section">
          <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Tes assistants</h2>
          <div className="space-y-3">
            {AGENT_IDS.map((id) => {
              const meta = AGENT_META[id]
              const currentName = getAgentName(id)
              const isEditing = editingId === id

              return (
                <div
                  key={id}
                  className="p-4 rounded-xl flex items-center justify-between"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AgentAvatar id={id} size={40} />
                    <div className="min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitRename(id)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            autoFocus
                            className="input-field text-sm"
                            style={{ width: 192, padding: '8px 12px' }}
                            placeholder={meta?.short || id}
                          />
                          <button
                            onClick={() => commitRename(id)}
                            className="p-1.5 rounded-lg transition"
                            style={{ background: 'rgba(255, 107, 0, 0.2)' }}
                            title="Valider"
                          >
                            <Check className="w-4 h-4" style={{ color: 'var(--orange-400)' }} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-lg transition"
                            style={{ background: 'var(--bg-elevated)' }}
                            title="Annuler"
                          >
                            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{currentName}</p>
                          <button
                            onClick={() => startEdit(id)}
                            className="p-1 rounded-lg transition"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            title="Renommer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{meta?.desc || ''}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold shrink-0 ml-3" style={{ color: 'var(--orange-300)' }}>● Actif</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Account */}
        <div className="settings-section">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange-glow)' }}>
              <User className="w-5 h-5" style={{ color: 'var(--orange-400)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Compte</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Prénom</label>
              <input type="text" placeholder="Gérard" className="input-field" />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Métier</label>
              <select className="input-field">
                <option>Coiffeur</option>
                <option>Avocat</option>
                <option>Garagiste</option>
                <option>Esthéticienne</option>
                <option>Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input type="email" placeholder="gerard@salon.fr" className="input-field" />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all" style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#fca5a5' }}>
              Déconnecter
            </button>
            <button className="flex-1 btn-primary text-sm">
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
