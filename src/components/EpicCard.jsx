export default function EpicCard({ epic, loading }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🌐 Earth From Space</div>
        <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
      </div>
    )
  }
  if (!epic) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🌐 Earth From Space</div>
        <div className="empty-state">EPIC imagery unavailable right now.</div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🌐 Earth From Space</div>
      <img src={epic.img} alt="Full-disc photo of Earth taken by NASA's EPIC camera" className="epic-img" loading="lazy" />
      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.7rem', lineHeight: 1.5 }}>
        Your side of the planet, photographed from the DSCOVR satellite
        ~1.5 million km away.
      </div>
      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 4 }}>{epic.date} UTC · NASA EPIC</div>
    </div>
  )
}
