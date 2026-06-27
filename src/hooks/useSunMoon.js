import { useMemo } from 'react'
import * as SunCalc from 'suncalc'

// SunCalc v2: azimuth is degrees from north (0=N,90=E,270=W); altitude is degrees above horizon

export function useSunMoon(location) {
  return useMemo(() => {
    if (!location) return { sunData: null, moonData: null }
    const { lat, lon } = location
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)

    const times = SunCalc.getTimes(today, lat, lon)
    const sunPos = SunCalc.getPosition(now, lat, lon)
    const sunAtSunset = SunCalc.getPosition(times.sunset, lat, lon)

    const moonTimes = SunCalc.getMoonTimes(today, lat, lon)
    const moonIllum = SunCalc.getMoonIllumination(now)
    const moonPos = SunCalc.getMoonPosition(now, lat, lon)

    const PHASE_NAMES = [
      'New Moon','Waxing Crescent','First Quarter','Waxing Gibbous',
      'Full Moon','Waning Gibbous','Third Quarter','Waning Crescent',
    ]
    const PHASE_EMOJI = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘']
    const phaseIdx = Math.round(moonIllum.phase * 8) % 8

    let daysToFull = Math.round((0.5 - moonIllum.phase + (moonIllum.phase > 0.5 ? 1 : 0)) * 29.53)
    if (daysToFull === 0 && moonIllum.phase < 0.48) daysToFull = 0

    return {
      sunData: {
        sunrise: times.sunrise,
        sunset: times.sunset,
        solarNoon: times.solarNoon,
        goldenHourMorningEnd: times.goldenHourEnd,
        goldenHourStart: times.goldenHour,
        blueHourStart: times.blueHour || new Date(times.sunset.getTime() - 20 * 60000),
        blueHourEnd: times.blueHourEnd || new Date(times.sunset.getTime() + 40 * 60000),
        dawn: times.dawn,
        dusk: times.dusk,
        nauticalDusk: times.nauticalDusk,
        sunAzimuthDeg: sunAtSunset.azimuth,       // already degrees from north
        currentAltitudeDeg: sunPos.altitude,       // already degrees
        isDay: sunPos.altitude > 0,
      },
      moonData: {
        moonrise: moonTimes.rise,
        moonset: moonTimes.set,
        fraction: moonIllum.fraction,
        phase: moonIllum.phase,
        angle: moonIllum.angle,
        phaseName: PHASE_NAMES[phaseIdx],
        phaseEmoji: PHASE_EMOJI[phaseIdx],
        altitudeDeg: moonPos.altitude,             // already degrees
        daysToFull,
      }
    }
  }, [location?.lat, location?.lon])
}

export function useWeekSunData(location) {
  return useMemo(() => {
    if (!location) return []
    const { lat, lon } = location
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)
      const times = SunCalc.getTimes(date, lat, lon)
      const sunAtSunset = SunCalc.getPosition(times.sunset, lat, lon)
      days.push({
        date,
        sunset: times.sunset,
        sunAzimuthDeg: sunAtSunset.azimuth,        // already degrees from north
        label: i === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' }),
      })
    }
    return days
  }, [location?.lat, location?.lon])
}
