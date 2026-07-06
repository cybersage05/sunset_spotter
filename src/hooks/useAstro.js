import { useState, useEffect, useRef } from 'react'

// Stargazing forecast for tonight (~23:00) computed from Open-Meteo night-hour
// data — cloud cover, visibility, humidity — plus moon brightness.
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

function nearestHourIndex(isoTimes, targetDate) {
  const target = targetDate.getTime()
  let best = 0, bestDiff = Infinity
  isoTimes.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - target)
    if (diff < bestDiff) { bestDiff = diff; best = i }
  })
  return best
}

export function useAstro(location, moonFraction) {
  const [astro, setAstro] = useState(null)
  const [loading, setLoading] = useState(false)
  const cacheRef = useRef({})

  useEffect(() => {
    if (!location) return
    const key = `${location.lat.toFixed(2)},${location.lon.toFixed(2)}|${(moonFraction ?? 0).toFixed(2)}`
    if (cacheRef.current[key]) { setAstro(cacheRef.current[key]); return }
    setLoading(true)

    const params = new URLSearchParams({
      latitude: location.lat,
      longitude: location.lon,
      hourly: 'cloud_cover,visibility,relative_humidity_2m',
      forecast_days: 2,
      timezone: 'auto',
    })

    fetch(`${FORECAST_URL}?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const h = data?.hourly
        if (!h?.time?.length) { setAstro(null); return }

        // Tonight around 23:00
        const target = new Date()
        target.setHours(23, 0, 0, 0)
        if (Date.now() > target.getTime() + 2 * 3600000) target.setDate(target.getDate() + 1)
        const idx = nearestHourIndex(h.time, target)

        const cloud = h.cloud_cover?.[idx] ?? 50
        const vis = h.visibility?.[idx] ?? 10000
        const hum = h.relative_humidity_2m?.[idx] ?? 60

        const clearPct = Math.round(100 - cloud)
        let transPct = Math.round(Math.min(100, (vis / 24000) * 100))
        if (hum > 60) transPct = Math.max(0, transPct - Math.round((hum - 60) / 2))
        const darkPct = Math.round(100 - (moonFraction ?? 0) * 80)

        const score = Math.max(0, Math.min(100, Math.round(
          clearPct * 0.6 + transPct * 0.25 + darkPct * 0.15
        )))

        let verdict, emoji
        if (score >= 75) { verdict = 'Excellent — a great night for stars.'; emoji = '🌌' }
        else if (score >= 55) { verdict = 'Good — plenty of stars should be visible.'; emoji = '✨' }
        else if (score >= 35) { verdict = 'Fair — some stars through gaps.'; emoji = '🌠' }
        else { verdict = 'Poor — clouds will hide most of the sky.'; emoji = '☁️' }

        const result = {
          score, verdict, emoji,
          clearPct, transPct, darkPct,
          visKm: (vis / 1000).toFixed(0),
          humidity: Math.round(hum),
        }
        cacheRef.current[key] = result
        setAstro(result)
      })
      .catch(() => setAstro(null))
      .finally(() => setLoading(false))
  }, [location?.lat, location?.lon, moonFraction])

  return { astro, loading }
}
