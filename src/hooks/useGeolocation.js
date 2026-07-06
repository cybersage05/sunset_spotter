import { useState, useEffect } from 'react'

const BIGDATA_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'
const IP_URL = 'https://ipwho.is/'

async function reverseGeocode(lat, lon) {
  try {
    const r = await fetch(`${BIGDATA_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
    if (!r.ok) return null
    const d = await r.json()
    const parts = [d.city || d.locality || d.principalSubdivision, d.countryName].filter(Boolean)
    return parts.join(', ') || `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  }
}

// Fallback: approximate location from IP (ipwho.is — free, no key, HTTPS)
async function ipLocate() {
  try {
    const r = await fetch(IP_URL)
    if (!r.ok) return null
    const d = await r.json()
    if (!d.success || d.latitude == null) return null
    return {
      lat: d.latitude,
      lon: d.longitude,
      name: [d.city, d.country].filter(Boolean).join(', ') || 'Approximate location',
    }
  } catch {
    return null
  }
}

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | granted | approximate | denied | error
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fallbackToIP(errMessage) {
      const loc = await ipLocate()
      if (loc) {
        setLocation(loc)
        setStatus('approximate')
        setError(null)
      } else {
        setStatus('denied')
        setError(errMessage)
      }
    }

    if (!navigator.geolocation) {
      fallbackToIP('Geolocation is not supported by your browser.')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        const name = await reverseGeocode(lat, lon)
        setLocation({ lat, lon, name })
        setStatus('granted')
      },
      (err) => {
        fallbackToIP(err.message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  function setManualLocation(loc) {
    setLocation(loc)
    setStatus('granted')
    setError(null)
  }

  return { location, status, error, setManualLocation }
}
