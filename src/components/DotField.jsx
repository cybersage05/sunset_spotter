import { useEffect, useRef } from 'react'

export default function DotField({ paused }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ mouse: { x: -999, y: -999 }, animId: null })

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const COLS = 28, ROWS = 18
    let dots = []

    function buildDots() {
      dots = []
      const gapX = canvas.width / COLS
      const gapY = canvas.height / ROWS
      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          const t = (r / ROWS + c / COLS) / 2
          const color = t < 0.5
            ? lerpColor('#ff6b9d', '#ffb86c', t * 2)
            : lerpColor('#ffb86c', '#5ce1e6', (t - 0.5) * 2)
          dots.push({
            bx: c * gapX, by: r * gapY,
            x: c * gapX, y: r * gapY,
            color, size: Math.random() * 2 + 1.5,
            phase: Math.random() * Math.PI * 2,
          })
        }
      }
    }

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      buildDots()
    }
    resize()
    window.addEventListener('resize', resize)

    function onMouseMove(e) { stateRef.current.mouse = { x: e.clientX, y: e.clientY } }
    function onTouchMove(e) {
      if (e.touches[0]) stateRef.current.mouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    let t = 0
    function tick() {
      if (!paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const { mouse } = stateRef.current
        t += 0.012
        dots.forEach(d => {
          const dx = d.bx - mouse.x, dy = d.by - mouse.y
          const dist = Math.sqrt(dx*dx + dy*dy)
          const wave = Math.sin(t + d.phase) * 6
          const push = Math.max(0, 80 - dist) / 80
          d.x = d.bx + Math.cos(d.phase + t * 0.5) * wave + dx/dist * push * -12
          d.y = d.by + Math.sin(d.phase + t * 0.7) * wave + dy/dist * push * -12
          const alpha = 0.25 + push * 0.5 + Math.abs(Math.sin(t + d.phase)) * 0.15
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.fillStyle = d.color
          ctx.shadowColor = d.color
          ctx.shadowBlur = 4 + push * 8
          ctx.beginPath()
          ctx.arc(d.x, d.y, d.size + push * 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })
      }
      stateRef.current.animId = requestAnimationFrame(tick)
    }
    stateRef.current.animId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      cancelAnimationFrame(stateRef.current.animId)
    }
  }, [paused])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: 0.55 }}
    />
  )
}

function lerpColor(a, b, t) {
  const ah = parseInt(a.replace('#',''), 16)
  const bh = parseInt(b.replace('#',''), 16)
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff
  const r = Math.round(ar + (br-ar)*t)
  const g = Math.round(ag + (bg-ag)*t)
  const bl = Math.round(ab + (bb-ab)*t)
  return `rgb(${r},${g},${bl})`
}
