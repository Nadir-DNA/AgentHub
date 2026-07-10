// ponytail: local license — localStorage feature flags, Stripe validates server-side later
// Trial = 14 days full access, then Starter (1 agent). No crypto, no server — just local state.

export type Plan = 'trial' | 'starter' | 'pro' | 'enterprise'

export const PLAN_FEATURES = {
  trial:      { agents: Infinity, packs: true,  label: 'Trial',     customAgents: true  },
  starter:    { agents: 1,         packs: false, label: 'Starter',   customAgents: false },
  pro:        { agents: 5,         packs: true,  label: 'Pro',       customAgents: true  },
  enterprise: { agents: Infinity, packs: true,  label: 'Enterprise',customAgents: true  },
} as const

const TRIAL_DAYS = 14
const KEY = 'agenthub-license'

interface LicenseState {
  plan: Plan
  trialStart: number  // epoch ms
  activatedAt: number | null  // epoch ms, when Stripe key applied
  stripeCustomerId: string | null
}

function load(): LicenseState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupt — reset */ }
  const now = Date.now()
  return { plan: 'trial', trialStart: now, activatedAt: null, stripeCustomerId: null }
}

function save(s: LicenseState) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

function daysLeft(trialStart: number): number {
  return Math.ceil((trialStart + TRIAL_DAYS * 86400000 - Date.now()) / 86400000)
}

// ponytail: this is client-side trust — Stripe webhook validates server-side, this is just UX gating
export function getPlan(): Plan {
  const s = load()
  if (s.plan === 'trial' && daysLeft(s.trialStart) <= 0) return 'starter'
  if (s.plan === 'trial') return 'trial'
  return s.plan
}

export function getDaysLeft(): number {
  return daysLeft(load().trialStart)
}

export function canCreateAgent(currentCount: number): boolean {
  const plan = getPlan()
  const max = PLAN_FEATURES[plan].agents
  return currentCount < max
}

export function canUsePacks(): boolean {
  return PLAN_FEATURES[getPlan()].packs
}

export function canCreateCustomAgents(): boolean {
  return PLAN_FEATURES[getPlan()].customAgents
}

export function activate(plan: Plan, stripeCustomerId?: string) {
  const s = load()
  s.plan = plan
  s.activatedAt = Date.now()
  if (stripeCustomerId) s.stripeCustomerId = stripeCustomerId
  save(s)
}

export function reset() {
  localStorage.removeItem(KEY)
}