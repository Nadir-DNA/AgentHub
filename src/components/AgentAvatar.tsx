import managerImg from '../assets/agents/manager.jpg'
import commercialImg from '../assets/agents/commercial.jpg'
import marketingImg from '../assets/agents/marketing.jpg'
import judiciaireImg from '../assets/agents/judiciaire.jpg'
import techdataImg from '../assets/agents/techdata.jpg'

const IMAGES: Record<string, string> = {
  manager: managerImg,
  commercial: commercialImg,
  marketing: marketingImg,
  judiciaire: judiciaireImg,
  techdata: techdataImg,
}

export default function AgentAvatar({ id, size = 200 }: { id: string; size?: number }) {
  const src = IMAGES[id] || IMAGES.manager

  return (
    <img
      src={src}
      alt={id}
      draggable={false}
      style={{
        width: '100%',
        height: size,
        objectFit: 'contain',
        objectPosition: 'center bottom',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
      }}
      className="agent-avatar-img"
    />
  )
}
