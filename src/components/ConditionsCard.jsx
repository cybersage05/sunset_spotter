import { bearingLabel } from '../utils/time.js'

function aqiInfo(aqi) {
  if (aqi == null) return null
  if (aqi <= 20) return { label: 'Good', color: 'var(--score-high)' }
  if (aqi <= 40) return { label: 'Fair', color: 'var(--score-high)' }
  if (aqi <= 60) return { label: 'Moderate', color: 'var(--score-mid)' }
  if (aqi <= 80) return { label: 'Poor', color: 'var(--score-low)' }
  return { label: 'Very poor', color: 'var(--score-low)' }
}

function hints(s) {
  const out = []
  if (s.temp != null && s.temp < 8) out.push('🧥 Bring a warm jacket')
  else if (s.temp != null && s.temp < 16) out.push('🧥 A light jacket helps')
  if (s.precipProb != null && s.precipProb > 40) out.push('☔ Chance of rain — pack cover')
  if (s.windSpeed != null && s.windSpeed > 25) out.push('💨 Windy — secure your tripod')
  if (s.aqi != null && s.aqi <= 20) out.push('🍃 Crisp, clean air tonight')
  return out
}

export default function ConditionsCard({ data, loading }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="skeleton" style={{ height: 160, borderRadius: 12 }} />
      </div>
    )
  }
  const s = data?.snapshot
  if (!s) {
    return (
      <div className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="section-title">🌡️ Conditions at Sunset</div>
        <div className="empty-state">Waiting for weather data…</div>
      </div>
    )
  }

  const aqi = aqiInfo(s.aqi)
  const tips = hints(s)

  const stats = [
    { icon: '🌡️', label: 'Temperature', value: s.temp != null ? `${Math.round(s.temp)}°C` : '—', sub: s.feelsLike != null ? `feels ${Math.round(s.feelsLike)}°C` : null },
    { icon: '💨', label: 'Wind', value: s.windSpeed != null ? `${Math.round(s.windSpeed)} km/h` : '—', sub: s.windDir != null ? bearingLabel(s.windDir) : null },
    { icon: '🌧️', label: 'Rain chance', value: s.precipProb != null ? `${s.precipProb}%` : '—', sub: null },
    { icon: '🫁', label: 'Air quality', value: aqi ? aqi.label : '—', sub: s.pm25 != null ? `PM2.5 ${Math.round(s.pm25)}` : null, color: aqi?.color },
  ]

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🌡️ Conditions at Sunset</div>
      <div className="stat-grid">
        {stats.map((st, i) => (
          <div key={i} className="stat-tile">
            <div style={{ fontSize: '1.3rem', lineHeight: 1 }}>{st.icon}</div>
            <div className="label" style={{ margin: '0.35rem 0 0.15rem' }}>{st.label}</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font-display)', color: st.color || 'var(--bg-amber)' }}>
              {st.value}
            </div>
            {st.sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{st.sub}</div>}
          </div>
        ))}
      </div>
      {tips.length > 0 && (
        <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {tips.map((t, i) => (
            <span key={i} className="factor-pill factor-neutral">{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}
