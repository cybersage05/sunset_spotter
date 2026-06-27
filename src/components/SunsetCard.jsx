import { useState, useEffect } from 'react'
import { fmt, countdown } from '../utils/time.js'

export default function SunsetCard({ sunData, isNight }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (!sunData) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="skeleton" style={{ height: 180, borderRadius: 12 }} />
      </div>
    )
  }

  const { sunrise, sunset, solarNoon, goldenHourStart, goldenHourMorningEnd, blueHourStart, blueHourEnd } = sunData
  const toSunset = countdown(sunset)
  const toGolden = countdown(goldenHourStart)
  const now = new Date()
  const pastSunset = now > sunset
  const inGolden = now >= goldenHourStart && now <= blueHourStart
  const inBlue = now >= blueHourStart && now <= blueHourEnd

  const orb = isNight ? 'orb-moon' : 'orb-sun'

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className={orb} />
        <div>
          <div className="label">Tonight's Sunset</div>
          <div className="title-display" style={{ fontSize: '1.7rem', color: 'var(--bg-amber)' }}>
            {fmt(sunset)}
          </div>
          {!pastSunset && toSunset ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              ⏱ in {toSunset}
            </div>
          ) : pastSunset ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sunset has passed</div>
          ) : null}
        </div>
      </div>

      {(inGolden || inBlue) && (
        <div style={{
          marginBottom: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 8,
          background: inGolden ? 'rgba(255,184,108,0.15)' : 'rgba(92,225,230,0.12)',
          border: `1px solid ${inGolden ? 'rgba(255,184,108,0.3)' : 'rgba(92,225,230,0.25)'}`,
          fontSize: '0.82rem', color: inGolden ? 'var(--bg-amber)' : 'var(--accent-cyan)',
          fontWeight: 600,
        }}>
          {inGolden ? '✨ Golden hour now' : '🌀 Blue hour now'} — go outside!
        </div>
      )}

      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>🌅 Sunrise</span>
        <span className="data-value">{fmt(sunrise)}</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>☀️ Solar noon</span>
        <span className="data-value">{fmt(solarNoon)}</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>🌇 Sunset</span>
        <span className="data-value">{fmt(sunset)}</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>✨ Golden hour</span>
        <span className="data-value">{fmt(goldenHourStart)} – {fmt(blueHourStart)}</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>🌀 Blue hour</span>
        <span className="data-value">{fmt(blueHourStart)} – {fmt(blueHourEnd)}</span>
      </div>

      {!pastSunset && toGolden && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <div className="label" style={{ marginBottom: 4 }}>Golden hour starts in</div>
          <div className="countdown-display">{toGolden}</div>
        </div>
      )}
    </div>
  )
}
