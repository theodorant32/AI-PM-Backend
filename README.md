# Weather App - PM Accelerator Technical Assessment

**Assessment:** Tech Assessment #2 (Backend)

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

App runs at http://localhost:3000

## API Endpoints

**Weather CRUD:**
- `POST /api/weather/search` - Search with location + date range
- `GET /api/weather` - Get all searches
- `GET /api/weather/search/:id` - Get by ID
- `PUT /api/weather/:id` - Update
- `DELETE /api/weather/:id` - Delete

**Export:**
- `GET /api/export/json` - Export as JSON
- `GET /api/export/csv` - Export as CSV
- `GET /api/export/xml` - Export as XML
- `GET /api/export/markdown` - Export as Markdown

## Tech Stack

- Node.js + Express
- SQLite (better-sqlite3)
- OpenWeatherMap API
- YouTube API (optional)
