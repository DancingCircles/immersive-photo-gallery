import assert from 'node:assert/strict';
import test from 'node:test';
import { ContentError } from '../../application/errors/content-error.ts';
import {
  decodeCursorPage,
  decodeDailyEdit,
  decodeErrorEnvelope,
  decodeWorkDetail,
} from '../../infrastructure/http/decoders.ts';

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
  artistStatement: 'Quiet light.',
  editorialNote: 'Selected for composition.',
  aiAnalysis: {
    content: 'Strong diagonal balance.',
    generatedAt: '2026-09-08T12:00:00.000Z',
    model: 'analysis-model',
    version: '1',
  },
  attribution: {
    sourceUrl: 'https://example.test/work-01',
    licenseName: 'Private development placeholder',
    licenseUrl: 'https://example.test/license',
    creditLine: 'Photographer 01',
  },
};

void test('decoders accept valid responses and ignore unknown fields', () => {
  const page = decodeCursorPage({ data: { items: [summary], nextCursor: null, hasMore: false, extra: true } });
  assert.equal(page.items[0].id, 'work-01');
  assert.equal(page.hasMore, false);
  assert.equal(decodeWorkDetail({ data: { ...detail, extra: 'ignored' } }).aiAnalysis?.model, 'analysis-model');
  assert.equal(
    decodeDailyEdit({
      data: {
        date: '2026-09-08',
        generatedAt: '2026-09-08T12:00:00.000Z',
        selectionVersion: 'v1',
        works: [summary],
      },
    }).date,
    '2026-09-08',
  );
});

void test('decoders allow optional AI analysis to be absent', () => {
  const { aiAnalysis: _aiAnalysis, ...withoutAi } = detail;
  assert.equal(decodeWorkDetail({ data: withoutAi }).aiAnalysis, undefined);
});

void test('decoders reject missing required fields with a field path', () => {
  assert.throws(
    () => decodeWorkDetail({ data: { ...detail, attribution: { licenseName: 'x' } } }),
    (error: unknown) =>
      error instanceof ContentError &&
      error.code === 'INVALID_CONTENT_RESPONSE' &&
      error.message.includes('data.attribution.sourceUrl'),
  );
});

void test('decoders reject non ISO date fields', () => {
  assert.throws(
    () => decodeWorkDetail({ data: { ...detail, publishedAt: 'September 8th' } }),
    (error: unknown) =>
      error instanceof ContentError && error.code === 'INVALID_CONTENT_RESPONSE',
  );
});

void test('error envelopes preserve safe error details', () => {
  assert.deepEqual(
    decodeErrorEnvelope({
      error: { code: 'WORK_NOT_FOUND', message: 'Missing', requestId: 'request-1' },
    }),
    { code: 'WORK_NOT_FOUND', message: 'Missing', requestId: 'request-1' },
  );
});
