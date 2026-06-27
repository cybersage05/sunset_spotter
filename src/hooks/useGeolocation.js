import { useState, useEffect } from 'react'

const BIGDATA_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

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

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | granted | denied | error
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error')
      setError('Geolocation is not supported by your browser.')
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
        setStatus('denied')
        setError(err.message)
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
