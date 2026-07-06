import { useState, useEffect, useRef } from 'react'
import { useGeolocation } from './hooks/useGeolocation.js'
import { useSunMoon, useWeekSunData } from './hooks/useSunMoon.js'
import { useWeather } from './hooks/useWeather.js'
import { useViewpoints } from './hooks/useViewpoints.js'
import { useAstro } from './hooks/useAstro.js'
import { useISS } from './hooks/useISS.js'
import SkyBackground from './components/SkyBackground.jsx'
import PetalsCanvas from './components/PetalsCanvas.jsx'
import DotField from './components/DotField.jsx'
import Lightfall from './components/Lightfall.jsx'
import LocationSearch from './components/LocationSearch.jsx'
import SunsetCard from './components/SunsetCard.jsx'
import QualityScore from './components/QualityScore.jsx'
import Compass from './components/Compass.jsx'
import Viewpoints from './components/Viewpoints.jsx'
import MoonCard from './components/MoonCard.jsx'
import WeekOutlook from './components/WeekOutlook.jsx'
import NightModeToggle from './components/NightModeToggle.jsx'
import LightTimeline from './components/LightTimeline.jsx'
import ConditionsCard from './components/ConditionsCard.jsx'
import StargazingCard from './components/StargazingCard.jsx'
import ISSCard from './components/ISSCard.jsx'
import MapCard from './components/MapCard.jsx'

