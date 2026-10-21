const ALIASES = { acetaminophen: 'paracetamol', pan: 'pantoprazole' };

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
    ...brands.map((b) => ({ kind: 'brand', b, k: [b.brand, ...(b.aliases || [])].map(clean) })),
    ...generics.map((g) => ({ kind: 'generic', g, k: [clean(g.generic_name)] })),
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

  const search = (q, limit = 3) => {
    const hits = fuse.search(clean(q), { limit });
    if (!hits.length) return null;
    const top = hits[0].item;
    if (top.kind === 'generic') return { generic: top.g, alternatives: hits.slice(1), score: hits[0].score };
    const generic = byKey.get(key(top.b.salts, top.b.strength));
    return generic ? { brand: top.b, generic, alternatives: hits.slice(1), score: hits[0].score } : null;
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
