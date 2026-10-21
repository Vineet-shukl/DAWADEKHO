/** Nearby places named Jan Aushadhi, from OpenStreetMap via Nominatim. */
function kmBetween(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  const lat = Number(req.query?.lat);
  const lng = Number(req.query?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'bad_location', shops: [] }));
    return;
  }

  const dLat = 0.2;
  const dLng = 0.2 / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  const viewbox = [lng - dLng, lat + dLat, lng + dLng, lat - dLat].join(',');
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', 'Jan Aushadhi');
  url.searchParams.set('limit', '15');
  url.searchParams.set('viewbox', viewbox);
  url.searchParams.set('bounded', '1');

  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'DawaDekho/1.0 (medicine price helper; contact via github)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'upstream', shops: [] }));
      return;
    }
    const rows = await r.json();
    const shops = (Array.isArray(rows) ? rows : [])
      .map((row) => {
        const shopLat = Number(row.lat);
        const shopLng = Number(row.lon);
        if (!Number.isFinite(shopLat) || !Number.isFinite(shopLng)) return null;
        const km = kmBetween(lat, lng, shopLat, shopLng);
        if (km > 25) return null;
        return {
          name: row.name || 'Jan Aushadhi',
          address: row.display_name || '',
          lat: shopLat,
          lng: shopLng,
          km: +km.toFixed(1),
          maps: `https://www.google.com/maps/dir/?api=1&destination=${shopLat},${shopLng}`,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.km - b.km)
      .slice(0, 8);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ shops, source: 'OpenStreetMap' }));
  } catch {
    res.statusCode = 504;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'timeout', shops: [] }));
  }
}
