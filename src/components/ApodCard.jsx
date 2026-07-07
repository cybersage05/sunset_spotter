export default function ApodCard({ apod, loading }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🔭 Astronomy Picture of the Day</div>
        <div className="skeleton" style={{ height: 260, borderRadius: 12 }} />
      </div>
    )
  }
  if (!apod) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🔭 Astronomy Picture of the Day</div>
        <div className="empty-state">
          NASA APOD is briefly rate-limited — <a href="https://apod.nasa.gov/apod/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }}>view it on apod.nasa.gov ↗</a>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🔭 Astronomy Picture of the Day</div>
      {apod.url && (
        <a href={apod.link} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size: ${apod.title}`}>
          <img src={apod.url} alt={apod.title} className="apod-img" loading="lazy" />
        </a>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600 }}>{apod.title}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{apod.date}{apod.copyright ? ` · © ${apod.copyright}` : ' · NASA'}</div>
      </div>
      <details style={{ marginTop: '0.5rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)', userSelect: 'none' }}>
          What am I looking at?
        </summary>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {apod.explanation}
        </p>
      </details>
    </div>
  )
}
