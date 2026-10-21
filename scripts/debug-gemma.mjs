import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const prompt =
  'Convert spoken medicine to brand string. Input: dolo six fifty. Output JSON only: {"brand_query":"...","ok":true}';

const MODEL = 'gemma-4-26b-a4b-it';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
const r = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 256 },
  }),
});
const j = await r.json();
const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
console.log('FULL TEXT:\n', text);
console.log('---');
const m = text.match(/\{[\s\S]*\}/);
console.log('MATCH', m?.[0]);
