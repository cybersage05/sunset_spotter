# ✦ Cosmic Verse — Sunset & Space Companion

Your window to the sky, from tonight's sunset to the edge of the solar system. Cosmic Verse scores tonight's sunset from real forecast data, maps the best nearby viewpoints, tracks the moon and the ISS live, rates stargazing conditions — and then keeps going: rocket launches, asteroids passing Earth today, space weather, earthquakes, natural events seen from orbit, and NASA's picture of the day.

## Sky & sunset features

- 🌇 **Sunset quality score (0–100)** — computed from cloud layers, visibility, humidity and aerosol optical depth at your local sunset time
- 🕐 **Today's Light timeline** — dawn, golden hour, sunset, blue hour and dusk on one 24-hour bar with a live "now" marker
- 🌡️ **Conditions at sunset** — temperature, wind, rain chance and air quality (PM2.5 / European AQI), with what-to-bring hints
- 🗺️ **Interactive sunset map** — nearby viewpoints, peaks, beaches and piers ranked by how well they face the sunset, a dashed ray showing exactly which way the sun goes down, and a **NASA GIBS satellite imagery layer**
- 🧭 **Sunset compass** — animated bearing needle
- 🌙 **Moon tonight** — accurate phase rendering, rise/set times, days to full
- 🔭 **Stargazing forecast** (night mode) — clear-sky, air transparency and moon-darkness rating for tonight
- 📅 **7-day sunset outlook** — scores for the week ahead
- 📡 **Graceful location** — GPS → IP-based fallback → manual city search

## The Cosmos Today

- 🔭 **NASA Astronomy Picture of the Day** — with the full explanation on tap
- 🚀 **Next rocket launches** — live countdown, all agencies including SpaceX
- ☄️ **Asteroids passing today** — count, closest pass in Moon-distances, size & speed
- 🌞 **Space weather** — live Kp index, aurora outlook and the latest solar flare
- 👨‍🚀 **Humans in space right now** — the full crew roster off the planet
- 🛰️ **ISS live tracker** — position, speed, distance from you, overhead alerts
- 🌏 **Earthquakes** — M4.5+ worldwide in the last 24h, strongest and nearest to you
- 🌋 **Earth events** — live wildfires, storms and volcanoes closest to you, seen from orbit
- 🌐 **Earth from space** — today's full-disc photo of your side of the planet from DSCOVR
- 🪐 **Planet of the day** — a rotating solar-system spotlight

## Data sources — free & open

| Source | Used for |
|---|---|
| [SunCalc](https://github.com/mourner/suncalc) | Sun/moon positions, phases, golden & blue hour |
| [Open-Meteo](https://open-meteo.com/) | Weather forecast, air quality (AOD, PM2.5, AQI), city geocoding |
| [OpenStreetMap Overpass](https://overpass-api.de/) | Nearby viewpoints, peaks, beaches, parks, piers |
| [CARTO basemaps](https://carto.com/basemaps/) + [Leaflet](https://leafletjs.com/) | Interactive map tiles |
| [NASA APOD](https://api.nasa.gov/) | Astronomy Picture of the Day |
| [NASA NeoWs](https://api.nasa.gov/) | Near-Earth asteroids |
| [NASA EPIC](https://epic.gsfc.nasa.gov/) | Full-disc Earth imagery from DSCOVR |
| [NASA EONET](https://eonet.gsfc.nasa.gov/) | Live natural events (fires, storms, volcanoes) |
| [NASA GIBS](https://earthdata.nasa.gov/gibs) | Satellite imagery map layer (MODIS true colour) |
| [NOAA SWPC](https://www.swpc.noaa.gov/) | Planetary Kp index, solar flares, aurora outlook |
| [The Space Devs / Launch Library 2](https://thespacedevs.com/) | Upcoming launches (incl. SpaceX), astronauts in space |
| [USGS](https://earthquake.usgs.gov/) | Worldwide earthquake feed |
| [WhereTheISS.at](https://wheretheiss.at/) | Live ISS telemetry |
| [Solar System OpenData](https://api.le-systeme-solaire.net/) | Planet facts (local snapshot; live with a free token via `VITE_SOLAIRE_KEY`) |
| [BigDataCloud](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) | Reverse geocoding |
| [ipwho.is](https://ipwho.is/) | IP-based location fallback |

NASA endpoints run on `DEMO_KEY` out of the box (rate-limited to ~30 requests/hour per IP). For heavier use, grab a free key at [api.nasa.gov](https://api.nasa.gov/) and create a `.env` file:

```
VITE_NASA_KEY=your_key_here
VITE_SOLAIRE_KEY=your_solar_system_opendata_token   # optional
```

> Not included (need registration, paid tiers, or aren't browser-callable): EUMETSAT, AstronomyAPI, OpenWeather, NASA Exoplanet Archive (TAP), Open Notify (HTTP-only — replaced by The Space Devs), satellite.js TLE propagation. SpaceX's own API is unmaintained since 2022 — its launches come through Launch Library 2 instead.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (the app is served under `/sunset_spotter/`).

## Build & deploy

`npm run build` outputs to `dist/`. Pushes to `main` auto-deploy to GitHub Pages via the included workflow.
