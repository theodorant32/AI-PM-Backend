const express = require('express');
const router = express.Router();
const db = require('../database');
const weatherService = require('../services/weatherService');

router.post('/search', async (req, res) => {
  try {
    const { location, date_from, date_to } = req.body;

    if (!location || !date_from || !date_to) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['location', 'date_from', 'date_to']
      });
    }

    const fromDate = new Date(date_from);
    const toDate = new Date(date_to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ error: 'date_from must be before date_to' });
    }

    const weatherData = await weatherService.getWeatherData(location, date_from, date_to);
    const saved = db.createWeatherSearch(weatherData);

    res.json(saved);
  } catch (error) {
    console.error('Search error:', error.message);
    const status = error.message === 'Location not found' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const searches = db.getAllWeatherSearches();
    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search/:id', (req, res) => {
  try {
    const search = db.getWeatherSearchById(req.params.id);
    if (!search) {
      return res.status(404).json({ error: 'Search not found' });
    }
    res.json(search);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/location/:query', (req, res) => {
  try {
    const searches = db.getWeatherSearchesByLocation(req.params.query);
    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = db.getWeatherSearchById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Search not found' });
    }

    const { location, date_from, date_to } = req.body;
    let updateData = { ...req.body };

    if (location || date_from || date_to) {
      if (!location || !date_from || !date_to) {
        return res.status(400).json({
          error: 'When updating location, all fields required',
          required: ['location', 'date_from', 'date_to']
        });
      }

      const fromDate = new Date(date_from);
      const toDate = new Date(date_to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      if (fromDate > toDate) {
        return res.status(400).json({ error: 'date_from must be before date_to' });
      }

      const weatherData = await weatherService.getWeatherData(location, date_from, date_to);
      updateData = weatherData;
    }

    const updated = db.updateWeatherSearch(req.params.id, updateData);
    res.json(updated);
  } catch (error) {
    console.error('Update error:', error.message);
    const status = error.message === 'Location not found' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existing = db.getWeatherSearchById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Search not found' });
    }

    db.deleteWeatherSearch(req.params.id);
    res.json({ message: 'Search deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
