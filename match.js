const ALIASES = {
  acetaminophen: 'paracetamol',
  pcm: 'paracetamol',
  para: 'paracetamol',
  crocin: 'paracetamol',
  dolo: 'paracetamol',
  calpol: 'paracetamol',
  metacin: 'paracetamol',
  pan: 'pantoprazole',
  pantop: 'pantoprazole',
  pantocid: 'pantoprazole',
  omez: 'omeprazole',
  telma: 'telmisartan',
  amlong: 'amlodipine',
  glycomet: 'metformin',
  glyciphage: 'metformin',
  azithral: 'azithromycin',
  azee: 'azithromycin',
  thyronorm: 'thyroxine',
  eltroxin: 'thyroxine',
  ecosprin: 'aspirin',
  disprin: 'aspirin',
  brufen: 'ibuprofen',
  voveran: 'diclofenac',
  meftal: 'mefenamic acid',
  taxim: 'cefixime',
  augmentin: 'amoxicillin',
};

export const normaliseSalt = (s) => {
  const k = String(s).toLowerCase().trim();
  return ALIASES[k] || k;
};

export function normaliseStrength(s = '') {
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, '')
    .split('+')
    .map((p) => {
      const g = p.match(/^([\d.]+)g$/);
      return g ? `${+g[1] * 1000}mg` : p;
    })
    .join('+');
}

const key = (salts, str) => salts.map(normaliseSalt).join('|') + '@' + normaliseStrength(str);

const clean = (q) =>
  String(q)
    .toLowerCase()
    .replace(/o(?=\d)|(?<=\d)o/g, '0')
    .replace(/[^a-z0-9]/g, '');

export function createMatcher(generics, brands, Fuse = globalThis.Fuse) {
  if (!Fuse) throw new Error('Fuse.js is required');
  const byKey = new Map(generics.map((g) => [key(g.salts, g.strength), g]));
  const rows = [
    ...brands.map((b) => ({
      kind: 'brand',
      b,
      k: [b.brand, ...(b.aliases || []), ...b.salts].map(clean),
    })),
    ...generics.map((g) => ({
      kind: 'generic',
      g,
      k: [g.generic_name, ...g.salts].map(clean),
    })),
  ];
  const fuse = new Fuse(rows, {
    keys: ['k'],
    threshold: 0.35,
    includeScore: true,
    ignoreLocation: true,
  });

  const bySalt = (salts, strength) => {
    const g = byKey.get(key(salts, strength));
    return g ? { generic: g } : null;
  };

  const saltOf = (q) => {
    const n = clean(q).replace(/\d+(\.\d+)?/g, '');
    if (!n) return null;
    if (ALIASES[n]) return ALIASES[n];
    const known = new Set(generics.flatMap((g) => g.salts.map(normaliseSalt)));
    if (known.has(n)) return n;
    return null;
  };

  const pickGeneric = (list, q) => {
    const nums = [...String(q).matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
    if (nums.length) {
      const hit = list.find((g) => nums.every((n) => normaliseStrength(g.strength).includes(n)));
      if (hit) return hit;
    }
    return list.find((g) => g.salts.length === 1) || list[0];
  };

  const brandFor = (generic) =>
    brands.find((b) => key(b.salts, b.strength) === key(generic.salts, generic.strength)) || null;

  const fromSalt = (q) => {
    const salt = saltOf(q);
    if (!salt) return null;
    const list = generics.filter((g) => g.salts.map(normaliseSalt).includes(salt));
    if (!list.length) return null;
    const generic = pickGeneric(list, q);
    const brand = brandFor(generic);
    return { generic, brand, alternatives: [], score: 0.02, via: 'salt' };
  };

  const search = (q, limit = 3) => {
    const needle = clean(q);
    const exactBrand = brands.find((b) =>
      [b.brand, ...(b.aliases || [])].some((name) => clean(name) === needle)
    );
    if (exactBrand) {
      const generic = byKey.get(key(exactBrand.salts, exactBrand.strength));
      if (generic) return { brand: exactBrand, generic, alternatives: [], score: 0 };
    }
    const hits = fuse.search(needle, { limit });
    const top = hits[0]?.item;
    const topScore = hits[0]?.score ?? 1;
    const related = (item) =>
      item.k.some(
        (k) => k === needle || k.startsWith(needle) || (needle.length >= 4 && k.includes(needle))
      );
    if (top?.kind === 'brand' && related(top)) {
      const generic = byKey.get(key(top.b.salts, top.b.strength));
      if (generic) return { brand: top.b, generic, alternatives: hits.slice(1), score: topScore };
    }
    const saltHit = fromSalt(q);
    if (saltHit) return saltHit;
    if (!top) return null;
    if (top.kind === 'generic') return { generic: top.g, alternatives: hits.slice(1), score: topScore };
    const generic = byKey.get(key(top.b.salts, top.b.strength));
    return generic ? { brand: top.b, generic, alternatives: hits.slice(1), score: topScore } : null;
  };

  const labelOf = (row) => (row.kind === 'brand' ? row.b.brand : row.g.generic_name);

  const suggest = (q, limit = 6) => {
    const needle = clean(q);
    if (!needle) return [];
    const scored = [];
    const seen = new Set();
    const push = (row, score) => {
      const label = labelOf(row);
      if (seen.has(label)) return;
      seen.add(label);
      scored.push({ item: row, label, score });
    };
    const salt = saltOf(q);
    const brandPrefix = brands.some((b) =>
      [b.brand, ...(b.aliases || [])].some((name) => clean(name).startsWith(needle))
    );
    if (salt && !brandPrefix) {
      for (const g of generics) {
        if (!g.salts.map(normaliseSalt).includes(salt)) continue;
        push({ kind: 'generic', g, k: [] }, g.salts.length === 1 ? 0.03 : 0.12);
      }
    }
    for (const row of rows) {
      const keys = row.k.filter(Boolean);
      if (keys.some((k) => k === needle)) push(row, 0);
      else if (keys.some((k) => k.startsWith(needle))) push(row, 0.05);
      else if (needle.length >= 3 && keys.some((k) => k.includes(needle))) push(row, 0.22);
    }
    if (scored.length < limit) {
      for (const hit of fuse.search(needle, { limit: limit + 6 })) {
        push(hit.item, 0.45 + (hit.score ?? 0));
      }
    }
    scored.sort((a, b) => a.score - b.score || a.label.length - b.label.length);
    return scored.slice(0, limit);
  };

  return { search, bySalt, suggest };
}

export const savings = (branded, generic) => {
  const amt = Math.max(0, branded - generic);
  return { amount: +amt.toFixed(2), pct: branded ? Math.round((amt / branded) * 100) : 0 };
};
