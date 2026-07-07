export default function PlanetCard({ planet, loading }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🪐 Planet of the Day</div>
        <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
      </div>
    )
  }
  if (!planet) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🪐 Planet of the Day</div>
        <div className="empty-state">Solar system data unavailable right now.</div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🪐 Planet of the Day</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: '2.6rem', lineHeight: 1 }}>{planet.emoji}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--bg-amber)' }}>
          {planet.name}
        </span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>📏 Radius</span>
        <span className="data-value">{planet.radiusKm.toLocaleString()} km</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>🏋️ Gravity</span>
        <span className="data-value">{planet.gravity} m/s²</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>🌙 Moons</span>
        <span className="data-value">{planet.moons}</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>🗓️ Year length</span>
        <span className="data-value">{planet.yearDays.toLocaleString()} days</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>{planet.tempC != null ? '🌡️ Avg temp' : '🕐 Day length'}</span>
        <span className="data-value">{planet.tempC != null ? `${planet.tempC}°C` : `${planet.dayHours} h`}</span>
      </div>
      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 6 }}>Solar System OpenData</div>
    </div>
  )
}
