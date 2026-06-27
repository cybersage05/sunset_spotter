export function fmt(date) {
  if (!date || isNaN(date)) return '—'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function fmtDate(date) {
  if (!date || isNaN(date)) return '—'
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function countdown(target) {
  if (!target || isNaN(target)) return null
  const diff = target - Date.now()
  if (diff < 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `${h}h ${m.toString().padStart(2,'0')}m`
  if (m > 0) return `${m}m ${s.toString().padStart(2,'0')}s`
  return `${s}s`
}

export function bearingLabel(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

export function skyGradient(isNight, sunAltDeg) {
  if (isNight) {
    return 'linear-gradient(180deg, #0a0a1f 0%, #0d1128 40%, #1c2541 100%)'
  }
  const alt = sunAltDeg ?? 0
  if (alt > 30) {
    return 'linear-gradient(180deg, #1a1245 0%, #2d1b6e 30%, #6b3fa0 65%, #ffb86c 100%)'
  }
  if (alt > 10) {
    return 'linear-gradient(180deg, #1a1245 0%, #4a2075 25%, #9b3fa0 50%, #ff6b9d 75%, #ffb86c 100%)'
  }
  if (alt > 0) {
    return 'linear-gradient(180deg, #1a1245 0%, #6b3fa0 30%, #ff6b9d 60%, #ffb86c 85%, #fff4e6 100%)'
  }
  if (alt > -6) {
    return 'linear-gradient(180deg, #0d0a2a 0%, #1a1245 25%, #6b3fa0 55%, #ff6b9d 80%, #ffb86c 100%)'
  }
  return 'linear-gradient(180deg, #0a0a1f 0%, #1a1245 50%, #2d1b6e 100%)'
}
