import type {
  ContentRepository,
  CursorPage,
  ListWorksInput,
} from '../../application/ports/content-repository.ts';
import type { DailyEdit } from '../../domain/daily-edit/daily-edit.ts';
import type { WorkDetail, WorkSummary } from '../../domain/work/work.ts';
import { createApiClient, type FetchImpl } from './api-client.ts';
import { decodeCursorPage, decodeDailyEdit, decodeWorkDetail } from './decoders.ts';

function listParams(input: ListWorksInput) {
  const params = new URLSearchParams({ limit: String(input.limit) });
  if (input.cursor) params.set('cursor', input.cursor);
  if (input.query?.trim()) params.set('query', input.query.trim());
  return params;
}

export function createHttpContentRepository({
  baseUrl,
  fetchImpl,
  timeoutMs,
}: {
  baseUrl: string;
  fetchImpl?: FetchImpl;
  timeoutMs?: number;
}): ContentRepository {
  const client = createApiClient({ baseUrl, fetchImpl, timeoutMs });
  return {
    async listWorks(input): Promise<CursorPage<WorkSummary>> {
      return decodeCursorPage(await client.get('/v1/works', listParams(input)));
    },
    async getWork(id): Promise<WorkDetail> {
      return decodeWorkDetail(await client.get(`/v1/works/${encodeURIComponent(id)}`));
    },
    async getDailyEdit(date): Promise<DailyEdit> {
      return decodeDailyEdit(await client.get(`/v1/daily-edits/${encodeURIComponent(date)}`));
    },
  };
}
