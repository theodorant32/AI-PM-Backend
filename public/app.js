const API_BASE = '/api/weather';

// Country and city data
const countriesAndCities = {
  "US": {
    name: "United States",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "Seattle", "Denver", "Boston", "Portland", "Miami"]
  },
  "GB": {
    name: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Edinburgh", "Bristol", "Sheffield", "Newcastle", "Belfast", "Cardiff", "Leicester", "Nottingham", "Southampton"]
  },
  "CA": {
    name: "Canada",
    cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener", "London", "Victoria", "Halifax", "Saskatoon", "Regina"]
  },
  "AU": {
    name: "Australia",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Hobart", "Darwin", "Cairns", "Wollongong", "Geelong", "Townsville"]
  },
  "JP": {
    name: "Japan",
    cities: ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Kawasaki", "Saitama", "Hiroshima", "Sendai", "Chiba", "Kitakyushu", "Sakai"]
  },
  "DE": {
    name: "Germany",
    cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Dusseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hanover", "Nuremberg"]
  },
  "FR": {
    name: "France",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Cannes"]
  },
  "IT": {
    name: "Italy",
    cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania", "Venice", "Verona", "Messina", "Padua"]
  },
  "ES": {
    name: "Spain",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Malaga", "Murcia", "Palma", "Bilbao", "Alicante", "Cordoba", "Valladolid", "Vigo", "Gijon"]
  },
  "BR": {
    name: "Brazil",
    cities: ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre", "Goiania", "Belem", "Campinas"]
  },
  "IN": {
    name: "India",
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Surat", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal"]
  },
  "CN": {
    name: "China",
    cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Chongqing", "Tianjin", "Wuhan", "Hangzhou", "Xi'an", "Nanjing", "Shenyang", "Harbin", "Qingdao"]
  },
  "MX": {
    name: "Mexico",
    cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Leon", "Juarez", "Zapopan", "Merida", "Cancun", "Acapulco", "Puerto Vallarta"]
  },
  "NL": {
    name: "Netherlands",
    cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen"]
  },
  "SE": {
    name: "Sweden",
    cities: ["Stockholm", "Gothenburg", "Malmo", "Uppsala", "Vasteras", "Orebro", "Linkoping", "Helsingborg", "Jonkoping", "Norrkoping"]
  },
  "NO": {
    name: "Norway",
    cities: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Fredrikstad", "Kristiansand", "Tromso", "Sandnes", "Alesund"]
  },
  "DK": {
    name: "Denmark",
    cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle", "Roskilde"]
  },
  "FI": {
    name: "Finland",
    cities: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyvaskyla", "Lahti", "Kuopio", "Pori"]
  },
  "SG": {
    name: "Singapore",
    cities: ["Singapore"]
  },
  "AE": {
    name: "United Arab Emirates",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah"]
  },
  "OTHER": {
    name: "Other (Type City)",
    cities: [],
    customInput: true
  }
};

// Initialize country and city dropdowns
function initLocationSelectors() {
  const countrySelect = document.getElementById('country');
  const citySelect = document.getElementById('city');

  // Populate countries
  Object.entries(countriesAndCities).forEach(([code, data]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = data.name;
    countrySelect.appendChild(option);
  });

  // Update cities when country changes
  countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;
    citySelect.innerHTML = '<option value="">Select City</option>';

    if (selectedCountry && countriesAndCities[selectedCountry]) {
      const countryData = countriesAndCities[selectedCountry];

      if (countryData.customInput) {
        // Show text input for "Other" option
        citySelect.outerHTML = '<input type="text" id="city" name="city" placeholder="Enter city name" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:14px;">';
      } else {
        // Populate city dropdown
        countryData.cities.forEach(city => {
          const option = document.createElement('option');
          option.value = city;
          option.textContent = city;
          citySelect.appendChild(option);
        });
      }
    }
  });
}

document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const country = document.getElementById('country').value;
  let city = document.getElementById('city').value;

  // Get full location string for API
  let location;
  if (country === 'OTHER') {
    location = city;
  } else {
    location = `${city},${country}`;
  }

  const date_from = document.getElementById('date_from').value;
  const date_to = document.getElementById('date_to').value;
  const messageEl = document.getElementById('message');
  const resultSection = document.getElementById('result');

  messageEl.className = 'message';
  messageEl.textContent = '';

  try {
    const response = await fetch(API_BASE + '/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, date_from, date_to })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Search failed');
    }

    displayResult(data);
    showMessage('Weather data retrieved successfully!', 'success');
    loadSavedSearches();
  } catch (error) {
    showMessage(error.message, 'error');
    resultSection.style.display = 'none';
  }
});

