import { CONFIG } from './config.js';
import { createMatcher, savings } from './match.js';
import { getLang, setLang, t } from './i18n.js';
import { animate, stagger } from 'https://cdn.jsdelivr.net/npm/motion@12.23.12/+esm';
import { readHandwriting } from './ocr.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function motionIn(target, delay = 0) {
  if (reduceMotion || !target) return;
  animate(
    target,
    { opacity: [0, 1], y: [14, 0] },
    { duration: 0.55, delay, ease: [0.32, 0.72, 0, 1] }
  );
}

const $ = (id) => document.getElementById(id);

let matcher = null;
let debounceTimer = null;
let predictTimer = null;
let autoShowTimer = null;
let predictSeq = 0;
let activeIndex = -1;
let lastHits = [];

function setMascot(mood) {
  const el = $('mascot');
  if (el) el.dataset.mood = mood;
}

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

function paintSuggestions(items) {
  const list = $('suggestions');
  list.innerHTML = '';
  activeIndex = -1;
  lastHits = items.slice(0, 6);
  lastHits.forEach((hit, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = `sug-${i}`;
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = hit.guess ? t('search.guess', { name: hit.label }) : hit.label;
    if (hit.guess) btn.classList.add('guess');
    btn.addEventListener('click', () => selectHit(hit));
    li.appendChild(btn);
    list.appendChild(li);
  });
  list.hidden = lastHits.length === 0;
  $('search-input').setAttribute('aria-expanded', String(!list.hidden));
  list.setAttribute('aria-label', t('search.results.aria', { n: lastHits.length }));
  if (!list.hidden) motionIn([...list.querySelectorAll('button')], stagger(0.04));
}

function hitsFromQuery(query) {
  const ranked = matcher.suggest(query, 5);
  return ranked.map((row) => {
    const it = row.item;
    if (it.kind === 'brand') return { label: it.b.brand, payload: { brand: it.b, generic: null }, score: row.score };
    return { label: it.g.generic_name, payload: { generic: it.g }, score: row.score };
  });
}

function renderSuggestions(query) {
  const live = $('live-guess');
  if (!matcher || !query.trim()) {
    lastHits = [];
    $('suggestions').hidden = true;
    $('search-input').setAttribute('aria-expanded', 'false');
    if (live) live.hidden = true;
    setMascot('idle');
    return;
  }
  const items = hitsFromQuery(query);
  paintSuggestions(items);
  if (live) {
    if (items[0]) {
      live.hidden = false;
      live.textContent = t('search.live', { name: items[0].label });
    } else {
      live.hidden = true;
    }
  }
  schedulePredict(query.trim(), items.map((item) => item.label));
  clearTimeout(autoShowTimer);
  const top = items[0];
  if (top && query.trim().length >= 4 && (top.score ?? 1) <= 0.05) {
    autoShowTimer = setTimeout(() => {
      if ($('search-input').value.trim() !== query.trim()) return;
      selectHit(top);
    }, 700);
  }
}

function schedulePredict(query, candidates) {
  clearTimeout(predictTimer);
  if (!navigator.onLine || !CONFIG.API_URL || query.length < 3) return;
  const live = $('live-guess');
  if (live && candidates[0]) {
    live.hidden = false;
    live.textContent = t('search.checking');
  }
  predictTimer = setTimeout(() => askGemma(query, candidates), 420);
}

async function askGemma(query, candidates = []) {
  const seq = ++predictSeq;
  if ($('search-input').value.trim() !== query) return;
  setMascot('think');
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ predict: query, candidates }),
      signal: AbortSignal.timeout(8000),
    });
    if (seq !== predictSeq || $('search-input').value.trim() !== query) return;
    if (!res.ok) {
      setMascot('idle');
      return;
    }
    const data = await res.json();
    const guess = (data.brand_query || '').trim();
    const confirmed = guess ? matcher.search(guess) : null;
    if (!confirmed?.generic && !confirmed?.brand) {
      setMascot('idle');
      return;
    }
    const label = confirmed.brand?.brand || confirmed.generic.generic_name;
    const allowed = new Set(candidates.map((name) => name.toLowerCase()));
    if (candidates.length && !allowed.has(label.toLowerCase()) && !allowed.has(guess.toLowerCase())) {
      const liveBack = $('live-guess');
      if (liveBack && candidates[0]) liveBack.textContent = t('search.live', { name: candidates[0] });
      setMascot('idle');
      return;
    }
    const local = hitsFromQuery(query).filter((h) => h.label.toLowerCase() !== label.toLowerCase());
    paintSuggestions([{ label, payload: confirmed, guess: true }, ...local]);
    const live = $('live-guess');
    if (live) {
      live.hidden = false;
      live.textContent = t('search.checked', { name: label });
    }
    setMascot('happy');
  } catch {
    if (seq === predictSeq) setMascot('idle');
  }
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

