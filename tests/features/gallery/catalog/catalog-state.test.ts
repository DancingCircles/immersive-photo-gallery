import assert from 'node:assert/strict';
import test from 'node:test';
import type { CursorPage } from '../../../../application/ports/content-repository.ts';
import type { WorkSummary } from '../../../../domain/work/work.ts';
import {
  createGalleryCatalogState,
  galleryCatalogReducer,
} from '../../../../features/gallery/catalog/catalog-state.ts';

const work = (id: string): WorkSummary => ({
  id,
  title: `Work ${id}`,
  photographerName: 'Photographer',
  publishedAt: '2026-09-08',
  category: 'Portrait',
  thumbnail: { src: `/images/${id}.jpg`, width: 800, height: 1000, alt: id },
});

const page = (ids: string[], hasMore = false): CursorPage<WorkSummary> => ({
  items: ids.map(work),
  nextCursor: hasMore ? 'next' : null,
  hasMore,
});

void test('appending a page de-duplicates works by id', () => {
  const initial = createGalleryCatalogState(page(['one', 'two'], true));
  const loading = galleryCatalogReducer(initial, { type: 'more-started', requestId: 1 });
  const result = galleryCatalogReducer(loading, {
    type: 'more-succeeded',
    requestId: 1,
    page: page(['two', 'three']),
  });
  assert.deepEqual(result.items.map(({ id }) => id), ['one', 'two', 'three']);
});

void test('a new search replaces the current directory', () => {
  const initial = createGalleryCatalogState(page(['one', 'two'], true));
  const searching = galleryCatalogReducer(initial, {
    type: 'search-started',
    requestId: 1,
    query: 'new',
  });
  const result = galleryCatalogReducer(searching, {
    type: 'search-succeeded',
    requestId: 1,
    page: page(['three']),
  });
  assert.deepEqual(result.items.map(({ id }) => id), ['three']);
  assert.equal(result.query, 'new');
});

void test('stale search results cannot replace a newer query', () => {
  const initial = createGalleryCatalogState(page(['one']));
  const searching = galleryCatalogReducer(initial, {
    type: 'search-started',
    requestId: 2,
    query: 'new',
  });
  const stale = galleryCatalogReducer(searching, {
    type: 'search-succeeded',
    requestId: 1,
    page: page(['two']),
  });
  assert.equal(stale, searching);
});

void test('a failed next page keeps existing works available', () => {
  const initial = createGalleryCatalogState(page(['one', 'two'], true));
  const loading = galleryCatalogReducer(initial, { type: 'more-started', requestId: 1 });
  const result = galleryCatalogReducer(loading, {
    type: 'more-failed',
    requestId: 1,
    error: new Error('offline'),
  });
  assert.deepEqual(result.items.map(({ id }) => id), ['one', 'two']);
  assert.equal(result.status, 'load-more-error');
});

void test('clearing a search restores the initial directory', () => {
  const initialPage = page(['one', 'two'], true);
  const searched = galleryCatalogReducer(
    galleryCatalogReducer(createGalleryCatalogState(initialPage), {
      type: 'search-started',
      requestId: 1,
      query: 'new',
    }),
    { type: 'search-succeeded', requestId: 1, page: page(['three']) },
  );
  const restored = galleryCatalogReducer(searched, {
    type: 'initial-restored',
    requestId: 2,
    page: initialPage,
  });
  assert.deepEqual(restored.items.map(({ id }) => id), ['one', 'two']);
  assert.equal(restored.query, '');
});
