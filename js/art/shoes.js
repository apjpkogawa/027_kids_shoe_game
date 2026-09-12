// Top-down shoe, toe up. The left shoe is drawn; the right shoe is a mirror.
// Inner (arch) edge carries half a ladybug so a correctly paired L+R forms
// one whole bug. The velcro tab (and light box, if any) sits on the OUTER
// edge, matching the real shoes.
function shoeSvg({ body, toe, sole, strap, stripe, tab, box, mesh, mirror }) {
  const transform = mirror ? 'transform="translate(100 0) scale(-1 1)"' : '';
  const meshDots = mesh
    ? `<pattern id="mesh-${mesh.replace('#', '')}" width="6" height="6" patternUnits="userSpaceOnUse">
         <circle cx="3" cy="3" r="1.2" fill="${mesh}"/>
       </pattern>
       <path d="M32 18 C48 8 74 12 78 32 C84 55 82 92 77 120 C75 128 66 131 55 129 C42 128 27 128 24 116 C18 92 17 56 24 34 C26 26 28 21 32 18 Z" fill="url(#mesh-${mesh.replace('#', '')})"/>`
    : '';
  const stripes = stripe
    ? `<path d="M26 66 C45 60 62 60 78 66 M26 74 C45 68 62 68 78 74" stroke="${stripe}" stroke-width="2.5" fill="none"/>`
    : '';
  const lightBox = box
    ? `<rect x="6" y="60" width="14" height="18" rx="4" fill="${box}" stroke="#fff" stroke-width="2"/>`
    : '';
  return `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
  <g ${transform}>
    <path d="M30 12 C48 2 78 6 84 30 C90 55 88 95 82 125 C80 134 68 138 55 136 C40 134 22 134 18 120 C12 95 10 55 18 32 C21 22 24 16 30 12 Z" fill="${sole}"/>
    <path d="M32 18 C48 8 74 12 78 32 C84 55 82 92 77 120 C75 128 66 131 55 129 C42 128 27 128 24 116 C18 92 17 56 24 34 C26 26 28 21 32 18 Z" fill="${body}"/>
    ${meshDots}
    <!-- toe cap -->
    <path d="M32 18 C48 8 74 12 78 32 C79 36 80 40 80 44 C62 38 40 38 22 44 C22 40 23 36 24 34 C26 26 28 21 32 18 Z" fill="${toe}"/>
    <!-- heel collar / opening -->
    <path d="M34 96 C40 90 62 90 68 96 C70 106 68 118 62 124 C50 128 46 128 38 124 C32 118 30 106 34 96 Z" fill="#fff" opacity="0.9"/>
    <path d="M38 100 C44 96 58 96 64 100 C66 108 64 116 60 120 C50 123 46 123 40 120 C36 116 34 108 38 100 Z" fill="${body}" opacity="0.5"/>
    <!-- velcro strap with tab on the outer edge -->
    <path d="M22 58 L80 58 L80 80 L22 80 Z" fill="${strap}" stroke="#ccc" stroke-width="1"/>
    ${stripes}
    <rect x="10" y="60" width="14" height="18" rx="3" fill="${tab}" stroke="#bbb" stroke-width="1"/>
    ${lightBox}
    <!-- half ladybug on the inner edge -->
    <g transform="translate(80 108)">
      <path d="M0 -12 A12 12 0 0 1 0 12 Z" fill="#e53935"/>
      <path d="M0 -12 A12 12 0 0 1 0 12" stroke="#222" stroke-width="2" fill="none"/>
      <circle cx="5" cy="-4" r="2.5" fill="#222"/>
      <circle cx="7" cy="5" r="2.5" fill="#222"/>
      <path d="M0 -12 A5 5 0 0 1 0 -3 Z" fill="#222"/>
    </g>
  </g>
</svg>`;
}

function shoeSet(label, colors) {
  return {
    label,
    left: shoeSvg({ ...colors, mirror: false }),
    right: shoeSvg({ ...colors, mirror: true }),
  };
}

export const SHOE_SETS = {
  'green-mesh': shoeSet('みどり うわばき', {
    body: '#f6f5ee', mesh: '#d9d7c8', toe: '#1b8a3a', sole: '#e8e8e0', strap: '#f6f5ee', stripe: '#1b8a3a', tab: '#f6f5ee',
  }),
  'yellow-mesh': shoeSet('きいろ うわばき', {
    body: '#f6f5ee', mesh: '#d9d7c8', toe: '#f2c200', sole: '#e8e8e0', strap: '#f6f5ee', stripe: '#f2d75c', tab: '#f6f5ee',
  }),
  'nb-sage': shoeSet('ベージュ スニーカー', {
    body: '#8fa89a', toe: '#d9c9a3', sole: '#e0d8c8', strap: '#fff', stripe: '#8fa89a', tab: '#f2c56b',
  }),
  'nb-pink': shoeSet('ピンク スニーカー', {
    body: '#bfe0f0', toe: '#f4c9cc', sole: '#e8e8e8', strap: '#fff', stripe: '#3fbfb0', tab: '#f4c9cc',
  }),
  'anpan-blue': shoeSet('あお ひかるくつ', {
    body: '#2b5fd9', mesh: '#5a86e8', toe: '#2b5fd9', sole: '#f2f2f2', strap: '#2b5fd9', stripe: '#c8e64a', tab: '#2b5fd9', box: '#f3d9a0',
  }),
  'anpan-pink': shoeSet('ピンク ひかるくつ', {
    body: '#f3b3cf', mesh: '#e8d6b0', toe: '#f3b3cf', sole: '#f2e8e0', strap: '#f3b3cf', stripe: '#fff', tab: '#f3b3cf', box: '#f3d9a0',
  }),
};

// Which shoe sets belong to which child profile.
export const PROFILE_SHOES = {
  bug: ['anpan-blue', 'yellow-mesh', 'nb-sage'],
  dress: ['anpan-pink', 'green-mesh', 'nb-pink'],
};

// Pick the shoe set for a round: a fixed id, or a random one from the profile.
export function pickShoeSet(profile, setting, random = Math.random) {
  const ids = PROFILE_SHOES[profile];
  const id = setting in SHOE_SETS && ids.includes(setting)
    ? setting
    : ids[Math.floor(random() * ids.length)];
  return SHOE_SETS[id];
}
