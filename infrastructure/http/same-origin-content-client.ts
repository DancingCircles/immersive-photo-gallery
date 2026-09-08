import { ContentError } from '../../application/errors/content-error.ts';
import type { CursorPage, ListWorksInput } from '../../application/ports/content-repository.ts';
import type { WorkDetail, WorkSummary } from '../../domain/work/work.ts';

type ContentErrorBody = {
  error?: { code?: string; message?: string; requestId?: string };
};

type ContentDataBody<T> = { data?: T };

async function requestContent<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  const body = (await response.json().catch(() => ({}))) as ContentDataBody<T> & ContentErrorBody;
  if (!response.ok) {
    throw new ContentError(
      body.error?.code ?? 'CONTENT_REQUEST_FAILED',
      body.error?.message ?? 'Content request failed',
      { status: response.status, requestId: body.error?.requestId },
    );
  }
  if (!body.data) {
    throw new ContentError('CONTENT_INVALID_RESPONSE', 'Content response is missing data', {
      status: response.status,
    });
  }
  return body.data;
}

function toSearchParams(input: ListWorksInput): URLSearchParams {
  const params = new URLSearchParams({ limit: String(input.limit) });
  if (input.cursor) params.set('cursor', input.cursor);
  if (input.query?.trim()) params.set('query', input.query.trim());
  return params;
}

export async function listGalleryWorks(
  input: ListWorksInput,
  signal?: AbortSignal,
): Promise<CursorPage<WorkSummary>> {
  return requestContent<CursorPage<WorkSummary>>(
    `/api/content/gallery?${toSearchParams(input).toString()}`,
    signal,
  );
}

export function getWork(id: string, signal?: AbortSignal): Promise<WorkDetail> {
  return requestContent<WorkDetail>(`/api/content/works/${encodeURIComponent(id)}`, signal);
}
