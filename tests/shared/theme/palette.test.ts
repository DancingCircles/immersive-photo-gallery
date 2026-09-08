import assert from 'node:assert/strict';
import test from 'node:test';
import { getThemePalette } from '../../../shared/theme/palette.ts';

void test('day and night palettes invert the surface and text contrast', () => {
  const day = getThemePalette('light');
  const night = getThemePalette('dark');

  assert.equal(day.surface, '#ffffff');
  assert.equal(day.text, '#080808');
  assert.equal(day.mediaSurface, '#f2f2f2');
  assert.equal(day.pill, '#d8d8d8');
  assert.equal(day.hoverBorder, day.border);
  assert.equal(night.surface, '#050505');
  assert.equal(night.text, '#f1f1ed');
});

void test('each theme gives cards a visible border and metadata pill', () => {
  for (const theme of ['light', 'dark'] as const) {
    const palette = getThemePalette(theme);
    assert.notEqual(palette.border, palette.surface);
    assert.notEqual(palette.pill, palette.surface);
  }
});
