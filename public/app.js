const API_BASE = '/api/weather';

document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const location = document.getElementById('location').value.trim();
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

function displayResult(data) {
  document.getElementById('res-location').textContent =
    `${data.location_name}, ${data.country}`;
  document.getElementById('res-description').textContent = data.weather_description;
  document.getElementById('res-temp').textContent = data.temperature;
  document.getElementById('res-feels').textContent = data.feels_like;
  document.getElementById('res-humidity').textContent = data.humidity;
  document.getElementById('res-pressure').textContent = data.pressure;
  document.getElementById('res-wind').textContent = data.wind_speed;
  document.getElementById('res-dates').textContent =
    `${data.date_from} to ${data.date_to}`;
  document.getElementById('res-coords').textContent =
    `${data.latitude}, ${data.longitude}`;

  document.getElementById('res-icon').src =
    `https://openweathermap.org/img/wn/${data.weather_icon}@2x.png`;

  const mapsLink = document.getElementById('res-maps');
  mapsLink.href = data.maps_url;
  mapsLink.style.display = data.maps_url ? 'inline-block' : 'none';

  const youtubeLink = document.getElementById('res-youtube');
  if (data.youtube_url) {
    youtubeLink.href = data.youtube_url;
    youtubeLink.style.display = 'inline-block';
  } else {
    youtubeLink.style.display = 'none';
  }

  document.getElementById('result').style.display = 'block';
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

    if (searches.length === 0) {
      listEl.innerHTML = '<p style="color: #7f8c8d; font-size: 14px;">No saved searches yet.</p>';
      return;
    }

    listEl.innerHTML = searches.map(s => `
      <div class="saved-item">
        <div class="saved-item-info">
          <div class="saved-item-location">${s.location_name || s.location_query}, ${s.country || ''}</div>
          <div class="saved-item-date">${s.date_from} to ${s.date_to} - ${s.temperature}°C, ${s.weather_description}</div>
        </div>
        <div class="saved-item-actions">
          <button class="btn-secondary btn-view" onclick="viewSearch(${s.id})">View</button>
          <button class="btn-secondary btn-delete" onclick="deleteSearch(${s.id})">Delete</button>
        </div>
      </div>
    `).join('');
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

loadSavedSearches();
