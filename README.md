# 薄明 Hakumei — Sunset Spotter

A location-aware sunset companion. It scores tonight's sunset from real forecast data, maps the best nearby viewpoints, tracks the moon, rates stargazing conditions, and even shows you where the ISS is — all with a cinematic twilight aesthetic that shifts between day and night modes.

## Features

- 🌇 **Sunset quality score (0–100)** — computed from cloud layers, visibility, humidity and aerosol optical depth at your local sunset time
- 🕐 **Today's Light timeline** — dawn, golden hour, sunset, blue hour and dusk on one 24-hour bar with a live "now" marker
- 🌡️ **Conditions at sunset** — temperature, wind, rain chance and air quality (PM2.5 / European AQI), with what-to-bring hints
- 🗺️ **Interactive sunset map** — nearby viewpoints, peaks, beaches and piers ranked by how well they face the sunset, plus a dashed ray showing exactly which way the sun goes down
- 🧭 **Sunset compass** — animated bearing needle
- 🌙 **Moon tonight** — accurate phase rendering, rise/set times, days to full
- 🔭 **Stargazing forecast** (night mode) — clear-sky, air transparency and moon-darkness rating for tonight
- 🛰️ **ISS live tracker** — position, speed, and a heads-up when it's over your part of the sky
- 📅 **7-day sunset outlook** — scores for the week ahead
- 📡 **Graceful location** — GPS → IP-based fallback → manual city search

## Data sources — all free & open, no API keys

| Source | Used for |
|---|---|
| [SunCalc](https://github.com/mourner/suncalc) | Sun/moon positions, phases, golden & blue hour |
| [Open-Meteo](https://open-meteo.com/) | Weather forecast, air quality (AOD, PM2.5, AQI), city geocoding |
| [OpenStreetMap Overpass](https://overpass-api.de/) | Nearby viewpoints, peaks, beaches, parks, piers |
| [CARTO basemaps](https://carto.com/basemaps/) + [Leaflet](https://leafletjs.com/) | Interactive map tiles |
| [BigDataCloud](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) | Reverse geocoding |
| [ipwho.is](https://ipwho.is/) | IP-based location fallback |
| [WhereTheISS.at](https://wheretheiss.at/) | Live ISS telemetry |

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (the app is served under `/sunset_spotter/`).

## Build & deploy

`npm run build` outputs to `dist/`. Pushes to `main` auto-deploy to GitHub Pages via the included workflow.
