import { useState, useRef, useEffect } from 'react'

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export default function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`)
        const d = await r.json()
        setResults(d.results || [])
        setOpen(true)
      } catch { setResults([]) }
    }, 320)
  }, [query])

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function select(r) {
    onSelect({ lat: r.latitude, lon: r.longitude, name: [r.name, r.admin1, r.country].filter(Boolean).join(', ') })
    setQuery('')
    setOpen(false)
    setResults([])
  }

  return (
    <div ref={wrapRef} className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
      <input
        className="search-input"
        type="text"
        placeholder="Search city…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        aria-label="Search for a city"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && results.length > 0 && (
        <div className="search-results" role="listbox">
          {results.map((r, i) => (
            <div
              key={i}
              className="search-result-item"
              role="option"
              onClick={() => select(r)}
              onKeyDown={e => e.key === 'Enter' && select(r)}
              tabIndex={0}
            >
              {r.name}{r.admin1 ? `, ${r.admin1}` : ''}{r.country ? ` · ${r.country}` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
