import { useState, useEffect } from 'react'

// Where The ISS At? — free, no key, HTTPS, CORS-enabled live ISS telemetry
const ISS_URL = 'https://api.wheretheiss.at/v1/satellites/25544'

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useISS(location) {
  const [iss, setIss] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const r = await fetch(ISS_URL)
        if (!r.ok) return
        const d = await r.json()
        if (cancelled) return
        const groundDist = location ? haversine(location.lat, location.lon, d.latitude, d.longitude) : null
        setIss({
          lat: d.latitude,
          lon: d.longitude,
          altitude: d.altitude,       // km
          velocity: d.velocity,       // km/h
          visibility: d.visibility,   // 'daylight' | 'eclipsed'
          groundDist,
          overhead: groundDist != null && groundDist < 1200,
        })
      } catch { /* silent — card simply keeps last data */ }
    }

    poll()
    const id = setInterval(poll, 10000)
    return () => { cancelled = true; clearInterval(id) }
  }, [location?.lat, location?.lon])

  return iss
}
