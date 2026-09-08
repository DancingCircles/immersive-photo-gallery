import { ContentError } from '../../application/errors/content-error.ts';
import type { ContentRepository } from '../../application/ports/content-repository.ts';
import { createHttpContentRepository } from '../http/http-content-repository.ts';
import { localContentRepository } from '../local/local-content-repository.ts';

export type ContentSourceEnvironment = {
  [key: string]: string | undefined;
  CONTENT_SOURCE?: string;
  CONTENT_API_BASE_URL?: string;
  CONTENT_API_TIMEOUT_MS?: string;
};

/** Selects the server-side repository without silently changing data sources. */
export function getContentRepository(
  env: ContentSourceEnvironment = process.env,
): ContentRepository {
  const source = env.CONTENT_SOURCE?.trim().toLowerCase() || 'local';
  if (source === 'local') return localContentRepository;
  if (source === 'http') {
    const baseUrl = env.CONTENT_API_BASE_URL?.trim();
    if (!baseUrl) {
      throw new ContentError('CONTENT_API_NOT_CONFIGURED', 'Content API is not configured', {
        status: 503,
      });
    }
    const parsedTimeout = Number(env.CONTENT_API_TIMEOUT_MS);
    return createHttpContentRepository({
      baseUrl,
      timeoutMs: Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : undefined,
    });
  }
  throw new ContentError('INVALID_CONTENT_SOURCE', 'Invalid content source', { status: 500 });
}
