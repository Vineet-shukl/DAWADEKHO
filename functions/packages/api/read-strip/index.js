const MODEL = 'gemma-4-26b-a4b-it';
const MAX_PASSES = 3;

const EXTRACT_PROMPT = `You read photos of Indian medicine strips or boxes (PRINTED text only).
Return ONLY a JSON object, no other text:
{"brand": string|null, "salts": string[], "strength": string|null,
 "form": "tablet"|"capsule"|"syrup"|"injection"|"other"|null,
 "mrp_printed": number|null, "readable": boolean, "confidence": number}
Rules:
- Copy only text printed in the image. If unsure, use null.
- Never guess a salt or price that is not printed.
- Strength like "650mg" or "500mg+125mg".
- confidence is 0 to 1 (how sure you are the fields match the print).
- If handwriting (not printed packaging), set readable to false.`;

const VERIFY_PROMPT = (draft) => `You are checking a previous reading of the SAME medicine strip/box photo.
Previous JSON:
${JSON.stringify(draft)}

Compare carefully to the printed text in the image.
Return ONLY corrected JSON (same schema), no other text:
{"brand": string|null, "salts": string[], "strength": string|null,
 "form": "tablet"|"capsule"|"syrup"|"injection"|"other"|null,
 "mrp_printed": number|null, "readable": boolean, "confidence": number, "changed": boolean}
Rules:
- Fix any field that does not match printed text.
- Set changed=true if you corrected anything; false if the draft was accurate.
- Never invent salts or prices. Prefer null over a guess.
- Handwriting → readable false.`;

const VOICE_NORMALIZE_PROMPT = (utterance) => `Normalise spoken/typed Indian medicine name to a brand search string.
Utterance: ${JSON.stringify(utterance)}
End with one JSON object (example shape): {"brand_query":"Dolo 650","salts":["paracetamol"],"strength":"650mg","confidence":0.9,"ok":true}
Rules: map number words to digits; keep brand+strength; if nonsense set ok=false and brand_query=null; never invent a drug; no medical advice.`;

const VOICE_VERIFY_PROMPT = (utterance, draft) => `Verify this normalisation.
Utterance: ${JSON.stringify(utterance)}
Draft: ${JSON.stringify(draft)}
End with corrected JSON: {"brand_query":"...","salts":[],"strength":null,"confidence":0.9,"ok":true,"changed":false}
Set changed=true only if you fixed a field. Never invent drugs.`;

function parseJson(text) {
  const raw = String(text || '');
  // Gemma often reasons first; collect brace-balanced objects, prefer the last valid one.
  const candidates = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] !== '{') continue;
    let depth = 0;
    for (let j = i; j < raw.length; j++) {
      if (raw[j] === '{') depth++;
      else if (raw[j] === '}') {
        depth--;
        if (depth === 0) {
          candidates.push(raw.slice(i, j + 1));
          break;
        }
      }
    }
  }
  for (let i = candidates.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(candidates[i]);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
    } catch {
      /* try earlier */
    }
  }
  return null;
}

function sameStrip(a, b) {
  if (!a || !b) return false;
  const saltsA = (a.salts || []).map((s) => String(s).toLowerCase()).join('|');
  const saltsB = (b.salts || []).map((s) => String(s).toLowerCase()).join('|');
  return (
    String(a.brand || '').toLowerCase() === String(b.brand || '').toLowerCase() &&
    saltsA === saltsB &&
    String(a.strength || '').toLowerCase().replace(/\s+/g, '') ===
      String(b.strength || '').toLowerCase().replace(/\s+/g, '') &&
    a.mrp_printed === b.mrp_printed
  );
}

async function callGemma(parts, signal, attempt = 0) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0, maxOutputTokens: 1024 },
    }),
  });
  if ((r.status === 429 || r.status >= 500) && attempt < 2) {
    await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
    return callGemma(parts, signal, attempt + 1);
  }
  if (r.status === 429) {
    const err = new Error('busy');
    err.code = 429;
    throw err;
  }
  if (!r.ok) {
    const err = new Error('upstream');
    err.code = 502;
    err.status = r.status;
    throw err;
  }
  const j = await r.json();
  return j.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
}

