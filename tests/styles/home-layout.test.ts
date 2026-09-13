import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const stylesheet = [
  readFileSync(new URL('../../styles/daily-edit.css', import.meta.url), 'utf8'),
  readFileSync(new URL('../../styles/responsive.css', import.meta.url), 'utf8'),
].join('\n');
const phoneRules = [
  ...stylesheet.matchAll(
    /@media \(max-width:\s*560px\)\s*{([\s\S]*?)}\s*@media/g,
  ),
].at(-1)?.[1];

void test('daily recommendation sits at the bottom of a viewport-height intro', () => {
  assert.match(
    stylesheet,
    /\.featured-intro\s*{[^}]*min-height:\s*calc\(100svh\s+-\s+140px\);/,
  );
  assert.match(
    stylesheet,
    /\.featured-header__heading\s*{[^}]*margin:\s*auto\s+0\s+36px;/,
  );
  assert.match(
    stylesheet,
    /@media \(max-width:\s*900px\)\s*{[\s\S]*?\.featured-header__heading\s*{[^}]*margin:\s*auto\s+0\s+28px;/,
  );
});

void test('featured cards crop thumbnails to their frame without white letterboxing', () => {
  assert.match(
    stylesheet,
    /\.featured-card__image img\s*{[^}]*object-fit:\s*cover;/,
  );
});

void test('phone layout keeps the recommendation heading fluid and cards single-column', () => {
  assert.ok(phoneRules);
  assert.match(
    phoneRules,
    /\.featured-header__heading h1\s*{[^}]*font-size:\s*clamp\(32px,\s*9\.5vw,\s*42px\);[^}]*overflow-wrap:\s*normal;/,
  );
  assert.match(
    phoneRules,
    /\.featured-grid\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/,
  );
});

void test('phone header preserves touch targets while hiding the wide volume slider', () => {
  assert.ok(phoneRules);
  assert.match(
    phoneRules,
    /\.background-music__volume\s*{[^}]*display:\s*none;/,
  );
  assert.match(
    phoneRules,
    /\.background-music__toggle\s*{[^}]*width:\s*44px;[^}]*height:\s*44px;/,
  );
});
