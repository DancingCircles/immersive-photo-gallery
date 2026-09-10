import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../../../', import.meta.url);
const source = (path: string) => readFileSync(new URL(path, root), 'utf8');

void test('homepage keeps the xylophone canvas behind its scrollable work list', () => {
  const home = source('features/daily-edit/featured-home.tsx');

  assert.match(home, /XylophoneBackground/);
  assert.match(home, /featured-intro/);
  assert.match(home, /XylophoneSoundToggle/);
  assert.match(home, /<SiteNav current="featured">/);
  assert.match(home, /useState\(true\)/);
});

void test('xylophone background and user-controlled audio modules are present', () => {
  assert.equal(
    existsSync(new URL('features/daily-edit/xylophone-background.tsx', root)),
    true,
  );
  assert.equal(
    existsSync(new URL('features/daily-edit/xylophone-sound-toggle.tsx', root)),
    true,
  );
  assert.equal(
    existsSync(new URL('features/daily-edit/xylophone/xylophone-runtime.ts', root)),
    true,
  );
  assert.equal(
    existsSync(new URL('features/daily-edit/xylophone/reference/assets/models/xylophone-09.glb', root)),
    true,
  );
  assert.equal(
    existsSync(new URL('features/daily-edit/xylophone/reference/assets/audio/do.wav', root)),
    true,
  );
  assert.match(
    source('features/daily-edit/xylophone-sound-toggle.tsx'),
    /aria-pressed=\{enabled\}/,
  );
  assert.match(
    source('features/daily-edit/xylophone/xylophone-runtime.ts'),
    /FluidSim/,
  );
  assert.match(
    source('features/daily-edit/xylophone/xylophone-runtime.ts'),
    /FrostBackdropPass/,
  );
  assert.match(
    source('features/daily-edit/xylophone/reference/shaders/xylophoneBg/xylophoneBgFrag.glsl'),
    /vec3 color = vec3\(1\.0\);/,
  );
});

void test('background styles stay pale, fixed, and non-interactive', () => {
  const styles = source('styles/daily-edit.css');

  assert.match(styles, /\.xylophone-background\s*\{/);
  assert.match(styles, /pointer-events:\s*none/);
  assert.match(styles, /position:\s*fixed/);
  assert.match(styles, /\.featured-intro\s*\{/);
  assert.match(styles, /\.featured-home\s*{[^}]*background:\s*#fff;/);
  assert.match(styles, /\.site-nav \.xylophone-sound-toggle\s*\{/);
  assert.match(
    source('components/navigation/site-nav.tsx'),
    /children\?: ReactNode/,
  );
});
