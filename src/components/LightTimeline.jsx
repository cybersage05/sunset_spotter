import { useState, useEffect } from 'react'
import { fmt } from '../utils/time.js'

function pctOfDay(date) {
  if (!date || isNaN(date)) return null
  const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.max(0, Math.min(100, ((date - midnight) / 86400000) * 100))
}

export default function LightTimeline({ sunData }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  if (!sunData) return null

  const { dawn, sunrise, goldenHourMorningEnd, goldenHourStart, sunset, blueHourEnd, dusk } = sunData
  const p = {
    dawn: pctOfDay(dawn),
    sunrise: pctOfDay(sunrise),
    morningGoldEnd: pctOfDay(goldenHourMorningEnd),
    goldenStart: pctOfDay(goldenHourStart),
    sunset: pctOfDay(sunset),
    blueEnd: pctOfDay(blueHourEnd),
    dusk: pctOfDay(dusk),
  }
  if (p.sunrise == null || p.sunset == null) return null

  const nowPct = pctOfDay(new Date())

  const gradient = `linear-gradient(90deg,
    #0d0a2a 0%,
    #0d0a2a ${(p.dawn ?? p.sunrise - 4) - 2}%,
    #43307a ${p.dawn ?? p.sunrise - 4}%,
    #ffb86c ${p.sunrise}%,
    #8fb7d9 ${p.morningGoldEnd ?? p.sunrise + 5}%,
    #8fb7d9 ${(p.goldenStart ?? p.sunset - 5) - 4}%,
    #ffb86c ${p.goldenStart ?? p.sunset - 5}%,
    #ff6b9d ${p.sunset}%,
    #5c6fe6 ${p.blueEnd ?? p.sunset + 3}%,
    #43307a ${p.dusk ?? p.sunset + 5}%,
    #0d0a2a ${(p.dusk ?? p.sunset + 5) + 2}%,
    #0d0a2a 100%)`

  const markers = [
    { pct: p.sunrise, label: 'Sunrise', time: fmt(sunrise), icon: '🌅' },
    { pct: p.goldenStart, label: 'Golden', time: fmt(goldenHourStart), icon: '✨' },
    { pct: p.sunset, label: 'Sunset', time: fmt(sunset), icon: '🌇' },
    { pct: p.dusk, label: 'Dusk', time: fmt(dusk), icon: '🌆' },
  ].filter(m => m.pct != null).sort((a, b) => a.pct - b.pct)

  // Stagger labels that would overlap onto a second row; hide if both rows are taken
  let lastTop = -Infinity, lastBottom = -Infinity
  for (const m of markers) {
    if (m.pct - lastTop >= 9) { m.row = 0; lastTop = m.pct }
    else if (m.pct - lastBottom >= 9) { m.row = 1; lastBottom = m.pct }
    else { m.row = -1 }
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">🕐 Today's Light</div>
      <div className="timeline-wrap">
        <div className="timeline-bar" style={{ background: gradient }}>
          {nowPct != null && (
            <div className="timeline-now" style={{ left: `${nowPct}%` }} title="Now">
              <div className="timeline-now-dot" />
            </div>
          )}
        </div>
        <div className="timeline-markers">
          {markers.map((m, i) => (
            <div key={i} className="timeline-marker" style={{ left: `${m.pct}%` }}>
              <div className="timeline-tick" style={m.row === 1 ? { height: 14 } : undefined} />
              {m.row >= 0 && (
                <div className="timeline-marker-label" style={m.row === 1 ? { position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '3rem' } : undefined}>
                  <span>{m.icon} {m.label}</span>
                  <span className="timeline-marker-time">{m.time}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
        <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
      </div>
    </div>
  )
}
