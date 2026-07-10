import type { ReactElement } from 'react'

// ponytail: Claude Code icon (thesvg) as base character + iconic accessory per role
// Base path: https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/claude-code/default.svg

const BASE_PATH =
  'M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9 V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z'

// Accessory SVG fragment per role — iconic, immediately recognizable
const ACCESSORIES: Record<string, ReactElement> = {
  // Manager: Captain America shield — round, star center, red/white/blue stripes
  manager: (
    <g className="avatar-accessory">
      <circle cx="20" cy="18" r="6" fill="#b22222" stroke="#1a1a1a" strokeWidth="0.3" />
      <circle cx="20" cy="18" r="5" fill="#f4f2f5" />
      <circle cx="20" cy="18" r="4" fill="#b22222" />
      <circle cx="20" cy="18" r="3" fill="#f4f2f5" />
      <circle cx="20" cy="18" r="2" fill="#1e3a8a" />
      <polygon
        points="20,16.5 20.5,17.5 21.5,17.5 20.7,18.2 21,19.2 20,18.6 19,19.2 19.3,18.2 18.5,17.5 19.5,17.5"
        fill="#f4f2f5"
      />
    </g>
  ),
  // Commercial: Briefcase with dollar sign — businessman style
  commercial: (
    <g className="avatar-accessory">
      <rect x="16" y="17" width="9" height="6" rx="0.5" fill="#8b4513" stroke="#5c2d0e" strokeWidth="0.3" />
      <rect x="18.5" y="15" width="4" height="2" rx="0.3" fill="none" stroke="#5c2d0e" strokeWidth="0.8" />
      <rect x="19.5" y="19" width="2" height="1.5" fill="#ffd700" />
      <text x="20.5" y="21.5" fontSize="2.5" fontWeight="bold" fill="#ffd700" textAnchor="middle">$</text>
      <rect x="16.5" y="22.5" width="8" height="0.5" fill="#5c2d0e" />
    </g>
  ),
  // Marketing: Bow and arrow — targeting customers
  marketing: (
    <g className="avatar-accessory">
      <path d="M15 14 C 12 17, 12 23, 15 26" stroke="#b8860b" strokeWidth="1.2" fill="none" />
      <line x1="15" y1="14" x2="15" y2="26" stroke="#f4f2f5" strokeWidth="0.6" />
      <line x1="15" y1="20" x2="26" y2="20" stroke="#8b4513" strokeWidth="0.8" />
      <polygon points="26,20 24.5,19 24.5,21" fill="#ff6b00" />
      <polygon points="15,19.5 14,20 15,20.5" fill="#b8860b" />
      <polygon points="15.5,19.5 14.5,20 15.5,20.5" fill="#b8860b" />
    </g>
  ),
  // Juridique: Scales of justice — classic legal symbol
  judiciaire: (
    <g className="avatar-accessory">
      <rect x="19.5" y="14" width="2" height="10" fill="#f2c14e" stroke="#b8942e" strokeWidth="0.2" />
      <rect x="15" y="13.5" width="11" height="1" fill="#f2c14e" stroke="#b8942e" strokeWidth="0.2" />
      <rect x="15.5" y="15" width="0.5" height="4" fill="#b8942e" />
      <rect x="25" y="15" width="0.5" height="4" fill="#b8942e" />
      <path d="M14 19 L17 19 L15.5 21 Z" fill="#f2c14e" stroke="#b8942e" strokeWidth="0.2" />
      <path d="M24 19 L27 19 L25.5 21 Z" fill="#f2c14e" stroke="#b8942e" strokeWidth="0.2" />
      <rect x="18" y="23.5" width="5" height="1" rx="0.3" fill="#f2c14e" stroke="#b8942e" strokeWidth="0.2" />
    </g>
  ),
  // Tech & Data: Laptop with code screen — developer style
  techdata: (
    <g className="avatar-accessory">
      <rect x="14" y="17" width="13" height="8" rx="0.5" fill="#2dd4bf" stroke="#1a9a8a" strokeWidth="0.3" />
      <rect x="15" y="18" width="11" height="5.5" fill="#1a1a1a" />
      <rect x="15.5" y="18.5" width="3" height="0.5" fill="#ff6b00" />
      <rect x="15.5" y="19.2" width="5" height="0.5" fill="#f4f2f5" />
      <rect x="15.5" y="19.9" width="2.5" height="0.5" fill="#2dd4bf" />
      <rect x="15.5" y="20.6" width="4" height="0.5" fill="#f2c14e" />
      <rect x="15.5" y="21.3" width="3.5" height="0.5" fill="#f4f2f5" />
      <rect x="15" y="23.5" width="11" height="1" fill="#4a4a4a" />
      <rect x="19" y="23.7" width="3" height="0.6" fill="#2dd4bf" opacity="0.7" />
    </g>
  ),
}

export default function AgentAvatar({ id, size = 200 }: { id: string; size?: number }) {
  const acc = ACCESSORIES[id]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 27"
      fill="none"
      style={{ maxWidth: '100%', height: 'auto' }}
      className="avatar-cut avatar-animated"
    >
      {/* Base Claude Code character */}
      <path d={BASE_PATH} fill="#D97757" className="avatar-base" />
      {/* Accessory overlay */}
      {acc}
    </svg>
  )
}