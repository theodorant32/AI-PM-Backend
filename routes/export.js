const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/json', (req, res) => {
  try {
    const searches = db.getAllWeatherSearches();
    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/json/:id', (req, res) => {
  try {
    const search = db.getWeatherSearchById(req.params.id);
    if (!search) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(search);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/csv', (req, res) => {
  try {
    const searches = db.getAllWeatherSearches();

    const headers = [
      'id', 'location_query', 'location_name', 'country',
      'latitude', 'longitude', 'date_from', 'date_to',
      'temperature', 'feels_like', 'humidity', 'pressure',
      'wind_speed', 'weather_description', 'created_at'
    ];

    const rows = searches.map(s => [
      s.id,
      `"${(s.location_query || '').replace(/"/g, '""')}"`,
      `"${(s.location_name || '').replace(/"/g, '""')}"`,
      `"${(s.country || '').replace(/"/g, '""')}"`,
      s.latitude,
      s.longitude,
      s.date_from,
      s.date_to,
      s.temperature,
      s.feels_like,
      s.humidity,
      s.pressure,
      s.wind_speed,
      `"${(s.weather_description || '').replace(/"/g, '""')}"`,
      s.created_at
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather_data.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/xml', (req, res) => {
  try {
    const searches = db.getAllWeatherSearches();

    const escapeXml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<weather_searches>\n';

    searches.forEach(s => {
      xml += '  <search>\n';
      xml += `    <id>${s.id}</id>\n`;
      xml += `    <location_query>${escapeXml(s.location_query)}</location_query>\n`;
      xml += `    <location_name>${escapeXml(s.location_name)}</location_name>\n`;
      xml += `    <country>${escapeXml(s.country)}</country>\n`;
      xml += `    <latitude>${s.latitude}</latitude>\n`;
      xml += `    <longitude>${s.longitude}</longitude>\n`;
      xml += `    <date_from>${escapeXml(s.date_from)}</date_from>\n`;
      xml += `    <date_to>${escapeXml(s.date_to)}</date_to>\n`;
      xml += `    <temperature>${s.temperature}</temperature>\n`;
      xml += `    <feels_like>${s.feels_like}</feels_like>\n`;
      xml += `    <humidity>${s.humidity}</humidity>\n`;
      xml += `    <pressure>${s.pressure}</pressure>\n`;
      xml += `    <wind_speed>${s.wind_speed}</wind_speed>\n`;
      xml += `    <weather_description>${escapeXml(s.weather_description)}</weather_description>\n`;
      xml += `    <created_at>${escapeXml(s.created_at)}</created_at>\n`;
      xml += '  </search>\n';
    });

    xml += '</weather_searches>';

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename=weather_data.xml');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/markdown', (req, res) => {
  try {
    const searches = db.getAllWeatherSearches();

    let md = '# Weather Search Data Export\n\n';
    md += `Exported: ${new Date().toISOString()}\n\n`;
    md += `Total Records: ${searches.length}\n\n`;

    md += '| ID | Location | Country | Date Range | Temp (°C) | Conditions |\n';
    md += '|----|----------|---------|------------|-----------|------------|\n';

    searches.forEach(s => {
      md += `| ${s.id} | ${s.location_name || s.location_query} | ${s.country || 'N/A'} | ${s.date_from} to ${s.date_to} | ${s.temperature} | ${s.weather_description} |\n`;
    });

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename=weather_data.md');
    res.send(md);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
