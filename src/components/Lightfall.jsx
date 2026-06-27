import { useEffect, useRef } from 'react'

const COLORS = ['#cdd6f4', '#6b3fa0', '#f5d58a', '#9b8ec4', '#cba6f7']

function createStreak(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h - h * 0.5,
    len: Math.random() * 120 + 60,
    speed: Math.random() * 1.8 + 0.6,
    width: Math.random() * 1.5 + 0.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.5 + 0.15,
    wobble: Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
  }
}

export default function Lightfall({ paused }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ streaks: [], animId: null })

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const isMobile = window.innerWidth < 640
    const COUNT = isMobile ? 30 : 55

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stateRef.current.streaks = Array.from({ length: COUNT }, () => {
        const s = createStreak(canvas.width, canvas.height)
        s.y = Math.random() * canvas.height
        return s
      })
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    function tick() {
      if (!paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        t += 0.008
        stateRef.current.streaks.forEach(s => {
          const wx = Math.sin(t + s.phase) * s.wobble
          s.y += s.speed
          s.x += wx

          const grad = ctx.createLinearGradient(s.x, s.y - s.len, s.x + wx * 20, s.y)
          grad.addColorStop(0, 'rgba(0,0,0,0)')
          grad.addColorStop(0.4, hexAlpha(s.color, s.alpha * 0.3))
          grad.addColorStop(0.85, hexAlpha(s.color, s.alpha))
          grad.addColorStop(1, hexAlpha(s.color, s.alpha * 0.6))

          ctx.save()
          ctx.strokeStyle = grad
          ctx.lineWidth = s.width
          ctx.shadowColor = s.color
          ctx.shadowBlur = 6
          ctx.globalAlpha = 1
          ctx.beginPath()
          ctx.moveTo(s.x, s.y - s.len)
          ctx.lineTo(s.x + wx * 20, s.y)
          ctx.stroke()
          ctx.restore()

          if (s.y > canvas.height + s.len) {
            Object.assign(s, createStreak(canvas.width, canvas.height))
            s.y = -s.len
          }
        })
      }
      stateRef.current.animId = requestAnimationFrame(tick)
    }
    stateRef.current.animId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(stateRef.current.animId)
    }
  }, [paused])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: 0.7 }}
    />
  )
}

function hexAlpha(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0,2),16)
  const g = parseInt(h.slice(2,4),16)
  const b = parseInt(h.slice(4,6),16)
  return `rgba(${r},${g},${b},${alpha})`
}
