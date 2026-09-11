import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const stylesheet = [
  readFileSync(
    new URL('../../../../styles/shell.css', import.meta.url),
    'utf8',
  ),
  readFileSync(
    new URL('../../../../styles/responsive.css', import.meta.url),
    'utf8',
  ),
].join('\n');
const galleryPage = readFileSync(
  new URL('../../../../features/gallery/gallery-client.tsx', import.meta.url),
  'utf8',
);
const detailPage = readFileSync(
  new URL(
    '../../../../features/gallery/detail/gallery-detail.tsx',
    import.meta.url,
  ),
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

void test('closing restores the source card early', () => {
  assert.match(galleryPage, /state\.phase !== 'closing'/);
  assert.match(galleryPage, /dispatch\(\{ type: 'closed' \}\)/);
  assert.match(galleryPage, /state\.phase === 'closing'\s*\? null/);
  assert.doesNotMatch(galleryPage, /\.to\(\s*flightRef\.current/);
});

void test('detail image keeps its original aspect ratio in the upper area', () => {
  assert.match(
    stylesheet,
    /\.gallery-detail__media\s*{[^}]*width:\s*100%;[^}]*max-width:\s*100%;[^}]*height:\s*auto;[^}]*flex:\s*0\s+0\s+auto;[^}]*align-self:\s*center;[^}]*background:\s*transparent;/,
  );
  assert.match(
    stylesheet,
    /\.gallery-detail__media-frame img\s*{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*contain;[^}]*object-position:\s*center;/,
  );
  assert.match(
    detailPage,
    /aspectRatio:\s*`\$\{work\.thumbnail\.width\} \/ \$\{work\.thumbnail\.height\}`/,
  );
});

void test('gallery details scroll inside the presentation panel after the image', () => {
  assert.match(
    stylesheet,
    /\.gallery-detail__body\s*{[^}]*overflow-y:\s*auto;/,
  );
});

void test('detail headings stay at a readable editorial scale', () => {
  assert.match(
    stylesheet,
    /\.gallery-detail__copy h1\s*{[^}]*font-size:\s*clamp\(24px,\s*2\.25vw,\s*40px\);/,
  );
  assert.match(
    stylesheet,
    /\.work-detail-page__article > h1\s*{[^}]*font:\s*500 clamp\(22px,\s*2\.5vw,\s*32px\) \/ 1\.1/,
  );
});

void test('opening uses a compositor frame while the complete image fades in', () => {
  assert.match(
    galleryPage,
    /\.to\(\s*flight,\s*{\s*x:\s*0,\s*y:\s*0,\s*scaleX:\s*1,\s*scaleY:\s*1,/,
  );
  assert.match(galleryPage, /className="gallery-flight-frame"/);
  assert.match(
    galleryPage,
    /\.to\(\s*detailImage,\s*{\s*opacity: 1,\s*scale: 1,/,
  );
  assert.match(
    stylesheet,
    /\.gallery-flight-frame\s*{[^}]*border:\s*1px solid #171717;/,
  );
  assert.match(galleryPage, /\.set\(flight, \{ display: 'none' \}\)/);
});
