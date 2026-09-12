import { loadState, saveState, resetState, todayString } from './storage.js';
import { PROFILE_ICONS } from './art/items.js';
import { UI_ICONS } from './art/chars.js';
import { SHOE_SETS, PROFILE_SHOES } from './art/shoes.js';
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
  gear.innerHTML = UI_ICONS.gear;
  let timer = null;
  gear.addEventListener('pointerdown', () => {
    timer = setTimeout(openSettings, LONG_PRESS_MS);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) =>
    gear.addEventListener(ev, () => clearTimeout(timer)));
}

function openSettings() {
  document.getElementById('daily-limit').value = app.state.settings.dailyLimit;
  document.querySelectorAll('.shoe-set').forEach((select) => {
    const profile = select.dataset.profile;
    select.innerHTML = '<option value="all">ぜんぶ（ランダム）</option>' + PROFILE_SHOES[profile]
      .map((id) => `<option value="${id}">${SHOE_SETS[id].label}</option>`).join('');
    const current = app.state.profiles[profile].shoeSet;
    select.value = PROFILE_SHOES[profile].includes(current) ? current : 'all';
  });
  document.getElementById('settings').showModal();
}

function setupSettingsSheet() {
  const dialog = document.getElementById('settings');
  dialog.querySelector('form').addEventListener('submit', () => {
    const limit = parseInt(document.getElementById('daily-limit').value, 10);
    if (Number.isInteger(limit) && limit >= 1 && limit <= 50) {
      app.state.settings.dailyLimit = limit;
    }
    document.querySelectorAll('.shoe-set').forEach((select) => {
      app.state.profiles[select.dataset.profile].shoeSet = select.value;
    });
    app.save();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('データを全部消しますか？')) return;
    resetState(localStorage);
    app.state = loadState(localStorage, todayString());
    dialog.close();
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
setupSettingsSheet();
setupNavButtons();
app.show('screen-profile');
