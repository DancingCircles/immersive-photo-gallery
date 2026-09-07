import assert from 'node:assert/strict';
import test from 'node:test';
import {
  galleryFlightTransform,
  galleryCardMediaRect,
  galleryDetailReducer,
  initialGalleryDetailState,
  isGalleryTileExtracted,
  projectedCornersToScreenRect,
} from './gallery-detail.ts';

const selection = {
  projectId: 3,
  tileIndex: 11,
  sourceRect: { left: 100, top: 80, width: 240, height: 180 },
};

void test('gallery detail opens once and closes immediately', () => {
  const opening = galleryDetailReducer(initialGalleryDetailState, {
    type: 'select',
    selection,
  });
  assert.deepEqual(opening, { phase: 'opening', selection });
  assert.equal(
    galleryDetailReducer(opening, { type: 'select', selection }),
    opening,
  );

  const detail = galleryDetailReducer(opening, { type: 'opened' });
  assert.equal(detail.phase, 'detail');
  assert.deepEqual(
    galleryDetailReducer(detail, { type: 'close' }),
    initialGalleryDetailState,
  );
});

void test('flight image starts inside the media region of the WebGL card', () => {
  assert.deepEqual(
    galleryCardMediaRect({ left: 100, top: 50, width: 640, height: 740 }),
    { left: 190, top: 168, width: 460, height: 480 },
  );
});

void test('only the selected repeated tile gives up its image', () => {
  assert.equal(isGalleryTileExtracted(11, 11), true);
  assert.equal(isGalleryTileExtracted(3, 11), false);
  assert.equal(isGalleryTileExtracted(11, null), false);
});

void test('flight uses a compositor transform between source and destination', () => {
  assert.deepEqual(
    galleryFlightTransform(
      { left: 100, top: 80, width: 200, height: 160 },
      { left: 460, top: 140, width: 300, height: 240 },
    ),
    { x: 360, y: 60, scaleX: 1.5, scaleY: 1.5 },
  );
});

void test('projected mesh corners are converted through gallery distortion', () => {
  const rect = projectedCornersToScreenRect(
    [
      [-0.44, 0.33],
      [0.44, 0.33],
      [0.44, -0.33],
      [-0.44, -0.33],
    ],
    { width: 1000, height: 800 },
    0,
  );

  assert.deepEqual(rect, {
    left: 250,
    top: 250,
    width: 500,
    height: 300,
  });
});
