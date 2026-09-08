import assert from 'node:assert/strict';
import test from 'node:test';
import { toFeaturedWork } from '../../../features/daily-edit/daily-edit-view-model.ts';
import type { WorkSummary } from '../../../domain/work/work.ts';

const summary: WorkSummary = {
  id: 'work-01',
  title: 'Untitled 01',
  photographerName: 'Photographer 01',
  publishedAt: '2026-01-01',
  category: 'portrait',
  thumbnail: {
    src: '/art/0.png',
    width: 1200,
    height: 800,
    alt: 'Untitled 01',
  },
};

void test('daily edit view model derives only presentation metadata', () => {
  assert.deepEqual(toFeaturedWork(summary, 0, 12), {
    ...summary,
    displayTitle: 'UNTITLED 01',
    categoryLabel: 'PORTRAIT',
    year: '2026',
    positionLabel: '01 / 12',
  });
});
