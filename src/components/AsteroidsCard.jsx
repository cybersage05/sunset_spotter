export default function AsteroidsCard({ neo, loading }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">☄️ Asteroids Today</div>
        <div className="skeleton" style={{ height: 150, borderRadius: 12 }} />
      </div>
    )
  }
  if (!neo) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">☄️ Asteroids Today</div>
        <div className="empty-state">NASA NeoWs is briefly rate-limited — check back soon.</div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">☄️ Asteroids Today</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span className="score-number" style={{ color: 'var(--bg-amber)' }}>{neo.count}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          near-Earth objects passing today
          {neo.hazardous > 0 && <span style={{ color: 'var(--score-low)' }}> · {neo.hazardous} flagged hazardous</span>}
        </span>
      </div>
      {neo.closest && (
        <>
          <div className="data-row">
            <span style={{ color: 'var(--text-secondary)' }}>🎯 Closest pass</span>
            <span className="data-value" style={{ fontSize: '0.82rem' }}>{neo.closest.name}</span>
          </div>
          <div className="data-row">
            <span style={{ color: 'var(--text-secondary)' }}>↔️ Miss distance</span>
            <span className="data-value">{neo.closest.lunar}× Moon distance</span>
          </div>
          <div className="data-row">
            <span style={{ color: 'var(--text-secondary)' }}>⚡ Speed</span>
            <span className="data-value">{neo.closest.speed} km/h</span>
          </div>
          <div className="data-row">
            <span style={{ color: 'var(--text-secondary)' }}>📏 Largest today</span>
            <span className="data-value">~{neo.biggestM} m across</span>
          </div>
        </>
      )}
      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 6 }}>NASA Near-Earth Object Web Service</div>
    </div>
  )
}
