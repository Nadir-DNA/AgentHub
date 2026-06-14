import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react'
import * as api from '../services/api'
import type { Agent, Trigger } from '../services/api'
import { TOOLS, ROLES } from '../services/catalog'
import AgentAvatar from '../components/AgentAvatar'

const CRON_PRESETS = [
  { label: 'Chaque matin (9h)', cron: '0 0 9 * * Mon-Fri' },
  { label: 'Chaque soir (18h)', cron: '0 0 18 * * Mon-Fri' },
  { label: 'Chaque lundi (8h)', cron: '0 0 8 * * Mon' },
  { label: 'Chaque jour (12h)', cron: '0 0 12 * * *' },
]

function blankAgent(): Agent {
  return {
    id: `custom-${Date.now().toString(36)}`,
    name: 'Nouvel assistant',
    role: 'manager',
    title: 'Assistant',
    system_prompt:
      "Tu es un assistant IA professionnel pour une TPE/PME française. Réponds en français, de façon concrète et brève.",
    tools: [],
    triggers: [],
    pack: null,
    enabled: true,
  }
}

export default function AgentConfig() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [draft, setDraft] = useState<Agent | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isNew) {
      setDraft(blankAgent())
      return
    }
    api
      .getAgent(id)
      .then(a => (a ? setDraft(a) : navigate('/')))
      .catch(e => setError(String(e)))
  }, [id, isNew, navigate])

  if (!draft) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
        {error ? `Erreur : ${error}` : 'Chargement…'}
      </div>
    )
  }

  const patch = (p: Partial<Agent>) => setDraft({ ...draft, ...p })

  const toggleTool = (toolId: string) =>
    patch({
      tools: draft.tools.includes(toolId)
        ? draft.tools.filter(t => t !== toolId)
        : [...draft.tools, toolId],
    })

  const updateTrigger = (i: number, p: Partial<Trigger>) =>
    patch({ triggers: draft.triggers.map((t, idx) => (idx === i ? { ...t, ...p } : t)) })

  const addTrigger = () =>
    patch({
      triggers: [
        ...draft.triggers,
        {
          id: `trg-${Date.now().toString(36)}`,
          label: 'Nouvelle tâche planifiée',
          cron: '0 0 9 * * Mon-Fri',
          prompt: '',
          enabled: true,
        },
      ],
    })

  const removeTrigger = (i: number) =>
    patch({ triggers: draft.triggers.filter((_, idx) => idx !== i) })

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await api.saveAgent(draft)
      window.dispatchEvent(new CustomEvent('agenthub-agents-changed'))
      navigate(isNew ? '/' : `/agent/${draft.id}`)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!confirm(`Supprimer définitivement « ${draft.name} » et son historique ?`)) return
    try {
      await api.deleteAgent(draft.id)
      window.dispatchEvent(new CustomEvent('agenthub-agents-changed'))
      navigate('/')
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isNew ? 'Nouvel assistant' : `Configurer ${draft.name}`}
          </h1>
        </div>
        <AgentAvatar id={draft.role} size={56} />
      </div>

      {error && (
        <div className="msg-error px-4 py-3 mb-5 rounded-lg text-sm">⚠️ {error}</div>
      )}

      <div className="space-y-5">
        {/* Identité */}
        <div className="settings-section">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Identité</h2>
          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Nom affiché</label>
          <input
            className="input-field mb-4"
            value={draft.name}
            onChange={e => patch({ name: e.target.value })}
            placeholder="Ex. Cap le Manager"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Titre / spécialité</label>
              <input
                className="input-field"
                value={draft.title}
                onChange={e => patch({ title: e.target.value })}
                placeholder="Ex. Manager"
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Type (avatar)</label>
              <select
                className="input-field"
                value={draft.role}
                onChange={e => patch({ role: e.target.value })}
              >
                {ROLES.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Personnalité / prompt */}
        <div className="settings-section">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Personnalité & mission</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Décrivez en français ce que l'assistant doit faire et comment il doit répondre. C'est ce qui guide ses réponses.
          </p>
          <textarea
            className="input-field"
            style={{ minHeight: 160, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
            value={draft.system_prompt}
            onChange={e => patch({ system_prompt: e.target.value })}
          />
        </div>

        {/* Outils */}
        <div className="settings-section">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Outils connectés</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Activez les outils que cet assistant peut utiliser.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TOOLS.map(t => {
              const on = draft.tools.includes(t.id)
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTool(t.id)}
                  className="flex items-center gap-2 p-3 rounded-lg text-sm text-left transition-all"
                  style={{
                    background: on ? 'var(--orange-glow)' : 'var(--bg-secondary)',
                    border: `1px solid ${on ? 'rgba(255,107,0,0.4)' : 'var(--border-subtle)'}`,
                    color: on ? 'var(--orange-300)' : 'var(--text-secondary)',
                  }}
                >
                  <span>{t.icon}</span>
                  <span className="truncate">{t.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Déclencheurs / crons */}
        <div className="settings-section">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Tâches planifiées</h2>
            <button onClick={addTrigger} className="btn-secondary text-sm inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            L'assistant exécute automatiquement ces demandes selon la fréquence choisie.
          </p>

          {draft.triggers.length === 0 && (
            <p className="text-sm py-3" style={{ color: 'var(--text-muted)' }}>Aucune tâche planifiée.</p>
          )}

          <div className="space-y-4">
            {draft.triggers.map((t, i) => (
              <div
                key={t.id}
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <input
                    className="input-field flex-1"
                    style={{ padding: '8px 12px' }}
                    value={t.label}
                    onChange={e => updateTrigger(i, { label: e.target.value })}
                    placeholder="Nom de la tâche"
                  />
                  <label className="flex items-center gap-1.5 text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={t.enabled}
                      onChange={e => updateTrigger(i, { enabled: e.target.checked })}
                    />
                    Actif
                  </label>
                  <button onClick={() => removeTrigger(i)} className="p-1.5 rounded-lg" title="Supprimer">
                    <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
                <textarea
                  className="input-field mb-3"
                  style={{ minHeight: 56, resize: 'vertical', padding: '8px 12px' }}
                  value={t.prompt}
                  onChange={e => updateTrigger(i, { prompt: e.target.value })}
                  placeholder="Que doit faire l'assistant ? Ex. « Quels clients relancer aujourd'hui ? »"
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  {CRON_PRESETS.map(p => (
                    <button
                      key={p.cron}
                      onClick={() => updateTrigger(i, { cron: p.cron })}
                      className="cron-badge"
                      style={{ cursor: 'pointer', opacity: t.cron === p.cron ? 1 : 0.55 }}
                    >
                      {p.label}
                    </button>
                  ))}
                  <input
                    className="input-field"
                    style={{ padding: '6px 10px', width: 170, fontSize: 12, fontFamily: 'monospace' }}
                    value={t.cron}
                    onChange={e => updateTrigger(i, { cron: e.target.value })}
                    title="Expression cron (sec min heure jour mois jour-semaine)"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!isNew && (
            <button
              onClick={remove}
              className="py-3 px-5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#fca5a5' }}
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          )}
          <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Annuler</button>
          <button
            onClick={save}
            disabled={saving || !draft.name.trim()}
            className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
