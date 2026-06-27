import { useState, useEffect, useRef } from 'react'
import { useGeolocation } from './hooks/useGeolocation.js'
import { useSunMoon, useWeekSunData } from './hooks/useSunMoon.js'
import { useWeather } from './hooks/useWeather.js'
import { useViewpoints } from './hooks/useViewpoints.js'
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

export default function App() {
  const { location, status, error: geoError, setManualLocation } = useGeolocation()
  const [manualNight, setManualNight] = useState(null)
  const { sunData, moonData } = useSunMoon(location)
  const weekDays = useWeekSunData(location)
  const { hourlyAtSunset, weekScores, loading: wxLoading } = useWeather(location, weekDays)
  const { viewpoints, loading: vpLoading } = useViewpoints(location, sunData?.sunAzimuthDeg)
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

  // Scroll-reveal cards with Motion One
  useEffect(() => {
    import('@motionone/dom').then(({ inView, animate }) => {
      document.querySelectorAll('.glass-card').forEach(el => {
        el.style.opacity = '0'
        el.style.transform = 'translateY(20px)'
        inView(el, () => {
          animate(el, { opacity: 1, transform: 'translateY(0px)' }, { duration: 0.55, easing: [0.22, 1, 0.36, 1] })
        }, { amount: 0.1 })
      })
    })
  }, [location, sunData])

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
                    <SunsetCard sunData={sunData} isNight={isNight} />
                    <Compass azimuth={sunData?.sunAzimuthDeg} />
                  </div>
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
                  <div className="grid-2">
                    <Compass azimuth={sunData?.sunAzimuthDeg} />
                    <MoonCard moonData={moonData} />
                  </div>
                  <Viewpoints viewpoints={viewpoints} loading={vpLoading} sunsetAzimuth={sunData?.sunAzimuthDeg} />
                  <WeekOutlook weekDays={weekDays} weekScores={weekScores} loading={wxLoading} />
                </>
              )}
            </>
          )}

          {/* Footer */}
          <footer style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <p>Data: SunCalc · Open-Meteo · OpenStreetMap · BigDataCloud — all free, no keys</p>
            <p style={{ marginTop: 4 }}>薄明 Hakumei · Made with ♡</p>
          </footer>
        </main>
      </div>
    </>
  )
}
