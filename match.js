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
    if (top.kind === 'generic') return { generic: top.g, alternatives: hits.slice(1) };
    const generic = byKey.get(key(top.b.salts, top.b.strength));
    return generic ? { brand: top.b, generic, alternatives: hits.slice(1) } : null;
  };

  return { search, bySalt };
}

export const savings = (branded, generic) => {
  const amt = Math.max(0, branded - generic);
  return { amount: +amt.toFixed(2), pct: branded ? Math.round((amt / branded) * 100) : 0 };
};
