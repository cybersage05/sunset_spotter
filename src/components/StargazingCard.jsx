import { scoreColour } from '../utils/scoring.js'

function Bar({ label, pct, hint }) {
  return (
    <div style={{ marginBottom: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color: 'var(--text-muted)' }}>{hint}</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: scoreColour(pct) }} />
      </div>
    </div>
  )
}

export default function StargazingCard({ astro, loading, moonData }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="skeleton" style={{ height: 180, borderRadius: 12 }} />
      </div>
    )
  }
  if (!astro) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🔭 Stargazing Tonight</div>
        <div className="empty-state">Astro forecast unavailable for this location.</div>
      </div>
    )
  }

  const brightMoon = moonData?.fraction != null && moonData.fraction > 0.6
  const color = scoreColour(astro.score)

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🔭 Stargazing Tonight</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div className="score-number" style={{ color }}>{astro.score}</div>
        <div>
          <div style={{ fontSize: '1.1rem' }}>{astro.emoji}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{astro.verdict}</div>
        </div>
      </div>

      <Bar label="Clear sky" pct={astro.clearPct} hint={`${astro.clearPct}% clear`} />
      <Bar label="Air transparency" pct={astro.transPct} hint={`${astro.visKm} km · ${astro.humidity}% RH`} />
      <Bar label="Sky darkness" pct={astro.darkPct} hint={moonData?.fraction != null ? `${Math.round(moonData.fraction * 100)}% moon` : '—'} />

      {brightMoon && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          🌕 {Math.round(moonData.fraction * 100)}% moon will wash out fainter stars — look after moonset if you can.
        </div>
      )}
      <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
        Forecast for ~23:00 tonight · Open-Meteo
      </div>
    </div>
  )
}
