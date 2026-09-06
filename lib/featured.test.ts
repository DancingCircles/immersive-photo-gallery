import assert from 'node:assert/strict';
import test from 'node:test';
import { featuredWorks, formatFeaturedWork } from './featured.ts';
import { projects } from './projects.ts';

void test('featured homepage contains the first twelve gallery works', () => {
  assert.equal(featuredWorks.length, 12);
  assert.deepEqual(featuredWorks.map(({ id }) => id), projects.slice(0, 12).map(({ id }) => id));
});

void test('featured metadata is compact and derived from the gallery record', () => {
  assert.deepEqual(formatFeaturedWork(projects[0], 0, 12), {
    ...projects[0],
    displayTitle: 'UNTITLED 01',
    categoryLabel: 'PORTRAIT',
    year: '2026',
    positionLabel: '01 / 12',
  });
});

void test('featured works use only local art assets', () => {
  for (const work of featuredWorks) assert.match(work.image, /^\/art\/\d+\.(png|jpg)$/);
});
