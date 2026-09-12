import { makeRound, isCorrect, isNewUnlock, unlockedCount, UNLOCK_EVERY, shouldGuide } from './logic.js';
import { pickShoeSet, SHOE_VIEWBOX, STRAP_PIVOT, STRAP_OPEN_DEG } from './art/shoes.js';
import { CHARS, LEGS, FEET } from './art/chars.js';
import { ITEMS } from './art/items.js';
import { playPick, playCorrect, playWrong, playUnlock, playSleep, playVelcro } from './audio.js';

const CORRECT_DELAY_MS = 1500;
const WRONG_DELAY_MS = 1400;
const UNLOCK_SHOW_MS = 2600;
const SLEEP_SHOW_MS = 3000;
const SWAY_MAX_DEG = 38;
const SWAY_PER_PX = 0.9;
const CLOSE_ANGLE_DEG = 30;
const CONFETTI_COUNT = 28;

const FLOOR_POS = { left: { left: '10%', top: '6vh' }, right: { left: 'calc(90% - 32vh)', top: '6vh' } };

let misses = 0;
// True while a result animation plays; shoes cannot be moved then.
let roundLocked = false;

export function startGame(app) {
  app.show('screen-game');
  misses = 0;
  const char = document.getElementById('char');
  char.innerHTML = LEGS[app.profile];
  char.className = '';
  document.querySelectorAll('.foot').forEach((f) => { f.innerHTML = FEET[f.dataset.foot]; });
  if (app.state.today.rounds >= app.state.settings.dailyLimit) {
    goToSleep(app);
    return;
  }
  newRound(app);
}

function newRound(app) {
  const stage = document.getElementById('stage');
  stage.querySelectorAll('.shoe').forEach((el) => el.remove());
  resetFeet();
  roundLocked = false;
  document.getElementById('char').className = '';

  const set = pickShoeSet(app.profile, app.state.profiles[app.profile].shoeSet);
  const { floor } = makeRound();
  floor.forEach((side, i) => {
    const slot = i === 0 ? 'left' : 'right';
    const el = document.createElement('div');
    el.className = 'shoe';
    el.dataset.side = side;
    el.dataset.slot = slot;
    el.dataset.strap = 'open';
    el.innerHTML = side === 'L' ? set.left : set.right;
    placeOnFloor(el);
    makeDraggable(el, app);
    makeStrapFastenable(el, app);
    stage.appendChild(el);
  });
  renderProgress(app);
}

function resetFeet() {
  document.querySelectorAll('.foot').forEach((f) => { f.classList.remove('worn'); delete f.dataset.shoe; });
}

function placeOnFloor(el) {
  const pos = FLOOR_POS[el.dataset.slot];
  el.style.left = pos.left;
  el.style.top = pos.top;
  el.classList.remove('wrong-left', 'wrong-right', 'tab-hint');
  el.dataset.strap = 'open';
  delete el.dataset.worn;
}

// ---- phase 1: drag the shoe onto a foot (loose strap swings while moving) ----
function makeDraggable(el, app) {
  let offsetX = 0;
  let offsetY = 0;
  let lastX = 0;

  el.addEventListener('pointerdown', (e) => {
    if (roundLocked || el.dataset.strap === 'closed') return;
    if (el.dataset.worn) {
      // A worn shoe only comes off when the drawing itself is grabbed,
      // not the transparent box around it.
      if (!(e.target instanceof SVGElement) || e.target.tagName === 'svg') return;
      unwear(el);
    }
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    lastX = e.clientX;
    el.classList.remove('settling');
    el.classList.add('dragging');
    playPick();
  });

  el.addEventListener('pointermove', (e) => {
    if (!el.classList.contains('dragging')) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
    // The open tab lags behind horizontal motion like a real loose strap.
    const vx = e.clientX - lastX;
    lastX = e.clientX;
    const mirror = el.dataset.side === 'R' ? -1 : 1;
    const sway = Math.max(-SWAY_MAX_DEG, Math.min(SWAY_MAX_DEG, vx * SWAY_PER_PX * mirror));
    el.style.setProperty('--sway', `${sway}deg`);
  });

  el.addEventListener('pointerup', (e) => {
    if (!el.classList.contains('dragging')) return;
    el.classList.remove('dragging');
    settleStrap(el);
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
    settleStrap(el);
    placeOnFloor(el);
  });
}

