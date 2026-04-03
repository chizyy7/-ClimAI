/* ═══════════════════════════════════════════════════════
   ClimAI — app.js
   OpenWeatherMap + Claude AI + TensorFlow.js / MobileNet
═══════════════════════════════════════════════════════ */

// ── API Configuration ────────────────────────────────
const OPENWEATHER_API_KEY  = "YOUR_OPENWEATHER_API_KEY"; // Replace with real key
const ANTHROPIC_API_KEY    = "YOUR_ANTHROPIC_API_KEY"; // Replace with real key
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const ANTHROPIC_API_URL    = "https://api.anthropic.com/v1/messages";

// ── DOM refs — Weather ───────────────────────────────
const weatherForm      = document.getElementById("weatherForm");
const cityInput        = document.getElementById("cityInput");
const detectBtn        = document.getElementById("detectBtn");
const weatherError     = document.getElementById("weatherError");
const weatherResult    = document.getElementById("weatherResult");
const weatherCity      = document.getElementById("weatherCity");
const weatherCountry   = document.getElementById("weatherCountry");
const weatherIcon      = document.getElementById("weatherIcon");
const weatherTemp      = document.getElementById("weatherTemp");
const weatherFeelsLike = document.getElementById("weatherFeelsLike");
const weatherHumidity  = document.getElementById("weatherHumidity");
const weatherWind      = document.getElementById("weatherWind");
const weatherCondition = document.getElementById("weatherCondition");
const weatherVisibility= document.getElementById("weatherVisibility");
const weatherInsight   = document.getElementById("weatherInsight");
const weatherAiLoading = document.getElementById("weatherAiLoading");
const weatherAiText    = document.getElementById("weatherAiText");

// ── DOM refs — Sky ───────────────────────────────────
const uploadZone     = document.getElementById("uploadZone");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const fileInput      = document.getElementById("fileInput");
const skyPreview     = document.getElementById("skyPreview");
const classifyResult = document.getElementById("classifyResult");
const barChart       = document.getElementById("barChart");
const skyInsight     = document.getElementById("skyInsight");
const skyAiLoading   = document.getElementById("skyAiLoading");
const skyAiText      = document.getElementById("skyAiText");
const tfLoading      = document.getElementById("tfLoading");
const skyError       = document.getElementById("skyError");

// ── DOM refs — Nav ───────────────────────────────────
const navToggle = document.getElementById("navToggle");
const navLinks  = document.getElementById("navLinks");

// ── State ────────────────────────────────────────────
let mobilenetModel = null;

// ════════════════════════════════════════════════════════
// NAVBAR — mobile toggle
// ════════════════════════════════════════════════════════
navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close nav when a link is clicked
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ════════════════════════════════════════════════════════
// WEATHER — form submit
// ════════════════════════════════════════════════════════
weatherForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    showWeatherError("Please enter a city name.");
    return;
  }
  await fetchWeather(city);
});

