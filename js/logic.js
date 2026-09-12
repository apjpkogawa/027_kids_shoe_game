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
