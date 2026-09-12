# くつ左右おぼえゲーム Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 3歳半の子がタブレットで靴を左右正しく履かせ、逆履きの見た目を覚えるブラウザゲームを作る。

**Architecture:** ビルドなしの静的サイト。`index.html` に3画面（プロファイル／ゲーム／図鑑）と隠し設定を置き、ES modules の JS で画面遷移・ドラッグ判定・保存を行う。判定・保存・解放ロジックは DOM 非依存の純関数にして Node の組み込みテストランナーで検証する。絵はすべて JS が返す SVG 文字列。

**Tech Stack:** HTML / CSS / JavaScript (ES modules, 依存なし), `node --test` (Node 20+), Web Audio API, localStorage, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-09-12-kids-shoe-game-design.md`

## Global Constraints

- 外部ライブラリ・ビルドツールを使わない。`package.json` は `"type": "module"` とテストスクリプトのみ
- 画面に文字を出さない（親設定画面と `<title>` は例外）
- 子供の名前をコード・データ・コミットに含めない。プロファイル ID は `bug` と `dress` のみ
- 靴の写真ファイルをリポジトリに入れない（`.gitignore` で `photos/` を除外）
- 保存先は `localStorage["kids-shoe-game"]` のみ。外部送信なし
- コメント・変数名・コミットメッセージは英語
- 解放は正解 5 回ごと（`UNLOCK_EVERY = 5`）、ガイドは 3 連続ミスから（`GUIDE_AFTER_MISSES = 3`）、1 日上限の初期値は 10

---

## File Structure

```
index.html            画面の骨組み（section 4つ）と module 読み込み
manifest.json         ホーム画面追加用
css/style.css         レイアウト・アニメーション・状態クラス
js/main.js            画面遷移、プロファイル選択、設定画面、起動処理
js/game.js            ラウンド描画、ドラッグ＆ドロップ、判定後の演出
js/collection.js      図鑑画面の描画
js/logic.js           純関数: ラウンド生成、正誤判定、解放計算、ガイド判定
js/storage.js         純関数 + localStorage 読み書き、日付リセット
js/audio.js           Web Audio による効果音
js/art/shoes.js       靴セット（左右 SVG 文字列）
js/art/items.js       虫・ドレスの SVG 生成関数と 10 個ずつの定義
js/art/chars.js       キャラクター SVG（顔の切り替え用グループつき）
tests/logic.test.js
tests/storage.test.js
tests/art.test.js
```

---

### Task 1: Scaffold and test runner

**Files:**
- Create: `package.json`, `.gitignore`, `index.html`, `css/style.css`, `tests/smoke.test.js`

**Interfaces:**
- Produces: `npm test` が `node --test tests/` を実行する

- [ ] **Step 1: Write package.json and .gitignore**

`package.json`:
```json
{
  "name": "kids-shoe-game",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

`.gitignore`:
```
photos/
node_modules/
.DS_Store
```

- [ ] **Step 2: Write a smoke test**

`tests/smoke.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('test runner works', () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: `# pass 1`

- [ ] **Step 4: Write index.html shell**

`index.html`:
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="mobile-web-app-capable" content="yes">
  <link rel="manifest" href="manifest.json">
  <title>くつ</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <section id="screen-profile" class="screen">
    <button class="profile-btn" data-profile="bug" aria-label="bug"></button>
    <button class="profile-btn" data-profile="dress" aria-label="dress"></button>
    <button id="gear" class="gear" aria-label="settings"></button>
  </section>

  <section id="screen-game" class="screen" hidden>
    <div id="stage">
      <div id="char"></div>
      <div class="foot" data-foot="left"></div>
      <div class="foot" data-foot="right"></div>
    </div>
    <button id="btn-collection" class="corner-btn corner-right" aria-label="collection"></button>
    <button id="btn-home" class="corner-btn corner-left" aria-label="home"></button>
    <div id="progress"></div>
  </section>

  <section id="screen-collection" class="screen" hidden>
    <div id="collection-grid"></div>
    <button id="btn-back" class="corner-btn corner-left" aria-label="back"></button>
  </section>

  <section id="screen-settings" class="screen" hidden>
    <h1>おうちのひと設定</h1>
    <label>1日のラウンド数 <input id="daily-limit" type="number" min="1" max="50"></label>
    <label>くつ <select id="shoe-set"></select></label>
    <button id="btn-reset">データを全部消す</button>
    <button id="btn-settings-close">閉じる</button>
  </section>

  <div id="overlay" class="overlay" hidden></div>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Write base CSS**

`css/style.css`:
```css
:root {
  --bg: #fff7e6;
  --floor: #e8d5b5;
  --accent: #ff8a65;
  --shadow: rgba(0, 0, 0, 0.15);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  font-family: system-ui, sans-serif;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}

.screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen[hidden] { display: none; }

/* profile */
#screen-profile { gap: 8vw; }

.profile-btn {
  width: 32vw;
  height: 32vw;
  max-width: 320px;
  max-height: 320px;
  border: none;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 8px 0 var(--shadow);
  padding: 4%;
}

.profile-btn:active { transform: translateY(4px); box-shadow: 0 4px 0 var(--shadow); }

.profile-btn svg { width: 100%; height: 100%; }

.gear {
  position: fixed;
  right: 12px;
  bottom: 12px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  opacity: 0.3;
}

.gear::before { content: '⚙'; font-size: 24px; }

/* game */
#stage {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(var(--bg) 0 60%, var(--floor) 60% 100%);
}

#char {
  position: absolute;
  left: 50%;
  top: 8vh;
  width: 30vh;
  height: 52vh;
  transform: translateX(-50%);
}

#char svg { width: 100%; height: 100%; }

.foot {
  position: absolute;
  top: 58vh;
  width: 12vh;
  height: 18vh;
  border-radius: 40% 40% 30% 30%;
  border: 3px dashed rgba(0, 0, 0, 0.15);
}

.foot[data-foot="left"]  { left: calc(50% - 13vh); }
.foot[data-foot="right"] { left: calc(50% + 1vh); }

.foot.worn { border-color: transparent; }

.shoe {
  position: absolute;
  width: 14vh;
  height: 20vh;
  touch-action: none;
  filter: drop-shadow(0 4px 4px var(--shadow));
  transition: transform 0.3s, left 0.3s, top 0.3s;
}

.shoe.dragging { transition: none; z-index: 10; transform: scale(1.1); }

.shoe svg { width: 100%; height: 100%; }

.shoe.wrong-left  { transform: rotate(-25deg); }
.shoe.wrong-right { transform: rotate(25deg); }

.shoe.guide { animation: blink 0.6s infinite alternate; }

@keyframes blink { from { filter: brightness(1); } to { filter: brightness(1.6) drop-shadow(0 0 12px gold); } }

#char.happy { animation: jump 0.5s 2; }

@keyframes jump {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6vh); }
}

#char.confused { animation: stomp 0.3s 3; }

@keyframes stomp {
  0%, 100% { transform: translateX(-50%) rotate(0); }
  50% { transform: translateX(-50%) rotate(3deg); }
}

.corner-btn {
  position: fixed;
  top: 12px;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 0 var(--shadow);
  padding: 8px;
}

.corner-btn svg { width: 100%; height: 100%; }

.corner-left { left: 12px; }
.corner-right { right: 12px; }

#progress {
  position: fixed;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

#progress span {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
}

#progress span.on { background: var(--accent); }

/* collection */
#screen-collection { flex-direction: column; }

#collection-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3vh;
  width: 80vw;
}

.item {
  aspect-ratio: 1;
  background: #fff;
  border-radius: 16px;
  padding: 8%;
}

.item svg { width: 100%; height: 100%; }

.item.locked svg { filter: brightness(0) opacity(0.15); }

.item.unlocked:active svg { animation: wiggle 0.6s; }

@keyframes wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-10deg) scale(1.15); }
  75% { transform: rotate(10deg) scale(1.15); }
}

/* settings */
#screen-settings { flex-direction: column; gap: 24px; font-size: 20px; }

#screen-settings input, #screen-settings select { font-size: 20px; width: 6em; }

#screen-settings button { font-size: 20px; padding: 12px 24px; }

/* overlay (unlock / sleep) */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay[hidden] { display: none; }

.overlay svg { width: 50vh; height: 50vh; animation: pop 0.6s; }

@keyframes pop {
  from { transform: scale(0.2); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

- [ ] **Step 6: Commit**

```bash
git add package.json .gitignore index.html css/style.css tests/smoke.test.js
git commit -m "chore: scaffold static app and test runner"
```

---

### Task 2: Pure game logic

**Files:**
- Create: `js/logic.js`, `tests/logic.test.js`

**Interfaces:**
- Produces:
  - `UNLOCK_EVERY: number` (5), `GUIDE_AFTER_MISSES: number` (3)
  - `makeRound(random?: () => number): { floor: ['L','R'] | ['R','L'] }` 床の左スロット・右スロットに置く靴
  - `isCorrect(placement: { leftFoot: 'L'|'R', rightFoot: 'L'|'R' }): boolean`
  - `unlockedCount(correct: number): number`
  - `isNewUnlock(prevCorrect: number, nextCorrect: number): boolean`
  - `shouldGuide(misses: number): boolean`

- [ ] **Step 1: Write failing tests**

`tests/logic.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  UNLOCK_EVERY, GUIDE_AFTER_MISSES,
  makeRound, isCorrect, unlockedCount, isNewUnlock, shouldGuide,
} from '../js/logic.js';