export default function App() {
  const { location, status, error: geoError, setManualLocation } = useGeolocation()
  const [manualNight, setManualNight] = useState(null)
  const { sunData, moonData } = useSunMoon(location)
  const weekDays = useWeekSunData(location)
  const { hourlyAtSunset, weekScores, loading: wxLoading } = useWeather(location, weekDays)
  const { viewpoints, loading: vpLoading } = useViewpoints(location, sunData?.sunAzimuthDeg)
  const { astro, loading: astroLoading } = useAstro(location, moonData?.fraction)
  const iss = useISS(location)
  const heroRef = useRef(null)
  const sectionsRef = useRef([])
  const tabHidden = useRef(false)

  // Detect night from user's local clock vs actual sunset/sunrise times
  const autoNight = (() => {
    const now = new Date()
    if (sunData?.sunset && sunData?.sunrise) {
      return now >= sunData.sunset || now <= sunData.sunrise
    }
    const h = now.getHours()
    return h >= 19 || h < 6
  })()
  const isNight = manualNight !== null ? manualNight : autoNight

  // Sync data-theme on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isNight ? 'night' : 'day')
  }, [isNight])

  // Pause canvas effects when tab hidden
  useEffect(() => {
    function onVisibility() { tabHidden.current = document.hidden }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Animate hero on mount (anime.js v4 fade-up)
  useEffect(() => {
    import('animejs').then(({ animate, stagger }) => {
      animate('.fade-up-init', {
        translateY: [24, 0],
        opacity: [0, 1],
        duration: 800,
        ease: 'outExpo',
        delay: stagger(120, { start: 200 }),
      })
    })
  }, [])

  // Scroll-reveal cards: plain IntersectionObserver + CSS transition.
  // A MutationObserver picks up cards that mount later (data-dependent ones).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('card-visible')
          io.unobserve(e.target)
        }
      }
    }, { threshold: 0.08 })

    const seen = new WeakSet()
    function observeAll() {
      document.querySelectorAll('.glass-card').forEach(el => {
        if (seen.has(el)) return
        seen.add(el)
        el.classList.add('card-reveal')
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) {
          // Already on screen — reveal without waiting for the observer
          // (covers background/prerendered tabs where IO frames are throttled)
          setTimeout(() => el.classList.add('card-visible'), 60)
        } else {
          io.observe(el)
        }
      })
    }
    observeAll()
    const mo = new MutationObserver(observeAll)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => { io.disconnect(); mo.disconnect() }
  }, [])

  function toggleNight() {
    setManualNight(prev => prev === null ? !isNight : !prev)
  }

  const tategakiDay = '薄明 夕焼け 黄昏'
  const tategakiNight = '月夜 星空 深夜'

  return (
    <>
      <SkyBackground isNight={isNight} sunAltDeg={sunData?.currentAltitudeDeg} />
      <PetalsCanvas isNight={isNight} />
      {isNight ? <Lightfall paused={tabHidden.current} /> : <DotField paused={tabHidden.current} />}

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* ── Top nav ── */}
        <nav className="top-nav" role="navigation" aria-label="Site navigation">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--bg-amber)' }}>
              薄明
            </span>
            {location?.name && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                📍 {location.name}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <LocationSearch onSelect={setManualLocation} />
            <NightModeToggle isNight={isNight} onToggle={toggleNight} />
          </div>
        </nav>

        {/* ── Hero ── */}
        <header className="hero-section" ref={heroRef}>
          <div className="fade-up-init" style={{ position: 'relative' }}>
            <div
              aria-hidden="true"
              className="tategaki"
              style={{ fontSize: '0.78rem' }}
            >
              {isNight ? tategakiNight : tategakiDay}
            </div>
            <h1 className="title-display hero-title fade-up-init">
              {isNight ? '月夜' : '薄明'}
            </h1>
            <p className="hero-subtitle fade-up-init">
              {isNight
                ? 'Moon & Night Mode — stars are out'
                : 'Tonight\'s sunset, scored & mapped'}
            </p>
            {location?.name && (
              <p className="fade-up-init" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {location.name}
              </p>
            )}
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="main-content">
          {/* Geo error banner */}
          {geoError && status === 'denied' && (
            <div className="geo-banner" role="alert">
              📡 Location access denied — search for your city above to get started.
            </div>
          )}
          {status === 'approximate' && (
            <div className="geo-banner" style={{ background: 'rgba(255,184,108,0.1)', borderColor: 'rgba(255,184,108,0.25)', color: 'var(--bg-amber)' }}>
              📡 Using your approximate location from IP — search above for a precise spot.
            </div>
          )}
          {status === 'loading' && (
            <div className="geo-banner" style={{ background: 'rgba(92,225,230,0.08)', borderColor: 'rgba(92,225,230,0.2)', color: 'var(--accent-cyan)' }}>
              🔍 Detecting your location…
            </div>
          )}
          {!location && status === 'idle' && (
            <div className="geo-banner" style={{ background: 'rgba(92,225,230,0.08)', borderColor: 'rgba(92,225,230,0.2)', color: 'var(--accent-cyan)' }}>
              Search for a city above or allow location access to begin.
            </div>
          )}

          {location && (
            <>
              {isNight ? (
                /* ── Night layout ── */
                <>
                  <MoonCard moonData={moonData} />
                  <div className="grid-2">
                    <StargazingCard astro={astro} loading={astroLoading} moonData={moonData} />
                    <ISSCard iss={iss} />
                  </div>
                  <LightTimeline sunData={sunData} />
                  <div className="grid-2">
                    <SunsetCard sunData={sunData} isNight={isNight} />
                    <Compass azimuth={sunData?.sunAzimuthDeg} />
                  </div>
                  <MapCard location={location} viewpoints={viewpoints} sunsetAzimuth={sunData?.sunAzimuthDeg} isNight={isNight} />
                  <WeekOutlook weekDays={weekDays} weekScores={weekScores} loading={wxLoading} />
                  <Viewpoints viewpoints={viewpoints} loading={vpLoading} sunsetAzimuth={sunData?.sunAzimuthDeg} />
                </>
              ) : (
                /* ── Day layout ── */
                <>
                  <div className="grid-2">
                    <SunsetCard sunData={sunData} isNight={isNight} />
                    <QualityScore data={hourlyAtSunset} loading={wxLoading} />
                  </div>
                  <LightTimeline sunData={sunData} />
                  <div className="grid-2">
                    <ConditionsCard data={hourlyAtSunset} loading={wxLoading} />
                    <Compass azimuth={sunData?.sunAzimuthDeg} />
                  </div>
                  <MapCard location={location} viewpoints={viewpoints} sunsetAzimuth={sunData?.sunAzimuthDeg} isNight={isNight} />
                  <Viewpoints viewpoints={viewpoints} loading={vpLoading} sunsetAzimuth={sunData?.sunAzimuthDeg} />
                  <div className="grid-2">
                    <MoonCard moonData={moonData} />
                    <ISSCard iss={iss} />
                  </div>
                  <WeekOutlook weekDays={weekDays} weekScores={weekScores} loading={wxLoading} />
                </>
              )}
            </>
          )}

          {/* Footer */}
          <footer style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <p>Data: SunCalc · Open-Meteo (weather · air quality · geocoding) · OpenStreetMap & Overpass · CARTO tiles · BigDataCloud · ipwho.is · WhereTheISS.at — all free & open, no keys</p>
            <p style={{ marginTop: 4 }}>薄明 Hakumei · Made with ♡</p>
          </footer>
        </main>
      </div>
    </>
  )
}
