import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../../../', import.meta.url);
const source = (path: string) => readFileSync(new URL(path, root), 'utf8');

void test('homepage introduces the pixel loading sequence before its content', () => {
  const home = source('features/daily-edit/featured-home.tsx');

  assert.match(home, /OpeningLoader/);
  assert.match(home, /<OpeningLoader\s*\/>/);
  assert.equal(
    existsSync(new URL('features/daily-edit/opening-loader.tsx', root)),
    true,
  );
});

void test('opening loader counts from zero to one hundred with a reduced-motion fallback', () => {
  const loader = source('features/daily-edit/opening-loader.tsx');

  assert.match(loader, /useState\(0\)/);
  assert.match(loader, /setProgress\(100\)/);
  assert.match(loader, /prefers-reduced-motion: reduce/);
  assert.match(loader, /createPixelPattern/);
  assert.match(loader, /Math\.random\(\)/);
  assert.match(loader, /useState<Pixel\[\]>\(\[\]\)/);
  assert.match(loader, /setPixels\(createPixelPattern\(\)\)/);
  assert.match(loader, /\{progress\}%/);
});

void test('opening loader uses irregular pink pixel clusters with a soft entrance and no leading runner', () => {
  const loader = source('features/daily-edit/opening-loader.tsx');
  const styles = source('styles/daily-edit.css');

  assert.match(loader, /#e3a0ad/);
  assert.match(loader, /#d794c7/);
  assert.doesNotMatch(loader, /opening-loader__trail/);
  assert.match(styles, /\.opening-loader\s*\{/);
  assert.match(styles, /background:\s*#fff/);
  assert.match(styles, /\.opening-loader__pixels\s*\{/);
  assert.match(styles, /grid-template-columns:\s*repeat\(24,/);
  assert.match(styles, /@keyframes opening-pixel-appear/);
  assert.match(styles, /animation:\s*opening-pixel-appear/);
  assert.doesNotMatch(styles, /\.opening-loader__trail/);
});
