import { useState, useEffect, useRef } from 'react'

// Public Overpass endpoints — tried in order, the main one can be flaky
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

async function fetchOverpass(query) {
  for (const url of OVERPASS_MIRRORS) {
    try {
      const r = await fetch(url, { method: 'POST', body: query })
      if (r.ok) return await r.json()
    } catch { /* try next mirror */ }
  }
  throw new Error('All Overpass mirrors failed')
}

function bearing(lat1, lon1, lat2, lon2) {
  const toRad = d => d * Math.PI / 180
  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function azimuthScore(viewpointBearing, sunsetAzimuth) {
  const diff = Math.abs(((viewpointBearing - sunsetAzimuth + 540) % 360) - 180)
  return Math.max(0, 1 - diff / 90)
}

const TYPE_LABELS = {
  viewpoint: '🔭 Viewpoint',
  peak: '⛰️ Peak',
  beach: '🏖️ Beach',
  park: '🌿 Park',
  pier: '⚓ Pier',
}

export function useViewpoints(location, sunsetAzimuth) {
  const [viewpoints, setViewpoints] = useState([])
  const [loading, setLoading] = useState(false)
  const cacheRef = useRef({})

  useEffect(() => {
    if (!location || sunsetAzimuth == null) return
    const key = `${location.lat.toFixed(2)},${location.lon.toFixed(2)}`
    if (cacheRef.current[key]) {
      rankAndSet(cacheRef.current[key], location, sunsetAzimuth)
      return
    }
    setLoading(true)

    const { lat, lon } = location
    const query = `[out:json][timeout:20];
(
  node["tourism"="viewpoint"](around:12000,${lat},${lon});
  node["natural"="peak"](around:12000,${lat},${lon});
  node["natural"="beach"](around:10000,${lat},${lon});
  node["leisure"="park"]["name"](around:5000,${lat},${lon});
  node["man_made"="pier"](around:8000,${lat},${lon});
);
out body 40;`

    fetchOverpass(query)
      .then(data => {
        cacheRef.current[key] = data.elements || []
        rankAndSet(cacheRef.current[key], location, sunsetAzimuth)
      })
      .catch(() => setViewpoints([]))
      .finally(() => setLoading(false))
  }, [location?.lat, location?.lon])

  useEffect(() => {
    const key = location ? `${location.lat.toFixed(2)},${location.lon.toFixed(2)}` : null
    if (key && cacheRef.current[key] && sunsetAzimuth != null) {
      rankAndSet(cacheRef.current[key], location, sunsetAzimuth)
    }
  }, [sunsetAzimuth])

  function rankAndSet(elements, loc, az) {
    const seen = new Set()
    const ranked = elements
      .filter(e => {
        const name = e.tags?.name || e.tags?.['name:en'] || ''
        if (!name) return false
        if (seen.has(name)) return false
        seen.add(name)
        return true
      })
      .map(e => {
        const dist = haversine(loc.lat, loc.lon, e.lat, e.lon)
        const bear = bearing(loc.lat, loc.lon, e.lat, e.lon)
        const azScore = azimuthScore(bear, az)
        const distScore = Math.max(0, 1 - dist / 12)
        const finalScore = azScore * 0.7 + distScore * 0.3
        const type = Object.keys(TYPE_LABELS).find(k => e.tags?.[k === 'peak' ? 'natural' : k === 'beach' ? 'natural' : k === 'park' ? 'leisure' : k === 'pier' ? 'man_made' : 'tourism'] === (k === 'viewpoint' ? 'viewpoint' : k)) || 'viewpoint'
        return {
          name: e.tags?.name || e.tags?.['name:en'] || 'Unnamed spot',
          type: TYPE_LABELS[type] || '📍 Spot',
          dist: dist.toFixed(1),
          bear: bear.toFixed(0),
          azScore: (azScore * 100).toFixed(0),
          finalScore,
          lat: e.lat,
          lon: e.lon,
        }
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 6)
    setViewpoints(ranked)
  }

  return { viewpoints, loading }
}
