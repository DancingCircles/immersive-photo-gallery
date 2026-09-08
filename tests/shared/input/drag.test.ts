import assert from 'node:assert/strict';
import test from 'node:test';
import {
  chairYawAfterDrag,
  cameraDistanceForDrag,
  isDragGesture,
} from '../../../shared/input/drag.ts';

void test('a press becomes a drag only after a small pointer threshold', () => {
  assert.equal(isDragGesture(0, 0, 2, 2), false);
  assert.equal(isDragGesture(0, 0, 4, 0), true);
});

void test('dragging pulls the camera back by a proportional, bounded amount', () => {
  assert.equal(cameraDistanceForDrag(7.2), 7.776);
  assert.equal(cameraDistanceForDrag(20), 20.65);
});

void test('chair rotation accumulates beyond one full turn', () => {
  const firstTurn = chairYawAfterDrag(0, 300);
  const secondTurn = chairYawAfterDrag(firstTurn, 300);

  assert.ok(secondTurn > Math.PI * 2);
});
