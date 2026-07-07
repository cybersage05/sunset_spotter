import { useState, useEffect } from 'react'

// ── Cosmic Verse space-data hooks ──
// All endpoints are free & CORS-enabled. NASA endpoints use DEMO_KEY by
// default (30 req/hr per IP) — set VITE_NASA_KEY in .env for your own key.
const NASA_KEY = import.meta.env.VITE_NASA_KEY || 'DEMO_KEY'

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Generic fetch-once hook with sessionStorage cache (spares rate limits on reloads)
function useFetchOnce(url, transform, cacheKey, ttlMin = 60) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!url) { setLoading(false); return }
    let cancelled = false

    if (cacheKey) {
      try {
        const raw = sessionStorage.getItem(cacheKey)
        if (raw) {
          const { t, v } = JSON.parse(raw)
          if (Date.now() - t < ttlMin * 60000) { setData(v); setLoading(false); return }
        }
      } catch { /* ignore bad cache */ }
    }

    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => {
        if (cancelled) return
        const v = transform ? transform(json) : json
        setData(v)
        if (cacheKey && v != null) {
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), v })) } catch { /* quota */ }
        }
      })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return { data, loading }
}

// ── NASA APOD — Astronomy Picture of the Day ──
export function useApod() {
  return useFetchOnce(
    `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&thumbs=true`,
    d => ({
      title: d.title,
      date: d.date,
      explanation: d.explanation,
      mediaType: d.media_type,
      url: d.media_type === 'video' ? (d.thumbnail_url || null) : d.url,
      link: d.media_type === 'video' ? d.url : (d.hdurl || d.url),
      copyright: d.copyright?.trim(),
    }),
    'cv-apod', 180,
  )
}

// ── NASA NeoWs — asteroids approaching Earth today ──
export function useAsteroids() {
  const today = new Date().toISOString().slice(0, 10)
  return useFetchOnce(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_KEY}`,
    d => {
      const list = Object.values(d.near_earth_objects || {}).flat()
      if (!list.length) return { count: 0 }
      const withApproach = list.filter(a => a.close_approach_data?.[0])
      const closest = withApproach.reduce((min, a) =>
        +a.close_approach_data[0].miss_distance.kilometers < +min.close_approach_data[0].miss_distance.kilometers ? a : min)
      const biggest = list.reduce((max, a) =>
        (a.estimated_diameter?.meters?.estimated_diameter_max ?? 0) > (max.estimated_diameter?.meters?.estimated_diameter_max ?? 0) ? a : max)
      const ca = closest.close_approach_data[0]
      return {
        count: list.length,
        hazardous: list.filter(a => a.is_potentially_hazardous_asteroid).length,
        closest: {
          name: closest.name.replace(/[()]/g, ''),
          lunar: (+ca.miss_distance.lunar).toFixed(1),
          km: Math.round(+ca.miss_distance.kilometers).toLocaleString(),
          speed: Math.round(+ca.relative_velocity.kilometers_per_hour).toLocaleString(),
        },
        biggestM: Math.round(biggest.estimated_diameter?.meters?.estimated_diameter_max ?? 0),
      }
    },
    'cv-neo', 180,
  )
}

// ── NASA EPIC — latest full-disc Earth image from DSCOVR (keyless mirror) ──
export function useEpic(lon) {
  return useFetchOnce(
    'https://epic.gsfc.nasa.gov/api/natural',
    arr => {
      if (!arr?.length) return null
      // Pick the frame whose centroid is closest to the user's longitude
      const pick = lon == null ? arr[Math.floor(arr.length / 2)] :
        arr.reduce((best, f) => {
          const d = x => Math.min(Math.abs(x.centroid_coordinates.lon - lon), 360 - Math.abs(x.centroid_coordinates.lon - lon))
          return d(f) < d(best) ? f : best
        })
      const [date] = pick.date.split(' ')
      const [y, m, d] = date.split('-')
      return {
        img: `https://epic.gsfc.nasa.gov/archive/natural/${y}/${m}/${d}/jpg/${pick.image}.jpg`,
        date: pick.date,
      }
    },
    lon != null ? `cv-epic-${Math.round(lon)}` : 'cv-epic', 180,
  )
}

