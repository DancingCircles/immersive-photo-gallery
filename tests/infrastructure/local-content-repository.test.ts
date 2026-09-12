import assert from 'node:assert/strict';
import test from 'node:test';
import { ContentError } from '../../application/errors/content-error.ts';
import { getDailyEdit } from '../../application/queries/get-daily-edit.ts';
import { getEditorialDate } from '../../application/queries/get-editorial-date.ts';
import { getWork } from '../../application/queries/get-work.ts';
import { listWorks } from '../../application/queries/list-works.ts';
import type { ContentRepository } from '../../application/ports/content-repository.ts';
import { localContentRepository } from '../../infrastructure/local/local-content-repository.ts';

void test('local repository uses stable string ids and paginates with an opaque cursor', async () => {
  const first = await localContentRepository.listWorks({ limit: 5 });
  const second = await localContentRepository.listWorks({
    limit: 5,
    cursor: first.nextCursor ?? undefined,
  });
  assert.equal(first.items.length, 5);
  assert.equal(second.items.length, 5);
  assert.equal(first.items[0].id, 'work-3f002a09-3fd2-455e-8db0-95c1c8cff716');
  assert.notEqual(first.items[0].id, second.items[0].id);
  assert.match(first.nextCursor ?? '', /^offset:/);
});

void test('empty queries return the complete first page', async () => {
  const result = await listWorks(localContentRepository, { limit: 3, query: '   ' });
  assert.equal(result.items.length, 3);
  assert.equal(result.items[0].id, 'work-3f002a09-3fd2-455e-8db0-95c1c8cff716');
});

void test('search is case insensitive across metadata, all tags, and year', async () => {
  for (const query of ['WILDLIFE-PHOTOGRAPHY-IN-KERALA', 'priyaariyani1982', '猛禽', '自然光', '2026']) {
    const result = await localContentRepository.listWorks({ limit: 60, query });
    assert.ok(result.items.length > 0, query);
  }
});

void test('unknown ids raise WORK_NOT_FOUND', async () => {
  await assert.rejects(() => getWork(localContentRepository, 'missing'), (error: unknown) =>
    error instanceof ContentError && error.code === 'WORK_NOT_FOUND',
  );
});

void test('daily edit contains exactly twelve summary works', async () => {
  const edit = await getDailyEdit(localContentRepository, '2026-09-08');
  assert.equal(edit.date, '2026-09-08');
  assert.equal(edit.works.length, 12);
  assert.deepEqual(edit.works.map((work) => work.id), [
    'work-2d3b78b1-afb9-48f9-8a97-a036514b30c2',
    'work-478174b9-175a-4fe7-bd72-acf5aedd7e4d',
    'work-a746ba31-e147-4080-b554-ad86eb6ea9bf',
    'work-6adb628d-d6ba-455f-8b53-827787041266',
    'work-c7ef5f0e-eb2c-4a9c-9f1a-53ea3b68141a',
    'work-df46432c-a11b-4e9f-9129-97b51bc242df',
    'work-aa06bfa3-728c-4a8c-b749-0aaf77c8cc96',
    'work-baa7432e-6609-45c9-b88f-0f8301707255',
    'work-ece66b30-a867-4c5a-a36a-262260b44272',
    'work-852ba582-c184-4b28-94ab-2973a990c618',
    'work-dade41a4-559e-4b5b-8030-5352f97f76dc',
    'work-f31988b5-8098-49ea-bb8f-faadf68cbffb',
  ]);
  for (const work of edit.works) {
    assert.ok(!('image' in work));
    assert.ok(!('artistStatement' in work));
    assert.ok(!('editorialNote' in work));
    assert.ok(!('aiAnalysis' in work));
    assert.ok(!('attribution' in work));
  }
});

void test('editorial date uses the requested timezone', () => {
  const now = new Date('2026-01-01T16:30:00.000Z');
  assert.equal(getEditorialDate(now, 'Asia/Shanghai'), '2026-01-02');
});

void test('repository rejects malformed and out of range cursors and normalizes limits', async () => {
  await assert.rejects(
    () => localContentRepository.listWorks({ limit: 5, cursor: 'not-a-cursor' }),
    (error: unknown) => error instanceof ContentError && error.code === 'INVALID_CURSOR',
  );
  for (const cursor of ['offset:999', 'offset:999999999999999999999999', 'offset:20']) {
    await assert.rejects(
      () => localContentRepository.listWorks({ limit: 5, cursor }),
      (error: unknown) => error instanceof ContentError && error.code === 'INVALID_CURSOR',
    );
  }
  const result = await localContentRepository.listWorks({ limit: 0 });
  assert.equal(result.items.length, 1);
});

void test('list query clamps limits and defaults non-finite limits', async () => {
  const received: number[] = [];
  const repository: ContentRepository = {
    async listWorks(input) {
      received.push(input.limit);
      return { items: [], nextCursor: null, hasMore: false };
    },
    async getWork() {
      throw new Error('unused');
    },
    async getDailyEdit() {
      throw new Error('unused');
    },
  };
  await listWorks(repository, { limit: 61 });
  await listWorks(repository, { limit: Number.NaN });
  assert.deepEqual(received, [60, 1]);
});
