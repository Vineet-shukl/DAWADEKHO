import { CONFIG } from './config.js';
import { createMatcher, savings } from './match.js';
import { getLang, setLang, t } from './i18n.js';

const $ = (id) => document.getElementById(id);

let matcher = null;
let debounceTimer = null;
let activeIndex = -1;
let lastHits = [];

function formatINR(n) {
  const num = Number(n) || 0;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: num % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  document.title = t('meta.title');
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', t('meta.description'));
  $('lang-en').setAttribute('aria-pressed', getLang() === 'en' ? 'true' : 'false');
  $('lang-hi').setAttribute('aria-pressed', getLang() === 'hi' ? 'true' : 'false');
  if ($('receipt').hidden === false && $('save-label').dataset.amount) {
    refreshSaveLabel();
  }
}

function refreshSaveLabel() {
  const amount = $('save-label').dataset.amount;
  const pct = $('save-label').dataset.pct;
  if (!amount) return;
  $('save-label').textContent = t('result.save', { amount, pct });
  $('save-sr').textContent = t('result.save.sr', {
    rupees: amount.replace('₹', '').replace(/,/g, ''),
    pct,
  });
}

function setOffline(on) {
  $('offline').classList.toggle('is-on', on);
}

function hideResults() {
  $('loading').hidden = true;
  $('error-box').hidden = true;
  $('nomatch').hidden = true;
  $('receipt').hidden = true;
  $('confirm-card').hidden = true;
}

function showError(key) {
  hideResults();
  $('error-box').hidden = false;
  $('error-text').textContent = t(key);
  $('search-input')?.focus();
}

function showSearch() {
  $('search-panel').hidden = false;
  $('photo-panel').hidden = true;
  $('search-input').focus();
}

function showPhoto() {
  $('photo-panel').hidden = false;
  $('search-panel').hidden = true;
  if (!navigator.onLine) {
    showError('photo.needsNet');
    return;
  }
}

function renderSuggestions(query) {
  const list = $('suggestions');
  list.innerHTML = '';
  activeIndex = -1;
  if (!matcher || !query.trim()) {
    list.hidden = true;
    $('search-input').setAttribute('aria-expanded', 'false');
    lastHits = [];
    return;
  }
  const result = matcher.search(query, 5);
  if (!result) {
    list.hidden = true;
    $('search-input').setAttribute('aria-expanded', 'false');
    lastHits = [];
    return;
  }
  const items = [];
  if (result.brand) items.push({ label: result.brand.brand, payload: result });
  else if (result.generic) items.push({ label: result.generic.generic_name, payload: result });
  for (const alt of result.alternatives || []) {
    const it = alt.item;
    if (it.kind === 'brand') items.push({ label: it.b.brand, payload: { brand: it.b, generic: null } });
    else items.push({ label: it.g.generic_name, payload: { generic: it.g } });
  }
  lastHits = items.slice(0, 5);
  lastHits.forEach((hit, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = `sug-${i}`;
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = hit.label;
    btn.addEventListener('click', () => selectHit(hit));
    li.appendChild(btn);
    list.appendChild(li);
  });
  list.hidden = lastHits.length === 0;
  $('search-input').setAttribute('aria-expanded', String(!list.hidden));
  list.setAttribute('aria-label', t('search.results.aria', { n: lastHits.length }));
}

function resolveHit(hit) {
  if (hit.payload.generic && hit.payload.brand) return hit.payload;
  if (hit.payload.brand) {
    const r = matcher.bySalt(hit.payload.brand.salts, hit.payload.brand.strength);
    return r ? { brand: hit.payload.brand, generic: r.generic } : null;
  }
  if (hit.payload.generic) return { generic: hit.payload.generic };
  return matcher.search(hit.label);
}

function selectHit(hit) {
  const resolved = resolveHit(hit);
  $('suggestions').hidden = true;
  $('search-input').setAttribute('aria-expanded', 'false');
  if (!resolved?.generic) {
    showNoMatch();
    return;
  }
  showResult(resolved, { approx: true });
}

function showNoMatch() {
  hideResults();
  $('nomatch').hidden = false;
}

