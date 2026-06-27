import { useEffect, useRef } from 'react'
import { skyGradient } from '../utils/time.js'

export default function SkyBackground({ isNight, sunAltDeg }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.style.background = skyGradient(isNight, sunAltDeg)
  }, [isNight, sunAltDeg])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        transition: 'background 2s ease',
        background: skyGradient(isNight, sunAltDeg),
      }}
    />
  )
}
