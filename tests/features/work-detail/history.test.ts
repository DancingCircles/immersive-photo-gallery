import test from 'node:test';
import assert from 'node:assert/strict';
import { workPath, workReturnTo, openWorkHistory, closeWorkHistory } from '../../../features/work-detail/work-detail-history.ts';

void test('work paths encode stable string ids', () => {
  assert.equal(workPath('work/a b'), '/works/work%2Fa%20b');
});

void test('history preserves the complete return URL and restores it', () => {
  let url = '/gallery?q=street#selected';
  const history = {
    state: { existing: true },
    pushState(state: unknown, _title: string, next: string) { this.state = state as typeof this.state; url = next; },
    replaceState(state: unknown, _title: string, next: string) { this.state = state as typeof this.state; url = next; },
  };
  openWorkHistory('work-1', url, history);
  assert.equal(url, '/works/work-1');
  assert.equal(workReturnTo(history.state), '/gallery?q=street#selected');
  closeWorkHistory(workReturnTo(history.state), history);
  assert.equal(url, '/gallery?q=street#selected');
  assert.equal(workReturnTo(null), '/gallery');
  assert.equal(workReturnTo({ returnTo: '//evil.test' }), '/gallery');
});
