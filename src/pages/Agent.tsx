import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Send, Clock, Wrench } from 'lucide-react'
import * as api from '../services/api'
import type { Message } from '../services/api'
import { getAgentName, getAgentShort, AGENT_META } from '../services/renames'
import AgentAvatar from '../components/AgentAvatar'

const TOOLS_AVAILABLE = [
  { id: 'planity', name: 'Planity', icon: '📅', category: 'planning' },
  { id: 'doctolib', name: 'Doctolib', icon: '📅', category: 'planning' },
  { id: 'google-agenda', name: 'Google Agenda', icon: '📅', category: 'planning' },
  { id: 'qonto', name: 'Qonto', icon: '💰', category: 'compta' },
  { id: 'pennylane', name: 'Pennylane', icon: '💰', category: 'compta' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', category: 'messagerie' },
  { id: 'google-avis', name: 'Google Avis', icon: '⭐', category: 'visibilité' },
  { id: 'instagram', name: 'Instagram', icon: '📸', category: 'réseaux' },
  { id: 'google-drive', name: 'Google Drive', icon: '☁️', category: 'stockage' },
  { id: 'yousign', name: 'Yousign', icon: '✍️', category: 'signature' },
]

const CRONS_DEFAULT = [
  { id: '1', label: 'Relance clients J-1', schedule: 'Chaque jour à 9h00' },
  { id: '2', label: 'Bilan de la journée', schedule: 'Chaque soir à 18h00' },
]

export default function Agent() {
  const { id = 'manager' } = useParams()
  const meta = AGENT_META[id] || AGENT_META.manager

  const greeting = (): Message => ({
    id: '0',
    agent_id: id,
    role: 'assistant',
    content: `Bonjour ! Je suis ${getAgentName(id)}, votre assistant ${meta.title}. Comment puis-je vous aider aujourd'hui ?`,
    timestamp: new Date().toISOString(),
  })

  const [messages, setMessages] = useState<Message[]>([greeting()])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setRefreshKey(n => n + 1)
    window.addEventListener('agenthub-rename', handler)
    return () => window.removeEventListener('agenthub-rename', handler)
  }, [])

  useEffect(() => {
    api.getHistory(id)
      .then(msgs => setMessages(msgs.length > 0 ? msgs : [greeting()]))
      .catch(() => setMessages([greeting()]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, refreshKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const content = text || input
    if (!content.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      agent_id: id,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const reply = await api.sendMessage(id, content)
      setMessages(prev => [...prev, reply])
    } catch (error) {
      const detail =
        typeof error === 'string' ? error : error instanceof Error ? error.message : 'erreur inconnue'
      const errContent =
        detail === 'NO_API_KEY'
          ? "⚠️ Aucune clé API configurée. Ajoutez votre clé OpenCode Go dans les Paramètres pour activer les réponses."
          : `⚠️ ${detail}`
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        agent_id: id,
        role: 'assistant',
        content: errContent,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="header-bar px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-lg transition-all"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <AgentAvatar id={id} size={40} />
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{getAgentName(id)} · {meta.title}</h2>
              <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--orange-400)' }}>
                <span className="w-1.5 h-1.5 rounded-full status-dot-orange" style={{ background: 'var(--orange-500)' }} />
                Connecté
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-5 py-3.5 text-[15px] leading-relaxed ${
                msg.role === 'user' ? 'msg-user' : msg.content.startsWith('⚠️') ? 'msg-error' : 'msg-assistant'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="msg-assistant px-5 py-3.5 flex items-center gap-3">
                <span className="flex gap-1.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{getAgentShort(id)} réfléchit…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="shrink-0 px-6 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-1">
          {meta.prompts.map(p => (
            <button
              key={p.label}
              onClick={() => handleSend(p.text)}
              disabled={isLoading}
              className="quick-action flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Crons */}
      <div className="shrink-0 px-6 py-2" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto">
          <Clock className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
          {CRONS_DEFAULT.map(c => (
            <span key={c.id} className="cron-badge">
              ⏰ {c.label} <span style={{ color: 'var(--text-muted)' }}>→ {c.schedule}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="shrink-0 px-6 py-2" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto">
          <Wrench className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
          {TOOLS_AVAILABLE.filter(t => meta.tools.includes(t.id)).map(t => (
            <span key={t.id} className="tool-badge active">✅ {t.name}</span>
          ))}
          {TOOLS_AVAILABLE.filter(t => !meta.tools.includes(t.id)).slice(0, 3).map(t => (
            <span key={t.id} className="tool-badge">⬜ {t.name}</span>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 p-4" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            placeholder={isLoading ? `${getAgentShort(id)} réfléchit…` : `Parle à ${getAgentShort(id)}...`}
            className="input-field flex-1"
            style={{ fontSize: 15 }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="btn-primary flex items-center justify-center"
            style={{ padding: '14px 20px' }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
