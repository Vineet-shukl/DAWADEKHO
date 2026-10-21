const MODEL = 'gemma-4-26b-a4b-it';
const PROMPT = `You read photos of Indian medicine strips or boxes.
Return ONLY a JSON object, no other text:
{"brand": string|null, "salts": string[], "strength": string|null,
 "form": "tablet"|"capsule"|"syrup"|"injection"|"other"|null,
 "mrp_printed": number|null, "readable": boolean}
Rules: copy only text printed in the image. If unsure, use null.
Never guess a salt or price that is not printed. Strength like "650mg" or "500mg+125mg".
If the image looks like handwriting (not printed packaging), set readable to false.`;

export async function main(args) {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  const reply = (statusCode, body) => ({
    statusCode,
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

  if (args.__ow_method === 'options' || args.httpMethod === 'OPTIONS') {
    return reply(204, '');
  }

  const image = args.image;
  if (!image || typeof image !== 'string') return reply(400, { error: 'no_image' });
  if (image.length > 2.8e6) return reply(413, { error: 'too_big' });
  if (!process.env.GEMINI_API_KEY) return reply(500, { error: 'generic' });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: image } },
              { text: PROMPT },
            ],
          },
        ],
        generationConfig: { temperature: 0 },
      }),
    });
    if (r.status === 429) return reply(429, { error: 'busy' });
    if (!r.ok) return reply(502, { error: 'upstream', status: r.status });
    const j = await r.json();
    const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return reply(422, { error: 'unreadable' });
    const d = JSON.parse(m[0]);
    if (!d.readable) return reply(422, { error: 'unreadable' });
    return reply(200, {
      brand: d.brand ?? null,
      salts: Array.isArray(d.salts) ? d.salts.filter((s) => typeof s === 'string') : [],
      strength: d.strength ?? null,
      form: d.form ?? null,
      mrp_printed: typeof d.mrp_printed === 'number' ? d.mrp_printed : null,
    });
  } catch (e) {
    const timeout = e.name === 'TimeoutError' || e.name === 'AbortError';
    return reply(timeout ? 504 : 500, { error: timeout ? 'timeout' : 'generic' });
  }
}
