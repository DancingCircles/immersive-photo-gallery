import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../../', import.meta.url);
const component = readFileSync(
  new URL('components/audio/background-music.tsx', root),
  'utf8',
);
const layout = readFileSync(new URL('app/layout.tsx', root), 'utf8');

void test('background music is mounted once at the root and keeps the requested track title', () => {
  assert.match(layout, /<BackgroundMusic \/>/);
  assert.match(component, /Carry Me Into the Light/);
  assert.match(component, /carry-me-into-the-light\.mp3/);
  assert.match(component, /loop/);
});

void test('background music starts at fifty percent and exposes mute and volume controls', () => {
  assert.match(component, /DEFAULT_VOLUME = 0\.5/);
  assert.match(component, /type="range"/);
  assert.match(component, /aria-pressed=\{muted\}/);
  assert.match(component, /localStorage/);
});

void test('the background music asset is included in the public bundle', () => {
  assert.equal(
    existsSync(new URL('public/audio/carry-me-into-the-light.mp3', root)),
    true,
  );
});
