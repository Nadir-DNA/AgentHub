import { Link, useNavigate } from 'react-router-dom'
import { Plus, Settings, Bot, Calendar, TrendingUp, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { AGENT_META, getAllNames } from '../services/renames'
import AgentAvatar from '../components/AgentAvatar'

// Vue locale du Hub (réécriture sur données Rust prévue au Lot 6).
interface Agent {
  id: string
  name: string
  type: 'manager' | 'commercial' | 'marketing' | 'judiciaire' | 'techdata'
  status: 'active' | 'inactive'
  profile: string
}

export default function Hub() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<Agent[]>([])
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('agenthub-config')
    let activatedAgents = ['manager', 'commercial', 'marketing', 'judiciaire', 'techdata']

    if (saved) {
      try {
        const config = JSON.parse(saved)
        if (config.agents && config.agents.length > 0) {
          activatedAgents = config.agents
        }
      } catch { /* ignore */ }
    }

    const names = getAllNames()

    const agentList: Agent[] = activatedAgents.map(id => ({
      id,
      name: names[id] || id,
      type: id as 'manager' | 'commercial' | 'marketing' | 'judiciaire' | 'techdata',
      status: 'active',
      profile: id,
    }))

    Object.keys(AGENT_META).forEach(id => {
      if (!activatedAgents.includes(id)) {
        agentList.push({
          id,
          name: names[id] || id,
          type: id as 'manager' | 'commercial' | 'marketing' | 'judiciaire' | 'techdata',
          status: 'inactive',
          profile: id,
        })
      }
    })

    setAgents(agentList)
  }, [refresh])

  useEffect(() => {
    const handler = () => setRefresh(n => n + 1)
    window.addEventListener('agenthub-rename', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('agenthub-rename', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const handleAddAgent = () => {
    navigate('/wizard')
  }

  const activeCount = agents.filter(a => a.status === 'active').length

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
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{activeCount}<span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>/{agents.length}</span></p>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="flex items-center gap-2.5 mb-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--orange-400)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tâches planifiées</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{activeCount * 2}</p>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="flex items-center gap-2.5 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--orange-400)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Requêtes IA</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>0</p>
        </div>
      </div>

      {/* Agents grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Vos assistants</h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{activeCount} agents prêts</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {agents.map((agent) => {
            const meta = AGENT_META[agent.id]
            const isActive = agent.status === 'active'

            return (
              <Link
                key={agent.id}
                to={isActive ? `/agent/${agent.id}` : '#'}
                className={`agent-card flex flex-col overflow-hidden ${
                  !isActive ? 'opacity-30 hover:opacity-60' : ''
                }`}
                onClick={e => {
                  if (!isActive) {
                    e.preventDefault()
                    handleAddAgent()
                  }
                }}
              >
                {/* Image — takes most of the card */}
                <div className="flex-1 flex items-end justify-center" style={{ minHeight: 180 }}>
                  <AgentAvatar id={agent.id} size={180} />
                </div>

                {/* Info bar at bottom */}
                <div className="px-3 py-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <h3 className="agent-name text-sm font-semibold truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {agent.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--orange-400)' }}>
                    {meta?.title || ''}
                  </p>
                  <p className="text-[10px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                    {meta?.desc || ''}
                  </p>
                </div>
              </Link>
            )
          })}

          {/* Add agent */}
          <button
            onClick={handleAddAgent}
            className="rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
            style={{
              background: 'transparent',
              border: '2px dashed var(--border-subtle)',
              minHeight: 240,
            }}
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
