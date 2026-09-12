// Parametric bug: body color, spot color, wing shape.
function bugSvg({ body, spots, wings }) {
  const wingPath = wings === 'round'
    ? '<ellipse cx="50" cy="58" rx="30" ry="34"/>'
    : '<path d="M50 24 C80 24 84 70 50 92 C16 70 20 24 50 24 Z"/>';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="${body}" stroke="#222" stroke-width="3">${wingPath}</g>
  <circle cx="50" cy="22" r="12" fill="#222"/>
  <path d="M42 12 L34 2 M58 12 L66 2" stroke="#222" stroke-width="3" stroke-linecap="round"/>
  <line x1="50" y1="30" x2="50" y2="90" stroke="#222" stroke-width="3"/>
  <g fill="${spots}">
    <circle cx="36" cy="48" r="6"/><circle cx="64" cy="48" r="6"/>
    <circle cx="32" cy="68" r="6"/><circle cx="68" cy="68" r="6"/>
    <circle cx="44" cy="82" r="5"/><circle cx="56" cy="82" r="5"/>
  </g>
</svg>`;
}

// Parametric dress: color, skirt shape, accent color for ribbon/collar.
function dressSvg({ color, accent, skirt }) {
  const skirtPath = skirt === 'flare'
    ? '<path d="M32 44 L68 44 L88 94 L12 94 Z"/>'
    : '<path d="M32 44 L68 44 L72 94 L28 94 Z"/>';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="${color}" stroke="#222" stroke-width="3">
    <path d="M32 8 L44 16 L56 16 L68 8 L68 44 L32 44 Z"/>
    ${skirtPath}
  </g>
  <path d="M44 16 L56 16 L50 26 Z" fill="${accent}"/>
  <circle cx="50" cy="44" r="6" fill="${accent}"/>
  <path d="M40 60 Q50 66 60 60" stroke="${accent}" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
}

const BUGS = [
  ['ladybug',   { body: '#e53935', spots: '#222',    wings: 'round' }],
  ['beetle',    { body: '#3e2723', spots: '#3e2723', wings: 'long' }],
  ['stag',      { body: '#212121', spots: '#212121', wings: 'long' }],
  ['bee',       { body: '#fdd835', spots: '#222',    wings: 'round' }],
  ['butterfly', { body: '#ab47bc', spots: '#ffeb3b', wings: 'round' }],
  ['dragonfly', { body: '#26c6da', spots: '#fff',    wings: 'long' }],
  ['grass',     { body: '#66bb6a', spots: '#2e7d32', wings: 'long' }],
  ['cicada',    { body: '#8d6e63', spots: '#d7ccc8', wings: 'long' }],
  ['firefly',   { body: '#455a64', spots: '#ffee58', wings: 'round' }],
  ['rhino',     { body: '#5d4037', spots: '#5d4037', wings: 'long' }],
];

const DRESSES = [
  ['pink',     { color: '#f48fb1', accent: '#fff',    skirt: 'flare' }],
  ['sky',      { color: '#81d4fa', accent: '#fff',    skirt: 'straight' }],
  ['lemon',    { color: '#fff176', accent: '#f57f17', skirt: 'flare' }],
  ['mint',     { color: '#a5d6a7', accent: '#fff',    skirt: 'straight' }],
  ['lavender', { color: '#ce93d8', accent: '#fff',    skirt: 'flare' }],
  ['peach',    { color: '#ffab91', accent: '#fff',    skirt: 'straight' }],
  ['ruby',     { color: '#e53935', accent: '#ffd54f', skirt: 'flare' }],
  ['navy',     { color: '#3949ab', accent: '#fff',    skirt: 'straight' }],
  ['gold',     { color: '#ffca28', accent: '#fff',    skirt: 'flare' }],
  ['rainbow',  { color: '#4dd0e1', accent: '#f06292', skirt: 'flare' }],
];

export const ITEMS = {
  bug: BUGS.map(([id, p]) => ({ id, svg: bugSvg(p) })),
  dress: DRESSES.map(([id, p]) => ({ id, svg: dressSvg(p) })),
};

export const PROFILE_ICONS = {
  bug: ITEMS.bug[0].svg,
  dress: ITEMS.dress[0].svg,
};
