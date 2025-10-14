# Weather + Air Quality

A simple web app that shows **current weather** (OpenWeatherMap) and **air quality** (Open-Meteo Air Quality) using **AJAX (fetch)** and **JSON**. No frameworks, just HTML, CSS (Bootstrap + custom), and JS.

## Features
- Weather by **city,country** or **geolocation**
- Temps in **K / °C / °F**, humidity, wind
- **Air Quality**: US AQI, PM2.5, PM10 (latest hour)
- Error handling for network/API issues

## Tech / APIs
- HTML5, CSS3, JavaScript
- Bootstrap 5
- **APIs**
  - OpenWeatherMap – Current Weather
  - Open-Meteo Geocoding – City → lat/lon
  - Open-Meteo Air Quality – AQI/PM (no key)

## Project Structure
/ (repo root)
├─ index.html 
├─ styles.css 
├─ README.MD
└─ app.js 