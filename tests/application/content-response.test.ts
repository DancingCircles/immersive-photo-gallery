import assert from 'node:assert/strict';
import test from 'node:test';
import { ContentError } from '../../application/errors/content-error.ts';
import { dataResponse, errorResponse } from '../../application/http/content-response.ts';
import { GET as getGallery } from '../../app/api/content/gallery/route.ts';
import { parseGalleryRequest } from '../../app/api/content/gallery/route.ts';
import { GET as getDailyEdit } from '../../app/api/content/daily-edits/[date]/route.ts';
import { GET as getWork } from '../../app/api/content/works/[id]/route.ts';

void test('dataResponse wraps data in the standard envelope', async () => {
  const response = dataResponse({ answer: 42 }, { status: 201 });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { data: { answer: 42 } });
});

void test('errorResponse returns a safe standard error envelope', async () => {
  const response = errorResponse(new ContentError('WORK_NOT_FOUND', 'Work not found', {
    status: 404, requestId: 'request-1',
  }));
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: { code: 'WORK_NOT_FOUND', message: 'Work not found', requestId: 'request-1' },
  });
});

void test('errorResponse hides internal errors and uses a request id', async () => {
  const response = errorResponse(new Error('database password'));
  assert.equal(response.status, 500);
  const body = (await response.json()) as { error: { code: string; message: string; requestId: string } };
  assert.equal(body.error.code, 'CONTENT_INTERNAL_ERROR');
  assert.equal(body.error.message, 'Content request failed');
  assert.ok(body.error.requestId);
});

void test('errorResponse generates a request id for content errors without one', async () => {
  const response = errorResponse(new ContentError('INVALID_CURSOR', 'Invalid cursor', { status: 400 }));
  const body = (await response.json()) as { error: { requestId: string } };
  assert.equal(response.status, 400);
  assert.ok(body.error.requestId);
});

void test('gallery handler parses cursor, query, limit, and defaults to 48', async () => {
  const parsed = parseGalleryRequest(new Request(
    'https://gallery.test/api/content/gallery?query=%20street%20',
  ));
  assert.deepEqual(parsed, { cursor: undefined, limit: 48, query: ' street ' });

  const limited = await getGallery(new Request('https://gallery.test/api/content/gallery?limit=5'));
  const limitedBody = (await limited.json()) as {
    data: { items: Array<{ id: string }>; nextCursor: string | null };
  };
  assert.equal(limitedBody.data.items.length, 5);
  assert.ok(limitedBody.data.nextCursor);

  const next = await getGallery(new Request(
    `https://gallery.test/api/content/gallery?limit=5&cursor=${encodeURIComponent(limitedBody.data.nextCursor!)}`,
  ));
  const nextBody = (await next.json()) as { data: { items: Array<{ id: string }> } };
  assert.equal(nextBody.data.items.length, 5);
  assert.equal(new Set(nextBody.data.items.map((item) => item.id)).intersection(
    new Set(limitedBody.data.items.map((item) => item.id)),
  ).size, 0);

  const filtered = await getGallery(new Request('https://gallery.test/api/content/gallery?query=street'));
  const filteredBody = (await filtered.json()) as { data: { items: Array<{ category: string }> } };
  assert.equal(filteredBody.data.items.length, 4);
  assert.ok(filteredBody.data.items.every((item) => item.category.toLowerCase().includes('street')));
});

void test('daily edit and work handlers parse route parameters', async () => {
  const daily = await getDailyEdit(new Request('https://gallery.test'), { params: { date: '2026-09-08' } });
  const dailyBody = (await daily.json()) as { data: { date: string; works: unknown[] } };
  assert.equal(dailyBody.data.date, '2026-09-08');
  assert.equal(dailyBody.data.works.length, 12);

  const work = await getWork(new Request('https://gallery.test'), { params: { id: 'work%2D01' } });
  const workBody = (await work.json()) as { data: { id: string } };
  assert.equal(workBody.data.id, 'work-01');
});

void test('route handlers use the uniform error response', async () => {
  const response = await getWork(new Request('https://gallery.test'), { params: { id: 'missing' } });
  const body = (await response.json()) as { error: { code: string; requestId: string } };
  assert.equal(response.status, 404);
  assert.equal(body.error.code, 'WORK_NOT_FOUND');
  assert.ok(body.error.requestId);
});
