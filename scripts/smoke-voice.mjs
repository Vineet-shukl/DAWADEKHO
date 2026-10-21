import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const { main } = await import('../functions/packages/api/read-strip/index.js');
const out = await main({ voice_text: 'dolo six fifty', __ow_method: 'post' });
console.log(out.statusCode, out.body);
