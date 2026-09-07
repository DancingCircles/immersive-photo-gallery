import assert from 'node:assert/strict';
import test from 'node:test';
import { filterProjects, type Project } from './projects.ts';

const fixtures: Project[] = [
  {
    id: 1,
    title: 'Night Walk',
    photographer: 'Lin Chen',
    publishedAt: '2026-04-01',
    category: 'street',
    image: '/night.jpg',
  },
  {
    id: 2,
    title: 'Quiet Field',
    photographer: 'Mara Li',
    publishedAt: '2025-09-12',
    category: 'landscape',
    image: '/field.jpg',
  },
];

void test('an empty project search keeps every work visible', () => {
  assert.deepEqual(filterProjects(fixtures, '  '), fixtures);
});

void test('project search matches title, photographer, category, and year', () => {
  assert.deepEqual(
    filterProjects(fixtures, 'night').map(({ id }) => id),
    [1],
  );
  assert.deepEqual(
    filterProjects(fixtures, 'MARA').map(({ id }) => id),
    [2],
  );
  assert.deepEqual(
    filterProjects(fixtures, 'street').map(({ id }) => id),
    [1],
  );
  assert.deepEqual(
    filterProjects(fixtures, '2025').map(({ id }) => id),
    [2],
  );
});

void test('project search returns no works when nothing matches', () => {
  assert.deepEqual(filterProjects(fixtures, 'portrait'), []);
});
