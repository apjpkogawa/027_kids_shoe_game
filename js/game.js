import { makeRound, isCorrect, isNewUnlock, unlockedCount, UNLOCK_EVERY, shouldGuide } from './logic.js';
import { pickShoeSet } from './art/shoes.js';
import { CHARS } from './art/chars.js';
import { ITEMS } from './art/items.js';
import { playPick, playCorrect, playWrong, playUnlock, playSleep } from './audio.js';

const CORRECT_DELAY_MS = 1500;
const WRONG_DELAY_MS = 1200;
const UNLOCK_SHOW_MS = 2500;
const SLEEP_SHOW_MS = 3000;

const FLOOR_POS = { left: { left: '12%', top: '62vh' }, right: { left: '70%', top: '62vh' } };

let misses = 0;

export function startGame(app) {
  app.show('screen-game');
  misses = 0;
  const char = document.getElementById('char');
  char.innerHTML = CHARS[app.profile];
  char.className = '';
  if (app.state.today.rounds >= app.state.settings.dailyLimit) {
    goToSleep(app);
    return;
  }
  newRound(app);
}

function newRound(app) {
  const stage = document.getElementById('stage');
  stage.querySelectorAll('.shoe').forEach((el) => el.remove());
  stage.querySelectorAll('.foot').forEach((el) => { el.classList.remove('worn'); delete el.dataset.shoe; });
  document.getElementById('char').className = '';

  const set = pickShoeSet(app.profile, app.state.profiles[app.profile].shoeSet);
  const { floor } = makeRound();
  floor.forEach((side, i) => {
    const slot = i === 0 ? 'left' : 'right';
    const el = document.createElement('div');
    el.className = 'shoe';
    el.dataset.side = side;
    el.dataset.slot = slot;
    el.innerHTML = side === 'L' ? set.left : set.right;
    placeOnFloor(el);
    makeDraggable(el, app);
    stage.appendChild(el);
  });
  renderProgress(app);
}

function placeOnFloor(el) {
  const pos = FLOOR_POS[el.dataset.slot];
  el.style.left = pos.left;
  el.style.top = pos.top;
  el.classList.remove('wrong-left', 'wrong-right');
}

function makeDraggable(el, app) {
  let offsetX = 0;
  let offsetY = 0;

  el.addEventListener('pointerdown', (e) => {
    if (el.dataset.worn) return;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    el.classList.add('dragging');
    playPick();
  });

  el.addEventListener('pointermove', (e) => {
    if (!el.classList.contains('dragging')) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
  });

  el.addEventListener('pointerup', (e) => {
    if (!el.classList.contains('dragging')) return;
    el.classList.remove('dragging');
    const foot = footUnder(e.clientX, e.clientY);
    if (foot && !foot.dataset.shoe) {
      wear(el, foot);
      checkRound(app);
    } else {
      placeOnFloor(el);
    }
  });

  el.addEventListener('pointercancel', () => {
    el.classList.remove('dragging');
    placeOnFloor(el);
  });
}

function footUnder(x, y) {
  return [...document.querySelectorAll('.foot')].find((foot) => {
    const r = foot.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }) || null;
}

function wear(shoe, foot) {
  const r = foot.getBoundingClientRect();
  const stage = document.getElementById('stage').getBoundingClientRect();
  shoe.style.left = `${r.left - stage.left - r.width * 0.08}px`;
  shoe.style.top = `${r.top - stage.top - r.height * 0.05}px`;
  shoe.dataset.worn = '1';
  foot.dataset.shoe = shoe.dataset.side;
  foot.classList.add('worn');
}

function checkRound(app) {
  const feet = document.querySelectorAll('.foot');
  const placement = {};
  feet.forEach((f) => { placement[`${f.dataset.foot}Foot`] = f.dataset.shoe; });
  if (!placement.leftFoot || !placement.rightFoot) return;

  if (isCorrect(placement)) {
    onCorrect(app);
  } else {
    onWrong(app);
  }
}

function onCorrect(app) {
  misses = 0;
  document.querySelectorAll('.shoe').forEach((s) => s.classList.remove('guide'));
  document.getElementById('char').className = 'happy';
  playCorrect();

  const profile = app.state.profiles[app.profile];
  const prev = profile.correct;
  profile.correct += 1;
  app.state.today.rounds += 1;
  app.save();
  renderProgress(app);

  let delay = CORRECT_DELAY_MS;
  if (isNewUnlock(prev, profile.correct)) {
    const item = ITEMS[app.profile][unlockedCount(profile.correct) - 1];
    if (item) {
      showOverlay(item.svg, UNLOCK_SHOW_MS);
      playUnlock();
      delay += UNLOCK_SHOW_MS;
    }
  }

  setTimeout(() => {
    if (app.state.today.rounds >= app.state.settings.dailyLimit) {
      goToSleep(app);
    } else {
      newRound(app);
    }
  }, delay);
}

function onWrong(app) {
  misses += 1;
  playWrong();
  document.getElementById('char').className = 'confused';
  // Show the swapped shoes toeing outward, then send them back to the floor.
  document.querySelectorAll('.foot').forEach((foot) => {
    const shoe = document.querySelector(`.shoe[data-side="${foot.dataset.shoe}"]`);
    shoe.classList.add(foot.dataset.foot === 'left' ? 'wrong-left' : 'wrong-right');
  });

  setTimeout(() => {
    document.getElementById('char').className = '';
    document.querySelectorAll('.foot').forEach((f) => { f.classList.remove('worn'); delete f.dataset.shoe; });
    document.querySelectorAll('.shoe').forEach((s) => { delete s.dataset.worn; placeOnFloor(s); });
    if (shouldGuide(misses)) {
      document.querySelectorAll('.shoe').forEach((s) => s.classList.add('guide'));
    }
  }, WRONG_DELAY_MS);
}

function goToSleep(app) {
  document.getElementById('char').className = 'sleep';
  playSleep();
  showOverlay(CHARS[app.profile], SLEEP_SHOW_MS);
  setTimeout(() => app.show('screen-profile'), SLEEP_SHOW_MS);
}

function showOverlay(svg, ms) {
  const overlay = document.getElementById('overlay');
  overlay.innerHTML = svg;
  overlay.hidden = false;
  setTimeout(() => { overlay.hidden = true; }, ms);
}

// Dots showing progress toward the next unlock.
function renderProgress(app) {
  const correct = app.state.profiles[app.profile].correct;
  const filled = correct % UNLOCK_EVERY;
  document.getElementById('progress').innerHTML =
    Array.from({ length: UNLOCK_EVERY }, (_, i) => `<span class="${i < filled ? 'on' : ''}"></span>`).join('');
}
