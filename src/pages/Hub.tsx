import { Link, useNavigate } from 'react-router-dom'
import { Plus, Settings, Bot, CalendarClock, Sparkles, Send, Zap, Wrench } from 'lucide-react'
import { useState, useEffect, useCallback, type MouseEvent, type CSSProperties } from 'react'
import { listen } from '@tauri-apps/api/event'
import * as api from '../services/api'
import type { Agent } from '../services/api'
import AgentAvatar from '../components/AgentAvatar'
import LicenseBadge from '../components/LicenseBadge'
import { canCreateAgent } from '../services/license'

// ponytail: role accents read from CSS :root vars inline

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
    const unlisten = listen('agent-task-done', () => load())
    return () => {
      window.removeEventListener('agenthub-agents-changed', handler)
      window.removeEventListener('agenthub-rename', handler)
      unlisten.then(f => f())
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

  // Parallax léger au survol des cartes
  const onTilt = (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `translateY(-8px) perspective(900px) rotateX(${-py * 5}deg) rotateY(${px * 5}deg)`
  }
  const resetTilt = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = ''
  }

  const stats = [
    { icon: Bot, label: 'Assistants', value: agents.length },
    { icon: CalendarClock, label: 'Tâches planifiées', value: tasksCount },
    { icon: Zap, label: 'Requêtes IA · ce mois', value: usage },
  ]

  const allowNewAgent = canCreateAgent(agents.length)

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-7">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ff6b00, #e65c00)', boxShadow: '0 6px 24px rgba(255,107,0,0.35)' }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>AgentHub</h1>
            <LicenseBadge />
          </div>
          <p className="text-sm ml-[56px]" style={{ color: 'var(--text-muted)' }}>Votre équipe d'assistants IA, prête à l'emploi.</p>
        </div>
        <Link
          to="/settings"
          className="p-2.5 rounded-xl transition-all"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <Settings className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" style={{ color: 'var(--orange-400)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Composer — Demander à l'équipe */}
      <div className="composer mb-9">
        <div className="flex items-center gap-2 mb-3 relative">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--orange-400)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Demander à l'équipe</h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— l'orchestrateur route vers le bon assistant</span>
        </div>
        <div className="flex gap-2 relative">
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
            style={{ padding: '0 20px' }}
          >
            {hubLoading ? '…' : <Send className="w-4 h-4" />}
          </button>
        </div>
        {hubError && <p className="text-xs mt-2 relative" style={{ color: '#fca5a5' }}>⚠️ {hubError}</p>}
      </div>

      {/* Agents grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Vos assistants</h2>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{agents.length} agents prêts</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {agents.map(agent => (
          <Link
            key={agent.id}
            to={`/agent/${agent.id}`}
            className="agent-card"
            style={{ '--accent': `var(--role-${agent.role}, var(--orange-500))` } as CSSProperties}
            onMouseMove={onTilt}
            onMouseLeave={resetTilt}
          >
            <div className="agent-stage">
              <div className="agent-ground" />
              <AgentAvatar id={agent.role} size={186} />
            </div>
            <div className="agent-plate">
              <h3 className="agent-name text-[15px] font-semibold truncate transition-colors" style={{ color: 'var(--text-primary)' }}>
                {agent.name}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.14em] mt-0.5 font-semibold" style={{ color: 'var(--accent)' as string }}>
                {agent.title}
              </p>
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="meta-chip"><Wrench className="w-2.5 h-2.5" />{agent.tools.length}</span>
                <span className="meta-chip"><CalendarClock className="w-2.5 h-2.5" />{agent.triggers.length}</span>
              </div>
            </div>
          </Link>
        ))}

        {/* Add agent — gated by license */}
        {allowNewAgent ? (
          <button
            onClick={() => navigate('/agent/new/config')}
            className="add-card flex flex-col items-center justify-center gap-2.5"
            style={{ minHeight: 280, background: 'transparent' }}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <Plus className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Ajouter un assistant</span>
          </button>
        ) : (
          <Link
            to="/settings"
            className="add-card flex flex-col items-center justify-center gap-2.5"
            style={{ minHeight: 280, background: 'transparent', opacity: 0.6 }}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--orange-glow)', border: '1px solid var(--orange-400)' }}>
              <Plus className="w-5 h-5" style={{ color: 'var(--orange-400)' }} />
            </div>
            <span className="text-xs font-medium text-center" style={{ color: 'var(--orange-300)' }}>
              Plan limité<br />Passer Pro pour ajouter
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}