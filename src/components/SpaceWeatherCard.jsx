function kpInfo(kp) {
  if (kp == null) return null
  if (kp >= 7) return { label: 'Severe storm', color: 'var(--score-low)', note: 'Aurora possible far from the poles tonight!' }
  if (kp >= 5) return { label: 'Geomagnetic storm', color: 'var(--score-low)', note: 'Aurora likely at high & mid latitudes.' }
  if (kp >= 4) return { label: 'Active', color: 'var(--score-mid)', note: 'Aurora possible at high latitudes.' }
  return { label: 'Quiet', color: 'var(--score-high)', note: 'Calm skies — aurora only near the poles.' }
}

export default function SpaceWeatherCard({ kp, flare, loading }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🌞 Space Weather</div>
        <div className="skeleton" style={{ height: 150, borderRadius: 12 }} />
      </div>
    )
  }
  const info = kpInfo(kp)
  if (!info) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🌞 Space Weather</div>
        <div className="empty-state">Space weather data unavailable right now.</div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🌞 Space Weather</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.85rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="score-number" style={{ color: info.color }}>{kp}</div>
          <div className="label">Kp index</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: info.color, marginBottom: 2 }}>{info.label}</div>
          <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>🌌 {info.note}</div>
        </div>
      </div>
      <div className="score-bar-track" style={{ marginBottom: '0.85rem' }}>
        <div className="score-bar-fill" style={{ width: `${Math.min(100, (kp / 9) * 100)}%`, background: info.color }} />
      </div>
      {flare && (
        <div className="data-row">
          <span style={{ color: 'var(--text-secondary)' }}>🔆 Latest solar flare</span>
          <span className="data-value">Class {flare.cls}</span>
        </div>
      )}
      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 6 }}>NOAA Space Weather Prediction Center</div>
    </div>
  )
}
