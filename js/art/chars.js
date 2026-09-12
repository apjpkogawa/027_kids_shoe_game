// Character seen from BEHIND, so the child sees the same orientation as
// their own feet (left foot on the left, toes pointing away). Reactions are
// shown above the head; CSS shows exactly one "face" group at a time.
function charSvg({ top, bottom, hair, skin }) {
  return `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
  <g class="face face-normal"></g>
  <g class="face face-happy">
    <path d="M24 26 L28 14 L32 26 Z" fill="#ffb300"/>
    <path d="M88 26 L92 14 L96 26 Z" fill="#ffb300"/>
    <circle cx="16" cy="36" r="3" fill="#ff7043"/>
    <circle cx="104" cy="36" r="3" fill="#ff7043"/>
    <text x="48" y="22" font-size="20" font-weight="700" fill="#ff5252" font-family="system-ui, sans-serif">♪</text>
  </g>
  <g class="face face-confused">
    <text x="50" y="24" font-size="28" font-weight="700" fill="#1e63d6" font-family="system-ui, sans-serif">?</text>
  </g>
  <g class="face face-sleep">
    <text x="72" y="22" font-size="14" fill="#6b7280" font-family="system-ui, sans-serif">z z</text>
  </g>
  <!-- head, back view -->
  <circle cx="60" cy="54" r="26" fill="${skin}"/>
  <path d="M34 56 C32 30 46 24 60 24 C74 24 88 30 86 56 C84 44 74 40 60 40 C46 40 36 44 34 56 Z" fill="${hair}"/>
  <path d="M34 56 C34 40 44 36 60 36 C76 36 86 40 86 56 C86 66 80 74 60 74 C40 74 34 66 34 56 Z" fill="${hair}"/>
  <ellipse cx="34" cy="58" rx="4" ry="6" fill="${skin}"/>
  <ellipse cx="86" cy="58" rx="4" ry="6" fill="${skin}"/>
  <rect x="53" y="76" width="14" height="10" rx="4" fill="${skin}"/>
  <!-- torso -->
  <path d="M32 90 Q60 82 88 90 L92 134 Q60 140 28 134 Z" fill="${top}"/>
  <path d="M32 90 L18 96 L14 118 L26 122 Z" fill="${top}"/>
  <path d="M88 90 L102 96 L106 118 L94 122 Z" fill="${top}"/>
  <path d="M18 120 Q14 138 18 146" stroke="${skin}" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M102 120 Q106 138 102 146" stroke="${skin}" stroke-width="10" stroke-linecap="round" fill="none"/>
  <!-- bottom -->
  <path d="M28 132 Q60 138 92 132 L94 158 Q60 164 26 158 Z" fill="${bottom}"/>
  <!-- legs -->
  <rect x="34" y="154" width="20" height="46" rx="10" fill="${skin}"/>
  <rect x="66" y="154" width="20" height="46" rx="10" fill="${skin}"/>
  <rect x="34" y="184" width="20" height="16" rx="8" fill="#fff"/>
  <rect x="66" y="184" width="20" height="16" rx="8" fill="#fff"/>
</svg>`;
}

export const CHARS = {
  bug: charSvg({ top: '#4caf50', bottom: '#2d3f8a', hair: '#3b2418', skin: '#ffd9b3' }),
  dress: charSvg({ top: '#f27ba6', bottom: '#f27ba6', hair: '#5a3a24', skin: '#ffd9b3' }),
};

// Bare foot / sock outline used as the drop target. Left foot drawn, right mirrored.
function footSvg(mirror) {
  const t = mirror ? 'transform="translate(100 0) scale(-1 1)"' : '';
  return `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
  <g ${t}>
    <path d="M52 8 C68 8 80 20 80 40 C80 56 74 66 72 80 C70 96 76 108 68 118 C62 126 42 126 36 118 C28 108 32 96 30 80 C28 66 20 56 22 40 C24 20 36 8 52 8 Z" fill="#ffd9b3" stroke="#e8b98d" stroke-width="3" stroke-dasharray="6 5"/>
  </g>
</svg>`;
}

export const FEET = { left: footSvg(false), right: footSvg(true) };

export const UI_ICONS = {
  home: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 11.5 L12 4.5 L20 11.5 V19.5 A1 1 0 0 1 19 20.5 H14.5 V15 H9.5 V20.5 H5 A1 1 0 0 1 4 19.5 Z" fill="currentColor"/></svg>`,
  book: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 4 A1 1 0 0 1 5.5 3 H10.5 A1.5 1.5 0 0 1 12 4.5 A1.5 1.5 0 0 1 13.5 3 H18.5 A1 1 0 0 1 19.5 4 V19 A1 1 0 0 1 18.5 20 H13.5 A1.5 1.5 0 0 0 12 21.5 A1.5 1.5 0 0 0 10.5 20 H5.5 A1 1 0 0 1 4.5 19 Z" fill="currentColor"/><path d="M12 4.5 V21.5" stroke="#fff" stroke-width="1.5"/></svg>`,
  back: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 5 L7.5 12 L14.5 19" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10" width="14" height="11" rx="3" fill="currentColor"/><path d="M8 10 V7.5 A4 4 0 0 1 16 7.5 V10" stroke="currentColor" stroke-width="2.5" fill="none"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 8.5 A3.5 3.5 0 1 0 12 15.5 A3.5 3.5 0 1 0 12 8.5 Z M10.3 2.5 H13.7 L14.2 5.2 L16.4 6.4 L19 5.4 L20.7 8.4 L18.6 10.2 V13.8 L20.7 15.6 L19 18.6 L16.4 17.6 L14.2 18.8 L13.7 21.5 H10.3 L9.8 18.8 L7.6 17.6 L5 18.6 L3.3 15.6 L5.4 13.8 V10.2 L3.3 8.4 L5 5.4 L7.6 6.4 L9.8 5.2 Z" fill="currentColor" fill-rule="evenodd"/></svg>`,
};
