import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styles = (path: string) =>
  readFileSync(new URL(`../../styles/${path}`, import.meta.url), 'utf8');

const stylesheet = [
  styles('foundation.css'),
  styles('shell.css'),
  styles('daily-edit.css'),
  styles('errors.css'),
].join('\n');

void test('the global typography system uses Fontshare display and UI families', () => {
  assert.match(stylesheet, /api\.fontshare\.com\/v2\/css/);
  assert.match(stylesheet, /--font-display:\s*['"]Cabinet Grotesk['"]/);
  assert.match(stylesheet, /--font-ui:\s*['"]Satoshi['"]/);
  assert.match(stylesheet, /font-family:\s*var\(--font-ui\)/);
  assert.match(stylesheet, /font-family:\s*var\(--font-display\)/);
});

void test('the daily recommendation wordmark keeps its original Arial treatment', () => {
  assert.match(
    styles('daily-edit.css'),
    /\.featured-header__heading h1\s*{[^}]*font-family:\s*Arial, Helvetica, sans-serif;/,
  );
});
