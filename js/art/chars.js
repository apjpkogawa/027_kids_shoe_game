// Character seen from BEHIND, so the child sees the same orientation as
// their own feet (left foot on the left, toes pointing away). Reactions are
// shown above the head; CSS shows exactly one "face" group at a time.
function charSvg({ shirt, hair }) {
  return `<svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
  <g class="face face-normal"></g>
  <g class="face face-happy">
    <path d="M22 18 L26 8 L30 18 Z M70 18 L74 8 L78 18 Z" fill="#ffb300"/>
    <text x="40" y="14" font-size="16" font-weight="bold" fill="#e53935">♪</text>
  </g>
  <g class="face face-confused">
    <text x="42" y="16" font-size="22" font-weight="bold" fill="#1565c0">?</text>
  </g>
  <g class="face face-sleep">
    <text x="60" y="16" font-size="14" fill="#555">z z</text>
  </g>
  <circle cx="50" cy="40" r="22" fill="#ffe0b2"/>
  <circle cx="50" cy="36" r="24" fill="${hair}"/>
  <path d="M28 66 L72 66 L78 120 L22 120 Z" fill="${shirt}"/>
  <path d="M28 66 L12 100 M72 66 L88 100" stroke="#ffe0b2" stroke-width="10" stroke-linecap="round"/>
  <rect x="30" y="118" width="16" height="52" rx="8" fill="#ffe0b2"/>
  <rect x="54" y="118" width="16" height="52" rx="8" fill="#ffe0b2"/>
</svg>`;
}

export const CHARS = {
  bug: charSvg({ shirt: '#66bb6a', hair: '#4e342e' }),
  dress: charSvg({ shirt: '#f48fb1', hair: '#6d4c41' }),
};

export const UI_ICONS = {
  home: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 11 L12 3 L21 11 V21 H14 V15 H10 V21 H3 Z" fill="#ff8a65"/></svg>`,
  book: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 3 H11 V21 H4 Z M13 3 H20 V21 H13 Z" fill="#42a5f5"/></svg>`,
  back: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15 4 L7 12 L15 20" stroke="#ff8a65" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};
