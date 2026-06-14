import managerCut from '../assets/agents/manager-cut.png'
import commercialCut from '../assets/agents/commercial-cut.png'
import marketingCut from '../assets/agents/marketing-cut.png'
import judiciaireCut from '../assets/agents/judiciaire-cut.png'
import techdataCut from '../assets/agents/techdata-cut.png'

const CUT: Record<string, string> = {
  manager: managerCut,
  commercial: commercialCut,
  marketing: marketingCut,
  judiciaire: judiciaireCut,
  techdata: techdataCut,
}

/**
 * Avatar d'agent : illustration détourée (PNG transparent) qui flotte sans
 * cadre. L'état « énergisé » (échelle + halo coloré) est piloté en CSS au
 * survol de l'avatar ou de la carte parente (`.agent-card`).
 */
export default function AgentAvatar({ id, size = 200 }: { id: string; size?: number }) {
  const src = CUT[id] || CUT.manager
  return (
    <img
      src={src}
      alt={id}
      draggable={false}
      className="avatar-cut"
      style={{ height: size, width: 'auto', maxWidth: '100%' }}
    />
  )
}
