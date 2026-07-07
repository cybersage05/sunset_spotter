export default function HumansCard({ crew, loading }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">👨‍🚀 Humans in Space</div>
        <div className="skeleton" style={{ height: 150, borderRadius: 12 }} />
      </div>
    )
  }
  if (!crew?.count) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">👨‍🚀 Humans in Space</div>
        <div className="empty-state">Crew roster unavailable right now.</div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">👨‍🚀 Humans in Space</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span className="score-number" style={{ color: 'var(--accent-cyan)' }}>{crew.count}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>people off the planet right now</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {crew.people.slice(0, 12).map((p, i) => (
          <span key={i} className="factor-pill factor-neutral" title={p.agency}>
            🧑‍🚀 {p.name}
          </span>
        ))}
        {crew.count > 12 && (
          <span className="factor-pill factor-neutral">+{crew.count - 12} more</span>
        )}
      </div>
      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 8 }}>The Space Devs astronaut registry</div>
    </div>
  )
}