let allForecastDays = [];
let showAllForecasts = false;

// Convert technical weather descriptions to user-friendly terms
function getFriendlyWeatherDesc(techDesc) {
  const mapping = {
    'clear sky': 'Sunny',
    'few clouds': 'Mostly Sunny',
    'scattered clouds': 'Partly Cloudy',
    'broken clouds': 'Cloudy',
    'overcast clouds': 'Overcast',
    'light intensity drizzle': 'Light Drizzle',
    'drizzle': 'Drizzle',
    'heavy intensity drizzle': 'Heavy Drizzle',
    'light rain': 'Light Rain',
    'moderate rain': 'Rain',
    'heavy intensity rain': 'Heavy Rain',
    'very heavy rain': 'Very Heavy Rain',
    'thunderstorm': 'Thunderstorm',
    'snow': 'Snow',
    'light snow': 'Light Snow',
    'heavy snow': 'Heavy Snow',
    'mist': 'Misty',
    'fog': 'Foggy',
    'haze': 'Hazy',
    'smoke': 'Smoky',
    'dust': 'Dusty',
    'squalls': 'Windy',
    'tornado': 'Tornado'
  };
  return mapping[techDesc] || techDesc;
}

// Get temperature category for visual indicators
function getTempCategory(temp) {
  if (temp >= 30) return 'hot';      // 30°C+ = Hot (red/orange)
  if (temp >= 20) return 'warm';     // 20-29°C = Warm (orange)
  if (temp >= 15) return 'mild';     // 15-19°C = Mild (green/teal)
  if (temp >= 10) return 'cool';     // 10-14°C = Cool (blue)
  return 'cold';                      // <10°C = Cold (purple)
}

// Get temperature emoji for visual indicator
function getTempEmoji(category) {
  const emojis = {
    'hot': '🔥',
    'warm': '☀️',
    'mild': '🌤️',
    'cool': '💨',
    'cold': '🥶'
  };
  return emojis[category] || '🌡️';
}

function displayResult(data) {
  // Handle both old and new data structures
  const currentWeather = data.current_weather || data;
  const temp = Math.round(currentWeather.temperature);
  const tempCategory = getTempCategory(currentWeather.temperature);

  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setElText('res-location', `${data.location_name}, ${data.country}`);
  setElText('res-description', getFriendlyWeatherDesc(currentWeather.weather_description));
  setElText('res-temp', temp);
  setElText('res-humidity', currentWeather.humidity);
  setElText('res-pressure', currentWeather.pressure);
  setElText('res-wind', currentWeather.wind_speed.toFixed(1));
  setElText('res-dates', `${data.date_from} to ${data.date_to}`);
  setElText('res-coords', `${data.latitude}, ${data.longitude}`);

  // Set weather icon and temperature badge
  const iconEl = document.getElementById('res-icon');
  const badgeEl = document.getElementById('temp-badge');
  const badgeEmojiEl = document.getElementById('temp-badge-emoji');
  const badgeLabelEl = document.getElementById('temp-badge-label');

  if (iconEl) {
    iconEl.src = `https://openweathermap.org/img/wn/${currentWeather.weather_icon}@2x.png`;
  }
  if (badgeEl) {
    badgeEl.className = 'temp-badge ' + tempCategory;
  }
  if (badgeEmojiEl) {
    badgeEmojiEl.textContent = getTempEmoji(tempCategory);
  }
  if (badgeLabelEl) {
    const labels = { hot: 'Hot', warm: 'Warm', mild: 'Mild', cool: 'Cool', cold: 'Cold' };
    badgeLabelEl.textContent = labels[tempCategory];
    badgeLabelEl.className = 'temp-badge-label ' + tempCategory;
  }

  const mapsLink = document.getElementById('res-maps');
  if (mapsLink) {
    mapsLink.href = data.maps_url;
    mapsLink.style.display = data.maps_url ? 'inline-block' : 'none';
  }

  const youtubeLink = document.getElementById('res-youtube');
  if (youtubeLink) {
    youtubeLink.href = data.youtube_url || '#';
    youtubeLink.style.display = data.youtube_url ? 'inline-block' : 'none';
  }

  // Display forecast warning if present
  const warningEl = document.getElementById('forecast-warning');
  if (warningEl) {
    warningEl.textContent = data.forecast_limit_warning || '';
    warningEl.style.display = data.forecast_limit_warning ? 'block' : 'none';
  }

  // Display forecast data
  const forecastSection = document.getElementById('forecast-section');
  if (forecastSection && data.forecast && data.forecast.length > 0) {
    allForecastDays = data.forecast;
    showAllForecasts = false;
    displayForecasts(data.forecast, false);
    forecastSection.style.display = 'block';
  } else if (forecastSection) {
    forecastSection.style.display = 'none';
  }

  const resultEl = document.getElementById('result');
  if (resultEl) resultEl.style.display = 'block';
}

