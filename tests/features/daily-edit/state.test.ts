import assert from 'node:assert/strict';
import test from 'node:test';
import { featuredReducer, initialFeaturedState } from '../../../features/daily-edit/state/featured-state.ts';

void test('featured transition follows the four approved phases', () => {
  const leaving = featuredReducer(initialFeaturedState, { type: 'select', workId: 3 });
  const revealing = featuredReducer(leaving, { type: 'grid-left' });
  const detail = featuredReducer(revealing, { type: 'detail-ready' });
  assert.deepEqual([leaving.phase, revealing.phase, detail.phase], [
    'leaving-grid', 'revealing-detail', 'detail',
  ]);
  assert.deepEqual(featuredReducer(detail, { type: 'close' }), initialFeaturedState);
});

void test('a second selection is ignored while a transition is active', () => {
  const leaving = featuredReducer(initialFeaturedState, { type: 'select', workId: 3 });
  assert.strictEqual(featuredReducer(leaving, { type: 'select', workId: 4 }), leaving);
});
