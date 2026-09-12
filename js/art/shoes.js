// Top-down shoe, toe up. Inner (arch) edge carries half a ladybug so a
// correctly paired L+R forms one whole bug.
function shoeSvg({ body, sole, mirror }) {
  const transform = mirror ? 'transform="translate(100 0) scale(-1 1)"' : '';
  return `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
  <g ${transform}>
    <path d="M30 12 C48 2 78 6 84 30 C90 55 88 95 82 125 C80 134 68 138 55 136 C40 134 22 134 18 120 C12 95 10 55 18 32 C21 22 24 16 30 12 Z" fill="${sole}"/>
    <path d="M32 18 C48 8 74 12 78 32 C84 55 82 92 77 120 C75 128 66 131 55 129 C42 128 27 128 24 116 C18 92 17 56 24 34 C26 26 28 21 32 18 Z" fill="${body}"/>
    <path d="M34 60 L66 60 M36 76 L64 76 M38 92 L62 92" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <path d="M30 40 C45 32 62 32 74 40" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>
    <!-- half ladybug on the inner edge (right side of the left shoe) -->
    <g transform="translate(80 84)">
      <path d="M0 -16 A16 16 0 0 1 0 16 Z" fill="#e53935"/>
      <path d="M0 -16 A16 16 0 0 1 0 16" stroke="#222" stroke-width="2" fill="none"/>
      <circle cx="7" cy="-6" r="3" fill="#222"/>
      <circle cx="9" cy="6" r="3" fill="#222"/>
      <path d="M0 -16 A6 6 0 0 1 0 -4 Z" fill="#222"/>
    </g>
  </g>
</svg>`;
}

const DEFAULT_COLORS = { body: '#42a5f5', sole: '#1e5fa8' };

export const SHOE_SETS = {
  default: {
    label: 'blue sneaker',
    left: shoeSvg({ ...DEFAULT_COLORS, mirror: false }),
    right: shoeSvg({ ...DEFAULT_COLORS, mirror: true }),
  },
};
