import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

void test('third-party notice preserves the xylophone MIT attribution', () => {
  const notice = readFileSync(
    new URL('../THIRD_PARTY_NOTICES.md', import.meta.url),
    'utf8',
  );

  assert.match(notice, /Sujenphea\/xylophone/);
  assert.match(notice, /Copyright \(c\) 2009 - 2026 Codrops/);
  assert.match(notice, /MIT License/);
});
