const OWM_KEY = "c8849cb9b3b65f989a90c477edcd61e5"; 

// ====== DOM helpers ======
const $ = (id) => document.getElementById(id);
const show = (el, on = true) => el.classList.toggle("d-none", !on);

// ====== Renderers ======
function renderWeather(data) {
  const out = $("weatherOut");
  const toF = (k) => (k - 273.15) * 9/5 + 32;
  const toC = (k) => (k - 273.15);

  const main = data.weather?.[0]?.main ?? "—";
  const desc = data.weather?.[0]?.description ?? "—";
  const tempK = data.main?.temp;
  const feelsK = data.main?.feels_like;
  const city = data.name ?? "—";
  const country = data.sys?.country ?? "—";
  const humidity = data.main?.humidity;
  const wind = data.wind?.speed;

  const block1 = `
    <div class="col-12 col-md-6">
      <div class="info-block">
        <div class="d-flex align-items-center justify-content-between">
          <h3 class="h6 mb-1">${city}, ${country}</h3>
          <span class="badge badge-k">K</span>
        </div>
        <div>${Number.isFinite(tempK) ? tempK.toFixed(2) : "—"} K
          (feels ${Number.isFinite(feelsK) ? feelsK.toFixed(2) : "—"} K)</div>
        <div class="text-secondary">${main} — ${desc}</div>
      </div>
    </div>`;

  const block2 = `
    <div class="col-12 col-md-6">
      <div class="info-block">
        <div class="d-flex align-items-center justify-content-between">
          <h3 class="h6 mb-1">Converted</h3>
          <span class="badge bg-secondary">°C / °F</span>
        </div>
        <div>
          ${Number.isFinite(tempK) ? toC(tempK).toFixed(1) : "—"} °C /
          ${Number.isFinite(tempK) ? toF(tempK).toFixed(1) : "—"} °F
        </div>
        <div class="text-secondary">
          Humidity: ${humidity ?? "—"}% • Wind: ${wind ?? "—"} m/s
        </div>
      </div>
    </div>`;

  out.innerHTML = block1 + block2;
}

function renderAQI(aqi, pm25, pm10, sourceText) {
  const category = (v) => {
    if (v == null) return "—";
    if (v <= 50) return "Good";
    if (v <= 100) return "Moderate";
    if (v <= 150) return "Unhealthy for Sensitive Groups";
    if (v <= 200) return "Unhealthy";
    if (v <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  $("aqiOut").innerHTML = `
    <div class="info-block">
      <div><strong>US AQI:</strong> ${aqi ?? "—"} <span class="text-secondary">(${category(aqi)})</span></div>
      <div class="text-secondary">PM2.5: ${pm25 ?? "—"} μg/m³ • PM10: ${pm10 ?? "—"} μg/m³</div>
      <div class="text-secondary">Source: ${sourceText}</div>
    </div>
  `;
}

// ====== Fetchers ======
async function fetchWeatherByCity(city, country) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${
    encodeURIComponent(city)
  },${encodeURIComponent(country)}&appid=${encodeURIComponent(OWM_KEY)}`;

  show($("spinWeather"), true);
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`OWM error: ${res.status}`);
    const data = await res.json();
    renderWeather(data);
  } catch (err) {
    $("weatherOut").innerHTML = `<div class="alert alert-danger">Weather error: ${err.message}</div>`;
  } finally {
    show($("spinWeather"), false);
  }
}

async function fetchWeatherByGeo() {
  if (!navigator.geolocation) {
    $("weatherOut").innerHTML = `<div class="alert alert-warning">Geolocation not supported.</div>`;
    return;
  }
  show($("spinWeather"), true);
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${encodeURIComponent(OWM_KEY)}`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`OWM error: ${res.status}`);
      const data = await res.json();
      renderWeather(data);
    } catch (err) {
      $("weatherOut").innerHTML = `<div class="alert alert-danger">Weather error: ${err.message}</div>`;
    } finally {
      show($("spinWeather"), false);
    }
  }, (err) => {
    show($("spinWeather"), false);
    $("weatherOut").innerHTML = `<div class="alert alert-warning">Geolocation denied (${err.code}). Try by city instead.</div>`;
  }, { enableHighAccuracy: true, timeout: 8000 });
}

/* Geocode city to lat/lon via Open-Meteo  */
async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Geocode error: ${res.status}`);
  const data = await res.json();
  const hit = data?.results?.[0];
  if (!hit) throw new Error("Location not found");
  return { latitude: hit.latitude, longitude: hit.longitude, name: hit.name, country_code: hit.country_code };
}

/* Fetch air quality using Open-Meteo Air Quality API */
async function fetchAirQualityByCity(city) {
  show($("spinAqi"), true);
  try {
    const { latitude, longitude } = await geocodeCity(city);
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi,pm2_5,pm10&timezone=auto`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`AQI error: ${res.status}`);
    const data = await res.json();

    const idx = (data.hourly?.time?.length || 1) - 1; // latest hour
    const usAqi = data.hourly?.us_aqi?.[idx] ?? null;
    const pm25  = data.hourly?.pm2_5?.[idx] ?? null;
    const pm10  = data.hourly?.pm10?.[idx] ?? null;

    renderAQI(usAqi, pm25, pm10, "Open-Meteo Air Quality (latest hour)");
  } catch (err) {
    $("aqiOut").innerHTML = `<div class="alert alert-danger">Air quality error: ${err.message}</div>`;
  } finally {
    show($("spinAqi"), false);
  }
}

// ====== Events ======
$("btnFetch").addEventListener("click", () => {
  if ($("useGeo").checked) fetchWeatherByGeo();
  else fetchWeatherByCity($("city").value.trim() || "Troy", $("country").value.trim() || "US");
});

$("btnAqi").addEventListener("click", () => {
  fetchAirQualityByCity($("city").value.trim() || "Troy");
});

// Initial load 
fetchWeatherByCity("Troy", "US");