function settleStrap(el) {
  el.classList.add('settling');
  el.addEventListener('animationend', () => {
    el.classList.remove('settling');
    el.style.setProperty('--sway', '0deg');
  }, { once: true });
}

function footUnder(x, y) {
  return [...document.querySelectorAll('.foot')].find((foot) => {
    const r = foot.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }) || null;
}

// Take a worn (but not yet fastened) shoe off its foot again.
function unwear(shoe) {
  const foot = document.querySelector(`.foot[data-shoe="${shoe.dataset.side}"]`);
  if (foot) { foot.classList.remove('worn'); delete foot.dataset.shoe; }
  delete shoe.dataset.worn;
  document.querySelectorAll('.shoe').forEach((s) => s.classList.remove('tab-hint'));
}

function wear(shoe, foot) {
  const r = foot.getBoundingClientRect();
  const stage = document.getElementById('stage').getBoundingClientRect();
  const s = shoe.getBoundingClientRect();
  shoe.style.left = `${r.left - stage.left + r.width / 2 - s.width / 2}px`;
  shoe.style.top = `${r.top - stage.top + r.height / 2 - s.height / 2 - r.height * 0.06}px`;
  shoe.dataset.worn = '1';
  foot.dataset.shoe = shoe.dataset.side;
  foot.classList.add('worn');
}

function checkRound(app) {
  const placement = {};
  document.querySelectorAll('.foot').forEach((f) => { placement[`${f.dataset.foot}Foot`] = f.dataset.shoe; });
  if (!placement.leftFoot || !placement.rightFoot) return;

  if (isCorrect(placement)) {
    // Correct feet: now the child fastens both straps.
    document.querySelectorAll('.shoe').forEach((s) => s.classList.add('tab-hint'));
  } else {
    onWrong(app);
  }
}

// ---- phase 2: fold the loose tab over the strap (only on a correctly worn shoe) ----
function makeStrapFastenable(el, app) {
  const tab = el.querySelector('.strap-tab');
  const mirror = el.dataset.side === 'R';

  function pivotOnScreen() {
    const r = el.querySelector('svg').getBoundingClientRect();
    // Mirrored shoes are drawn with translate(160) scale(-1), so x -> 160 - x.
    const px = mirror ? 160 - STRAP_PIVOT.x : STRAP_PIVOT.x;
    return {
      x: r.left + ((px - SHOE_VIEWBOX.x0) / SHOE_VIEWBOX.w) * r.width,
      y: r.top + ((STRAP_PIVOT.y - SHOE_VIEWBOX.y0) / SHOE_VIEWBOX.h) * r.height,
    };
  }

  // Strap rotation that makes it point at the pointer, in the left-shoe's
  // local frame: 0 = lying closed toward the outer ring, STRAP_OPEN_DEG = at rest open.
  function rotationToward(e) {
    const p = pivotOnScreen();
    const dx = (e.clientX - p.x) * (mirror ? -1 : 1);
    const dy = e.clientY - p.y;
    let rot = (Math.atan2(dy, dx) * 180) / Math.PI - 180;
    if (rot <= -180) rot += 360;
    return rot;
  }

  function canFasten() {
    return el.dataset.worn && el.dataset.strap === 'open' && el.classList.contains('tab-hint');
  }

  tab.addEventListener('pointerdown', (e) => {
    if (!canFasten()) return;
    e.stopPropagation();
    tab.setPointerCapture(e.pointerId);
    el.classList.remove('tab-hint');
    el.classList.add('tab-grab');
    playPick();
  });

  tab.addEventListener('pointermove', (e) => {
    if (!el.classList.contains('tab-grab')) return;
    el.style.setProperty('--sway', `${rotationToward(e) - STRAP_OPEN_DEG}deg`);
  });

  function release(e) {
    if (!el.classList.contains('tab-grab')) return;
    el.classList.remove('tab-grab');
    if (Math.abs(rotationToward(e)) <= CLOSE_ANGLE_DEG) {
      el.dataset.strap = 'closed';
      el.style.setProperty('--sway', '0deg');
      playVelcro();
      if ([...document.querySelectorAll('.shoe')].every((s) => s.dataset.strap === 'closed')) {
        onCorrect(app);
      }
    } else {
      el.classList.add('tab-hint');
      el.style.setProperty('--sway', '0deg');
    }
  }
  tab.addEventListener('pointerup', release);
  tab.addEventListener('pointercancel', release);
}

