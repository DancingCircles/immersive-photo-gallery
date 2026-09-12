import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  virtualCellForOffset,
  catalogIndexForCell,
  catalogItemForIndex,
  shouldPrefetchCatalog,
  createBindingGeneration,
} from '../../../../features/gallery/scene/virtual-grid.ts';

const pool = { columns: 8, rows: 6 };

void test('wrapped meshes advance at their own horizontal and vertical boundaries', () => {
  assert.deepEqual(
    virtualCellForOffset({ row: 0, column: 0 }, { x: 8.2, y: 0 }, pool),
    { row: 0, column: -8 },
  );
  assert.deepEqual(
    virtualCellForOffset({ row: 0, column: 7 }, { x: 0.6, y: 0 }, pool),
    { row: 0, column: -1 },
  );
  assert.deepEqual(
    virtualCellForOffset({ row: 5, column: 0 }, { x: 0, y: 0.6 }, pool),
    { row: -1, column: 0 },
  );
  assert.deepEqual(
    virtualCellForOffset({ row: 0, column: 0 }, { x: -0.6, y: -0.6 }, pool),
    { row: 6, column: 8 },
  );
});

void test('logical cells retain stable catalog slots when direction reverses', () => {
  const origin = { row: 2, column: 3 };
  assert.equal(catalogIndexForCell(origin, pool), 19);
  assert.equal(catalogIndexForCell({ row: 2, column: -5 }, pool), 67);
  assert.equal(catalogIndexForCell({ row: -4, column: -5 }, pool), 67);
  assert.equal(catalogIndexForCell({ row: 14, column: 3 }, pool), 115);
  assert.equal(
    catalogIndexForCell(
      virtualCellForOffset(origin, { x: 0, y: 0 }, pool),
      pool,
    ),
    19,
  );
});

void test('prefetch starts at the last 12 loaded works and never for a completed catalog', () => {
  assert.equal(shouldPrefetchCatalog(35, 48, true), false);
  assert.equal(shouldPrefetchCatalog(36, 48, true), true);
  assert.equal(shouldPrefetchCatalog(96, 48, true), true);
  assert.equal(shouldPrefetchCatalog(47, 48, false), false);
  assert.equal(shouldPrefetchCatalog(0, 0, true), false);
});

void test('partial pages keep the full gallery populated while the next page loads', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((index) => catalogItemForIndex(['one', 'two'], index)),
    ['one', 'two', 'one', 'two', 'one'],
  );
  assert.equal(catalogItemForIndex([], 0), undefined);
});

void test('rebinding and releasing reject stale image completions', () => {
  const generation = createBindingGeneration();
  const first = generation.next();
  const second = generation.next();
  assert.equal(generation.isCurrent(first), false);
  assert.equal(generation.isCurrent(second), true);
  generation.next();
  assert.equal(generation.isCurrent(second), false);
});

void test('the scene updates items separately from its fixed renderer lifetime', () => {
  const scene = readFileSync(
    new URL('../../../../features/gallery/scene/gallery-scene.tsx', import.meta.url),
    'utf8',
  );
  assert.match(scene, /itemsRef\.current = items/);
  assert.match(scene, /applyItemsRef\.current\?\.\(items\)/);
  assert.match(scene, /renderer\.domElement\.remove\(\);\s*};\s*}, \[\]\)/);
  assert.match(scene, /cols = 8,\s*rows = 6/);
  assert.match(scene, /searchModeRef = useRef\(searchMode\)/);
  assert.match(scene, /searchModeRef\.current\s*\?\s*\{ columns: searchTileCount\(catalog\), rows: 1 \}/);
  assert.match(scene, /tile\.userData\.y = 0/);
  assert.equal((scene.match(/new THREE\.CanvasTexture/g) ?? []).length, 1);
});

void test('the scene caps its texture and render-loop work for a growing catalog', () => {
  const scene = readFileSync(
    new URL('../../../../features/gallery/scene/gallery-scene.tsx', import.meta.url),
    'utf8',
  );
  assert.match(scene, /CARD_CANVAS_SCALE = 0\.6/);
  assert.match(scene, /PIXEL_RATIO_CAP = 1\.25/);
  assert.match(scene, /if \(needsPicking\) raycaster\.setFromCamera/);
  assert.match(scene, /if \(alive && !raf\) raf = requestAnimationFrame\(frame\)/);
  assert.match(scene, /const frame = \(now: number\) => \{\s*raf = 0;/);
});

void test('gallery cards do not add a gray backdrop behind the source image', () => {
  const scene = readFileSync(
    new URL('../../../../features/gallery/scene/gallery-scene.tsx', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(scene, /palette\.mediaSurface/);
});
