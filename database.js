const Database = require('better-sqlite3');
const path = require('path');

let db;

const initialize = () => {
  db = new Database(path.join(__dirname, 'weather.db'));

  db.exec(`
    CREATE TABLE IF NOT EXISTS weather_searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_query TEXT NOT NULL,
      location_name TEXT,
      country TEXT,
      latitude REAL,
      longitude REAL,
      date_from TEXT NOT NULL,
      date_to TEXT NOT NULL,
      temperature REAL,
      feels_like REAL,
      humidity INTEGER,
      pressure INTEGER,
      wind_speed REAL,
      weather_description TEXT,
      weather_icon TEXT,
      youtube_url TEXT,
      maps_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS api_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cache_key TEXT UNIQUE NOT NULL,
      response_data TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )
  `);

  console.log('Database initialized');
};

const createWeatherSearch = (data) => {
  // Extract current_weather data for backward compatibility with exports
  const currentWeather = data.current_weather || data;
  const stmt = db.prepare(`
    INSERT INTO weather_searches (
      location_query, location_name, country, latitude, longitude,
      date_from, date_to, temperature, feels_like, humidity,
      pressure, wind_speed, weather_description, weather_icon,
      youtube_url, maps_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.location_query,
    data.location_name,
    data.country,
    data.latitude,
    data.longitude,
    data.date_from,
    data.date_to,
    currentWeather.temperature,
    currentWeather.feels_like,
    currentWeather.humidity,
    currentWeather.pressure,
    currentWeather.wind_speed,
    currentWeather.weather_description,
    currentWeather.weather_icon,
    data.youtube_url,
    data.maps_url
  );
  return { id: result.lastInsertRowid, ...data };
};

const getAllWeatherSearches = () => {
  const stmt = db.prepare('SELECT * FROM weather_searches ORDER BY created_at DESC');
  return stmt.all();
};

const getWeatherSearchById = (id) => {
  const stmt = db.prepare('SELECT * FROM weather_searches WHERE id = ?');
  return stmt.get(id);
};

const getWeatherSearchesByLocation = (query) => {
  const stmt = db.prepare(`
    SELECT * FROM weather_searches
    WHERE location_query LIKE ?
    ORDER BY created_at DESC
  `);
  return stmt.all(`%${query}%`);
};

const updateWeatherSearch = (id, data) => {
  const fields = [];
  const values = [];

  Object.keys(data).forEach(key => {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  });

  if (fields.length === 0) return null;

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`
    UPDATE weather_searches
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  stmt.run(...values);

  return getWeatherSearchById(id);
};

const deleteWeatherSearch = (id) => {
  const stmt = db.prepare('DELETE FROM weather_searches WHERE id = ?');
  return stmt.run(id);
};

const getCachedResponse = (cacheKey) => {
  const stmt = db.prepare('SELECT response_data FROM api_cache WHERE cache_key = ? AND expires_at > ?');
  const row = stmt.get(cacheKey, new Date().toISOString());
  return row ? JSON.parse(row.response_data) : null;
};

const setCachedResponse = (cacheKey, data, ttlMinutes = 30) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO api_cache (cache_key, response_data, expires_at)
    VALUES (?, ?, ?)
  `);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  stmt.run(cacheKey, JSON.stringify(data), expiresAt);
};

module.exports = {
  initialize,
  createWeatherSearch,
  getAllWeatherSearches,
  getWeatherSearchById,
  getWeatherSearchesByLocation,
  updateWeatherSearch,
  deleteWeatherSearch,
  getCachedResponse,
  setCachedResponse
};
