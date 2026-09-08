import assert from 'node:assert/strict';
import test from 'node:test';
import { ContentError } from '../../application/errors/content-error.ts';
import { getWork } from '../../infrastructure/http/same-origin-content-client.ts';

void test('content errors keep a stable code and optional request id', () => {
  const error = new ContentError('WORK_NOT_FOUND', 'Work not found', {
    requestId: 'request-1',
    status: 404,
  });
  assert.equal(error.code, 'WORK_NOT_FOUND');
  assert.equal(error.status, 404);
  assert.equal(error.requestId, 'request-1');
});

void test('same-origin work client reads the standard detail envelope', async () => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (input) => {
    requests.push(input instanceof URL ? input.href : input instanceof Request ? input.url : input);
    return Response.json({
      data: {
        id: 'work-01',
        title: 'Untitled 01',
        photographerName: 'Photographer 01',
        publishedAt: '2026-01-01',
        category: 'portrait',
        thumbnail: { src: '/art/work.jpg', width: 1200, height: 900, alt: 'Work' },
        image: { src: '/art/work.jpg', width: 1200, height: 900, alt: 'Work' },
        attribution: {
          sourceUrl: 'https://example.test/work-01',
          licenseName: 'Licensed',
          creditLine: 'Photographer 01',
        },
      },
    });
  };
  try {
    const work = await getWork('work/a b');
    assert.equal(work.id, 'work-01');
    assert.deepEqual(requests, ['/api/content/works/work%2Fa%20b']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
