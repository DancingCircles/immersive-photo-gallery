import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

void test('daily recommendation headline is shown on the homepage', () => {
  const source = readFileSync(
    new URL('../../../features/daily-edit/featured-home.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /<h1>DAILY RECOMMENDATION<\/h1>/);
});
