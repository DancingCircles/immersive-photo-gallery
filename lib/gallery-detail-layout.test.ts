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

void test('closing has no exit animation and keeps one image layer throughout', () => {
  assert.doesNotMatch(galleryPage, /state\.phase !== 'closing'/);
  assert.doesNotMatch(galleryPage, /\.set\(detailImage,\s*{\s*opacity:\s*1\s*}\)/);
});

void test('detail image is compact, centered, and has no container background', () => {
  assert.match(
    stylesheet,
    /\.gallery-detail__media\s*{[^}]*width:\s*min\(58%,\s*320px\);[^}]*justify-self:\s*center;[^}]*background:\s*transparent;/,
  );
});
