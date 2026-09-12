import { ContentError } from '../../application/errors/content-error.ts';
import { decodeErrorEnvelope } from './decoders.ts';

export type FetchImpl = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type ApiClient = {
  get(path: string, query?: URLSearchParams): Promise<unknown>;
};

function joinUrl(baseUrl: string, path: string, query?: URLSearchParams) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const url = new URL(path.replace(/^\//, ''), base);
  if (query) url.search = query.toString();
  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}));
}

export function createApiClient({
  baseUrl,
  fetchImpl = fetch,
  timeoutMs = 8000,
}: {
  baseUrl: string;
  fetchImpl?: FetchImpl;
  timeoutMs?: number;
}): ApiClient {
  return {
    async get(path, query) {
      const signal = AbortSignal.timeout(timeoutMs);
      let response: Response;
      try {
        response = await fetchImpl(joinUrl(baseUrl, path, query), {
          signal,
          headers: { Accept: 'application/json' },
        });
      } catch (error) {
        // This signal is used only for the request timeout. Native fetch
        // rejects AbortSignal.timeout() with TimeoutError, while some mocks
        // and runtimes use AbortError instead.
        if (signal.aborted) {
          throw new ContentError('CONTENT_REQUEST_TIMEOUT', 'Content API request timed out', {
            status: 504,
            cause: error,
          });
        }
        throw new ContentError('CONTENT_REQUEST_FAILED', 'Content API request failed', {
          status: 502,
          cause: error,
        });
      }
      const body = await parseBody(response);
      if (!response.ok) {
        const error = decodeErrorEnvelope(body);
        throw new ContentError(
          error?.code ?? 'CONTENT_REQUEST_FAILED',
          error?.message ?? 'Content API request failed',
          { status: response.status, requestId: error?.requestId },
        );
      }
      return body;
    },
  };
}
