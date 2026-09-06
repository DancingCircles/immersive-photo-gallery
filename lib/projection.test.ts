import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GRID_CELL_HEIGHT,
  GRID_CELL_WIDTH,
  GALLERY_BASE_SCALE,
  cameraDistanceForAspect,
  distortionForViewport,
  projectGalleryUv,
} from './projection.ts';

void test('camera framing is pulled back on a 16:9 screen', () => {
  assert.ok(Math.abs(cameraDistanceForAspect(16 / 9) - 7.2) < 1e-9);
});

void test('grid cells use a landscape-oriented aspect ratio', () => {
  assert.ok(GRID_CELL_WIDTH > GRID_CELL_HEIGHT);
  assert.equal(GRID_CELL_WIDTH / GRID_CELL_HEIGHT, 2.5 / 2.35);
});

void test('flat mode removes radial distortion but keeps the gallery framing', () => {
  assert.equal(distortionForViewport('flat', 16 / 9), 0);
  assert.deepEqual(projectGalleryUv(0.5, -0.25, 0), [
    0.5 * GALLERY_BASE_SCALE,
    -0.25 * GALLERY_BASE_SCALE,
  ]);
});

void test('space mode applies the configured desktop distortion coefficient', () => {
  assert.equal(distortionForViewport('space', 16 / 9), -0.07 * (16 / 9));
});

void test('gallery distortion stays within the readability threshold', () => {
  const x = 1;
  const y = 1;
  const distortion = distortionForViewport('space', 16 / 9);
  const [mappedX] = projectGalleryUv(x, y, distortion);
  const previousMappedX = x * (1 - 0.24 * (x * x + y * y));

  assert.ok(mappedX > previousMappedX);
});
