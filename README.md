# Weather App

Full-stack weather application with real-time data, forecasts, and data export.

## Features

- Search by location (country/city dropdowns or custom input)
- Current weather + 5-day forecast
- CRUD operations for weather searches
- Export to JSON, CSV, XML, PDF, Markdown
- Google Maps & YouTube integrations

## Setup

```bash
npm install
```

Create `.env` file:
```
PORT=3000
OPENWEATHER_API_KEY=your_key_here
YOUTUBE_API_KEY=your_key_here
```

## Run

```bash
npm start
```

Open http://localhost:3000

## Tech Stack

Node.js, Express, SQLite (better-sqlite3), OpenWeatherMap API