test('makeRound puts L on the left floor slot when random < 0.5', () => {
  assert.deepEqual(makeRound(() => 0.2).floor, ['L', 'R']);
});

test('makeRound puts R on the left floor slot when random >= 0.5', () => {
  assert.deepEqual(makeRound(() => 0.7).floor, ['R', 'L']);
});

test('isCorrect is true only when L is on left foot and R on right foot', () => {
  assert.equal(isCorrect({ leftFoot: 'L', rightFoot: 'R' }), true);
  assert.equal(isCorrect({ leftFoot: 'R', rightFoot: 'L' }), false);
});

test('unlockedCount grows by one every UNLOCK_EVERY correct answers', () => {
  assert.equal(UNLOCK_EVERY, 5);
  assert.equal(unlockedCount(0), 0);
  assert.equal(unlockedCount(4), 0);
  assert.equal(unlockedCount(5), 1);
  assert.equal(unlockedCount(12), 2);
});

test('isNewUnlock detects crossing a threshold', () => {
  assert.equal(isNewUnlock(4, 5), true);
  assert.equal(isNewUnlock(5, 6), false);
});

test('shouldGuide after GUIDE_AFTER_MISSES consecutive misses', () => {
  assert.equal(GUIDE_AFTER_MISSES, 3);
  assert.equal(shouldGuide(2), false);
  assert.equal(shouldGuide(3), true);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`
Expected: FAIL, `Cannot find module '../js/logic.js'`

- [ ] **Step 3: Implement**

`js/logic.js`:
```js
export const UNLOCK_EVERY = 5;
export const GUIDE_AFTER_MISSES = 3;

// Decide which shoe sits on the left floor slot. Returns [leftSlot, rightSlot].
export function makeRound(random = Math.random) {
  return { floor: random() < 0.5 ? ['L', 'R'] : ['R', 'L'] };
}

export function isCorrect(placement) {
  return placement.leftFoot === 'L' && placement.rightFoot === 'R';
}

export function unlockedCount(correct) {
  return Math.floor(correct / UNLOCK_EVERY);
}

export function isNewUnlock(prevCorrect, nextCorrect) {
  return unlockedCount(nextCorrect) > unlockedCount(prevCorrect);
}

export function shouldGuide(misses) {
  return misses >= GUIDE_AFTER_MISSES;
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add js/logic.js tests/logic.test.js
git commit -m "feat: add pure round, judge and unlock logic"
```

---

### Task 3: Storage with daily reset

**Files:**
- Create: `js/storage.js`, `tests/storage.test.js`

**Interfaces:**
- Produces:
  - `KEY: string` (`'kids-shoe-game'`), `DEFAULT_DAILY_LIMIT: number` (10)
  - `defaultState(today: string): State`
  - `loadState(store: { getItem, setItem, removeItem }, today: string): State` 壊れたデータは初期値に戻し、日付が違えば `today.rounds` を 0 にする
  - `saveState(store, state): void`
  - `resetState(store): void`
  - `State = { profiles: { bug: { correct: number }, dress: { correct: number } }, settings: { dailyLimit: number, shoeSet: string }, today: { date: string, rounds: number } }`
  - `todayString(date?: Date): string` `YYYY-MM-DD` ローカル日付

- [ ] **Step 1: Write failing tests**

`tests/storage.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  KEY, DEFAULT_DAILY_LIMIT, defaultState, loadState, saveState, resetState, todayString,
} from '../js/storage.js';

function memoryStore(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
    data,
  };
}

test('loadState returns default when nothing is stored', () => {
  const state = loadState(memoryStore(), '2026-09-12');
  assert.deepEqual(state, defaultState('2026-09-12'));
  assert.equal(state.settings.dailyLimit, DEFAULT_DAILY_LIMIT);
});

test('loadState returns default when stored JSON is broken', () => {
  const store = memoryStore({ [KEY]: '{not json' });
  assert.deepEqual(loadState(store, '2026-09-12'), defaultState('2026-09-12'));
});

test('loadState resets today.rounds when the date changed', () => {
  const store = memoryStore();
  const state = defaultState('2026-09-11');
  state.today.rounds = 7;
  state.profiles.bug.correct = 9;
  saveState(store, state);

  const loaded = loadState(store, '2026-09-12');
  assert.equal(loaded.today.date, '2026-09-12');
  assert.equal(loaded.today.rounds, 0);
  assert.equal(loaded.profiles.bug.correct, 9);
});

test('loadState keeps today.rounds on the same date', () => {
  const store = memoryStore();
  const state = defaultState('2026-09-12');
  state.today.rounds = 3;
  saveState(store, state);
  assert.equal(loadState(store, '2026-09-12').today.rounds, 3);
});

test('loadState fills missing fields from defaults', () => {
  const store = memoryStore({ [KEY]: JSON.stringify({ profiles: { bug: { correct: 2 } } }) });
  const loaded = loadState(store, '2026-09-12');
  assert.equal(loaded.profiles.bug.correct, 2);
  assert.equal(loaded.profiles.dress.correct, 0);
  assert.equal(loaded.settings.dailyLimit, DEFAULT_DAILY_LIMIT);
});

test('resetState removes the key', () => {
  const store = memoryStore({ [KEY]: '{}' });
  resetState(store);
  assert.equal(store.getItem(KEY), null);
});

test('todayString formats local date as YYYY-MM-DD', () => {
  assert.equal(todayString(new Date(2026, 8, 3)), '2026-09-03');
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`
Expected: FAIL, `Cannot find module '../js/storage.js'`

- [ ] **Step 3: Implement**

`js/storage.js`:
```js
export const KEY = 'kids-shoe-game';
export const DEFAULT_DAILY_LIMIT = 10;

export function todayString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function defaultState(today) {
  return {
    profiles: { bug: { correct: 0 }, dress: { correct: 0 } },
    settings: { dailyLimit: DEFAULT_DAILY_LIMIT, shoeSet: 'default' },
    today: { date: today, rounds: 0 },
  };
}

function parse(raw) {
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

export function loadState(store, today) {
  const base = defaultState(today);
  const stored = parse(store.getItem(KEY));
  if (!stored) return base;

  const state = {
    profiles: {
      bug: { ...base.profiles.bug, ...stored.profiles?.bug },
      dress: { ...base.profiles.dress, ...stored.profiles?.dress },
    },
    settings: { ...base.settings, ...stored.settings },
    today: { ...base.today, ...stored.today },
  };
  if (state.today.date !== today) {
    state.today = { date: today, rounds: 0 };
  }
  return state;
}

export function saveState(store, state) {
  store.setItem(KEY, JSON.stringify(state));
}

export function resetState(store) {
  store.removeItem(KEY);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add js/storage.js tests/storage.test.js
git commit -m "feat: add localStorage state with daily reset"
```

---

### Task 4: Art assets (shoes, items, characters)

**Files:**
- Create: `js/art/shoes.js`, `js/art/items.js`, `js/art/chars.js`, `tests/art.test.js`
- Modify: `css/style.css`（末尾に顔切り替え CSS を追加）
- Delete: `tests/smoke.test.js`

**Interfaces:**
- Produces:
  - `SHOE_SETS: Record<string, { label: string, left: string, right: string }>` `'default'` を必ず含む
  - `ITEMS: { bug: Array<{ id: string, svg: string }>, dress: Array<{ id: string, svg: string }> }` 各 10 個
  - `PROFILE_ICONS: { bug: string, dress: string }` プロファイルボタン用 SVG
  - `CHARS: { bug: string, dress: string }` キャラ SVG。顔は `<g class="face face-normal">`, `face-happy`, `face-confused`, `face-sleep` の 4 グループを持ち、CSS で切り替える
  - `UI_ICONS: { home: string, book: string, back: string }`

- [ ] **Step 1: Write failing tests**

`tests/art.test.js`:
```js
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
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`
Expected: FAIL, `Cannot find module '../js/art/shoes.js'`

- [ ] **Step 3: Implement shoes**

上から見た靴。つま先が上。左靴は親指側（内側）が右になる。内側の縁に「てんとう虫の半分」を描き、左右を正しく並べると 1 匹になる。右靴は左靴を水平反転して作る。

`js/art/shoes.js`:
```js
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
```

写真から起こした靴セットを追加するときは、`shoeSvg` と同じ「左靴を描いて右は反転」の方式で `SHOE_SETS.<id>` を増やす。`label` は親設定の select にだけ表示する。

- [ ] **Step 4: Implement items and profile icons**

`js/art/items.js`:
```js
// Parametric bug: body color, spot color, wing shape.
function bugSvg({ body, spots, wings }) {
  const wingPath = wings === 'round'
    ? '<ellipse cx="50" cy="58" rx="30" ry="34"/>'
    : '<path d="M50 24 C80 24 84 70 50 92 C16 70 20 24 50 24 Z"/>';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="${body}" stroke="#222" stroke-width="3">${wingPath}</g>
  <circle cx="50" cy="22" r="12" fill="#222"/>
  <path d="M42 12 L34 2 M58 12 L66 2" stroke="#222" stroke-width="3" stroke-linecap="round"/>
  <line x1="50" y1="30" x2="50" y2="90" stroke="#222" stroke-width="3"/>
  <g fill="${spots}">
    <circle cx="36" cy="48" r="6"/><circle cx="64" cy="48" r="6"/>
    <circle cx="32" cy="68" r="6"/><circle cx="68" cy="68" r="6"/>
    <circle cx="44" cy="82" r="5"/><circle cx="56" cy="82" r="5"/>
  </g>
</svg>`;
}

// Parametric dress: color, skirt shape, accent color for ribbon/collar.
function dressSvg({ color, accent, skirt }) {
  const skirtPath = skirt === 'flare'
    ? '<path d="M32 44 L68 44 L88 94 L12 94 Z"/>'
    : '<path d="M32 44 L68 44 L72 94 L28 94 Z"/>';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="${color}" stroke="#222" stroke-width="3">
    <path d="M32 8 L44 16 L56 16 L68 8 L68 44 L32 44 Z"/>
    ${skirtPath}
  </g>
  <path d="M44 16 L56 16 L50 26 Z" fill="${accent}"/>
  <circle cx="50" cy="44" r="6" fill="${accent}"/>
  <path d="M40 60 Q50 66 60 60" stroke="${accent}" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
}

const BUGS = [
  ['ladybug',   { body: '#e53935', spots: '#222',    wings: 'round' }],
  ['beetle',    { body: '#3e2723', spots: '#3e2723', wings: 'long' }],
  ['stag',      { body: '#212121', spots: '#212121', wings: 'long' }],
  ['bee',       { body: '#fdd835', spots: '#222',    wings: 'round' }],
  ['butterfly', { body: '#ab47bc', spots: '#ffeb3b', wings: 'round' }],
  ['dragonfly', { body: '#26c6da', spots: '#fff',    wings: 'long' }],
  ['grass',     { body: '#66bb6a', spots: '#2e7d32', wings: 'long' }],
  ['cicada',    { body: '#8d6e63', spots: '#d7ccc8', wings: 'long' }],
  ['firefly',   { body: '#455a64', spots: '#ffee58', wings: 'round' }],
  ['rhino',     { body: '#5d4037', spots: '#5d4037', wings: 'long' }],
];

const DRESSES = [
  ['pink',     { color: '#f48fb1', accent: '#fff',    skirt: 'flare' }],
  ['sky',      { color: '#81d4fa', accent: '#fff',    skirt: 'straight' }],
  ['lemon',    { color: '#fff176', accent: '#f57f17', skirt: 'flare' }],
  ['mint',     { color: '#a5d6a7', accent: '#fff',    skirt: 'straight' }],
  ['lavender', { color: '#ce93d8', accent: '#fff',    skirt: 'flare' }],
  ['peach',    { color: '#ffab91', accent: '#fff',    skirt: 'straight' }],
  ['ruby',     { color: '#e53935', accent: '#ffd54f', skirt: 'flare' }],
  ['navy',     { color: '#3949ab', accent: '#fff',    skirt: 'straight' }],
  ['gold',     { color: '#ffca28', accent: '#fff',    skirt: 'flare' }],
  ['rainbow',  { color: '#4dd0e1', accent: '#f06292', skirt: 'flare' }],
];

export const ITEMS = {
  bug: BUGS.map(([id, p]) => ({ id, svg: bugSvg(p) })),
  dress: DRESSES.map(([id, p]) => ({ id, svg: dressSvg(p) })),
};

export const PROFILE_ICONS = {
  bug: ITEMS.bug[0].svg,
  dress: ITEMS.dress[0].svg,
};
```

- [ ] **Step 5: Implement characters and UI icons**

`js/art/chars.js`:
```js
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
```

- [ ] **Step 6: Add face-switching CSS**

`css/style.css` の末尾に追加:
```css
/* character faces: exactly one visible */
#char .face { display: none; }
#char:not(.happy):not(.confused):not(.sleep) .face-normal { display: block; }
#char.happy .face-happy { display: block; }
#char.confused .face-confused { display: block; }
#char.sleep .face-sleep { display: block; }
```

- [ ] **Step 7: Run tests and remove smoke test**

Run: `git rm tests/smoke.test.js` then `npm test`
Expected: all pass (logic, storage, art)

- [ ] **Step 8: Commit**

```bash
git add js/art css/style.css tests/art.test.js
git commit -m "feat: add svg art for shoes, items and characters"
```

---

### Task 5: Audio

**Files:**
- Create: `js/audio.js`

**Interfaces:**
- Produces: `playCorrect()`, `playWrong()`, `playUnlock()`, `playPick()`, `playSleep()` すべて同期呼び出しで戻り値なし。AudioContext は最初の呼び出し時に生成

- [ ] **Step 1: Implement**

`js/audio.js`:
```js
let ctx = null;

function context() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Play a sequence of [frequencyHz, durationSec] notes back to back.
function playNotes(notes, type = 'sine', volume = 0.2) {
  const ac = context();
  let t = ac.currentTime;
  for (const [freq, dur] of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur);
    t += dur;
  }
}

export function playPick() { playNotes([[660, 0.08]], 'triangle', 0.1); }
export function playCorrect() { playNotes([[523, 0.12], [659, 0.12], [784, 0.2]]); }
export function playWrong() { playNotes([[300, 0.2], [220, 0.3]], 'sawtooth', 0.12); }
export function playUnlock() { playNotes([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.35]], 'triangle'); }
export function playSleep() { playNotes([[440, 0.3], [392, 0.3], [349, 0.5]], 'sine', 0.15); }
```

- [ ] **Step 2: Manual check**

ブラウザのコンソールで `import('./js/audio.js').then(m => m.playCorrect())` を実行し、3 音の上昇音が鳴ること。

- [ ] **Step 3: Commit**

```bash
git add js/audio.js
git commit -m "feat: add web audio sound effects"
```

---

### Task 6: Screens, profile selection, settings

**Files:**
- Create: `js/main.js`, `js/game.js`（仮）, `js/collection.js`（仮）

**Interfaces:**
- Consumes: `loadState/saveState/resetState/todayString` (Task 3), `PROFILE_ICONS`, `UI_ICONS`, `SHOE_SETS` (Task 4)
- Produces:
  - `app: { state: State, profile: 'bug'|'dress'|null, save(): void, show(screenId: string): void }` を `js/game.js` と `js/collection.js` に渡す
  - `startGame(app)` と `renderCollection(app)` を Task 7/8 で実装し、ここから呼ぶ

- [ ] **Step 1: Implement main.js**

`js/main.js`:
```js
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
```

- [ ] **Step 2: Temporary stubs so the page loads**

Task 7/8 が未実装の間だけ使う。`js/game.js`:
```js
export function startGame(app) { app.show('screen-game'); }
```
`js/collection.js`:
```js
export function renderCollection(app) { app.show('screen-collection'); }
```

- [ ] **Step 3: Manual check**

Run: `python -m http.server 8080`（または任意の静的サーバー）で `http://localhost:8080` を開く。
Expected:
- 虫とドレスのボタンが表示され、タップでゲーム画面（空のステージ）に移る
- 右下の歯車を 2 秒長押しで設定画面。閉じるでプロファイルに戻る
- ラウンド数を 3 にして閉じ、リロード後も 3 のまま

- [ ] **Step 4: Commit**

```bash
git add js/main.js js/game.js js/collection.js
git commit -m "feat: add screens, profile selection and parent settings"
```

---

### Task 7: Game screen with drag and drop

**Files:**
- Modify: `js/game.js`（スタブを置き換え）

**Interfaces:**
- Consumes: `makeRound/isCorrect/isNewUnlock/unlockedCount/shouldGuide/UNLOCK_EVERY` (Task 2), `SHOE_SETS` (Task 4), `CHARS` (Task 4), `ITEMS` (Task 4), audio (Task 5), `app` (Task 6)
- Produces: `startGame(app: App): void`

**動作:**
1. キャラと床の靴 2 つを描く。床の並びは `makeRound()` で決める
2. 靴を pointer events でドラッグ。指を離した位置が空いている足の上なら足にはめる
3. 両足がはまったら `isCorrect` で判定
   - 正解: `#char.happy`、`playCorrect()`、`correct += 1`、`today.rounds += 1`、保存。解放閾値を越えたら overlay に新アイテムを出して `playUnlock()`。1.5 秒後に次ラウンド
   - 不正解: 足にはまった靴に `wrong-left` / `wrong-right`（つま先が外を向く回転）、`#char.confused`、`playWrong()`、`misses += 1`。1.2 秒後に靴を床に戻す。`shouldGuide(misses)` なら両方の靴に `guide` クラス（正解まで点滅。靴は 2 つしかないので「入れ替えて」の合図）
4. `today.rounds >= dailyLimit` なら `#char.sleep` と overlay、`playSleep()`、3 秒後にプロファイル画面へ

- [ ] **Step 1: Implement**

`js/game.js`:
```js
import { makeRound, isCorrect, isNewUnlock, unlockedCount, UNLOCK_EVERY, shouldGuide } from './logic.js';
import { SHOE_SETS } from './art/shoes.js';
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

  const set = SHOE_SETS[app.state.settings.shoeSet] || SHOE_SETS.default;
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
```

- [ ] **Step 2: Manual check on desktop**

Run: 静的サーバーで開き、虫を選ぶ。
Expected:
- 靴 2 つが床に出る。ドラッグで足に乗せられる。足の外で離すと床に戻る
- 逆に履くとキャラが「？」になり、靴が外向きに傾いてから床に戻る
- 3 回連続で間違えると靴が点滅する
- 正しく履くとキャラがジャンプし、下部のドットが 1 つ増える
- 5 回正解で虫が大きく表示される
- 設定でラウンド数 2 にして 2 回正解するとキャラが寝てプロファイル画面へ

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all pass（ロジックの変更なし）

- [ ] **Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat: add drag-and-drop shoe game round"
```

---

### Task 8: Collection screen

**Files:**
- Modify: `js/collection.js`（スタブを置き換え）

**Interfaces:**
- Consumes: `ITEMS` (Task 4), `unlockedCount` (Task 2), `app` (Task 6)
- Produces: `renderCollection(app: App): void`

- [ ] **Step 1: Implement**

`js/collection.js`:
```js
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
```

- [ ] **Step 2: Manual check**

Expected:
- 正解 0 回では 10 個すべてシルエット
- 正解 5 回後は 1 個目だけ色つき。タップで揺れる
- 戻るボタンでゲームに戻り、ラウンドが新しく始まる

- [ ] **Step 3: Commit**

```bash
git add js/collection.js
git commit -m "feat: add collection screen"
```

---

### Task 9: Manifest and GitHub Pages deploy

**Files:**
- Create: `manifest.json`, `README.md`

- [ ] **Step 1: Write manifest**

`manifest.json`:
```json
{
  "name": "kutsu",
  "short_name": "kutsu",
  "start_url": ".",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#fff7e6",
  "theme_color": "#ff8a65",
  "icons": []
}
```

- [ ] **Step 2: Write README**

`README.md`:
```markdown
# kids-shoe-game

Browser game for toddlers to learn left/right shoes. No build step.

## Run locally

    python -m http.server 8080

Open http://localhost:8080 on a tablet in landscape.

## Test

    npm test

## Adding a shoe set

Add an entry to `SHOE_SETS` in `js/art/shoes.js`. Draw the left shoe (toe up,
inner edge on the right) and mirror it for the right shoe. Photos used as
reference go in `photos/` (git-ignored).
```

- [ ] **Step 3: Enable GitHub Pages**

```bash
gh auth switch -u apjpkogawa
gh api -X POST repos/apjpkogawa/027_kids_shoe_game/pages -f build_type=legacy -f "source[branch]=master" -f "source[path]=/"
gh auth switch -u dev-aasha-inc
```

- [ ] **Step 4: Commit and push**

```bash
git add manifest.json README.md
git commit -m "chore: add manifest, readme and pages deploy"
git push
```

- [ ] **Step 5: Verify on tablet**

`https://apjpkogawa.github.io/027_kids_shoe_game/` をタブレットで開き、Task 7 Step 2 のチェックをドラッグ操作で再確認。ホーム画面に追加してフルスクリーンで起動すること。

---

## Self-Review

- **Spec coverage:** プロファイル選択 (T6)、ゲームと逆履き表示 (T7)、3 連続ミスのガイド (T7)、5 個ごと解放 (T2/T7)、図鑑 (T8)、親設定・上限・靴セット・全消去 (T6)、就寝終了 (T7)、日付リセット (T3)、文字なし (T1 の HTML は aria-label のみ)、写真を含めない (T1 の .gitignore)。半分絵のヒントは T4 の靴に含む。設計書の `unlocked: []` は `correct` から導出するため保存しない（意図的な簡略化）
- **Placeholder scan:** なし。写真起こしの靴セットは写真到着後の追加タスクとして README に手順を残した
- **Type consistency:** `app.show`, `app.save`, `app.profile`, `app.state` を T6 で定義し T7/T8 で同名で使用。`ITEMS[profile][i].svg`、`SHOE_SETS[id].left/right`、`CHARS[profile]` は T4 と一致
