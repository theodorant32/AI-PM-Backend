const axios = require('axios');
const db = require('../database');

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;
const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY;

const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const YOUTUBE_URL = 'https://www.googleapis.com/youtube/v3/search';

const geocodeLocation = async (query) => {
  const cacheKey = `geo:${query}`;
  const cached = db.getCachedResponse(cacheKey);
  if (cached) return cached;

  let response;
  try {
    response = await axios.get(GEO_URL, {
      params: {
        q: query,
        limit: 1,
        appid: OPENWEATHER_KEY
      }
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Location not found');
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid API key. Check your OPENWEATHER_API_KEY in .env file.');
    }
    if (error.response && error.response.status === 429) {
      throw new Error('API rate limit exceeded. Try again later.');
    }
    throw error;
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

const getForecastData = async (lat, lon, dateFrom, dateTo) => {
  const cacheKey = `forecast:${lat},${lon}:${dateFrom}:${dateTo}`;
  const cached = db.getCachedResponse(cacheKey);
  if (cached) return cached;

  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxForecastDate = new Date(today);
  maxForecastDate.setDate(maxForecastDate.getDate() + 5);

  const forecastLimitWarning = fromDate > maxForecastDate
    ? `Forecast data is only available up to 5 days out. Your selected range (${dateFrom} to ${dateTo}) exceeds this limit.`
    : null;

  const response = await axios.get(FORECAST_URL, {
    params: {
      lat,
      lon,
      units: 'metric',
      appid: OPENWEATHER_KEY
    }
  });

  const dailyData = {};
  response.data.list.forEach(item => {
    const itemDate = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dailyData[itemDate]) {
      dailyData[itemDate] = {
        date: itemDate,
        temps: [],
        weather_icons: [],
        weather_descriptions: []
      };
    }
    dailyData[itemDate].temps.push(item.main.temp);
    dailyData[itemDate].weather_icons.push(item.weather[0].icon);
    dailyData[itemDate].weather_descriptions.push(item.weather[0].description);
  });

  const dailyForecast = Object.values(dailyData).map(day => {
    const sortedTemps = [...day.temps].sort((a, b) => a - b);
    const modeDescription = day.weather_descriptions.sort((a, b) =>
      day.weather_descriptions.filter(v => v === a).length -
      day.weather_descriptions.filter(v => v === b).length
    ).pop();
    const modeIcon = day.weather_icons.sort((a, b) =>
      day.weather_icons.filter(v => v === a).length -
      day.weather_icons.filter(v => v === b).length
    ).pop();

    return {
      date: day.date,
      temp_min: sortedTemps[0],
      temp_max: sortedTemps[sortedTemps.length - 1],
      temp_avg: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
      weather_description: modeDescription,
      weather_icon: modeIcon
    };
  }).filter(day => {
    const dayDate = new Date(day.date);
    return dayDate >= fromDate && dayDate <= toDate;
  });

  const result = {
    daily_forecast: dailyForecast,
    forecast_limit_warning: forecastLimitWarning
  };

  db.setCachedResponse(cacheKey, result, 30);
  return result;
};

const getWeatherData = async (locationQuery, dateFrom, dateTo) => {
  const location = await geocodeLocation(locationQuery);
  const weather = await getCurrentWeather(location.latitude, location.longitude);
  const youtube = await getYouTubeVideo(location.name);
  const maps = getGoogleMapsUrl(location.latitude, location.longitude, location.name);
  const forecast = await getForecastData(location.latitude, location.longitude, dateFrom, dateTo);

  return {
    location_query: locationQuery,
    location_name: location.name,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    date_from: dateFrom,
    date_to: dateTo,
    current_weather: weather,
    forecast: forecast.daily_forecast,
    forecast_limit_warning: forecast.forecast_limit_warning,
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
