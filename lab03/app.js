// ---------- ELEMENTS ----------
const weatherBtn = document.getElementById("getWeatherBtn");
const factBtn = document.getElementById("factBtn");

const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");
const catFact = document.getElementById("catFact");

// ---------- WEATHER API ----------
const weatherApiKey = "c8849cb9b3b65f989a90c477edcd61e5";

weatherBtn.addEventListener("click", () => {
  const city = cityInput.value || "Troy";
  getWeather(city);
});

async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=imperial`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      cityName.textContent = "City not found 😞";
      temperature.textContent = "";
      description.textContent = "";
      weatherIcon.src = "";
      return;
    }

    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `🌡️ ${data.main.temp.toFixed(1)} °F`;
    description.textContent = `🌥️ ${data.weather[0].description}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  } catch (err) {
    console.error("Error fetching weather:", err);
  }
}

// ---------- CAT FACT API ----------
factBtn.addEventListener("click", getCatFact);

async function getCatFact() {
  try {
    const response = await fetch("https://catfact.ninja/fact");
    const data = await response.json();
    catFact.textContent = data.fact;
  } catch (err) {
    console.error("Error fetching cat fact:", err);
    catFact.textContent = "Could not fetch a new fact.";
  }
}

// ---------- ON LOAD ----------
getWeather("Troy");
getCatFact();
