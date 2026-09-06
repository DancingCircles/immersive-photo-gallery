import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createMoverKeyframes,
  createRepeatingSteps,
  getDetailImageSide,
  getTransitionTotalMs,
  type RectSnapshot,
} from './repeating-transition.ts';

const source: RectSnapshot = { left: 40, top: 80, width: 200, height: 140 };
const target: RectSnapshot = { left: 700, top: 60, width: 500, height: 700 };

void test('detail image lands opposite the clicked half of the viewport', () => {
  assert.equal(getDetailImageSide(200, 1200), 'right');
  assert.equal(getDetailImageSide(900, 1200), 'left');
});

void test('repeating steps preserve exact source and target geometry', () => {
  const steps = createRepeatingSteps(source, target);
  assert.equal(steps.length, 6);
  assert.deepEqual(steps[0].from, source);
  assert.deepEqual(steps.at(-1)?.to, target);
  assert.deepEqual(steps.map(({ delay }) => delay), [0, 50, 100, 150, 200, 250]);
});

void test('transition duration includes the last stagger and reveal pause', () => {
  assert.equal(getTransitionTotalMs(), 740);
});

void test('mover keyframes use fixed pixel geometry without rotation', () => {
  const [first, , last] = createMoverKeyframes(createRepeatingSteps(source, target)[0]);
  assert.deepEqual(first, {
    left: '40px', top: '80px', width: '200px', height: '140px',
    opacity: 0, clipPath: 'inset(18% 18% 18% 18%)', offset: 0,
  });
  assert.equal(last.left, '700px');
  assert.equal(last.top, '60px');
  assert.equal(last.transform, undefined);
});
