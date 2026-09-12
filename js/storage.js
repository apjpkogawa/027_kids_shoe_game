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
