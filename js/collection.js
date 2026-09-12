import { ITEMS } from './art/items.js';
import { UI_ICONS } from './art/chars.js';
import { unlockedCount } from './logic.js';

export function renderCollection(app) {
  const count = unlockedCount(app.state.profiles[app.profile].correct);
  const grid = document.getElementById('collection-grid');
  grid.innerHTML = ITEMS[app.profile]
    .map((item, i) => (i < count
      ? `<div class="item unlocked">${item.svg}</div>`
      : `<div class="item locked">${item.svg}<span class="lock">${UI_ICONS.lock}</span></div>`))
    .join('');
  app.show('screen-collection');
}
