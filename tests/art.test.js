import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHOE_SETS } from '../js/art/shoes.js';
import { ITEMS, PROFILE_ICONS } from '../js/art/items.js';
import { CHARS, UI_ICONS } from '../js/art/chars.js';

const isSvg = (s) => typeof s === 'string' && s.trim().startsWith('<svg') && s.trim().endsWith('</svg>');

test('default shoe set has left and right svg', () => {
  assert.ok(SHOE_SETS.default);
  assert.ok(isSvg(SHOE_SETS.default.left));
  assert.ok(isSvg(SHOE_SETS.default.right));
  assert.notEqual(SHOE_SETS.default.left, SHOE_SETS.default.right);
});

test('each profile has 10 items with unique ids', () => {
  for (const profile of ['bug', 'dress']) {
    assert.equal(ITEMS[profile].length, 10);
    const ids = new Set(ITEMS[profile].map((i) => i.id));
    assert.equal(ids.size, 10);
    ITEMS[profile].forEach((i) => assert.ok(isSvg(i.svg), i.id));
  }
  assert.ok(isSvg(PROFILE_ICONS.bug));
  assert.ok(isSvg(PROFILE_ICONS.dress));
});

test('characters expose four face groups', () => {
  for (const profile of ['bug', 'dress']) {
    const svg = CHARS[profile];
    assert.ok(isSvg(svg));
    for (const face of ['face-normal', 'face-happy', 'face-confused', 'face-sleep']) {
      assert.ok(svg.includes(`class="face ${face}"`), `${profile} ${face}`);
    }
  }
  ['home', 'book', 'back'].forEach((k) => assert.ok(isSvg(UI_ICONS[k])));
});
