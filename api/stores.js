/**
 * Nearby Jan Aushadhi Kendras from the public site list.
 * The locator posts this body to getAllKendraByStateDistrict:
 * { pageIndex, pageSize, stateId, districtId, pinCode, storeCode }.
 * stateId is the PMBI state code, not the row id from getAllStateOfIndia.
 * The admin nearby route rejects the public guest token, so distance is
 * computed from the latitude and longitude on each record.
 */

const TOKEN_URL = 'https://janaushadhi.gov.in:8443/auth/generateGuestToken';
const LIST_URL = 'https://janaushadhi.gov.in:8443/api/v1/website/getAllKendraByStateDistrict';

/** [south, north, west, east]. stateId is the code the list endpoint expects. */
const STATE_BOXES = [
  { id: 35, box: [6.7, 13.7, 92.2, 94.3] },
  { id: 28, box: [12.6, 19.2, 76.7, 84.8] },
  { id: 12, box: [26.5, 29.5, 91.5, 97.5] },
  { id: 18, box: [24.1, 28.0, 89.7, 96.1] },
  { id: 10, box: [24.2, 27.6, 83.3, 88.3] },
  { id: 4, box: [30.66, 30.82, 76.7, 76.88] },
  { id: 22, box: [17.8, 24.1, 80.2, 84.4] },
  { id: 7, box: [28.4, 28.9, 76.84, 77.35] },
  { id: 30, box: [14.9, 15.8, 73.7, 74.4] },
  { id: 24, box: [20.1, 24.7, 68.1, 74.5] },
  { id: 6, box: [27.6, 30.95, 74.45, 77.6] },
  { id: 2, box: [30.4, 33.3, 75.5, 79.1] },
  { id: 1, box: [32.4, 34.9, 73.6, 76.9] },
  { id: 20, box: [21.9, 25.4, 83.3, 87.95] },
  { id: 29, box: [11.5, 18.5, 74.0, 78.6] },
  { id: 32, box: [8.2, 12.85, 74.85, 77.45] },
  { id: 37, box: [32.2, 36.0, 75.5, 80.3] },
  { id: 31, box: [8.2, 12.4, 71.6, 74.2] },
  { id: 23, box: [21.1, 26.55, 74.0, 82.85] },
  { id: 27, box: [15.6, 22.05, 72.6, 80.95] },
  { id: 14, box: [23.8, 25.7, 93.0, 94.85] },
  { id: 17, box: [25.0, 26.15, 89.7, 92.85] },
  { id: 15, box: [21.9, 24.55, 92.15, 93.5] },
  { id: 13, box: [25.15, 27.05, 93.3, 95.25] },
  { id: 21, box: [17.8, 22.6, 81.3, 87.55] },
  { id: 34, box: [11.75, 12.05, 79.65, 79.9] },
  { id: 34, box: [10.85, 11.05, 79.75, 79.9] },
  { id: 34, box: [11.65, 11.78, 75.48, 75.58] },
  { id: 34, box: [16.68, 16.78, 82.18, 82.28] },
  { id: 3, box: [29.5, 32.55, 73.85, 76.95] },
  { id: 8, box: [23.05, 30.2, 69.45, 78.25] },
  { id: 11, box: [27.05, 28.15, 88.0, 88.95] },
  { id: 33, box: [8.05, 13.55, 76.2, 80.35] },
  { id: 36, box: [15.8, 19.95, 77.15, 81.35] },
  { id: 38, box: [20.05, 20.45, 72.95, 73.2] },
  { id: 38, box: [20.35, 20.5, 72.78, 72.9] },
  { id: 38, box: [20.68, 20.76, 70.9, 71.05] },
  { id: 16, box: [22.9, 24.55, 91.15, 92.4] },
  { id: 5, box: [28.7, 31.5, 77.55, 81.05] },
  { id: 9, box: [23.85, 30.45, 77.05, 84.7] },
  { id: 19, box: [21.5, 27.25, 85.8, 89.9] },
];

