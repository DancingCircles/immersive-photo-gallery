import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cameraDistanceForDrag,
  isDragGesture,
} from './interaction.ts';

void test('a press becomes a drag only after a small pointer threshold', () => {
  assert.equal(isDragGesture(0, 0, 2, 2), false);
  assert.equal(isDragGesture(0, 0, 4, 0), true);
});

void test('dragging pulls the camera back by a proportional, bounded amount', () => {
  assert.equal(cameraDistanceForDrag(7.2), 7.776);
  assert.equal(cameraDistanceForDrag(20), 20.65);
});
