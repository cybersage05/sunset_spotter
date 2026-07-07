import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const TILES = {
  day: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  night: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

// NASA GIBS — yesterday's MODIS true-colour imagery (today's is incomplete)
function gibsUrl() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const date = d.toISOString().slice(0, 10)
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`
}

// Destination point given start, bearing (deg) and distance (km)
function destination(lat, lon, bearingDeg, distKm) {
  const R = 6371
  const br = bearingDeg * Math.PI / 180
  const la1 = lat * Math.PI / 180
  const lo1 = lon * Math.PI / 180
  const d = distKm / R
  const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(br))
  const lo2 = lo1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2))
  return [la2 * 180 / Math.PI, ((lo2 * 180 / Math.PI) + 540) % 360 - 180]
}

export default function MapCard({ location, viewpoints, sunsetAzimuth, isNight }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const tileRef = useRef(null)
  const satRef = useRef(null)
  const controlRef = useRef(null)
  const layerRef = useRef(null)

  // Create map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false, // don't hijack page scroll
      attributionControl: true,
    })
    map.setView([0, 0], 2)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Swap base tiles with theme + NASA GIBS satellite option
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (controlRef.current) map.removeControl(controlRef.current)
    if (tileRef.current) map.removeLayer(tileRef.current)
    if (satRef.current) map.removeLayer(satRef.current)

    tileRef.current = L.tileLayer(isNight ? TILES.night : TILES.day, {
      attribution: ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map)
    satRef.current = L.tileLayer(gibsUrl(), {
      attribution: '<a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a> / MODIS Terra',
      maxZoom: 9,
    })
    controlRef.current = L.control.layers(
      { 'Map': tileRef.current, '🛰️ NASA Satellite': satRef.current },
      null,
      { position: 'topright' },
    ).addTo(map)
  }, [isNight])

  // Markers + sunset ray
  useEffect(() => {
    const map = mapRef.current
    if (!map || !location) return
    if (layerRef.current) map.removeLayer(layerRef.current)
    const group = L.layerGroup()

    // User marker
    const userIcon = L.divIcon({
      className: '',
      html: '<div class="map-marker-user"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })
    L.marker([location.lat, location.lon], { icon: userIcon, title: 'You' })
      .bindPopup(`<b>📍 You</b><br>${location.name || ''}`)
      .addTo(group)

    // Sunset direction ray
    if (sunsetAzimuth != null) {
      const end = destination(location.lat, location.lon, sunsetAzimuth, 15)
      L.polyline([[location.lat, location.lon], end], {
        color: '#ffb86c', weight: 3, dashArray: '8 8', opacity: 0.85,
      }).bindPopup('🌇 Sunset direction').addTo(group)
      L.circleMarker(end, { radius: 7, color: '#ffb86c', fillColor: '#ff6b9d', fillOpacity: 0.9, weight: 2 })
        .bindPopup('🌇 The sun sets this way')
        .addTo(group)
    }

    // Viewpoint markers
    const bounds = [[location.lat, location.lon]]
    for (const v of viewpoints || []) {
      const icon = L.divIcon({
        className: '',
        html: `<div class="map-marker-vp">${v.type.split(' ')[0]}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })
      L.marker([v.lat, v.lon], { icon, title: v.name })
        .bindPopup(
          `<b>${v.name}</b><br>${v.type} · ${v.dist} km · ${v.azScore}% sunset view<br>` +
          `<a href="https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lon}" target="_blank" rel="noopener noreferrer">Directions ↗</a>`
        )
        .addTo(group)
      bounds.push([v.lat, v.lon])
    }

    group.addTo(map)
    layerRef.current = group

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 })
    } else {
      map.setView([location.lat, location.lon], 12)
    }
    // Card is revealed with a scroll animation — make sure tiles size correctly
    setTimeout(() => map.invalidateSize(), 400)
  }, [location?.lat, location?.lon, viewpoints, sunsetAzimuth])

  if (!location) return null

  return (
    <div className="glass-card" style={{ marginBottom: '1rem', padding: '1rem' }}>
      <div className="section-title" style={{ padding: '0 0.5rem' }}>🗺️ Sunset Map</div>
      <div ref={containerRef} className="map-container" role="application" aria-label="Map of nearby sunset viewpoints" />
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6, padding: '0 0.5rem' }}>
        Dashed line = tonight's sunset direction · markers = best nearby spots
      </div>
    </div>
  )
}
