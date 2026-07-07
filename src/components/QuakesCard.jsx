function magColor(mag) {
  if (mag >= 6.5) return 'var(--score-low)'
  if (mag >= 5.5) return 'var(--score-mid)'
  return 'var(--score-high)'
}

export default function QuakesCard({ quakes, loading }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🌏 Earthquakes (24h)</div>
        <div className="skeleton" style={{ height: 150, borderRadius: 12 }} />
      </div>
    )
  }
  if (!quakes) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🌏 Earthquakes (24h)</div>
        <div className="empty-state">Earthquake feed unavailable right now.</div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🌏 Earthquakes (24h)</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span className="score-number" style={{ color: 'var(--bg-amber)' }}>{quakes.count}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>quakes of M4.5+ worldwide</span>
      </div>
      {quakes.strongest && (
        <div className="data-row">
          <span style={{ color: 'var(--text-secondary)' }}>💥 Strongest</span>
          <span className="data-value" style={{ color: magColor(quakes.strongest.mag), fontSize: '0.84rem', textAlign: 'right' }}>
            M{quakes.strongest.mag.toFixed(1)} — {quakes.strongest.place}
          </span>
        </div>
      )}
      {quakes.nearest && (
        <div className="data-row">
          <span style={{ color: 'var(--text-secondary)' }}>📍 Nearest to you</span>
          <span className="data-value" style={{ fontSize: '0.84rem', textAlign: 'right' }}>
            M{quakes.nearest.mag.toFixed(1)} · {Math.round(quakes.nearest.dist).toLocaleString()} km away
          </span>
        </div>
      )}
      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 6 }}>USGS Earthquake Hazards Program</div>
    </div>
  )
}
