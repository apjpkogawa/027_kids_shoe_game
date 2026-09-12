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