export function kmBetween(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function boxArea(box) {
  return Math.max(0, box[1] - box[0]) * Math.max(0, box[3] - box[2]);
}

export function statesNear(lat, lng) {
  const hits = [];
  for (const row of STATE_BOXES) {
    const [south, north, west, east] = row.box;
    if (lat < south || lat > north || lng < west || lng > east) continue;
    const prev = hits.find((h) => h.id === row.id);
    const area = boxArea(row.box);
    if (!prev) hits.push({ id: row.id, area });
    else if (area < prev.area) prev.area = area;
  }
  hits.sort((a, b) => a.area - b.area);
  return hits.slice(0, 3).map((h) => h.id);
}

function cleanText(value) {
  const text = String(value ?? '').trim();
  if (!text || text.toLowerCase() === 'null' || text === '0') return '';
  return text;
}

export function phoneOf(row) {
  const raw = cleanText(row?.contactNumber ?? row?.phone ?? row?.mobile ?? row?.mobileNo);
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8) return '';
  return raw;
}

export function daysOf(row) {
  if (!row) return '';
  for (const key of ['openDays', 'workingDays', 'openDay', 'days', 'weekDays']) {
    const text = cleanText(row[key]);
    if (text) return text;
  }
  return '';
}

function emailOf(row) {
  if (!row) return '';
  for (const key of ['email', 'emailId', 'contactEmail']) {
    const text = cleanText(row[key]);
    if (text.includes('@')) return text;
  }
  return '';
}

export function mapKendra(rows, lat, lng) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      if (Number(row?.status) !== 1) return null;
      const shopLat = Number(row.latitude);
      const shopLng = Number(row.longitude);
      if (!Number.isFinite(shopLat) || !Number.isFinite(shopLng)) return null;
      if (shopLat === 0 || shopLng === 0) return null;
      const km = kmBetween(lat, lng, shopLat, shopLng);
      if (km > 25) return null;
      const code = cleanText(row.storeCode);
      const address = [row.kendraAddress, row.districtName, row.stateName, row.pinCode]
        .map(cleanText)
        .filter(Boolean)
        .join(', ');
      const shop = {
        name: code ? `Jan Aushadhi ${code}` : 'Jan Aushadhi',
        address,
        lat: shopLat,
        lng: shopLng,
        km: +km.toFixed(1),
        maps: `https://www.google.com/maps/dir/?api=1&destination=${shopLat},${shopLng}`,
        phone: phoneOf(row),
        days: daysOf(row),
      };
      const email = emailOf(row);
      if (email) shop.email = email;
      return shop;
    })
    .filter(Boolean)
    .sort((a, b) => a.km - b.km)
    .slice(0, 8);
}

async function guestToken() {
  const res = await fetch(TOKEN_URL, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('token');
  const data = await res.json();
  if (!data?.responseBody) throw new Error('token');
  return data.responseBody;
}

async function kendrasInState(token, stateId, lat, lng) {
  const res = await fetch(LIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pageIndex: 0,
      pageSize: 5000,
      stateId,
      districtId: 0,
      pinCode: 0,
      storeCode: '',
      latitude: String(lat),
      longitude: String(lng),
    }),
    signal: AbortSignal.timeout(22000),
  });
  if (!res.ok) throw new Error('upstream');
  const data = await res.json();
  return data?.responseBody?.addKendraResponseList || [];
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
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
    send(res, 400, { error: 'bad_location', shops: [] });
    return;
  }

  const stateIds = statesNear(lat, lng);
  if (!stateIds.length) {
    send(res, 200, { shops: [], source: 'Jan Aushadhi' });
    return;
  }

  try {
    const token = await guestToken();
    const lists = await Promise.all(stateIds.map((id) => kendrasInState(token, id, lat, lng)));
    const shops = mapKendra(lists.flat(), lat, lng);
    send(res, 200, { shops, source: 'Jan Aushadhi' });
  } catch (err) {
    const timeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    send(res, timeout ? 504 : 502, { error: timeout ? 'timeout' : 'upstream', shops: [] });
  }
}
