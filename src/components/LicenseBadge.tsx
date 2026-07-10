// ponytail: trial badge in nav — shows days left or current plan
import { useState, useEffect } from 'react'
import { getPlan, getDaysLeft, PLAN_FEATURES } from '../services/license'

export default function LicenseBadge() {
  const [plan, setPlan] = useState(getPlan())
  const [days, setDays] = useState(getDaysLeft())

  useEffect(() => {
    const handler = () => { setPlan(getPlan()); setDays(getDaysLeft()) }
    window.addEventListener('agenthub-license-changed', handler)
    return () => window.removeEventListener('agenthub-license-changed', handler)
  }, [])

  const label = PLAN_FEATURES[plan].label
  const color = plan === 'trial'
    ? (days <= 3 ? '#fca5a5' : 'var(--orange-300)')
    : 'var(--orange-300)'

  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: 'var(--orange-glow)', color, border: `1px solid var(--border-subtle)` }}
    >
      {plan === 'trial' ? `Trial · ${days}j` : label}
    </span>
  )
}