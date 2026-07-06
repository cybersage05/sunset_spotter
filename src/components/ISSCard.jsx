export default function ISSCard({ iss }) {
  if (!iss) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🛰️ ISS Live</div>
        <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
      </div>
    )
  }

  const latLabel = `${Math.abs(iss.lat).toFixed(1)}°${iss.lat >= 0 ? 'N' : 'S'}`
  const lonLabel = `${Math.abs(iss.lon).toFixed(1)}°${iss.lon >= 0 ? 'E' : 'W'}`

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">
        🛰️ ISS Live <span className="live-dot" aria-hidden="true" />
      </div>

      {iss.overhead && (
        <div style={{
          marginBottom: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 8,
          background: 'rgba(92,225,230,0.12)', border: '1px solid rgba(92,225,230,0.25)',
          fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600,
        }}>
          👀 The ISS is in your part of the sky right now{iss.visibility === 'daylight' ? '' : ' — it may be visible as a fast-moving star'}!
        </div>
      )}

      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>📍 Position</span>
        <span className="data-value">{latLabel}, {lonLabel}</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>⬆️ Altitude</span>
        <span className="data-value">{Math.round(iss.altitude)} km</span>
      </div>
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>⚡ Speed</span>
        <span className="data-value">{Math.round(iss.velocity).toLocaleString()} km/h</span>
      </div>
      {iss.groundDist != null && (
        <div className="data-row">
          <span style={{ color: 'var(--text-secondary)' }}>↔️ From you</span>
          <span className="data-value">{Math.round(iss.groundDist).toLocaleString()} km</span>
        </div>
      )}
      <div className="data-row">
        <span style={{ color: 'var(--text-secondary)' }}>{iss.visibility === 'daylight' ? '☀️' : '🌑'} Currently in</span>
        <span className="data-value">{iss.visibility === 'daylight' ? 'Daylight' : "Earth's shadow"}</span>
      </div>
    </div>
  )
}
