/**
 * Local stand-in for the DigitalOcean Function.
 * Loads GEMINI_API_KEY from .env — never commit that file.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from '../functions/packages/api/read-strip/index.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

process.env.ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:8080';
const PORT = Number(process.env.LOCAL_API_PORT || 8787);

if (!process.env.GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { ...cors, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'method' }));
    return;
  }

  const chunks = [];
  for await (const c of req) chunks.push(c);
  let body = {};
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    res.writeHead(400, { ...cors, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'bad_json' }));
    return;
  }

  const out = await main({ ...body, __ow_method: 'post' });
  const headers = { ...cors, ...(out.headers || {}) };
  res.writeHead(out.statusCode || 200, headers);
  res.end(typeof out.body === 'string' ? out.body : JSON.stringify(out.body));
});

server.listen(PORT, () => {
  console.log(`Local read-strip API at http://localhost:${PORT}`);
  console.log('Point the app (localhost) at this URL — config.js auto-detects it.');
});