async function fetchWeather(city) {
  setWeatherLoading(true);
  clearWeatherError();
  hideElement(weatherResult);

  try {
    const url = `${OPENWEATHER_BASE_URL}?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 404) throw new Error(`City "${city}" not found. Please check the spelling.`);
      if (res.status === 401) throw new Error("Invalid API key. Check your OpenWeatherMap API key.");
      throw new Error(`Weather service error (${res.status}). Please try again.`);
    }

    const data = await res.json();
    renderWeather(data);
    triggerWeatherAnimation(data.weather[0].main);
    await fetchWeatherInsight(data);

  } catch (err) {
    showWeatherError(err.message || "Something went wrong. Please try again.");
  } finally {
    setWeatherLoading(false);
  }
}

function renderWeather(data) {
  weatherCity.textContent    = data.name;
  weatherCountry.textContent = data.sys?.country ? `${data.sys.country}` : "";
  weatherTemp.textContent    = `${Math.round(data.main.temp)}°C`;
  weatherFeelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
  weatherHumidity.textContent  = `${data.main.humidity}%`;
  weatherWind.textContent      = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
  weatherCondition.textContent = capitalise(data.weather[0].description);
  weatherVisibility.textContent = data.visibility
    ? `${(data.visibility / 1000).toFixed(1)} km`
    : "N/A";

  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.alt = data.weather[0].description;

  showElement(weatherResult);
}

// ── Weather → AI Insight ─────────────────────────────
async function fetchWeatherInsight(data) {
  showElement(weatherInsight);
  showElement(weatherAiLoading);
  weatherAiText.textContent = "";

  const prompt = `You are a friendly AI weather analyst. Given this weather data: 
City: ${data.name}, ${data.sys?.country || ""}
Temperature: ${Math.round(data.main.temp)}°C (feels like ${Math.round(data.main.feels_like)}°C)
Humidity: ${data.main.humidity}%
Wind speed: ${(data.wind.speed * 3.6).toFixed(1)} km/h
Condition: ${data.weather[0].description}
Visibility: ${data.visibility ? (data.visibility / 1000).toFixed(1) + " km" : "unknown"}

Give a 3-sentence natural language summary with practical advice for the day.`;

  try {
    const text = await callClaude(prompt);
    weatherAiText.textContent = text;
  } catch (err) {
    weatherAiText.textContent = "AI insight unavailable — please check your Anthropic API key.";
  } finally {
    hideElement(weatherAiLoading);
  }
}

// ── Helpers ──────────────────────────────────────────
function setWeatherLoading(on) {
  detectBtn.classList.toggle("is-loading", on);
  detectBtn.disabled = on;
}
function showWeatherError(msg) { weatherError.textContent = msg; }
function clearWeatherError()   { weatherError.textContent = ""; }

// ════════════════════════════════════════════════════════
// WEATHER ANIMATIONS
// ════════════════════════════════════════════════════════
const WEATHER_CLASSES = ["weather-clear", "weather-cloudy", "weather-rainy", "weather-stormy", "weather-snowy"];

function triggerWeatherAnimation(condition) {
  const body = document.body;
  WEATHER_CLASSES.forEach(c => body.classList.remove(c));

  const cond = condition.toLowerCase();
  if (cond === "clear") {
    body.classList.add("weather-clear");
  } else if (["clouds", "mist", "fog", "haze", "smoke", "dust", "sand", "ash"].some(c => cond.includes(c))) {
    body.classList.add("weather-cloudy");
  } else if (["rain", "drizzle"].some(c => cond.includes(c))) {
    body.classList.add("weather-rainy");
    buildRain(80);
  } else if (["thunderstorm"].some(c => cond.includes(c))) {
    body.classList.add("weather-stormy");
    buildRain(100);
  } else if (["snow", "sleet", "blizzard"].some(c => cond.includes(c))) {
    body.classList.add("weather-snowy");
    buildSnow(50);
  } else {
    body.classList.add("weather-cloudy");
  }
}

function buildRain(count) {
  const container = document.getElementById("rainContainer");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const drop = document.createElement("div");
    drop.className = "raindrop";
    const left = Math.random() * 100;
    const duration = 0.5 + Math.random() * 0.6;
    const height = 14 + Math.random() * 20;
    const delay = -Math.random() * 2;
    drop.style.cssText = `left:${left}%;height:${height}px;animation-duration:${duration}s;animation-delay:${delay}s;opacity:${0.5 + Math.random()*0.4}`;
    container.appendChild(drop);
  }
}

function buildSnow(count) {
  const container = document.getElementById("snowContainer");
  container.innerHTML = "";
  const flakes = ["❄", "❅", "❆", "✦", "•"];
  for (let i = 0; i < count; i++) {
    const flake = document.createElement("div");
    flake.className = "snowflake";
    flake.textContent = flakes[Math.floor(Math.random() * flakes.length)];
    const left = Math.random() * 100;
    const duration = 4 + Math.random() * 6;
    const delay = -Math.random() * 8;
    const size = 10 + Math.random() * 10;
    flake.style.cssText = `left:${left}%;font-size:${size}px;animation-duration:${duration}s;animation-delay:${delay}s`;
    container.appendChild(flake);
  }
}

// ════════════════════════════════════════════════════════
// SKY PHOTO CLASSIFIER
// ════════════════════════════════════════════════════════

// ── Upload zone interactions ─────────────────────────
uploadZone.addEventListener("click", () => fileInput.click());
uploadZone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
});

uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("drag-over");
});
uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-over"));
uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) handleImageFile(file);
});

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleImageFile(fileInput.files[0]);
});

async function handleImageFile(file) {
  clearSkyError();
  hideElement(classifyResult);

  if (!file.type.startsWith("image/")) {
    showSkyError("Please upload an image file (JPG, PNG, or WEBP).");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showSkyError("Image is too large. Maximum file size is 10 MB.");
    return;
  }

  // Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    skyPreview.src = e.target.result;
    showElement(skyPreview);
    hideElement(uploadPlaceholder);
  };
  reader.readAsDataURL(file);

  // Classify
  await classifyImage(skyPreview);
}

async function classifyImage(imgEl) {
  // Wait for preview image to fully load
  await new Promise(resolve => {
    if (imgEl.complete && imgEl.naturalWidth > 0) return resolve();
    imgEl.onload = resolve;
    imgEl.onerror = resolve;
  });

  showElement(tfLoading);
  clearSkyError();

  try {
    if (!mobilenetModel) {
      mobilenetModel = await mobilenet.load();
    }
    hideElement(tfLoading);

    const predictions = await mobilenetModel.classify(imgEl, 3);
    renderBarChart(predictions);
    showElement(classifyResult);

    await fetchSkyInsight(predictions[0].className);

  } catch (err) {
    hideElement(tfLoading);
    showSkyError("Classification failed: " + (err.message || "Unknown error. Please try another image."));
  }
}

function renderBarChart(predictions) {
  barChart.innerHTML = "";
  predictions.forEach((pred, idx) => {
    const pct = Math.round(pred.probability * 100);
    const label = formatClassName(pred.className);
    const li = document.createElement("li");
    li.className = "bar-item";
    li.setAttribute("role", "listitem");
    li.innerHTML = `
      <span class="bar-label">${label}</span>
      <span class="bar-pct">${pct}%</span>
      <div class="bar-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${label}: ${pct}%">
        <div class="bar-fill" data-width="${pct}"></div>
      </div>`;
    barChart.appendChild(li);
  });

  // Animate bars after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      barChart.querySelectorAll(".bar-fill").forEach(fill => {
        fill.style.width = fill.dataset.width + "%";
      });
    });
  });
}

// ── Sky → AI Insight ────────────────────────────────
async function fetchSkyInsight(topClass) {
  showElement(skyInsight);
  showElement(skyAiLoading);
  skyAiText.textContent = "";

  const prompt = `You are a weather expert. A sky image was classified as: "${formatClassName(topClass)}". In 3 sentences, describe what this likely means about current weather conditions and give practical advice for someone going outside.`;

  try {
    const text = await callClaude(prompt);
    skyAiText.textContent = text;
  } catch (err) {
    skyAiText.textContent = "AI insight unavailable — please check your Anthropic API key.";
  } finally {
    hideElement(skyAiLoading);
  }
}

function showSkyError(msg) {
  skyError.textContent = msg;
  showElement(skyError);
}
function clearSkyError() {
  skyError.textContent = "";
  hideElement(skyError);
}

// ════════════════════════════════════════════════════════
// CLAUDE API
// ════════════════════════════════════════════════════════
async function callClaude(prompt) {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-calls": "true",
      "x-api-key": ANTHROPIC_API_KEY,
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Claude API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text?.trim() || "No response received.";
}

// ════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════
function showElement(el) { el.classList.remove("hidden"); }
function hideElement(el) { el.classList.add("hidden"); }

function capitalise(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function formatClassName(name) {
  // MobileNet class names are comma-separated; take first term and clean up
  return capitalise(name.split(",")[0].replace(/_/g, " ").trim());
}
