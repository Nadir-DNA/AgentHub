import { Link, useNavigate } from 'react-router-dom'
import { Plus, Settings, Bot, Calendar, TrendingUp, Zap, Sparkles, Send } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import type { Agent } from '../services/api'
import AgentAvatar from '../components/AgentAvatar'

export default function Hub() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<Agent[]>([])
  const [usage, setUsage] = useState(0)
  const [hubQuery, setHubQuery] = useState('')
  const [hubLoading, setHubLoading] = useState(false)
  const [hubError, setHubError] = useState<string | null>(null)

  const load = useCallback(() => {
    api.listAgents().then(setAgents).catch(() => setAgents([]))
    api.getUsage().then(setUsage).catch(() => setUsage(0))
  }, [])

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('agenthub-agents-changed', handler)
    window.addEventListener('agenthub-rename', handler)
    return () => {
      window.removeEventListener('agenthub-agents-changed', handler)
      window.removeEventListener('agenthub-rename', handler)
    }
  }, [load])

  const tasksCount = agents.reduce((n, a) => n + a.triggers.filter(t => t.enabled).length, 0)

  const askTeam = async () => {
    const q = hubQuery.trim()
    if (!q || hubLoading) return
    setHubLoading(true)
    setHubError(null)
    try {
      const res = await api.askHub(q)
      setHubQuery('')
      navigate(`/agent/${res.agent_id}`)
    } catch (e) {
      const detail = typeof e === 'string' ? e : e instanceof Error ? e.message : 'erreur inconnue'
      setHubError(
        detail === 'NO_API_KEY'
          ? 'Ajoutez votre clé OpenCode Go dans les Paramètres pour activer vos assistants.'
          : detail,
      )
    } finally {
      setHubLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b00, #e65c00)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>AgentHub</h1>
          </div>
          <p className="text-xs ml-[52px]" style={{ color: 'var(--text-muted)' }}>Vos assistants IA professionnels</p>
        </div>
        <Link
          to="/settings"
          className="p-2.5 rounded-lg transition-all"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <Settings className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="flex items-center gap-2.5 mb-2">
            <Bot className="w-4 h-4" style={{ color: 'var(--orange-400)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Assistants</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{agents.length}</p>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="flex items-center gap-2.5 mb-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--orange-400)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tâches planifiées</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{tasksCount}</p>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="flex items-center gap-2.5 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--orange-400)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Requêtes IA (ce mois)</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{usage}</p>
        </div>
      </div>

      {/* Demander à l'équipe (orchestrateur) */}
      <div className="settings-section mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--orange-400)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Demander à l'équipe</h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— on route vers le bon assistant</span>
        </div>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            value={hubQuery}
            onChange={e => setHubQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askTeam()}
            disabled={hubLoading}
            placeholder="Ex. « Quels clients relancer cette semaine ? » ou « Propose un post Instagram »"
          />
          <button
            onClick={askTeam}
            disabled={hubLoading || !hubQuery.trim()}
            className="btn-primary flex items-center justify-center"
            style={{ padding: '0 18px' }}
          >
            {hubLoading ? '…' : <Send className="w-4 h-4" />}
          </button>
        </div>
        {hubError && (
          <p className="text-xs mt-2" style={{ color: '#fca5a5' }}>⚠️ {hubError}</p>
        )}
      </div>

      {/* Agents grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Vos assistants</h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{agents.length} agents prêts</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {agents.map(agent => (
            <Link
              key={agent.id}
              to={`/agent/${agent.id}`}
              className="agent-card flex flex-col overflow-hidden"
            >
              <div className="flex-1 flex items-end justify-center" style={{ minHeight: 180 }}>
                <AgentAvatar id={agent.role} size={180} />
              </div>
              <div className="px-3 py-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <h3 className="agent-name text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {agent.name}
                </h3>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--orange-400)' }}>
                  {agent.title}
                </p>
                <p className="text-[10px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                  {agent.tools.length} outil{agent.tools.length > 1 ? 's' : ''} · {agent.triggers.length} tâche{agent.triggers.length > 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}

          {/* Add agent */}
          <button
            onClick={() => navigate('/agent/new/config')}
            className="rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
            style={{ background: 'transparent', border: '2px dashed var(--border-subtle)', minHeight: 240 }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.3)'
              e.currentTarget.style.background = 'var(--orange-glow)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <Plus className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Ajouter</span>
          </button>
        </div>
      </div>
    </div>
  )
}
