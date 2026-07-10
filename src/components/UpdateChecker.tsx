// ponytail: check for updates on mount, show banner if available
import { useState, useEffect } from 'react'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { Download, X } from 'lucide-react'

export default function UpdateChecker() {
  const [update, setUpdate] = useState<Awaited<ReturnType<typeof check>> | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    check().then(setUpdate).catch(() => {})
  }, [])

  if (!update?.available || dismissed) return null

  const install = async () => {
    setDownloading(true)
    try {
      await update.downloadAndInstall()
      await relaunch()
    } catch {
      setDownloading(false)
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl p-4 flex items-center gap-3"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--orange-400)', boxShadow: '0 8px 30px var(--orange-glow-strong)' }}
    >
      <Download className="w-5 h-5 shrink-0" style={{ color: 'var(--orange-400)' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Mise à jour disponible — v{update.version}
        </p>
        <button
          onClick={install}
          disabled={downloading}
          className="text-xs font-semibold mt-1"
          style={{ color: 'var(--orange-400)' }}
        >
          {downloading ? 'Téléchargement…' : 'Installer maintenant →'}
        </button>
      </div>
      <button onClick={() => setDismissed(true)} style={{ color: 'var(--text-muted)' }}>
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}