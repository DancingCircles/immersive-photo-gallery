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
  assert.match(component, /Memories in Soft Light/);
  assert.match(component, /memories-in-soft-light\.mp3/);
  assert.match(component, /loop/);
});

void test('background music starts at fifty percent and exposes mute and volume controls', () => {
  assert.match(component, /DEFAULT_VOLUME = 0\.5/);
  assert.match(component, /DEFAULT_MUTED = true/);
  assert.match(component, /type="range"/);
  assert.match(component, /aria-pressed=\{muted\}/);
  assert.match(component, /localStorage/);
  assert.match(component, /if \(settings\.muted\) audio\.pause\(\)/);
  assert.doesNotMatch(component, /window\.addEventListener\('pointerdown'/);
});

void test('the background music asset is included in the public bundle', () => {
  assert.equal(
    existsSync(new URL('public/audio/memories-in-soft-light.mp3', root)),
    true,
  );
});
