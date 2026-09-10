import assert from 'node:assert/strict';
import test from 'node:test';
import { ContentError } from '../../application/errors/content-error.ts';
import { createHttpContentRepository } from '../../infrastructure/http/http-content-repository.ts';
import { getContentRepository } from '../../infrastructure/config/content-source.ts';

const image = { src: '/art/work.jpg', width: 1200, height: 900, alt: 'Work' };
const summary = {
  id: 'work-01',
  title: 'Untitled 01',
  photographerName: 'Photographer 01',
  publishedAt: '2026-01-01',
  category: 'portrait',
  thumbnail: image,
};
const detail = {
  ...summary,
  image,
  attribution: {
    sourceUrl: 'https://example.test/work-01',
    licenseName: 'Private development placeholder',
    creditLine: 'Photographer 01',
  },
};

void test('HTTP repository sends Go API query parameters', async () => {
  const urls: string[] = [];
  const repository = createHttpContentRepository({
    baseUrl: 'https://api.example.test/root/',
    fetchImpl: async (input) => {
      urls.push(
        input instanceof URL
          ? input.href
          : input instanceof Request
            ? input.url
            : input,
      );
      return Response.json({
        data: { items: [summary], nextCursor: 'offset:1', hasMore: true },
      });
    },
  });
  const page = await repository.listWorks({
    limit: 12,
    cursor: 'offset:1',
    query: ' street ',
  });
  assert.equal(page.items[0].id, 'work-01');
  assert.equal(
    urls[0],
    'https://api.example.test/root/v1/works?limit=12&cursor=offset%3A1&query=street',
  );
});

void test('HTTP repository resolves relative image URLs against the Go API origin', async () => {
  const repository = createHttpContentRepository({
    baseUrl: 'https://api.example.test/root/',
    fetchImpl: async () =>
      Response.json({
        data: {
          items: [
            {
              id: 'work-01',
              title: 'Untitled 01',
              image: {
                url: '/v1/works/work-01/image',
                width: 1200,
                height: 900,
                format: 'webp',
              },
              photographer: 'Photographer 01',
              publishedAt: '2026-01-01T00:00:00Z',
              analysis: { tags: ['portrait'] },
            },
          ],
        },
      }),
  });

  const page = await repository.listWorks({ limit: 48 });

  assert.equal(
    page.items[0].thumbnail.src,
    'https://api.example.test/v1/works/work-01/image',
  );
});

void test('HTTP repository maps non 2xx errors and preserves request id', async () => {
  const repository = createHttpContentRepository({
    baseUrl: 'https://api.example.test',
    fetchImpl: async () =>
      Response.json(
        {
          error: {
            code: 'WORK_NOT_FOUND',
            message: 'Missing',
            requestId: 'request-404',
          },
        },
        { status: 404 },
      ),
  });
  await assert.rejects(
    () => repository.getWork('missing'),
    (error: unknown) =>
      error instanceof ContentError &&
      error.code === 'WORK_NOT_FOUND' &&
      error.status === 404 &&
      error.requestId === 'request-404',
  );
});

void test('HTTP repository aborts timed out requests', async () => {
  const repository = createHttpContentRepository({
    baseUrl: 'https://api.example.test',
    timeoutMs: 5,
    fetchImpl: async (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Timed out', 'AbortError')),
        );
      }),
  });
  await assert.rejects(
    () => repository.getDailyEdit('2026-09-08'),
    (error: unknown) =>
      error instanceof ContentError && error.code === 'CONTENT_REQUEST_TIMEOUT',
  );
});

void test('HTTP repository converts invalid response structure', async () => {
  const repository = createHttpContentRepository({
    baseUrl: 'https://api.example.test',
    fetchImpl: async () =>
      Response.json({
        data: { items: [{}], nextCursor: null, hasMore: false },
      }),
  });
  await assert.rejects(
    () => repository.listWorks({ limit: 48 }),
    (error: unknown) =>
      error instanceof ContentError &&
      error.code === 'INVALID_CONTENT_RESPONSE',
  );
});

void test('content source creates HTTP repository when configured', () => {
  const repository = getContentRepository({
    CONTENT_SOURCE: 'http',
    CONTENT_API_BASE_URL: 'https://api.example.test',
    CONTENT_API_TIMEOUT_MS: '3000',
  });
  assert.equal(typeof repository.listWorks, 'function');
});

void test('HTTP repository fetches direct work detail and the current Go recommendation path', async () => {
  const urls: string[] = [];
  const repository = createHttpContentRepository({
    baseUrl: 'https://api.example.test',
    fetchImpl: async (input) => {
      urls.push(
        input instanceof URL
          ? input.href
          : input instanceof Request
            ? input.url
            : input,
      );
      return urls.length === 1
        ? Response.json({ data: detail })
        : Response.json({
            data: {
              date: '2026-09-08',
              generatedAt: '2026-09-08T12:00:00.000Z',
              selectionVersion: 'v1',
              works: [summary],
            },
          });
    },
  });
  await repository.getWork('work/a b');
  await repository.getDailyEdit('2026-09-08');
  assert.deepEqual(urls, [
    'https://api.example.test/v1/works/work%2Fa%20b',
    'https://api.example.test/v1/recommendations/2026-09-08',
  ]);
});
