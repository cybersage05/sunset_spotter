import { useEffect, useRef } from 'react'
import { fmt } from '../utils/time.js'

function drawMoon(canvas, fraction, phase) {
  const ctx = canvas.getContext('2d')
  const s = canvas.width
  const cx = s / 2, cy = s / 2, r = s / 2 - 4

  ctx.clearRect(0, 0, s, s)

  // Dark base
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = '#1c2541'
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()

  const isWaxing = phase < 0.5
  // ew: semi-minor axis of the terminator ellipse
  // (1-2f)*r goes from +r (new) → 0 (quarter) → -r (full); use abs for ellipse size
  const ew = Math.abs(1 - 2 * fraction) * r

  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.4, '#e8ecf5')
  grad.addColorStop(0.8, '#cdd6f4')
  grad.addColorStop(1, '#9ba8c7')
  ctx.fillStyle = grad

  // Each shape = outer disc arc on the lit side + inner ellipse arc on the terminator side,
  // forming one continuous closed path that correctly bounds the illuminated region.
  ctx.beginPath()
  if (isWaxing) {
    if (fraction >= 0.5) {
      // Waxing gibbous: right disc arc (top→bottom) + left ellipse arc (bottom→top)
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2)
      ctx.ellipse(cx, cy, ew, r, 0, Math.PI / 2, -Math.PI / 2)
    } else {
      // Waxing crescent: right ellipse only (top→bottom)
      ctx.ellipse(cx, cy, ew, r, 0, -Math.PI / 2, Math.PI / 2)
    }
  } else {
    if (fraction >= 0.5) {
      // Waning gibbous: left disc arc (bottom→top) + right ellipse arc (top→bottom)
      ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2)
      ctx.ellipse(cx, cy, ew, r, 0, -Math.PI / 2, Math.PI / 2)
    } else {
      // Waning crescent: left ellipse only (bottom→top)
      ctx.ellipse(cx, cy, ew, r, 0, Math.PI / 2, -Math.PI / 2)
    }
  }
  ctx.closePath()
  ctx.fill()

  ctx.restore()

  // Limb ring
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(205,214,244,0.3)'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

export default function MoonCard({ moonData }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!moonData || !canvasRef.current) return
    drawMoon(canvasRef.current, moonData.fraction, moonData.phase)
  }, [moonData?.fraction, moonData?.phase])

  if (!moonData) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
      </div>
    )
  }

  const { moonrise, moonset, fraction, phaseName, phaseEmoji, daysToFull } = moonData

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🌙 Moon Tonight</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
        <canvas
          ref={canvasRef}
          className="moon-canvas"
          width={90}
          height={90}
          aria-label={`Moon phase: ${phaseName}, ${Math.round(fraction * 100)}% illuminated`}
        />
        <div>
          <div className="phase-icon" style={{ marginBottom: 4 }}>{phaseEmoji}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>{phaseName}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {Math.round(fraction * 100)}% illuminated
          </div>
          {daysToFull === 0 ? (
            <div style={{ fontSize: '0.78rem', color: 'var(--bg-amber)', marginTop: 4 }}>🌕 Full moon tonight!</div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {daysToFull} day{daysToFull !== 1 ? 's' : ''} to full moon
            </div>
          )}
        </div>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>🌙 Moonrise</span>
        <span className="data-value">{moonrise ? fmt(moonrise) : '—'}</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>🌑 Moonset</span>
        <span className="data-value">{moonset ? fmt(moonset) : '—'}</span>
      </div>
    </div>
  )
}
