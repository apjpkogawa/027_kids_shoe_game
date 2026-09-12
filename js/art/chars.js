// Character with four face groups; CSS shows exactly one at a time.
function charSvg({ shirt, hair }) {
  return `<svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="34" r="26" fill="${hair}"/>
  <circle cx="50" cy="40" r="22" fill="#ffe0b2"/>
  <g class="face face-normal">
    <circle cx="42" cy="38" r="3" fill="#222"/><circle cx="58" cy="38" r="3" fill="#222"/>
    <path d="M44 50 Q50 54 56 50" stroke="#222" stroke-width="2" fill="none"/>
  </g>
  <g class="face face-happy">
    <path d="M38 38 Q42 33 46 38 M54 38 Q58 33 62 38" stroke="#222" stroke-width="2" fill="none"/>
    <path d="M40 48 Q50 60 60 48 Z" fill="#e57373"/>
  </g>
  <g class="face face-confused">
    <circle cx="42" cy="38" r="3" fill="#222"/><circle cx="58" cy="38" r="3" fill="#222"/>
    <path d="M44 52 Q50 48 56 52" stroke="#222" stroke-width="2" fill="none"/>
    <text x="70" y="24" font-size="18" font-weight="bold" fill="#1565c0">?</text>
  </g>
  <g class="face face-sleep">
    <path d="M38 38 Q42 41 46 38 M54 38 Q58 41 62 38" stroke="#222" stroke-width="2" fill="none"/>
    <path d="M44 51 Q50 54 56 51" stroke="#222" stroke-width="2" fill="none"/>
    <text x="68" y="20" font-size="14" fill="#555">z z</text>
  </g>
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
