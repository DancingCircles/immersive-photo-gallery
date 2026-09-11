import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('../../../features/daily-edit/smooth-scroll.tsx', import.meta.url),
  'utf8',
);
const featuredHomeSource = readFileSync(
  new URL('../../../features/daily-edit/featured-home.tsx', import.meta.url),
  'utf8',
);
const featuredDetailSource = readFileSync(
  new URL('../../../features/daily-edit/featured-detail.tsx', import.meta.url),
  'utf8',
);
const dailyEditStyles = readFileSync(
  new URL('../../../styles/daily-edit.css', import.meta.url),
  'utf8',
);

void test('daily edit smooth scrolling stays mounted while detail is open', () => {
  assert.match(source, /ReactLenis/);
  assert.doesNotMatch(source, /\.stop\(\)/);
  assert.doesNotMatch(source, /\.start\(\)/);
  assert.match(featuredDetailSource, /data-lenis-prevent/);
});

void test('detail overlay leaves the Lenis scroll container under Lenis control', () => {
  assert.doesNotMatch(featuredHomeSource, /scrollContainer\.style\.overflow/);
  assert.doesNotMatch(featuredHomeSource, /scrollContainer\.scrollTop/);
  assert.doesNotMatch(featuredHomeSource, /document\.body\.style\.overflow/);
});

void test('homepage detail uses the work title instead of a long photographer credit', () => {
  assert.match(featuredDetailSource, /const displayTitle/);
  assert.match(featuredDetailSource, /<h1>\{displayTitle\}<\/h1>/);
  assert.match(featuredDetailSource, /摄影师：\{work\.photographerName\}/);
  assert.match(
    dailyEditStyles,
    /\.featured-detail__copy h1\s*{[^}]*font-size:\s*clamp\(24px,\s*2\.5vw,\s*40px\);/,
  );
});
