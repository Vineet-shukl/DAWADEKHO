/**
 * Vercel serverless wrapper around the Gemma strip/voice reader.
 * Body: { image: base64 } | { voice_text: string }
 */
import { main } from '../functions/packages/api/read-strip/index.js';

function setCors(res, origin) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'method' }));
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'bad_json' }));
      return;
    }
  }
  body = body || {};

  const out = await main({
    ...body,
    __ow_method: 'post',
    httpMethod: 'POST',
  });

  res.statusCode = out.statusCode || 200;
  const headers = out.headers || {};
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === 'content-type') continue;
    res.setHeader(k, v);
  }
  res.setHeader('Content-Type', 'application/json');
  const payload = typeof out.body === 'string' ? out.body : JSON.stringify(out.body);
  res.end(payload);
}
