export default function EonetCard({ events, loading }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🌋 Earth Events</div>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6, borderRadius: 8 }} />)}
      </div>
    )
  }
  if (!events?.length) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🌋 Earth Events</div>
        <div className="empty-state">
          {events ? 'No tracked natural events right now.' : 'NASA EONET is unavailable right now — check back soon.'}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🌋 Earth Events</div>
      {events.map((e, i) => (
        <div key={i} className="viewpoint-item" style={{ padding: '0.6rem 0.85rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {e.emoji} {e.title}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{e.catLabel}</div>
          </div>
          {e.dist != null && (
            <span className="direction-badge" style={{ flexShrink: 0 }}>{Math.round(e.dist).toLocaleString()} km</span>
          )}
        </div>
      ))}
      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 4 }}>Closest live events to you · NASA EONET</div>
    </div>
  )
}
