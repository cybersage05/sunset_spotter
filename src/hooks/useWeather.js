import { useState, useEffect, useRef } from 'react'
import { computeScore } from '../utils/scoring.js'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AQ_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

function nearestHourIndex(isoTimes, targetDate) {
  const target = targetDate.getTime()
  let best = 0, bestDiff = Infinity
  isoTimes.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - target)
    if (diff < bestDiff) { bestDiff = diff; best = i }
  })
  return best
}

export function useWeather(location, sunsetTimes) {
  const [hourlyAtSunset, setHourlyAtSunset] = useState(null)
  const [weekScores, setWeekScores] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const cacheRef = useRef({})

  useEffect(() => {
    if (!location || !sunsetTimes?.length) return
    const key = `${location.lat.toFixed(3)},${location.lon.toFixed(3)}`
    if (cacheRef.current[key]) {
      applyCache(cacheRef.current[key], sunsetTimes)
      return
    }
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      latitude: location.lat,
      longitude: location.lon,
      hourly: 'cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,relative_humidity_2m',
      forecast_days: 8,
      timezone: 'auto',
    })
    const aqParams = new URLSearchParams({
      latitude: location.lat,
      longitude: location.lon,
      hourly: 'aerosol_optical_depth',
      forecast_days: 7,
      // Air quality API does not support timezone=auto; times are UTC
    })

    Promise.all([
      fetch(`${FORECAST_URL}?${params}`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`${AQ_URL}?${aqParams}`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([wx, aq]) => {
      const data = { wx, aq }
      cacheRef.current[key] = data
      applyCache(data, sunsetTimes)
    }).catch(e => {
      setError('Weather unavailable')
    }).finally(() => setLoading(false))

    function applyCache({ wx, aq }, times) {
      const times_ = wx.hourly.time
      const scores = times.map(({ date, sunset }) => {
        const idx = nearestHourIndex(times_, sunset)
        const aqIdx = aq ? nearestHourIndex(aq.hourly.time, sunset) : -1
        const snapshot = {
          cloud_cover: wx.hourly.cloud_cover?.[idx],
          cloud_cover_low: wx.hourly.cloud_cover_low?.[idx],
          cloud_cover_mid: wx.hourly.cloud_cover_mid?.[idx],
          cloud_cover_high: wx.hourly.cloud_cover_high?.[idx],
          visibility: wx.hourly.visibility?.[idx],
          humidity: wx.hourly.relative_humidity_2m?.[idx],
          aod: aq && aqIdx >= 0 ? aq.hourly.aerosol_optical_depth?.[aqIdx] : null,
        }
        return { date, sunset, ...computeScore(snapshot), snapshot }
      })
      setHourlyAtSunset(scores[0])
      setWeekScores(scores)
    }
  }, [location?.lat, location?.lon, sunsetTimes])

  return { hourlyAtSunset, weekScores, loading, error }
}
