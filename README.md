# ⛅ ClimAI — AI-Powered Weather Intelligence

ClimAI combines **live weather data**, **computer vision**, and **AI language models** to give you intelligent, human-friendly weather insights — all running in the browser with no back-end required.

---

## ✨ Features

### 🌐 Live Weather Lookup
- Select a **country** and **city** from structured dropdowns covering 30 countries and 150+ major cities worldwide.
- Fetches real-time data from **OpenWeatherMap**.
- Displays a dashboard-style stats grid:
  - 🌡️ Temperature (°C) · Feels Like · Humidity · Wind Speed · Visibility · Pressure
  - ⛅ Weather condition with the official OpenWeatherMap icon
  - 🌅 Sunrise & Sunset times (formatted to the city's local time)
- **Claude AI Insight** — a 3-sentence natural language summary with practical daily advice, powered by Claude Sonnet.

### 📸 Sky Photo Detector
- Upload any sky photo (JPG, PNG, WEBP, up to 10 MB) via drag-and-drop or file picker.
- **MobileNet** runs entirely in-browser using TensorFlow.js — no image leaves your device.
- Displays the top-3 classification results as an animated bar chart.
- **Claude AI Insight** interprets the detected sky conditions into practical advice.

### 🎨 Animated Weather Backgrounds
- Dynamic background gradient shifts based on detected weather condition.
- Animated elements: drifting clouds, sun glow, falling rain, snowflakes, and lightning flashes.

---

## 🚀 Getting Started

### Prerequisites
- A modern browser (Chrome, Firefox, Edge, Safari) with JavaScript enabled.
- An [OpenWeatherMap](https://openweathermap.org/api) API key (free tier is sufficient).
- An [Anthropic](https://www.anthropic.com/) API key for Claude AI insights.

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/chizyy7/-ClimAI.git
   cd -ClimAI
   ```

2. **Add your API keys** — open `app.js` and replace the placeholder values:
   ```js
   const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY";
   const ANTHROPIC_API_KEY   = "YOUR_ANTHROPIC_API_KEY";
   ```

3. **Open `index.html`** in your browser — no build step or server needed.
   > For the best experience (and to avoid CORS issues with the Anthropic API), serve the files over a local HTTP server:
   > ```bash
   > npx serve .
   > # or
   > python3 -m http.server 8080
   > ```

---

## 🗂️ Project Structure

```
-ClimAI/
├── index.html   — Markup: navbar, hero, Live Weather section, Sky Detector, about, footer
├── style.css    — Glassmorphism UI, animated background, responsive grid
├── app.js       — Country/city data, OpenWeatherMap fetch, MobileNet classifier, Claude API
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI | Vanilla HTML5 + CSS3 (glassmorphism, CSS Grid, custom properties) |
| Fonts | Google Fonts — Inter & Sora |
| Weather Data | [OpenWeatherMap Current Weather API](https://openweathermap.org/current) |
| AI Insights | [Anthropic Claude Sonnet](https://www.anthropic.com/) |
| Image Classification | [TensorFlow.js](https://www.tensorflow.org/js) + [MobileNet v2](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) |

---

## 🔑 API Notes

- **OpenWeatherMap** — the free tier allows up to 1,000 calls/day, which is more than enough for personal use.
- **Anthropic Claude** — direct browser calls are enabled via the `anthropic-dangerous-direct-browser-calls` header. For production use, proxy calls through a secure back-end to keep your API key private.

---

## 📄 License

MIT © 2025 [Chizy](https://github.com/chizyy7)
