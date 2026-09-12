import { ITEMS } from './art/items.js';
import { unlockedCount } from './logic.js';

export function renderCollection(app) {
  const count = unlockedCount(app.state.profiles[app.profile].correct);
  const grid = document.getElementById('collection-grid');
  grid.innerHTML = ITEMS[app.profile]
    .map((item, i) => `<div class="item ${i < count ? 'unlocked' : 'locked'}">${item.svg}</div>`)
    .join('');
  app.show('screen-collection');
}
