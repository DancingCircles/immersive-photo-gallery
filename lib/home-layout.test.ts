import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const stylesheet = readFileSync(
  new URL('../app/globals.css', import.meta.url),
  'utf8',
);

void test('desktop featured heading uses viewport-aware spacing while mobile stays compact', () => {
  assert.match(
    stylesheet,
    /\.featured-header__heading\s*{[^}]*margin:\s*clamp\(260px,\s*32vh,\s*460px\)\s+0\s+36px;/,
  );
  assert.match(
    stylesheet,
    /@media \(max-width:\s*900px\)\s*{[\s\S]*?\.featured-header__heading\s*{[^}]*margin:\s*80px\s+0\s+28px;/,
  );
});
