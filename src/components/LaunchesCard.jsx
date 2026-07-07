import { useState, useEffect } from 'react'
import { countdown } from '../utils/time.js'

export default function LaunchesCard({ launches, loading }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🚀 Next Launches</div>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 6, borderRadius: 8 }} />)}
      </div>
    )
  }
  if (!launches?.length) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🚀 Next Launches</div>
        <div className="empty-state">Launch schedule unavailable right now.</div>
      </div>
    )
  }

  const next = launches[0]
  const toNext = countdown(new Date(next.net))

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🚀 Next Launches</div>
      {toNext && (
        <div style={{ textAlign: 'center', marginBottom: '0.9rem' }}>
          <div className="label" style={{ marginBottom: 2 }}>Next liftoff in</div>
          <div className="countdown-display" style={{ fontSize: '1.7rem' }}>T− {toNext}</div>
        </div>
      )}
      {launches.slice(0, 3).map((l, i) => (
        <div key={i} className="viewpoint-item" style={{ padding: '0.6rem 0.85rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {[l.agency, l.location].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--bg-amber)', fontWeight: 600 }}>
              {new Date(l.net).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {new Date(l.net).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 4 }}>All agencies incl. SpaceX · The Space Devs</div>
    </div>
  )
}