const FORM_ICONS = {
  tablet:
    '<svg viewBox="0 0 32 32" width="28" height="28"><rect x="6" y="10" width="20" height="12" rx="6" fill="#fff7ed" stroke="#9a3412" stroke-width="2"/></svg>',
  capsule:
    '<svg viewBox="0 0 32 32" width="28" height="28"><rect x="4" y="12" width="24" height="8" rx="4" fill="#fff7ed" stroke="#9a3412" stroke-width="2"/><path d="M16 12v8" stroke="#9a3412" stroke-width="2"/></svg>',
  liquid:
    '<svg viewBox="0 0 32 32" width="28" height="28"><path d="M16 4c4 6 8 9 8 14a8 8 0 1 1-16 0c0-5 4-8 8-14z" fill="#fff7ed" stroke="#9a3412" stroke-width="2"/></svg>',
  powder:
    '<svg viewBox="0 0 32 32" width="28" height="28"><circle cx="10" cy="18" r="2" fill="#9a3412"/><circle cx="16" cy="12" r="2" fill="#9a3412"/><circle cx="22" cy="18" r="2" fill="#9a3412"/><circle cx="16" cy="22" r="2" fill="#9a3412"/></svg>',
  injection:
    '<svg viewBox="0 0 32 32" width="28" height="28"><rect x="12" y="6" width="8" height="16" rx="2" fill="#fff7ed" stroke="#9a3412" stroke-width="2"/><path d="M14 22h4l-2 4z" fill="#9a3412"/></svg>',
  inhaler:
    '<svg viewBox="0 0 32 32" width="28" height="28"><rect x="8" y="8" width="12" height="16" rx="3" fill="#fff7ed" stroke="#9a3412" stroke-width="2"/><path d="M20 14h6v6h-6" fill="none" stroke="#9a3412" stroke-width="2"/></svg>',
  cream:
    '<svg viewBox="0 0 32 32" width="28" height="28"><rect x="10" y="12" width="12" height="12" rx="2" fill="#fff7ed" stroke="#9a3412" stroke-width="2"/><path d="M13 12V8h6v4" fill="none" stroke="#9a3412" stroke-width="2"/></svg>',
};

function formIcon(form) {
  const f = String(form || '').toLowerCase();
  if (f === 'capsule') return FORM_ICONS.capsule;
  if (['syrup', 'solution', 'mouthwash'].includes(f)) return FORM_ICONS.liquid;
  if (f === 'powder') return FORM_ICONS.powder;
  if (f === 'injection') return FORM_ICONS.injection;
  if (f === 'inhaler') return FORM_ICONS.inhaler;
  if (['cream', 'ointment', 'gel'].includes(f)) return FORM_ICONS.cream;
  return FORM_ICONS.tablet;
}

let describeSeq = 0;

async function clarifyWithGemma(generic, fallback) {
  if (!navigator.onLine || !CONFIG.API_URL) return;
  const seq = ++describeSeq;
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        describe: {
          name: generic.generic_name,
          form: generic.form,
          salts: generic.salts.join(', '),
          strength: generic.strength,
          unit: generic.unit,
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok || seq !== describeSeq) return;
    const data = await res.json();
    const line = (data.line || '').trim();
    if (!line || /treat|cure|dose|pain|fever|infect|safe to|switch/i.test(line)) return;
    if ($('receipt').hidden) return;
    $('receipt-about').textContent = line;
  } catch {
    $('receipt-about').textContent = fallback;
  }
}

