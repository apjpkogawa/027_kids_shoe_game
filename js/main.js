import { loadState, saveState, resetState, todayString } from './storage.js';
import { PROFILE_ICONS } from './art/items.js';
import { UI_ICONS } from './art/chars.js';
import { SHOE_SETS } from './art/shoes.js';
import { startGame } from './game.js';
import { renderCollection } from './collection.js';

const LONG_PRESS_MS = 2000;

const app = {
  state: loadState(localStorage, todayString()),
  profile: null,
  save() { saveState(localStorage, this.state); },
  show(id) {
    document.querySelectorAll('.screen').forEach((s) => { s.hidden = s.id !== id; });
  },
};

function setupProfileScreen() {
  document.querySelectorAll('.profile-btn').forEach((btn) => {
    btn.innerHTML = PROFILE_ICONS[btn.dataset.profile];
    btn.addEventListener('click', () => {
      app.profile = btn.dataset.profile;
      startGame(app);
    });
  });

  // Hidden parent settings: hold the gear for LONG_PRESS_MS.
  const gear = document.getElementById('gear');
  let timer = null;
  gear.addEventListener('pointerdown', () => {
    timer = setTimeout(openSettings, LONG_PRESS_MS);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) =>
    gear.addEventListener(ev, () => clearTimeout(timer)));
}

function openSettings() {
  const limit = document.getElementById('daily-limit');
  const select = document.getElementById('shoe-set');
  limit.value = app.state.settings.dailyLimit;
  select.innerHTML = Object.entries(SHOE_SETS)
    .map(([id, set]) => `<option value="${id}">${set.label}</option>`).join('');
  select.value = app.state.settings.shoeSet in SHOE_SETS ? app.state.settings.shoeSet : 'default';
  app.show('screen-settings');
}

function setupSettingsScreen() {
  document.getElementById('btn-settings-close').addEventListener('click', () => {
    const limit = parseInt(document.getElementById('daily-limit').value, 10);
    if (Number.isInteger(limit) && limit >= 1 && limit <= 50) {
      app.state.settings.dailyLimit = limit;
    }
    app.state.settings.shoeSet = document.getElementById('shoe-set').value;
    app.save();
    app.show('screen-profile');
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('データを全部消しますか？')) return;
    resetState(localStorage);
    app.state = loadState(localStorage, todayString());
    app.show('screen-profile');
  });
}

function setupNavButtons() {
  document.getElementById('btn-home').innerHTML = UI_ICONS.home;
  document.getElementById('btn-collection').innerHTML = UI_ICONS.book;
  document.getElementById('btn-back').innerHTML = UI_ICONS.back;

  document.getElementById('btn-home').addEventListener('click', () => app.show('screen-profile'));
  document.getElementById('btn-collection').addEventListener('click', () => renderCollection(app));
  document.getElementById('btn-back').addEventListener('click', () => startGame(app));
}

setupProfileScreen();
setupSettingsScreen();
setupNavButtons();
app.show('screen-profile');
