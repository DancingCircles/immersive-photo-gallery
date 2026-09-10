import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const stylesheet = [
  readFileSync(new URL('../../styles/daily-edit.css', import.meta.url), 'utf8'),
  readFileSync(new URL('../../styles/responsive.css', import.meta.url), 'utf8'),
].join('\n');

void test('daily recommendation sits at the bottom of a viewport-height intro', () => {
  assert.match(stylesheet, /\.featured-intro\s*{[^}]*min-height:\s*calc\(100svh\s+-\s+140px\);/);
  assert.match(stylesheet, /\.featured-header__heading\s*{[^}]*margin:\s*auto\s+0\s+36px;/);
  assert.match(stylesheet, /@media \(max-width:\s*900px\)\s*{[\s\S]*?\.featured-header__heading\s*{[^}]*margin:\s*auto\s+0\s+28px;/);
});
