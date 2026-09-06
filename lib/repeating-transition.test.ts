import assert from 'node:assert/strict';
import test from 'node:test';
import * as transition from './repeating-transition.ts';

const source = { left: 40, top: 80, width: 200, height: 140 };
const target = { left: 700, top: 60, width: 500, height: 700 };

void test('detail image lands opposite the clicked half, including source midpoint rule', () => {
  assert.equal(transition.getDetailImageSide(200, 1200), 'right');
  assert.equal(transition.getDetailImageSide(900, 1200), 'left');
  assert.equal(transition.getDetailImageSide(600, 1200), 'left');
});

void test('six stationary intermediate rectangles exclude endpoints and interpolate centers and sizes', () => {
  const path = transition.generateMotionPath(source, target, 6);
  assert.equal(path.length, 6);
  path.forEach((rect, index) => {
    const t = (index + 1) / 7;
    assert.notDeepEqual(rect, source);
    assert.notDeepEqual(rect, target);
    assert.equal(rect.width, source.width + (target.width - source.width) * t);
    assert.equal(
      rect.height,
      source.height + (target.height - source.height) * t,
    );
    assert.equal(rect.left + rect.width / 2, 140 + (950 - 140) * t);
    assert.equal(rect.top + rect.height / 2, 150 + (410 - 150) * t);
  });
  assert.deepEqual(transition.generateMotionPath(source, target, 0), []);
  assert.deepEqual(transition.generateMotionPath(source, source, 1), [source]);
});

void test('all four clip-path triplets match source entry and exit directions', () => {
  const reveal = 'inset(0% 0% 0% 0%)';
  assert.deepEqual(transition.getClipPathsForDirection('top-bottom'), {
    from: 'inset(100% 0% 0% 0%)',
    reveal,
    hide: 'inset(0% 0% 100% 0%)',
  });
  assert.deepEqual(transition.getClipPathsForDirection('bottom-top'), {
    from: 'inset(0% 0% 100% 0%)',
    reveal,
    hide: 'inset(100% 0% 0% 0%)',
  });
  assert.deepEqual(transition.getClipPathsForDirection('left-right'), {
    from: 'inset(0% 100% 0% 0%)',
    reveal,
    hide: 'inset(0% 0% 0% 100%)',
  });
  assert.deepEqual(transition.getClipPathsForDirection('right-left'), {
    from: 'inset(0% 0% 0% 100%)',
    reveal,
    hide: 'inset(0% 100% 0% 0%)',
  });
});

void test('grid delays use two-dimensional center distance normalized to 0.3 seconds', () => {
  const base = { left: 0, top: 0, width: 20, height: 20 };
  const horizontal = { ...base, left: 30 };
  const vertical = { ...base, top: 40 };
  const diagonal = { ...base, left: 30, top: 40 };
  assert.deepEqual(
    transition.computeStaggerDelays(base, [
      diagonal,
      base,
      vertical,
      horizontal,
    ]),
    [0.3, 0, 0.24, 0.18],
  );
  assert.deepEqual(transition.computeStaggerDelays(base, [base, base]), [0, 0]);
  assert.deepEqual(transition.computeStaggerDelays(base, []), []);
  assert.deepEqual(
    transition.computeStaggerDelays(base, [
      { left: -10, top: -10, width: 40, height: 40 },
    ]),
    [0],
  );
});