function showResult(match, { stripMrp = null, approx = true } = {}) {
  hideResults();
  const g = match.generic;
  const brand = match.brand;
  const brandedPrice = stripMrp != null && stripMrp !== '' ? Number(stripMrp) : brand?.approx_mrp ?? null;
  const useApprox = stripMrp == null || stripMrp === '';
  const hasBrandPrice = brandedPrice != null && !Number.isNaN(brandedPrice);
  const sav = hasBrandPrice ? savings(brandedPrice, g.mrp) : { amount: 0, pct: 0 };
  $('receipt-title').textContent = g.generic_name;
  $('receipt-branded').textContent = hasBrandPrice ? formatINR(brandedPrice) : '—';
  $('receipt-generic').textContent = formatINR(g.mrp);
  $('approx-tag').hidden = !useApprox || !hasBrandPrice;
  const band = document.querySelector('.save-band');
  if (band) band.hidden = !hasBrandPrice;
  const amountStr = formatINR(sav.amount);
  $('save-amount').textContent = amountStr;
  $('save-label').dataset.amount = amountStr;
  $('save-label').dataset.pct = String(sav.pct);
  refreshSaveLabel();
  $('receipt-same').textContent = brand
    ? t('result.sameAs', { brand: brand.brand })
    : `${g.salts.join(', ')} · ${g.strength}`;
  const formKey = `form.${String(g.form || 'tablet').toLowerCase()}`;
  const formName = t(formKey) === formKey ? g.form : t(formKey);
  $('form-icon').innerHTML = formIcon(g.form);
  $('form-label').textContent = formName;
  const about = t('result.about', {
    form: formName,
    salt: g.salts.join(' + '),
    strength: g.strength,
    unit: g.unit,
  });
  $('receipt-about').textContent = about;
  clarifyWithGemma(g, about);
  $('receipt-pack').textContent = t('result.pack', { unit: g.unit });
  $('receipt-code').textContent = t('result.code', { code: g.code });
  $('receipt-source').textContent = t('result.source', { date: CONFIG.DATA_SNAPSHOT });
  $('kendra-link').href = CONFIG.KENDRA_URL;
  $('sugam-link').href = CONFIG.SUGAM_URL;
  const official = $('store-official');
  if (official) official.href = CONFIG.KENDRA_URL;
  $('receipt').hidden = false;
  $('receipt').setAttribute('aria-label', t('a11y.resultReady'));
  setMascot('happy');
  motionIn($('receipt'));
  motionIn($('save-amount'), 0.08);
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
  setMascot('think');
  if ($('loading-title')) $('loading-title').textContent = t('photo.reading');
  let image;
  let ocrText = '';
  let previewUrl = '';
  try {
    image = await fileToJpegBase64(file);
    previewUrl = URL.createObjectURL(file);
    if ($('loading-title')) $('loading-title').textContent = t('photo.hand');
    ocrText = await Promise.race([
      readHandwriting(previewUrl),
      new Promise((_, reject) => setTimeout(() => reject(new Error('ocr-timeout')), 25000)),
    ]);
  } catch {
    if (!image) {
      showError('err.generic');
      return;
    }
  } finally {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
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
      body: JSON.stringify({ image, ocr_text: ocrText || '' }),
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
    const hand = $('confirm-hand');
    if (hand) {
      hand.hidden = !data.handwriting;
      if (data.ocr_text) hand.textContent = `${t('err.handwriting')} ${data.ocr_text}`;
    }
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
  setMascot('listen');
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
    debounceTimer = setTimeout(() => renderSuggestions(q), 40);
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
  $('store-official') && ($('store-official').href = CONFIG.KENDRA_URL);
  $('store-map')?.addEventListener('click', () => {
    const status = $('store-status');
    const list = $('store-list');
    if (!navigator.geolocation) {
      if (status) status.textContent = t('store.denied');
      return;
    }
    if (status) status.textContent = t('store.locating');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const url = `${CONFIG.STORES_URL}?lat=${pos.coords.latitude.toFixed(5)}&lng=${pos.coords.longitude.toFixed(5)}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(14000) });
          const data = await res.json();
          const shops = data.shops || [];
          if (!list) return;
          list.innerHTML = '';
          if (!shops.length) {
            list.hidden = true;
            if (status) status.textContent = t('store.empty');
            return;
          }
          shops.forEach((shop) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = shop.maps;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'store-row';
            const name = document.createElement('strong');
            name.textContent = shop.name;
            const meta = document.createElement('span');
            meta.textContent = `${t('store.km', { km: shop.km })} · ${shop.address}`;
            a.append(name, meta);
            a.setAttribute('aria-label', `${t('store.open')}: ${shop.name}`);
            li.appendChild(a);
            list.appendChild(li);
          });
          list.hidden = false;
          if (status) status.textContent = t('store.note');
          motionIn([...list.querySelectorAll('a')], stagger(0.05));
        } catch {
          if (status) status.textContent = t('store.empty');
        }
      },
      () => {
        if (status) status.textContent = t('store.denied');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  });
  $('speak-btn')?.addEventListener('click', speakResult);
  $('voice-btn')?.addEventListener('click', startVoiceSearch);
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
}

init().catch(() => showError('err.generic'));
