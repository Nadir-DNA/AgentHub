import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Fond ambiant léger (three.js) : quelques blobs lumineux qui dérivent
 * lentement, en fondu additif, derrière toute l'interface. Très subtil,
 * capé en DPR, désactivé si prefers-reduced-motion ou WebGL absent.
 */
export default function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    } catch {
      return // WebGL indisponible → on laisse l'aurora CSS faire le travail
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    camera.position.z = 14

    // Sprite radial doux
    const tex = (() => {
      const c = document.createElement('canvas')
      c.width = c.height = 128
      const g = c.getContext('2d')!
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
      grd.addColorStop(0, 'rgba(255,255,255,1)')
      grd.addColorStop(0.25, 'rgba(255,255,255,0.55)')
      grd.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grd
      g.fillRect(0, 0, 128, 128)
      return new THREE.CanvasTexture(c)
    })()

    const COLORS = [0xff6b00, 0xff8c1a, 0xb15cff, 0x4f8cff, 0x2dd4bf]
    const blobs: { sprite: THREE.Sprite; speed: number; phase: number; baseX: number; baseY: number }[] = []
    const group = new THREE.Group()

    for (let i = 0; i < 14; i++) {
      const color = COLORS[i % COLORS.length]
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color,
        transparent: true,
        opacity: 0.12 + Math.random() * 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(mat)
      const baseX = (Math.random() - 0.5) * 26
      const baseY = (Math.random() - 0.5) * 18
      sprite.position.set(baseX, baseY, (Math.random() - 0.5) * 6)
      const s = 5 + Math.random() * 7
      sprite.scale.set(s, s, 1)
      group.add(sprite)
      blobs.push({ sprite, speed: 0.06 + Math.random() * 0.12, phase: Math.random() * Math.PI * 2, baseX, baseY })
    }
    scene.add(group)

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    const clock = new THREE.Clock()
    const animate = () => {
      const t = clock.getElapsedTime()
      for (const b of blobs) {
        b.sprite.position.x = b.baseX + Math.sin(t * b.speed + b.phase) * 2.2
        b.sprite.position.y = b.baseY + Math.cos(t * b.speed * 0.8 + b.phase) * 1.6
      }
      group.rotation.z = Math.sin(t * 0.03) * 0.05
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      tex.dispose()
      blobs.forEach(b => (b.sprite.material as THREE.SpriteMaterial).dispose())
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  )
}