function imagePart(image) {
  return { inline_data: { mime_type: 'image/jpeg', data: image } };
}

async function extractStrip(image, signal) {
  let draft = null;
  let passes = 0;

  for (let i = 0; i < MAX_PASSES; i++) {
    passes = i + 1;
    const text =
      i === 0
        ? await callGemma([imagePart(image), { text: EXTRACT_PROMPT }], signal)
        : await callGemma(
            [imagePart(image), { text: VERIFY_PROMPT(draft) }],
            signal
          );
    const next = parseJson(text);
    if (!next) {
      if (i === 0) return { ok: false, error: 'unreadable', passes };
      break;
    }
    if (i > 0 && draft && (next.changed === false || sameStrip(draft, next))) {
      draft = { ...draft, ...next, confidence: next.confidence ?? draft.confidence };
      break;
    }
    draft = next;
    if (typeof draft.confidence === 'number' && draft.confidence >= 0.9 && i > 0) break;
  }

  if (!draft || draft.readable === false) return { ok: false, error: 'unreadable', passes };
  return {
    ok: true,
    passes,
    data: {
      brand: draft.brand ?? null,
      salts: Array.isArray(draft.salts) ? draft.salts.filter((s) => typeof s === 'string') : [],
      strength: draft.strength ?? null,
      form: draft.form ?? null,
      mrp_printed: typeof draft.mrp_printed === 'number' ? draft.mrp_printed : null,
      confidence: typeof draft.confidence === 'number' ? draft.confidence : null,
      verified_passes: passes,
    },
  };
}

async function normaliseVoice(utterance, signal) {
  let draft = null;
  let passes = 0;
  const clipped = String(utterance).slice(0, 200);

  for (let i = 0; i < MAX_PASSES; i++) {
    passes = i + 1;
    const text =
      i === 0
        ? await callGemma([{ text: VOICE_NORMALIZE_PROMPT(clipped) }], signal)
        : await callGemma([{ text: VOICE_VERIFY_PROMPT(clipped, draft) }], signal);
    const next = parseJson(text);
    if (!next) {
      if (i === 0) return { ok: false, error: 'unreadable', passes };
      break;
    }
    if (i > 0 && draft && next.changed === false) {
      draft = next;
      break;
    }
    draft = next;
    if (typeof draft.confidence === 'number' && draft.confidence >= 0.9 && i > 0) break;
  }

  const query = draft?.brand_query || draft?.query || draft?.brand || null;
  if (!draft || draft.ok === false || !query) {
    return { ok: false, error: 'unreadable', passes };
  }
  return {
    ok: true,
    passes,
    data: {
      brand_query: String(query),
      salts: Array.isArray(draft.salts) ? draft.salts.filter((s) => typeof s === 'string') : [],
      strength: draft.strength ?? null,
      confidence: typeof draft.confidence === 'number' ? draft.confidence : null,
      verified_passes: passes,
    },
  };
}

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

  if (!process.env.GEMINI_API_KEY) return reply(500, { error: 'generic' });

  const image = args.image;
  const voiceText = args.voice_text || args.text;

  try {
    const signal = AbortSignal.timeout(45000);

    if (typeof voiceText === 'string' && voiceText.trim() && !image) {
      const out = await normaliseVoice(voiceText.trim(), signal);
      if (!out.ok) return reply(422, { error: out.error || 'unreadable' });
      return reply(200, out.data);
    }

    if (!image || typeof image !== 'string') return reply(400, { error: 'no_image' });
    if (image.length > 2.8e6) return reply(413, { error: 'too_big' });

    const out = await extractStrip(image, signal);
    if (!out.ok) return reply(422, { error: out.error || 'unreadable' });
    return reply(200, out.data);
  } catch (e) {
    if (e.code === 429) return reply(429, { error: 'busy' });
    if (e.code === 502) return reply(502, { error: 'upstream', status: e.status });
    const timeout = e.name === 'TimeoutError' || e.name === 'AbortError';
    return reply(timeout ? 504 : 500, { error: timeout ? 'timeout' : 'generic' });
  }
}
