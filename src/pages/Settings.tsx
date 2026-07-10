import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Key, Cpu, User, Check, Trash2, SlidersHorizontal, Palette, Moon, Sun, Languages } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import type { AppConfig, Agent } from '../services/api'
import AgentAvatar from '../components/AgentAvatar'
import { ACCENTS, setAccent, setMode, setLang, type AccentName } from '../services/preferences'

const MODELS = [
  { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash — rapide & économique' },
  { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro — plus précis' },
  { id: 'glm-5.1', label: 'GLM 5.1 — équilibré' },
  { id: 'kimi-k2.7', label: 'Kimi K2.7' },
  { id: 'mimo-v2.5-pro', label: 'MiMo V2.5 Pro' },
]

export default function Settings() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [usage, setUsage] = useState(0)
  const [keyInput, setKeyInput] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)
  const [accent, setAccentState] = useState<AccentName>(() => (localStorage.getItem('agenthub-accent') as AccentName) || 'Orange')
  const [mode, setModeState] = useState<'dark' | 'light'>(() => (localStorage.getItem('agenthub-mode') as 'dark' | 'light') || 'dark')
  const [lang, setLangState] = useState<'fr' | 'en'>(() => (localStorage.getItem('agenthub-lang') as 'fr' | 'en') || 'fr')

  const reload = useCallback(() => {
    api.getConfig().then(setConfig).catch(() => {})
    api.getUsage().then(setUsage).catch(() => {})
    api.listAgents().then(setAgents).catch(() => {})
  }, [])

  useEffect(() => { reload() }, [reload])

  if (!config) {
    return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Chargement…</div>
  }

  const patchConfig = async (p: Partial<AppConfig>) => {
    const next = { ...config, ...p }
    setConfig(next)
    await api.saveConfig(next)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1500)
  }

  const saveKey = async () => {
    const k = keyInput.trim()
    if (!k) return
    await api.setApiKey(k)
    setKeyInput('')
    reload()
  }

  const removeKey = async () => {
    await api.clearApiKey()
    reload()
  }

  const disconnect = async () => {
    if (!confirm('Se déconnecter ? La clé API sera supprimée et vous reverrez l\'onboarding.')) return
    await api.clearApiKey()
    await api.saveConfig({ ...config, installed: false })
    navigate('/wizard')
  }

  const onAccent = (name: AccentName) => {
    setAccent(name)
    setAccentState(name)
  }
  const onMode = (m: 'dark' | 'light') => {
    setMode(m)
    setModeState(m)
  }
  const onLang = (l: 'fr' | 'en') => {
    setLang(l)
    setLangState(l)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Paramètres</h1>
        </div>
        {savedFlash && (
          <span className="text-xs inline-flex items-center gap-1" style={{ color: 'var(--orange-300)' }}>
            <Check className="w-3.5 h-3.5" /> Enregistré
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* AI model */}
        <div className="settings-section">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange-glow)' }}>
              <Cpu className="w-5 h-5" style={{ color: 'var(--orange-400)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Modèle IA</h2>
          </div>
          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Modèle utilisé</label>
          <select
            className="input-field"
            value={config.model}
            onChange={e => patchConfig({ model: e.target.value })}
          >
            {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>

        {/* Appearance */}
        <div className="settings-section">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange-glow)' }}>
              <Palette className="w-5 h-5" style={{ color: 'var(--orange-400)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Apparence</h2>
          </div>
          {/* Accent color */}
          <label className="block text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Couleur d'accent</label>
          <div className="flex gap-3 flex-wrap">
            {ACCENTS.map(a => (
              <button
                key={a.name}
                onClick={() => onAccent(a.name)}
                className="rounded-full flex items-center justify-center transition-transform"
                style={{
                  width: 36, height: 36,
                  background: a.color,
                  outline: accent === a.name ? `2px solid ${a.color}` : 'none',
                  outlineOffset: accent === a.name ? 2 : 0,
                  transform: accent === a.name ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {accent === a.name && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
          {/* Mode */}
          <label className="block text-sm mb-3 mt-5" style={{ color: 'var(--text-muted)' }}>Thème</label>
          <div className="flex gap-3">
            <button
              onClick={() => onMode('dark')}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
              style={{
                background: mode === 'dark' ? 'var(--orange-glow-strong)' : 'var(--bg-secondary)',
                border: `1px solid ${mode === 'dark' ? 'var(--orange-400)' : 'var(--border-subtle)'}`,
                color: mode === 'dark' ? 'var(--orange-300)' : 'var(--text-muted)',
              }}
            >
              <Moon className="w-4 h-4" /> Sombre
            </button>
            <button
              onClick={() => onMode('light')}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
              style={{
                background: mode === 'light' ? 'var(--orange-glow-strong)' : 'var(--bg-secondary)',
                border: `1px solid ${mode === 'light' ? 'var(--orange-400)' : 'var(--border-subtle)'}`,
                color: mode === 'light' ? 'var(--orange-300)' : 'var(--text-muted)',
              }}
            >
              <Sun className="w-4 h-4" /> Clair
            </button>
          </div>
          {/* Language */}
          <label className="block text-sm mb-3 mt-5" style={{ color: 'var(--text-muted)' }}>
            <Languages className="w-4 h-4 inline mr-1" /> Langue
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => onLang('fr')}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold"
              style={{
                background: lang === 'fr' ? 'var(--orange-glow-strong)' : 'var(--bg-secondary)',
                border: `1px solid ${lang === 'fr' ? 'var(--orange-400)' : 'var(--border-subtle)'}`,
                color: lang === 'fr' ? 'var(--orange-300)' : 'var(--text-muted)',
              }}
            >Français</button>
            <button
              onClick={() => onLang('en')}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold"
              style={{
                background: lang === 'en' ? 'var(--orange-glow-strong)' : 'var(--bg-secondary)',
                border: `1px solid ${lang === 'en' ? 'var(--orange-400)' : 'var(--border-subtle)'}`,
                color: lang === 'en' ? 'var(--orange-300)' : 'var(--text-muted)',
              }}
            >English</button>
          </div>
        </div>

        {/* API key */}
        <div className="settings-section">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange-glow)' }}>
              <Key className="w-5 h-5" style={{ color: 'var(--orange-400)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Clé API OpenCode Go</h2>
          </div>

          <div className="flex items-center justify-between text-sm mb-4">
            <span style={{ color: 'var(--text-muted)' }}>Statut</span>
            {config.has_api_key ? (
              <span className="font-semibold inline-flex items-center gap-1" style={{ color: 'var(--orange-300)' }}>
                <Check className="w-4 h-4" /> Configurée
              </span>
            ) : (
              <span className="font-semibold" style={{ color: '#fca5a5' }}>Aucune clé</span>
            )}
          </div>

          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            {config.has_api_key ? 'Remplacer la clé' : 'Ajouter votre clé'}
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              placeholder="sk-…"
              className="input-field flex-1"
            />
            <button onClick={saveKey} disabled={!keyInput.trim()} className="btn-primary text-sm">Enregistrer</button>
            {config.has_api_key && (
              <button onClick={removeKey} className="btn-secondary text-sm">Supprimer</button>
            )}
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            La clé est stockée localement, hors du navigateur. Obtenez-la sur{' '}
            <a href="https://opencode.ai/auth" target="_blank" rel="noreferrer" style={{ color: 'var(--orange-400)' }}>opencode.ai/auth</a>.
          </p>

          <div className="flex items-center justify-between text-sm mt-5 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Requêtes ce mois</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{usage}</span>
          </div>
        </div>

        {/* Agents */}
        <div className="settings-section">
          <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Vos assistants</h2>
          <div className="space-y-3">
            {agents.map(a => (
              <div
                key={a.id}
                className="p-4 rounded-xl flex items-center justify-between"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AgentAvatar id={a.role} size={40} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.title}</p>
                  </div>
                </div>
                <Link
                  to={`/agent/${a.id}/config`}
                  className="btn-secondary text-sm inline-flex items-center gap-1.5 shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Configurer
                </Link>
              </div>
            ))}
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
              <input
                type="text"
                value={config.user_name ?? ''}
                onChange={e => setConfig({ ...config, user_name: e.target.value })}
                onBlur={e => patchConfig({ user_name: e.target.value })}
                placeholder="Gérard"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input
                type="email"
                value={config.user_email ?? ''}
                onChange={e => setConfig({ ...config, user_email: e.target.value })}
                onBlur={e => patchConfig({ user_email: e.target.value })}
                placeholder="gerard@salon.fr"
                className="input-field"
              />
            </div>
            {config.metier && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Pack métier : <span style={{ color: 'var(--orange-300)' }}>{config.metier}</span>
              </p>
            )}
          </div>

          <button
            onClick={disconnect}
            className="w-full mt-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
            style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#fca5a5' }}
          >
            <Trash2 className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}