// ── NASA EONET — open natural events near the user ──
// Title → emoji mapping works across EONET v2.1 (numeric ids) and v3 (string ids)
const EONET_TITLE_EMOJI = [
  ['wildfire', '🔥'], ['storm', '🌀'], ['volcano', '🌋'], ['ice', '🧊'],
  ['flood', '🌊'], ['drought', '🏜️'], ['dust', '🌫️'], ['haze', '🌫️'],
  ['landslide', '⛰️'], ['snow', '❄️'], ['temperature', '🌡️'], ['earthquake', '🫨'], ['water', '💧'],
]
export function useEonet(location) {
  // v2.1 endpoint — the v3 API is frequently unavailable
  const { data, loading } = useFetchOnce(
    'https://eonet.gsfc.nasa.gov/api/v2.1/events?status=open&limit=200',
    d => (d.events || []).map(e => {
      const geoms = e.geometry || e.geometries
      const geom = geoms?.[geoms.length - 1]
      const coords = geom?.coordinates
      if (!coords || geom.type !== 'Point') return null
      const [lon, lat] = coords
      const catTitle = (e.categories?.[0]?.title || 'Event')
      const emoji = EONET_TITLE_EMOJI.find(([k]) => catTitle.toLowerCase().includes(k))?.[1] || '🌍'
      return {
        title: e.title,
        emoji,
        catLabel: catTitle,
        lat: +lat, lon: +lon,
      }
    }).filter(e => e && Number.isFinite(e.lat) && Number.isFinite(e.lon)),
    'cv-eonet', 120,
  )

  let events = null
  if (data && location) {
    events = data
      .map(e => ({ ...e, dist: haversine(location.lat, location.lon, e.lat, e.lon) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 4)
  } else if (data) {
    events = data.slice(0, 4)
  }
  return { events, loading }
}

// ── NOAA SWPC — geomagnetic activity (Kp index) + latest solar flare ──
export function useSpaceWeather() {
  const kp = useFetchOnce(
    'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
    arr => {
      const last = arr?.[arr.length - 1]
      if (!last) return null
      const v = +(last.kp_index ?? last.estimated_kp)
      return { kp: Math.round(v * 10) / 10, time: last.time_tag }
    },
    'cv-kp', 20,
  )
  const flare = useFetchOnce(
    'https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json',
    arr => {
      const f = arr?.[0]
      if (!f?.max_class) return null
      return { cls: f.max_class, time: f.max_time }
    },
    'cv-flare', 60,
  )
  return {
    kp: kp.data?.kp ?? null,
    flare: flare.data,
    loading: kp.loading,
  }
}

// ── The Space Devs LL2 — upcoming rocket launches (includes SpaceX) ──
export function useLaunches() {
  return useFetchOnce(
    'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=4&mode=list',
    d => (d.results || []).map(r => ({
      name: r.name,
      net: r.net,
      status: r.status?.abbrev || r.status?.name || '',
      agency: r.lsp_name || '',
      location: r.location || '',
    })),
    'cv-launches', 60,
  )
}

// ── The Space Devs — humans currently in space ──
export function useAstronauts() {
  return useFetchOnce(
    'https://ll.thespacedevs.com/2.2.0/astronaut/?in_space=true&limit=30&mode=list',
    d => ({
      count: d.count ?? d.results?.length ?? 0,
      people: (d.results || []).map(a => ({
        name: a.name,
        agency: a.agency?.abbrev || a.agency?.name || '',
      })),
    }),
    'cv-astro', 360,
  )
}

// ── USGS — significant earthquakes in the last 24h ──
export function useQuakes(location) {
  const { data, loading } = useFetchOnce(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson',
    d => (d.features || []).map(f => ({
      mag: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
    })),
    'cv-quakes', 30,
  )

  let quakes = null
  if (data) {
    const withDist = location
      ? data.map(q => ({ ...q, dist: haversine(location.lat, location.lon, q.lat, q.lon) }))
      : data
    const strongest = data.length ? data.reduce((m, q) => q.mag > m.mag ? q : m) : null
    const nearest = location && withDist.length
      ? withDist.reduce((m, q) => q.dist < m.dist ? q : m)
      : null
    quakes = { count: data.length, strongest, nearest }
  }
  return { quakes, loading }
}

// ── Solar System OpenData (Le Système Solaire) — planet spotlight ──
// The API now needs a (free) bearer token: set VITE_SOLAIRE_KEY to use it live.
// Without a token we serve the same dataset from a local snapshot.
const SOLAIRE_KEY = import.meta.env.VITE_SOLAIRE_KEY
const PLANETS = [
  { id: 'mercure', name: 'Mercury', emoji: '🪨', gravity: 3.7, radiusKm: 2440, moons: 0, yearDays: 88, dayHours: 1407.6, tempC: 167 },
  { id: 'venus', name: 'Venus', emoji: '🌕', gravity: 8.87, radiusKm: 6052, moons: 0, yearDays: 225, dayHours: 5832.5, tempC: 464 },
  { id: 'mars', name: 'Mars', emoji: '🔴', gravity: 3.71, radiusKm: 3390, moons: 2, yearDays: 687, dayHours: 24.6, tempC: -65 },
  { id: 'jupiter', name: 'Jupiter', emoji: '🟠', gravity: 24.79, radiusKm: 69911, moons: 95, yearDays: 4333, dayHours: 9.9, tempC: -110 },
  { id: 'saturne', name: 'Saturn', emoji: '🪐', gravity: 10.44, radiusKm: 58232, moons: 146, yearDays: 10759, dayHours: 10.7, tempC: -140 },
  { id: 'uranus', name: 'Uranus', emoji: '🔵', gravity: 8.87, radiusKm: 25362, moons: 28, yearDays: 30687, dayHours: 17.2, tempC: -195 },
  { id: 'neptune', name: 'Neptune', emoji: '🔷', gravity: 11.15, radiusKm: 24622, moons: 16, yearDays: 60190, dayHours: 16.1, tempC: -200 },
  { id: 'terre', name: 'Earth', emoji: '🌍', gravity: 9.8, radiusKm: 6371, moons: 1, yearDays: 365, dayHours: 23.9, tempC: 15 },
]
export function usePlanet() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const local = PLANETS[dayOfYear % PLANETS.length]
  const [data, setData] = useState(local)

  useEffect(() => {
    if (!SOLAIRE_KEY) return
    let cancelled = false
    fetch(`https://api.le-systeme-solaire.net/rest/bodies/${local.id}`, {
      headers: { Authorization: `Bearer ${SOLAIRE_KEY}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => {
        if (cancelled) return
        setData({
          name: d.englishName || local.name,
          emoji: local.emoji,
          gravity: d.gravity ?? local.gravity,
          radiusKm: Math.round(d.meanRadius) || local.radiusKm,
          moons: d.moons?.length ?? local.moons,
          yearDays: Math.round(d.sideralOrbit) || local.yearDays,
          dayHours: Math.round(Math.abs(d.sideralRotation) * 10) / 10 || local.dayHours,
          tempC: d.avgTemp ? Math.round(d.avgTemp - 273.15) : local.tempC,
        })
      })
      .catch(() => { /* keep local snapshot */ })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.id])

  return { data, loading: false }
}
