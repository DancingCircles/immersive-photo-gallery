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

type MediaVariant = 'image' | 'thumbnail';

function resolveImageAsset(
  asset: ImageAsset,
  workID: string,
  variant: MediaVariant,
): ImageAsset {
  // The API base URL is server-only. Return a stable same-origin path so a
  // browser never needs access to an internal API host or its credentials.
  return {
    ...asset,
    src: `/api/content/media/${encodeURIComponent(workID)}/${variant}`,
  };
}

function resolveWorkSummary(work: WorkSummary): WorkSummary {
  return {
    ...work,
    thumbnail: resolveImageAsset(work.thumbnail, work.id, 'thumbnail'),
  };
}

function resolveWorkDetail(work: WorkDetail): WorkDetail {
  return {
    ...work,
    thumbnail: resolveImageAsset(work.thumbnail, work.id, 'thumbnail'),
    image: resolveImageAsset(work.image, work.id, 'image'),
  };
}

function resolveDailyEdit(edit: DailyEdit): DailyEdit {
  return {
    ...edit,
    works: edit.works.map(resolveWorkSummary),
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
        items: page.items.map(resolveWorkSummary),
      };
    },
    async getWork(id): Promise<WorkDetail> {
      return resolveWorkDetail(
        decodeWorkDetail(
          await client.get(`/v1/works/${encodeURIComponent(id)}`),
        ),
      );
    },
    async getDailyEdit(date): Promise<DailyEdit> {
      return resolveDailyEdit(
        decodeDailyEdit(
          await client.get(`/v1/recommendations/${encodeURIComponent(date)}`),
        ),
      );
    },
  };
}
