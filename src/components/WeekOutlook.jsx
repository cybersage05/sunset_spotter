import { fmt } from '../utils/time.js'
import { scoreColour } from '../utils/scoring.js'

export default function WeekOutlook({ weekDays, weekScores, loading }) {
  return (
    <div className="glass-card" style={{ marginBottom: '1rem' }}>
      <div className="section-title">📅 7-Day Sunset Outlook</div>
      {loading ? (
        <div className="week-row">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="skeleton" style={{ minWidth: 82, height: 92, borderRadius: 10, flexShrink: 0 }} />
          ))}
        </div>
      ) : (
        <div className="week-row" role="list">
          {weekDays.map((day, i) => {
            const scoreData = weekScores[i]
            const score = scoreData?.score
            const color = score != null ? scoreColour(score) : 'var(--text-muted)'
            return (
              <div key={i} className="week-day-card" role="listitem">
                <div className="label" style={{ marginBottom: 4 }}>{day.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  {fmt(day.sunset)}
                </div>
                {score != null ? (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color, lineHeight: 1 }}>
                      {score}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>/100</div>
                    <div style={{ marginTop: 6 }}>
                      <div className="score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${score}%`, background: color }} />
                      </div>
                    </div>
                    {scoreData?.verdictEmoji && (
                      <div style={{ marginTop: 4, fontSize: '1rem' }}>{scoreData.verdictEmoji}</div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>—</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
