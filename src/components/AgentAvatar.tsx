import managerImg from '../assets/agents/manager.jpg'
import commercialImg from '../assets/agents/commercial.jpg'
import marketingImg from '../assets/agents/marketing.jpg'
import judiciaireImg from '../assets/agents/judiciaire.jpg'
import techdataImg from '../assets/agents/techdata.jpg'
import managerActive from '../assets/agents/manager-active.jpg'
import commercialActive from '../assets/agents/commercial-active.jpg'
import marketingActive from '../assets/agents/marketing-active.jpg'
import judiciaireActive from '../assets/agents/judiciaire-active.jpg'
import techdataActive from '../assets/agents/techdata-active.jpg'

const REST: Record<string, string> = {
  manager: managerImg,
  commercial: commercialImg,
  marketing: marketingImg,
  judiciaire: judiciaireImg,
  techdata: techdataImg,
}

const ACTIVE: Record<string, string> = {
  manager: managerActive,
  commercial: commercialActive,
  marketing: marketingActive,
  judiciaire: judiciaireActive,
  techdata: techdataActive,
}

/**
 * Avatar d'agent avec deux images : la version « repos » et la version
 * « active » (couleurs boostées + halo) qui apparaît en fondu au survol de
 * l'avatar ou de la carte parente (`.agent-card`).
 */
export default function AgentAvatar({ id, size = 200 }: { id: string; size?: number }) {
  const rest = REST[id] || REST.manager
  const active = ACTIVE[id] || ACTIVE.manager
  // Ratio portrait des illustrations (~0.65) : largeur déterministe pour éviter
  // que les couches absolues ne s'étirent dans les layouts en ligne.
  const width = Math.round(size * 0.68)

  return (
    <div className="avatar" style={{ height: size, width, flexShrink: 0 }}>
      <img src={rest} alt={id} draggable={false} className="avatar-layer avatar-rest" />
      <img src={active} alt="" aria-hidden draggable={false} className="avatar-layer avatar-active" />
    </div>
  )
}
