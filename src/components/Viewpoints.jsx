import { bearingLabel } from '../utils/time.js'

export default function Viewpoints({ viewpoints, loading, sunsetAzimuth }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">📍 Best Spots Nearby</div>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 6, borderRadius: 8 }} />)}
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">📍 Best Spots Nearby</div>
      {viewpoints.length === 0 ? (
        <div className="empty-state">
          No viewpoints found nearby — try zooming out or searching a different area.
        </div>
      ) : (
        viewpoints.map((v, i) => (
          <div key={i} className="viewpoint-item">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {v.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span>{v.type}</span>
                <span>↔ {v.dist} km</span>
                <span style={{ color: Number(v.azScore) > 60 ? 'var(--score-high)' : Number(v.azScore) > 30 ? 'var(--score-mid)' : 'var(--score-low)' }}>
                  {Number(v.azScore) > 60 ? '★' : Number(v.azScore) > 30 ? '◇' : '○'} {v.azScore}% sunset view
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
              <span className="direction-badge">{v.bear}° {bearingLabel(Number(v.bear))}</span>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
                aria-label={`Directions to ${v.name}`}
              >
                Directions ↗
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
