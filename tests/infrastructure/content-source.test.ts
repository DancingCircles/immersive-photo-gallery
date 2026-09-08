import assert from 'node:assert/strict';
import test from 'node:test';
import { ContentError } from '../../application/errors/content-error.ts';
import { getContentRepository } from '../../infrastructure/config/content-source.ts';
import { localContentRepository } from '../../infrastructure/local/local-content-repository.ts';

void test('missing or local content source returns the local repository', () => {
  assert.equal(getContentRepository({}), localContentRepository);
  assert.equal(getContentRepository({ CONTENT_SOURCE: 'local' }), localContentRepository);
});

void test('production http mode never falls back to local content', () => {
  assert.throws(() => getContentRepository({ CONTENT_SOURCE: 'http' }), (error: unknown) =>
      error instanceof ContentError &&
      error.code === 'CONTENT_API_NOT_CONFIGURED' &&
      error.status === 503,
  );
});

void test('unknown content source is rejected', () => {
  assert.throws(() => getContentRepository({ CONTENT_SOURCE: 'other' }), (error: unknown) =>
    error instanceof ContentError && error.code === 'INVALID_CONTENT_SOURCE');
});