function showResult(match, { stripMrp = null, approx = true } = {}) {
  hideResults();
  const g = match.generic;
  const brand = match.brand;
  const brandedPrice = stripMrp != null && stripMrp !== '' ? Number(stripMrp) : brand?.approx_mrp ?? null;
  const useApprox = stripMrp == null || stripMrp === '';
  if (brandedPrice == null) {
    showNoMatch();
    return;
  }
  const sav = savings(brandedPrice, g.mrp);
  const titleBrand = brand?.brand || g.generic_name;
  $('receipt-title').textContent = `${titleBrand}  (${g.salts.join(' + ')} ${g.strength})`;
  $('receipt-branded').textContent = formatINR(brandedPrice);
  $('receipt-generic').textContent = formatINR(g.mrp);
  $('approx-tag').hidden = !useApprox;
  const amountStr = formatINR(sav.amount);
  $('save-amount').textContent = amountStr;
  $('save-label').dataset.amount = amountStr;
  $('save-label').dataset.pct = String(sav.pct);
  refreshSaveLabel();
  $('receipt-same').textContent = brand
    ? t('result.sameAs', { brand: brand.brand })
    : `${g.salts.join(', ')} · ${g.strength}`;
  $('receipt-pack').textContent = t('result.pack', { unit: g.unit });
  $('receipt-code').textContent = t('result.code', { code: g.code });
  $('receipt-source').textContent = t('result.source', { date: CONFIG.DATA_SNAPSHOT });
  $('kendra-link').href = CONFIG.KENDRA_URL;
  $('sugam-link').href = CONFIG.SUGAM_URL;
  $('receipt').hidden = false;
  $('receipt').setAttribute('aria-label', t('a11y.resultReady'));
}

function runQuery(q) {
  showSearch();
  $('search-input').value = q;
  $('search-clear').hidden = !q;
  const result = matcher.search(q);
  if (!result?.generic) {
    showNoMatch();
    return;
  }
  showResult(result, { approx: true });
}

async function fileToJpegBase64(file) {
  const bmp = await createImageBitmap(file);
  const max = 1024;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  return dataUrl.split(',')[1];
}

async function readStrip(file) {
  if (!navigator.onLine) {
    showError('photo.needsNet');
    return;
  }
  if (!CONFIG.API_URL) {
    showError('err.busy');
    showSearch();
    return;
  }
  hideResults();
  $('loading').hidden = false;
  let image;
  try {
    image = await fileToJpegBase64(file);
  } catch {
    showError('err.generic');
    return;
  }
  if (image.length > 2.8e6) {
    showError('err.tooBig');
    return;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 50000);
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (res.status === 429) return showError('err.busy');
    if (res.status === 413) return showError('err.tooBig');
    if (res.status === 422) return showError('err.unreadable');
    if (res.status === 504) return showError('err.timeout');
    if (!res.ok) return showError('err.generic');
    const data = await res.json();
    $('loading').hidden = true;
    $('confirm-card').hidden = false;
    $('confirm-brand').value = data.brand || '';
    $('confirm-salt').value = Array.isArray(data.salts) ? data.salts.join(', ') : '';
    $('confirm-strength').value = data.strength || '';
    $('confirm-mrp').value = data.mrp_printed != null ? data.mrp_printed : '';
    $('confirm-brand').focus();
  } catch (e) {
    clearTimeout(timer);
    showError(e.name === 'AbortError' ? 'err.timeout' : 'err.generic');
    showSearch();
  }
}

function speakResult() {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const text = [$('save-sr').textContent, $('receipt-title').textContent, t('result.disclaimer')]
    .filter(Boolean)
    .join('. ');
  const u = new SpeechSynthesisUtterance(text);
  u.lang = getLang() === 'hi' ? 'hi-IN' : 'en-IN';
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) => v.lang.startsWith(u.lang.slice(0, 2)));
  if (preferred) u.voice = preferred;
  window.speechSynthesis.speak(u);
}

async function normaliseVoiceText(utterance) {
  if (!CONFIG.API_URL || !navigator.onLine) {
    runQuery(utterance);
    return;
  }
  const status = $('voice-status');
  status.hidden = false;
  status.textContent = t('voice.working');
  hideResults();
  $('loading').hidden = false;
  $('loading-title').textContent = t('voice.working');
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice_text: utterance }),
      signal: AbortSignal.timeout(45000),
    });
    $('loading').hidden = true;
    if (!res.ok) {
      status.textContent = '';
      status.hidden = true;
      runQuery(utterance);
      return;
    }
    const data = await res.json();
    const q = data.brand_query || utterance;
    status.textContent = q;
    runQuery(q);
  } catch {
    $('loading').hidden = true;
    status.hidden = true;
    runQuery(utterance);
  }
}

