export function computeScore(data) {
  const {
    cloud_cover,
    cloud_cover_low,
    cloud_cover_mid,
    cloud_cover_high,
    visibility,
    humidity,
    aod,
  } = data

  let score = 50
  const factors = []

  // ── High/cirrus clouds: catch and scatter colour ──
  const high = cloud_cover_high ?? 0
  if (high > 60) {
    score += 18
    factors.push({ label: `High cirrus ${high}%`, type: 'good', detail: 'Cirrus clouds scatter golden light' })
  } else if (high > 25) {
    score += 10
    factors.push({ label: `Some cirrus ${high}%`, type: 'good', detail: 'Light scatter expected' })
  } else if (high < 10) {
    score -= 5
    factors.push({ label: 'Clear sky above', type: 'neutral', detail: 'No high clouds to catch colour' })
  }

  // ── Low clouds: block horizon ──
  const low = cloud_cover_low ?? 0
  if (low > 60) {
    score -= 22
    factors.push({ label: `Heavy low cloud ${low}%`, type: 'bad', detail: 'Will block the sun at the horizon' })
  } else if (low > 30) {
    score -= 12
    factors.push({ label: `Low cloud ${low}%`, type: 'bad', detail: 'Partial horizon obstruction' })
  } else if (low < 10) {
    score += 8
    factors.push({ label: 'Clear horizon', type: 'good', detail: 'Low clouds won\'t block the sun' })
  }

  // ── Mid-level clouds: moderate effect ──
  const mid = cloud_cover_mid ?? 0
  if (mid > 70) {
    score -= 8
    factors.push({ label: `Dense mid cloud ${mid}%`, type: 'bad', detail: 'May mute colours' })
  } else if (mid > 20 && mid <= 70) {
    score += 5
    factors.push({ label: `Mid cloud ${mid}%`, type: 'good', detail: 'Can add dramatic texture' })
  }

  // ── Total overcast ──
  const total = cloud_cover ?? 0
  if (total > 90) {
    score -= 15
    factors.push({ label: `Overcast ${total}%`, type: 'bad', detail: 'Fully overcast sky expected' })
  }

  // ── Visibility ──
  const vis = visibility ?? 10000
  if (vis < 3000) {
    score -= 15
    factors.push({ label: `Poor visibility ${(vis/1000).toFixed(1)}km`, type: 'bad', detail: 'Haze or fog will dull colours' })
  } else if (vis < 6000) {
    score -= 5
    factors.push({ label: `Reduced visibility ${(vis/1000).toFixed(1)}km`, type: 'neutral', detail: 'Some haze present' })
  } else if (vis > 15000) {
    score += 5
    factors.push({ label: 'Excellent visibility', type: 'good', detail: 'Crystal clear air' })
  }

  // ── Humidity ──
  const hum = humidity ?? 50
  if (hum > 85) {
    score -= 8
    factors.push({ label: `High humidity ${hum}%`, type: 'bad', detail: 'Moisture will diffuse light' })
  } else if (hum >= 55 && hum <= 75) {
    score += 4
    factors.push({ label: `Humidity ${hum}%`, type: 'good', detail: 'Slight moisture deepens reds' })
  }

  // ── Aerosol optical depth ──
  if (aod != null) {
    if (aod > 0.5) {
      score -= 10
      factors.push({ label: `High aerosols (AOD ${aod.toFixed(2)})`, type: 'bad', detail: 'Dust/pollution dulls sunset' })
    } else if (aod >= 0.1 && aod <= 0.3) {
      score += 6
      factors.push({ label: `Moderate aerosols (AOD ${aod.toFixed(2)})`, type: 'good', detail: 'Deepens reds and oranges' })
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  let verdict, verdictEmoji
  if (score >= 80) { verdict = 'Outstanding — conditions are near perfect tonight.'; verdictEmoji = '🌅' }
  else if (score >= 65) { verdict = 'Very good — a colourful show is likely.'; verdictEmoji = '✨' }
  else if (score >= 50) { verdict = 'Decent — worth heading out for.'; verdictEmoji = '🌤' }
  else if (score >= 35) { verdict = 'Fair — some colour possible but mixed skies.'; verdictEmoji = '⛅' }
  else { verdict = 'Poor — clouds or haze will likely obscure the show.'; verdictEmoji = '☁️' }

  return { score, verdict, verdictEmoji, factors }
}

export function scoreColour(score) {
  if (score >= 70) return 'var(--score-high)'
  if (score >= 45) return 'var(--score-mid)'
  return 'var(--score-low)'
}
