import assert from 'node:assert/strict';
import test from 'node:test';
import {
  galleryCardMediaRect,
  galleryDetailReducer,
  galleryFlightStartTransform,
  initialGalleryDetailState,
  firstVisibleRaycastHit,
  isGalleryTileExtracted,
  projectedCornersToScreenRect,
} from './gallery-detail.ts';

const selection = {
  projectId: 3,
  tileIndex: 11,
  sourceRect: { left: 100, top: 80, width: 240, height: 180 },
};

void test('gallery detail opens once and closes after entering a closing phase', () => {
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
  const closing = galleryDetailReducer(detail, { type: 'close' });
  assert.equal(closing.phase, 'closing');
  assert.deepEqual(closing.selection, selection);
  assert.deepEqual(
    galleryDetailReducer(closing, { type: 'closed' }),
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

void test('raycast selection skips cards hidden by search', () => {
  const hidden = { object: { visible: false }, id: 'hidden' };
  const visible = { object: { visible: true }, id: 'visible' };

  assert.equal(firstVisibleRaycastHit([hidden, visible]), visible);
  assert.equal(firstVisibleRaycastHit([hidden]), undefined);
});

void test('flight starts from the card using compositor-only transforms', () => {
  assert.deepEqual(
    galleryFlightStartTransform(
      { left: 100, top: 80, width: 200, height: 160 },
      { left: 460, top: 140, width: 300, height: 240 },
    ),
    { x: -360, y: -60, scaleX: 2 / 3, scaleY: 2 / 3 },
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