function startVoiceSearch() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    showError('err.voice');
    return;
  }
  showSearch();
  const rec = new SR();
  rec.lang = getLang() === 'hi' ? 'hi-IN' : 'en-IN';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  const btn = $('voice-btn');
  const status = $('voice-status');
  status.hidden = false;
  status.textContent = t('voice.listening');
  btn.classList.add('is-listening');
  rec.onresult = (e) => {
    const said = e.results?.[0]?.[0]?.transcript?.trim();
    btn.classList.remove('is-listening');
    if (!said) {
      status.hidden = true;
      return;
    }
    $('search-input').value = said;
    $('search-clear').hidden = false;
    normaliseVoiceText(said);
  };
  rec.onerror = () => {
    btn.classList.remove('is-listening');
    status.hidden = true;
    showError('err.voice');
  };
  rec.onend = () => btn.classList.remove('is-listening');
  rec.start();
}

function confirmLookup() {
  const brandName = $('confirm-brand').value.trim();
  const salts = $('confirm-salt').value
    .split(/[,+/]| and /i)
    .map((s) => s.trim())
    .filter(Boolean);
  const strength = $('confirm-strength').value.trim();
  const mrpRaw = $('confirm-mrp').value;
  const stripMrp = mrpRaw === '' ? null : Number(mrpRaw);

  let match = null;
  if (salts.length && strength) match = matcher.bySalt(salts, strength);
  if (!match?.generic && brandName) match = matcher.search(brandName);
  if (!match?.generic) {
    showNoMatch();
    return;
  }
  showResult(match, { stripMrp, approx: stripMrp == null });
}

async function init() {
  applyI18n();
  setOffline(!navigator.onLine);
  window.addEventListener('online', () => setOffline(false));
  window.addEventListener('offline', () => setOffline(true));

  const [ja, br] = await Promise.all([
    fetch('data/jan_aushadhi.json').then((r) => r.json()),
    fetch('data/brands.json').then((r) => r.json()),
  ]);
  matcher = createMatcher(ja, br, globalThis.Fuse);

  $('lang-en').addEventListener('click', () => {
    setLang('en');
    applyI18n();
  });
  $('lang-hi').addEventListener('click', () => {
    setLang('hi');
    applyI18n();
  });

  const openType = () => showSearch();
  const openPhoto = () => {
    showPhoto();
    $('photo-input').click();
  };
  $('cta-type').addEventListener('click', openType);
  $('sticky-type').addEventListener('click', openType);
  $('error-type').addEventListener('click', openType);
  $('cta-photo').addEventListener('click', openPhoto);
  $('sticky-photo').addEventListener('click', openPhoto);
  $('photo-pick').addEventListener('click', () => $('photo-input').click());

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => runQuery(chip.getAttribute('data-q')));
  });

  const input = $('search-input');
  input.addEventListener('input', () => {
    const q = input.value;
    $('search-clear').hidden = !q;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => renderSuggestions(q), 120);
  });
  input.addEventListener('keydown', (e) => {
    const list = $('suggestions');
    if (list.hidden || !lastHits.length) {
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        runQuery(input.value.trim());
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, lastHits.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectHit(lastHits[activeIndex]);
      return;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runQuery(input.value.trim());
      return;
    } else if (e.key === 'Escape') {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      return;
    } else return;
    [...list.querySelectorAll('button')].forEach((btn, i) => {
      btn.setAttribute('aria-selected', String(i === activeIndex));
    });
  });

  $('search-clear').addEventListener('click', () => {
    input.value = '';
    $('search-clear').hidden = true;
    renderSuggestions('');
    hideResults();
    input.focus();
  });

  $('photo-input').addEventListener('change', () => {
    const file = $('photo-input').files?.[0];
    if (file) readStrip(file);
    $('photo-input').value = '';
  });

  $('confirm-go').addEventListener('click', confirmLookup);
  $('confirm-retake').addEventListener('click', openPhoto);
  $('nomatch-retry').addEventListener('click', () => {
    hideResults();
    showSearch();
  });
  $('another').addEventListener('click', () => {
    hideResults();
    input.value = '';
    showSearch();
  });
  $('speak-btn')?.addEventListener('click', speakResult);
  $('voice-btn')?.addEventListener('click', startVoiceSearch);
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
}

init().catch(() => showError('err.generic'));
