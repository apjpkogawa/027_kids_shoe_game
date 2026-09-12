// Shoe as the child sees their own feet: toe points UP (away), heel opening
// at the bottom. The LEFT shoe is drawn (outer edge on the left, inner/big-toe
// edge on the right); the right shoe is its mirror.
//
// The velcro strap is the left/right cue. It is sewn on the inner side, runs
// across the instep through a D-ring on the OUTER side, and its loose tab
// hangs outward. Two strap states live in the SVG and CSS shows one:
//   .strap-tab    open tab hanging outward (rotates around the D-ring)
//   .strap-closed tab folded flat over the strap
const VIEW_W = 160;
const VIEW_H = 170;
export const SHOE_VIEWBOX = { w: VIEW_W, h: VIEW_H };
// D-ring pivot of the open tab (left-shoe coordinates).
export const STRAP_PIVOT = { x: 46, y: 80 };

const OUTLINE = 'M82 10 C104 10 122 26 124 52 C125 72 116 84 114 100 C112 122 118 140 108 154 C100 166 66 166 58 154 C48 140 46 120 46 100 C46 76 40 56 46 38 C52 20 66 10 82 10 Z';
const UPPER_T = 'transform="translate(82 88) scale(0.92) translate(-82 -88)"';

function shoeSvg({ id, body, toe, sole, strap, stripe, tab, box, mesh, mirror }) {
  const transform = mirror ? `transform="translate(${VIEW_W} 0) scale(-1 1)"` : '';
  const meshId = `mesh-${id}`;
  const meshFill = mesh
    ? `<defs><pattern id="${meshId}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="${mesh}"/></pattern></defs>
       <path d="${OUTLINE}" ${UPPER_T} fill="url(#${meshId})"/>`
    : '';
  const stripes = stripe
    ? `<path d="M50 76 H116 M50 84 H116" stroke="${stripe}" stroke-width="2" stroke-linecap="round" opacity="0.9"/>`
    : '';
  const lightBox = box
    ? `<rect x="54" y="68" width="18" height="24" rx="5" fill="${box}" stroke="#fff" stroke-width="2"/>
       <rect x="58" y="72" width="10" height="16" rx="3" fill="#fff" opacity="0.5"/>`
    : '';
  const hook = `<pattern id="hook-${id}" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.7" fill="#000" opacity="0.25"/></pattern>`;
  return `<svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>${hook}</defs>
  <g ${transform}>
    <!-- sole with rim -->
    <path d="${OUTLINE}" fill="${sole}"/>
    <path d="${OUTLINE}" fill="none" stroke="#fff" stroke-width="2" opacity="0.7" transform="translate(82 88) scale(0.97) translate(-82 -88)"/>
    <!-- upper -->
    <path d="${OUTLINE}" ${UPPER_T} fill="${body}"/>
    ${meshFill}
    <!-- toe cap -->
    <path d="M82 10 C104 10 122 26 124 52 C104 66 62 66 45 50 C48 32 62 10 82 10 Z" ${UPPER_T} fill="${toe}"/>
    <path d="M45 50 C62 66 104 66 124 52" ${UPPER_T} fill="none" stroke="#000" stroke-width="1.5" opacity="0.15"/>
    <!-- heel opening -->
    <path d="M60 106 C70 98 96 98 104 106 C109 124 106 142 98 152 C88 158 76 158 66 152 C58 142 55 124 60 106 Z" fill="#fff" opacity="0.85"/>
    <path d="M65 110 C72 104 92 104 99 110 C103 124 101 138 95 146 C87 151 77 151 69 146 C63 138 61 124 65 110 Z" fill="#d9d4cc"/>
    <!-- strap body across the instep -->
    <path d="M50 68 H118 Q122 68 122 72 V88 Q122 92 118 92 H50 Z" fill="${strap}"/>
    <path d="M54 71 H116 M54 89 H116" stroke="#000" stroke-width="1" stroke-dasharray="2 2" opacity="0.25"/>
    ${stripes}
    ${lightBox}
    <!-- D-ring on the OUTER side -->
    <rect x="41" y="66" width="11" height="28" rx="4" fill="none" stroke="#fff" stroke-width="3.5"/>
    <rect x="41" y="66" width="11" height="28" rx="4" fill="none" stroke="#000" stroke-width="1" opacity="0.2"/>
    <!-- OPEN tab: hangs outward from the D-ring, hook side up -->
    <g class="strap-tab" style="transform-origin: ${STRAP_PIVOT.x}px ${STRAP_PIVOT.y}px">
      <path d="M46 69 H14 Q6 69 6 77 V83 Q6 91 14 91 H46 Z" fill="${tab}"/>
      <path d="M46 69 H14 Q6 69 6 77 V83 Q6 91 14 91 H46 Z" fill="url(#hook-${id})"/>
      <path d="M44 72 H16 M44 88 H16" stroke="#000" stroke-width="1" stroke-dasharray="2 2" opacity="0.3"/>
      <path d="M46 68 V92" stroke="#000" stroke-width="2" opacity="0.25"/>
    </g>
    <!-- CLOSED tab: folded flat over the strap -->
    <g class="strap-closed">
      <path d="M46 68 H84 Q90 68 90 74 V86 Q90 92 84 92 H46 Z" fill="${tab}"/>
      <path d="M50 71 H84 M50 89 H84" stroke="#000" stroke-width="1" stroke-dasharray="2 2" opacity="0.3"/>
      <path d="M46 66 V94" stroke="#fff" stroke-width="3" opacity="0.8"/>
    </g>
  </g>
</svg>`;
}

function shoeSet(id, label, colors) {
  return {
    label,
    left: shoeSvg({ ...colors, id: `${id}-l`, mirror: false }),
    right: shoeSvg({ ...colors, id: `${id}-r`, mirror: true }),
  };
}

export const SHOE_SETS = {
  'green-mesh': shoeSet('green-mesh', 'みどり うわばき', {
    body: '#f7f6f1', mesh: '#d6d3c6', toe: '#1d8f3f', sole: '#e6e6df', strap: '#f7f6f1', stripe: '#1d8f3f', tab: '#f7f6f1',
  }),
  'yellow-mesh': shoeSet('yellow-mesh', 'きいろ うわばき', {
    body: '#f7f6f1', mesh: '#d6d3c6', toe: '#f3c518', sole: '#e6e6df', strap: '#f7f6f1', stripe: '#f0d660', tab: '#f7f6f1',
  }),
  'nb-sage': shoeSet('nb-sage', 'ベージュ スニーカー', {
    body: '#93aa9c', toe: '#dccaa2', sole: '#e3dccb', strap: '#fbfbf8', stripe: '#93aa9c', tab: '#fbfbf8',
  }),
  'nb-pink': shoeSet('nb-pink', 'ピンク スニーカー', {
    body: '#bfe1f1', toe: '#f5cacf', sole: '#ececec', strap: '#fbfbf8', stripe: '#3fbfb0', tab: '#fbfbf8',
  }),
  'anpan-blue': shoeSet('anpan-blue', 'あお ひかるくつ', {
    body: '#2f62d8', mesh: '#5c88e6', toe: '#2f62d8', sole: '#f2f2f2', strap: '#2f62d8', stripe: '#c9e84c', tab: '#2f62d8', box: '#f6dca6',
  }),
  'anpan-pink': shoeSet('anpan-pink', 'ピンク ひかるくつ', {
    body: '#f4b6d0', mesh: '#ead9b6', toe: '#f4b6d0', sole: '#f4ebe3', strap: '#f4b6d0', stripe: '#fff', tab: '#f4b6d0', box: '#f6dca6',
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
