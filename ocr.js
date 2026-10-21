/**
 * Handwriting line OCR.
 * Model: Xenova/trocr-small-handwritten
 * Upstream: Microsoft TrOCR, https://github.com/microsoft/unilm/tree/master/trocr
 * Runs in the browser. Output is a transcript only, not a price or a drug fact.
 */
const MODEL = 'Xenova/trocr-small-handwritten';
const CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2';

let pipePromise = null;

async function getPipe() {
  if (!pipePromise) {
    pipePromise = import(CDN).then(async ({ pipeline, env }) => {
      env.allowLocalModels = false;
      return pipeline('image-to-text', MODEL);
    });
  }
  return pipePromise;
}

export async function readHandwriting(imageUrl) {
  const pipe = await getPipe();
  const out = await pipe(imageUrl);
  const row = Array.isArray(out) ? out[0] : out;
  const text = (row?.generated_text || '').trim();
  return text.slice(0, 240);
}

export const HANDWRITING_OCR = {
  name: 'TrOCR',
  model: MODEL,
  repo: 'https://github.com/microsoft/unilm/tree/master/trocr',
};
