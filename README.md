# Weather App

Full-stack weather application with real-time data, forecasts, and data export.

## Features

- Search by location (country/city dropdowns or custom input)
- Current weather + 5-day forecast
- CRUD operations for weather searches
- Export to JSON, CSV, XML, PDF, Markdown
- Google Maps & YouTube integrations
- Responsive design for desktop, tablet, and mobile

## Setup

```bash
npm install
```

Create `.env` file:
```
PORT=3000
OPENWEATHER_API_KEY=your_api_key_here
YOUTUBE_API_KEY=your_youtube_key_here
```

Get your API keys:
- OpenWeatherMap: https://openweathermap.org/api
- YouTube Data API: https://developers.google.com/youtube/v3

## Run

```bash
npm start
```

Open http://localhost:3000

## API Endpoints

### Weather
- `POST /api/weather/search` - Search weather by location and date range
- `GET /api/weather` - Get all saved searches
- `GET /api/weather/search/:id` - Get search by ID
- `GET /api/weather/location/:query` - Search by location name
- `PUT /api/weather/:id` - Update a search
- `DELETE /api/weather/:id` - Delete a search

### Export
- `GET /api/export/json` - Export all data as JSON
- `GET /api/export/csv` - Export all data as CSV
- `GET /api/export/xml` - Export all data as XML
- `GET /api/export/pdf` - Export all data as PDF
- `GET /api/export/markdown` - Export all data as Markdown

## Tech Stack

- Node.js
- Express.js
- SQLite (better-sqlite3)
- OpenWeatherMap API
- YouTube Data API

## Author

Theodoros Antentas
