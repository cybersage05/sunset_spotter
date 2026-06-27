import { useEffect, useRef } from 'react'

function createParticle(w, h, isNight) {
  return {
    x: Math.random() * w,
    y: Math.random() * h - h,
    size: isNight ? Math.random() * 2 + 0.5 : Math.random() * 8 + 4,
    speedY: Math.random() * 1.2 + 0.4,
    speedX: (Math.random() - 0.5) * 0.6,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.04,
    opacity: isNight ? Math.random() * 0.8 + 0.2 : Math.random() * 0.7 + 0.3,
    twinkle: isNight ? Math.random() * 0.02 : 0,
  }
}

function drawPetal(ctx, p) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.angle)
  ctx.globalAlpha = p.opacity
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
  g.addColorStop(0, '#fff4e6')
  g.addColorStop(0.5, '#ff6b9d')
  g.addColorStop(1, 'rgba(255,107,157,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawStar(ctx, p) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.globalAlpha = p.opacity
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 3)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.4, '#cdd6f4')
  g.addColorStop(1, 'rgba(205,214,244,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, p.size * 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export default function PetalsCanvas({ isNight }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ particles: [], animId: null })

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const COUNT = isNight ? 80 : 28
    const isMobile = window.innerWidth < 640

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stateRef.current.particles = Array.from({ length: isMobile ? Math.floor(COUNT * 0.6) : COUNT },
        () => createParticle(canvas.width, canvas.height, isNight))
    }
    resize()
    window.addEventListener('resize', resize)

    function tick() {
      const { particles } = stateRef.current
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        if (isNight) {
          p.opacity += Math.sin(Date.now() * 0.001 + i) * p.twinkle
          p.opacity = Math.max(0.1, Math.min(1, p.opacity))
          drawStar(ctx, p)
          p.y += p.speedY * 0.15
        } else {
          drawPetal(ctx, p)
          p.y += p.speedY
          p.x += p.speedX + Math.sin(Date.now() * 0.0005 + i) * 0.3
          p.angle += p.spin
        }
        if (p.y > canvas.height + 20) {
          Object.assign(p, createParticle(canvas.width, canvas.height, isNight))
          p.y = -20
        }
      })
      stateRef.current.animId = requestAnimationFrame(tick)
    }
    stateRef.current.animId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(stateRef.current.animId)
    }
  }, [isNight])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
    />
  )
}
