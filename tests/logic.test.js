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