function displayForecasts(forecastDays, showAll) {
  const container = document.getElementById('forecast-container');
  const showMoreBtn = document.getElementById('show-more-btn');

  const daysToShow = showAll ? forecastDays : forecastDays.slice(0, 3);
  const remainingDays = forecastDays.length - 3;

  container.innerHTML = daysToShow.map(day => {
    const tempCategory = getTempCategory(day.temp_avg);
    const emoji = getTempEmoji(tempCategory);
    return `
      <div class="forecast-day">
        <div class="forecast-date">${formatDate(day.date)} ${emoji}</div>
        <img src="https://openweathermap.org/img/wn/${day.weather_icon}@2x.png" alt="Weather icon">
        <div class="forecast-temps">
          <span class="temp-max">${Math.round(day.temp_max)}°</span>
          <span class="temp-min">${Math.round(day.temp_min)}°</span>
        </div>
        <div class="forecast-desc">${getFriendlyWeatherDesc(day.weather_description)}</div>
      </div>
    `;
  }).join('');

  if (forecastDays.length > 3) {
    showMoreBtn.style.display = 'block';
    showMoreBtn.textContent = showAll ? 'Show Less' : `Show More (${remainingDays} more days)`;
    showMoreBtn.onclick = () => {
      showAllForecasts = !showAllForecasts;
      displayForecasts(forecastDays, showAllForecasts);
    };
  } else {
    showMoreBtn.style.display = 'none';
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function showMessage(text, type) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className = `message ${type}`;
}

async function loadSavedSearches() {
  try {
    const response = await fetch(API_BASE);
    const searches = await response.json();

    const listEl = document.getElementById('savedList');

    // Filter out entries with invalid/null weather data
    const validSearches = searches.filter(s => {
      const cw = s.current_weather || s;
      return cw.temperature !== null && cw.temperature !== undefined;
    });

    if (validSearches.length === 0) {
      listEl.innerHTML = '<p style="color: #7f8c8d; font-size: 14px;">No saved searches yet. Search for a location to get started!</p>';
      return;
    }

    listEl.innerHTML = validSearches.map(s => {
      const currentWeather = s.current_weather || s;
      const temp = Math.round(currentWeather.temperature);
      const desc = getFriendlyWeatherDesc(currentWeather.weather_description) || 'Clear';
      return `
        <div class="saved-item">
          <div class="saved-item-info">
            <div class="saved-item-location">${s.location_name || s.location_query}, ${s.country || ''}</div>
            <div class="saved-item-date">${s.date_from} to ${s.date_to} - ${temp}°C, ${desc}</div>
          </div>
          <div class="saved-item-actions">
            <button class="btn-secondary btn-view" onclick="viewSearch(${s.id})">View</button>
            <button class="btn-secondary btn-delete" onclick="deleteSearch(${s.id})">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to load saved searches:', error);
  }
}

async function viewSearch(id) {
  try {
    const response = await fetch(`${API_BASE}/search/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load search');
    }

    displayResult(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function deleteSearch(id) {
  if (!confirm('Delete this search?')) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Delete failed');
    }

    showMessage('Search deleted', 'success');
    loadSavedSearches();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function exportData(format) {
  window.open(`/api/export/${format}`, '_blank');
}

const today = new Date().toISOString().split('T')[0];
document.getElementById('date_from').min = today;
document.getElementById('date_to').min = today;

// Initialize location selectors
initLocationSelectors();

loadSavedSearches();
