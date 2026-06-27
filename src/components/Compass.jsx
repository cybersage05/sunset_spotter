import { useEffect, useRef } from 'react'
import { bearingLabel } from '../utils/time.js'

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

export default function Compass({ azimuth }) {
  const needleRef = useRef(null)
  const prevAz = useRef(null)

  useEffect(() => {
    if (azimuth == null || !needleRef.current) return
    import('animejs').then(({ animate }) => {
      animate(needleRef.current, {
        rotate: [prevAz.current ?? 0, azimuth - 180],
        duration: 1600,
        ease: 'outElastic(1, 0.55)',
      })
      prevAz.current = azimuth - 180
    })
  }, [azimuth])

  if (azimuth == null) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
      </div>
    )
  }

  const label = bearingLabel(azimuth)
  const size = 180

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🧭 Sunset Compass</div>
      <div className="compass-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Sunset at ${Math.round(azimuth)}° ${label}`}>
          {/* Outer ring */}
          <circle cx={size/2} cy={size/2} r={size/2-4} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Cardinal labels */}
          {CARDINALS.map((c, i) => {
            const rad = (ANGLES[i] - 90) * Math.PI / 180
            const r = size/2 - 18
            return (
              <text
                key={c}
                x={size/2 + Math.cos(rad) * r}
                y={size/2 + Math.sin(rad) * r}
                textAnchor="middle" dominantBaseline="central"
                fontSize={c.length === 1 ? 11 : 8}
                fill={c === 'N' ? 'var(--bg-rose)' : 'var(--text-muted)'}
                fontFamily="var(--font-body)" fontWeight={c === 'N' ? 700 : 400}
              >{c}</text>
            )
          })}

          {/* Tick marks */}
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i * 5 - 90) * Math.PI / 180
            const inner = i % 9 === 0 ? size/2-28 : i % 3 === 0 ? size/2-24 : size/2-21
            const outer = size/2-14
            return (
              <line key={i}
                x1={size/2 + Math.cos(a)*inner} y1={size/2 + Math.sin(a)*inner}
                x2={size/2 + Math.cos(a)*outer} y2={size/2 + Math.sin(a)*outer}
                stroke="rgba(255,255,255,0.15)" strokeWidth={i % 9 === 0 ? 1.5 : 0.8}
              />
            )
          })}

          {/* Sunset bearing line */}
          {(() => {
            const rad = (azimuth - 90) * Math.PI / 180
            const r2 = size/2 - 28
            return (
              <line
                x1={size/2} y1={size/2}
                x2={size/2 + Math.cos(rad) * r2} y2={size/2 + Math.sin(rad) * r2}
                stroke="var(--bg-amber)" strokeWidth="2" strokeDasharray="4 3" opacity="0.5"
              />
            )
          })()}

          {/* Needle */}
          <g ref={needleRef} style={{ transformOrigin: `${size/2}px ${size/2}px`, transform: `rotate(${azimuth - 180}deg)` }}>
            {/* North (red) */}
            <polygon
              points={`${size/2},${size/2-44} ${size/2-6},${size/2+6} ${size/2+6},${size/2+6}`}
              fill="var(--bg-rose)"
              filter="url(#glow)"
            />
            {/* South (dark) */}
            <polygon
              points={`${size/2},${size/2+44} ${size/2-6},${size/2-6} ${size/2+6},${size/2-6}`}
              fill="rgba(255,255,255,0.2)"
            />
            <circle cx={size/2} cy={size/2} r="5" fill="var(--bg-cream)" />
          </g>

          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>

        <div style={{ textAlign: 'center' }}>
          <div className="direction-badge">{Math.round(azimuth)}° {label}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Face {label} at sunset
          </div>
        </div>
      </div>
    </div>
  )
}
