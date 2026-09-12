// Shoe as the child sees their own feet: toe points UP (away), heel opening
// at the bottom. The LEFT shoe is drawn (outer edge on the left, inner/big-toe
// edge on the right); the right shoe is its mirror.
//
// The velcro strap is the left/right cue. It is sewn on the INNER side, and
// fastening means pulling it across the instep to the D-ring on the OUTER
// side and folding it back. Two strap states live in the SVG and CSS shows one:
//   .strap-tab    the whole loose strap, hinged at the inner anchor (open)
//   .strap-closed strap lying across the instep, folded back at the ring
export const SHOE_VIEWBOX = { x0: -20, y0: -20, w: 200, h: 190 };
// Inner-side hinge of the strap (left-shoe coordinates).
export const STRAP_PIVOT = { x: 120, y: 80 };
// Resting rotation of the open strap (degrees, 0 = lying closed across the instep).
export const STRAP_OPEN_DEG = 75;

const OUTLINE = 'M82 10 C104 10 122 26 124 52 C125 72 116 84 114 100 C112 122 118 140 108 154 C100 166 66 166 58 154 C48 140 46 120 46 100 C46 76 40 56 46 38 C52 20 66 10 82 10 Z';
const UPPER_T = 'transform="translate(82 88) scale(0.92) translate(-82 -88)"';

