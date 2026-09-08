import assert from 'node:assert/strict';
import test from 'node:test';
import { toGalleryCard } from '../../../../features/gallery/catalog/card-view-model.ts';
import type { WorkSummary } from '../../../../domain/work/work.ts';

void test('gallery card maps a work thumbnail into the scene image source', () => {
  const work: WorkSummary = {
    id: 'work-04',
    title: 'Untitled 04',
    photographerName: 'Photographer 04',
    publishedAt: '2026-04-01',
    category: 'documentary',
    thumbnail: { src: '/art/3.jpg', width: 1200, height: 800, alt: 'Untitled 04' },
  };

  assert.deepEqual(toGalleryCard(work, 3), {
    ...work,
    directoryPosition: 4,
    sceneImageSrc: '/art/3.jpg',
  });
});
