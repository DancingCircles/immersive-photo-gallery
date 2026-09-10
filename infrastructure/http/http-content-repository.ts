import type {
  ContentRepository,
  CursorPage,
  ListWorksInput,
} from '../../application/ports/content-repository.ts';
import type { DailyEdit } from '../../domain/daily-edit/daily-edit.ts';
import type {
  ImageAsset,
  WorkDetail,
  WorkSummary,
} from '../../domain/work/work.ts';
import { createApiClient, type FetchImpl } from './api-client.ts';
import {
  decodeCursorPage,
  decodeDailyEdit,
  decodeWorkDetail,
} from './decoders.ts';

function listParams(input: ListWorksInput) {
  const params = new URLSearchParams({ limit: String(input.limit) });
  if (input.cursor) params.set('cursor', input.cursor);
  if (input.query?.trim()) params.set('query', input.query.trim());
  return params;
}

function resolveImageAsset(asset: ImageAsset, baseUrl: string): ImageAsset {
  try {
    return { ...asset, src: new URL(asset.src, baseUrl).toString() };
  } catch {
    return asset;
  }
}

function resolveWorkSummary(work: WorkSummary, baseUrl: string): WorkSummary {
  return { ...work, thumbnail: resolveImageAsset(work.thumbnail, baseUrl) };
}

function resolveWorkDetail(work: WorkDetail, baseUrl: string): WorkDetail {
  return {
    ...work,
    thumbnail: resolveImageAsset(work.thumbnail, baseUrl),
    image: resolveImageAsset(work.image, baseUrl),
  };
}

function resolveDailyEdit(edit: DailyEdit, baseUrl: string): DailyEdit {
  return {
    ...edit,
    works: edit.works.map((work) => resolveWorkSummary(work, baseUrl)),
  };
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
      const page = decodeCursorPage(
        await client.get('/v1/works', listParams(input)),
      );
      return {
        ...page,
        items: page.items.map((work) => resolveWorkSummary(work, baseUrl)),
      };
    },
    async getWork(id): Promise<WorkDetail> {
      return resolveWorkDetail(
        decodeWorkDetail(
          await client.get(`/v1/works/${encodeURIComponent(id)}`),
        ),
        baseUrl,
      );
    },
    async getDailyEdit(date): Promise<DailyEdit> {
      return resolveDailyEdit(
        decodeDailyEdit(
          await client.get(`/v1/recommendations/${encodeURIComponent(date)}`),
        ),
        baseUrl,
      );
    },
  };
}
