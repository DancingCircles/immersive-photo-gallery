import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const stylesheet = readFileSync(
  new URL('../app/globals.css', import.meta.url),
  'utf8',
);
const galleryPage = readFileSync(
  new URL('../app/gallery/page.tsx', import.meta.url),
  'utf8',
);

void test('detail panel stays on the right half outside phone layouts', () => {
  assert.match(
    stylesheet,
    /\.gallery-detail\s*{[^}]*right:\s*0;[^}]*left:\s*auto;[^}]*width:\s*50vw;/,
  );
  const tabletRules = stylesheet.match(
    /@media \(max-width:\s*900px\)\s*{([\s\S]*?)}\s*@media/,
  )?.[1];
  assert.ok(tabletRules);
  assert.doesNotMatch(tabletRules, /\.gallery-detail\s*{[^}]*width:\s*100vw;/);
});

void test('closing leaves the flight image at rest and restores the source card early', () => {
  assert.match(galleryPage, /state\.phase !== 'closing'/);
  assert.match(galleryPage, /dispatch\(\{ type: 'closed' \}\)/);
  assert.match(galleryPage, /state\.phase === 'closing'\s*\? null/);
  assert.doesNotMatch(galleryPage, /\.to\(\s*flightRef\.current/);
});

void test('detail image is compact, centered, and has no container background', () => {
  assert.match(
    stylesheet,
    /\.gallery-detail__media\s*{[^}]*width:\s*min\(58%,\s*320px\);[^}]*justify-self:\s*center;[^}]*background:\s*transparent;/,
  );
});

void test('opening uses compositor transforms and swaps to the real image at rest', () => {
  assert.match(
    galleryPage,
    /\.to\(\s*flight,\s*{\s*x:\s*0,\s*y:\s*0,\s*scaleX:\s*1,\s*scaleY:\s*1,/,
  );
  assert.match(galleryPage, /\.set\(detailImage, \{ opacity: 1 \}\)/);
  assert.match(galleryPage, /\.set\(flight, \{ display: 'none' \}\)/);
});
