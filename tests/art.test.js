import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHOE_SETS, PROFILE_SHOES, pickShoeSet } from '../js/art/shoes.js';
import { ITEMS, PROFILE_ICONS } from '../js/art/items.js';
import { CHARS, UI_ICONS } from '../js/art/chars.js';

const isSvg = (s) => typeof s === 'string' && s.trim().startsWith('<svg') && s.trim().endsWith('</svg>');

test('every shoe set has distinct left and right svg', () => {
  for (const [id, set] of Object.entries(SHOE_SETS)) {
    assert.ok(isSvg(set.left), id);
    assert.ok(isSvg(set.right), id);
    assert.notEqual(set.left, set.right, id);
  }
});

test('each profile lists only existing shoe sets', () => {
  for (const profile of ['bug', 'dress']) {
    assert.ok(PROFILE_SHOES[profile].length >= 1);
    PROFILE_SHOES[profile].forEach((id) => assert.ok(SHOE_SETS[id], id));
  }
});

test('pickShoeSet uses the chosen set or a random one from the profile', () => {
  assert.equal(pickShoeSet('bug', 'yellow-mesh'), SHOE_SETS['yellow-mesh']);
  assert.equal(pickShoeSet('bug', 'all', () => 0), SHOE_SETS[PROFILE_SHOES.bug[0]]);
  assert.equal(pickShoeSet('bug', 'anpan-pink', () => 0.99), SHOE_SETS[PROFILE_SHOES.bug.at(-1)]);
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
