import { useEffect, useRef } from 'react'
import { scoreColour } from '../utils/scoring.js'

export default function QualityScore({ data, loading }) {
  const numRef = useRef(null)

  useEffect(() => {
    if (!data || !numRef.current) return
    // Count-up using RAF (anime.js v4 removed object tween API)
    let start = null
    const duration = 1200
    const target = data.score
    function step(ts) {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4)
      if (numRef.current) numRef.current.textContent = Math.round(eased * target)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [data?.score])

  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="skeleton" style={{ height: 160, borderRadius: 12 }} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🌈 Sunset Quality Score</div>
        <div className="empty-state">Waiting for weather data…</div>
      </div>
    )
  }

  const { score, verdict, verdictEmoji, factors } = data
  const color = scoreColour(score)

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🌈 Sunset Quality Score</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
          <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="44" cy="44" r="36" fill="none"
              stroke={color} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - score / 100)}`}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1), stroke 0.5s' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column',
          }}>
            <span className="score-number" ref={numRef} style={{ color }}>{score}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>/100</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{verdictEmoji}</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{verdict}</div>
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <div className="score-bar-track">
          <div className="score-bar-fill" style={{ width: `${score}%`, background: color }} />
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <span className="label">Factors</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {factors.map((f, i) => (
          <span key={i} className={`factor-pill factor-${f.type}`} title={f.detail}>
            {f.type === 'good' ? '▲' : f.type === 'bad' ? '▼' : '●'} {f.label}
          </span>
        ))}
      </div>

      {data.snapshot && (
        <details style={{ marginTop: '0.75rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)', userSelect: 'none' }}>
            Show raw data
          </summary>
          <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
            {[
              ['Cloud total', `${data.snapshot.cloud_cover ?? '—'}%`],
              ['Cloud low', `${data.snapshot.cloud_cover_low ?? '—'}%`],
              ['Cloud mid', `${data.snapshot.cloud_cover_mid ?? '—'}%`],
              ['Cloud high', `${data.snapshot.cloud_cover_high ?? '—'}%`],
              ['Visibility', data.snapshot.visibility != null ? `${(data.snapshot.visibility/1000).toFixed(1)}km` : '—'],
              ['Humidity', `${data.snapshot.humidity ?? '—'}%`],
              ['AOD', data.snapshot.aod?.toFixed(3) ?? '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{k}:</span> {v}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