function shoeSvg({ id, body, toe, sole, strap, stripe, box, mesh, cutout, mirror }) {
  const transform = mirror ? 'transform="translate(160 0) scale(-1 1)"' : '';
  const meshId = `mesh-${id}`;
  const meshFill = mesh
    ? `<defs><pattern id="${meshId}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="${mesh}"/></pattern></defs>
       <path d="${OUTLINE}" ${UPPER_T} fill="url(#${meshId})"/>`
    : '';
  const stripeLine = (x1, x2) => (stripe
    ? `<path d="M${x1} 76 H${x2} M${x1} 84 H${x2}" stroke="${stripe}" stroke-width="2.2" stroke-linecap="round" opacity="0.95"/>`
    : '');
  const lightBox = box
    ? `<rect x="56" y="67" width="20" height="26" rx="5" fill="${box}" stroke="#fff" stroke-width="2"/>
       <rect x="60" y="71" width="12" height="18" rx="3" fill="#fff" opacity="0.5"/>`
    : '';
  const hook = `<pattern id="hook-${id}" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.7" fill="#000" opacity="0.28"/></pattern>`;
  // Mary-jane style uwabaki: one big cutout from toe cap to heel, nothing
  // under the strap. Sneakers: a tongue under the strap plus a heel opening.
  const opening = cutout
    ? `<path d="M52 62 C70 54 98 54 112 62 C118 92 114 128 100 152 C90 158 76 158 66 152 C50 128 46 92 52 62 Z" fill="#fff" opacity="0.92"/>
       <path d="M58 68 C72 62 96 62 106 68 C112 92 108 126 96 146 C88 151 78 151 70 146 C56 126 52 92 58 68 Z" fill="#d9d4cc"/>`
    : `<path d="M56 64 C70 58 96 58 110 64 C112 74 112 86 110 96 C96 102 70 102 56 96 C54 86 54 74 56 64 Z" fill="#000" opacity="0.12"/>
       <path d="M60 66 C72 61 94 61 106 66 C108 76 108 86 106 94 C94 99 72 99 60 94 C58 86 58 76 60 66 Z" fill="#fff" opacity="0.6"/>
       <path d="M60 106 C70 98 96 98 104 106 C109 124 106 142 98 152 C88 158 76 158 66 152 C58 142 55 124 60 106 Z" fill="#fff" opacity="0.85"/>
       <path d="M65 110 C72 104 92 104 99 110 C103 124 101 138 95 146 C87 151 77 151 69 146 C63 138 61 124 65 110 Z" fill="#d9d4cc"/>`;
  const stitch = (x1, x2) => `<path d="M${x1} 71 H${x2} M${x1} 89 H${x2}" stroke="#000" stroke-width="1" stroke-dasharray="2 2" opacity="0.28"/>`;
  return `<svg viewBox="${SHOE_VIEWBOX.x0} ${SHOE_VIEWBOX.y0} ${SHOE_VIEWBOX.w} ${SHOE_VIEWBOX.h}" xmlns="http://www.w3.org/2000/svg">
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
    ${opening}
    <!-- D-ring on the OUTER side (always visible: this is the cue) -->
    <rect x="40" y="64" width="12" height="32" rx="4" fill="none" stroke="#fff" stroke-width="4"/>
    <rect x="40" y="64" width="12" height="32" rx="4" fill="none" stroke="#000" stroke-width="1.2" opacity="0.25"/>
    <!-- inner anchor stitching -->
    <path d="M118 66 V94" stroke="#000" stroke-width="2" opacity="0.25"/>
    <!-- OPEN strap: hinged at the inner anchor, standing up toward the toe -->
    <g class="strap-tab" style="transform-origin: ${STRAP_PIVOT.x}px ${STRAP_PIVOT.y}px">
      <!-- generous invisible hit area so small fingers can grab the strap -->
      <path d="M120 80 H30" stroke="transparent" stroke-width="56" stroke-linecap="round"/>
      <path d="M120 68 H36 Q26 68 26 78 V82 Q26 92 36 92 H120 Z" fill="${strap}"/>
      <path d="M62 68 H36 Q26 68 26 78 V82 Q26 92 36 92 H62 Z" fill="url(#hook-${id})"/>
      ${stitch(30, 118)}
      ${stripeLine(64, 118)}
      ${lightBox}
    </g>
    <!-- CLOSED strap: across the instep, through the ring, folded back on top -->
    <g class="strap-closed">
      <path d="M120 68 H46 V92 H120 Z" fill="${strap}"/>
      ${stitch(50, 118)}
      ${stripeLine(50, 118)}
      ${lightBox}
      <path d="M46 66 H78 Q84 66 84 72 V88 Q84 94 78 94 H46 Z" fill="${strap}"/>
      ${stitch(50, 80)}
      <path d="M46 64 V96" stroke="#fff" stroke-width="3" opacity="0.9"/>
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
    body: '#f7f6f1', mesh: '#d6d3c6', toe: '#1d8f3f', sole: '#e6e6df', strap: '#f7f6f1', stripe: '#1d8f3f', cutout: true,
  }),
  'yellow-mesh': shoeSet('yellow-mesh', 'きいろ うわばき', {
    body: '#f7f6f1', mesh: '#d6d3c6', toe: '#f3c518', sole: '#e6e6df', strap: '#f7f6f1', stripe: '#f0d660', cutout: true,
  }),
  'nb-sage': shoeSet('nb-sage', 'ベージュ スニーカー', {
    body: '#93aa9c', toe: '#dccaa2', sole: '#e3dccb', strap: '#fbfbf8', stripe: '#93aa9c',
  }),
  'nb-pink': shoeSet('nb-pink', 'ピンク スニーカー', {
    body: '#bfe1f1', toe: '#f5cacf', sole: '#ececec', strap: '#fbfbf8', stripe: '#3fbfb0',
  }),
  'anpan-blue': shoeSet('anpan-blue', 'あお ひかるくつ', {
    body: '#2f62d8', mesh: '#5c88e6', toe: '#2f62d8', sole: '#f2f2f2', strap: '#2f62d8', stripe: '#c9e84c', box: '#f6dca6',
  }),
  'anpan-pink': shoeSet('anpan-pink', 'ピンク ひかるくつ', {
    body: '#f4b6d0', mesh: '#ead9b6', toe: '#f4b6d0', sole: '#f4ebe3', strap: '#f4b6d0', stripe: '#fff', box: '#f6dca6',
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