function onCorrect(app) {
  misses = 0;
  roundLocked = true;
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
      showOverlay(item.svg, UNLOCK_SHOW_MS, true);
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
  roundLocked = true;
  playWrong();
  document.getElementById('char').className = 'confused';
  // Swapped shoes: toes splay outward and the loose tabs point at each other.
  document.querySelectorAll('.foot').forEach((foot) => {
    const shoe = document.querySelector(`.shoe[data-side="${foot.dataset.shoe}"]`);
    shoe.classList.add(foot.dataset.foot === 'left' ? 'wrong-left' : 'wrong-right');
  });

  setTimeout(() => {
    document.getElementById('char').className = '';
    resetFeet();
    roundLocked = false;
    document.querySelectorAll('.shoe').forEach((s) => placeOnFloor(s));
    if (shouldGuide(misses)) {
      document.querySelectorAll('.shoe').forEach((s) => s.classList.add('guide'));
    }
  }, WRONG_DELAY_MS);
}

function goToSleep(app) {
  document.getElementById('char').className = 'sleep';
  playSleep();
  showOverlay(CHARS[app.profile], SLEEP_SHOW_MS, false);
  setTimeout(() => app.show('screen-profile'), SLEEP_SHOW_MS);
}

function showOverlay(svg, ms, celebrate) {
  const overlay = document.getElementById('overlay');
  overlay.querySelector('.overlay-art').innerHTML = svg;
  overlay.querySelector('.confetti').innerHTML = celebrate ? confettiHtml() : '';
  overlay.hidden = false;
  setTimeout(() => { overlay.hidden = true; }, ms);
}

function confettiHtml() {
  const colors = ['oklch(68% 0.18 35)', 'oklch(80% 0.16 90)', 'oklch(72% 0.17 150)', 'oklch(70% 0.15 250)', 'oklch(78% 0.14 330)'];
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const angle = (i / CONFETTI_COUNT) * Math.PI * 2;
    const dist = 22 + Math.random() * 26;
    const dx = `${Math.cos(angle) * dist}vh`;
    const dy = `${Math.sin(angle) * dist + 10}vh`;
    return `<i style="--dx:${dx};--dy:${dy};--c:${colors[i % colors.length]};animation-delay:${Math.random() * 120}ms"></i>`;
  }).join('');
}

// Dots toward the next unlock, with the upcoming item shown as the goal.
function renderProgress(app) {
  const correct = app.state.profiles[app.profile].correct;
  const filled = correct % UNLOCK_EVERY;
  const next = ITEMS[app.profile][unlockedCount(correct)];
  const dots = Array.from({ length: UNLOCK_EVERY }, (_, i) => `<span class="${i < filled ? 'on' : ''}"></span>`).join('');
  const goal = next ? `<div class="goal" style="filter: grayscale(1) opacity(0.5)">${next.svg}</div>` : '';
  document.getElementById('progress').innerHTML = dots + goal;
}
