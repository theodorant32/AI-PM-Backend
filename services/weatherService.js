const axios = require('axios');
const db = require('../database');

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;
const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY;

const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const YOUTUBE_URL = 'https://www.googleapis.com/youtube/v3/search';

const geocodeLocation = async (query) => {
  const cacheKey = `geo:${query}`;
  const cached = db.getCachedResponse(cacheKey);
  if (cached) return cached;

  const response = await axios.get(GEO_URL, {
    params: {
      q: query,
      limit: 1,
      appid: OPENWEATHER_KEY
    }
  });

  if (!response.data || response.data.length === 0) {
    throw new Error('Location not found');
  }

  const location = response.data[0];
  const result = {
    name: location.name,
    country: location.country,
    latitude: location.lat,
    longitude: location.lon,
    state: location.state
  };

  db.setCachedResponse(cacheKey, result, 60);
  return result;
};

const getCurrentWeather = async (lat, lon) => {
  const cacheKey = `weather:${lat},${lon}`;
  const cached = db.getCachedResponse(cacheKey);
  if (cached) return cached;

  const response = await axios.get(WEATHER_URL, {
    params: {
      lat,
      lon,
      units: 'metric',
      appid: OPENWEATHER_KEY
    }
  });

  const data = response.data;
  const result = {
    temperature: data.main.temp,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    wind_speed: data.wind.speed,
    weather_description: data.weather[0].description,
    weather_icon: data.weather[0].icon
  };

  db.setCachedResponse(cacheKey, result, 15);
  return result;
};

const getYouTubeVideo = async (locationName) => {
  if (!YOUTUBE_KEY) return null;

  try {
    const response = await axios.get(YOUTUBE_URL, {
      params: {
        part: 'snippet',
        q: `${locationName} travel guide`,
        type: 'video',
        maxResults: 1,
        key: YOUTUBE_KEY
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const video = response.data.items[0];
      return {
        title: video.snippet.title,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        thumbnail: video.snippet.thumbnails.default.url
      };
    }
  } catch (error) {
    console.error('YouTube API error:', error.message);
  }
  return null;
};

const getGoogleMapsUrl = (lat, lon, locationName) => {
  return {
    maps_url: `https://www.google.com/maps?q=${lat},${lon}`,
    directions_url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
    search_url: `https://www.google.com/maps/search/${encodeURIComponent(locationName)}`
  };
};

const getWeatherData = async (locationQuery, dateFrom, dateTo) => {
  const location = await geocodeLocation(locationQuery);
  const weather = await getCurrentWeather(location.latitude, location.longitude);
  const youtube = await getYouTubeVideo(location.name);
  const maps = getGoogleMapsUrl(location.latitude, location.longitude, location.name);

  return {
    location_query: locationQuery,
    location_name: location.name,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    date_from: dateFrom,
    date_to: dateTo,
    ...weather,
    youtube_url: youtube ? youtube.url : null,
    ...maps
  };
};

module.exports = {
  geocodeLocation,
  getCurrentWeather,
  getYouTubeVideo,
  getGoogleMapsUrl,
  getWeatherData
};
