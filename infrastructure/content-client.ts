import type { CursorPage, ListWorksInput } from '@/application/ports/content-repository';
import type { WorkDetail, WorkSummary } from '@/domain/work/work';
import {
  getWork as requestWork,
  listGalleryWorks as requestGalleryWorks,
} from './http/same-origin-content-client';
import { localContentRepository } from './local/local-content-repository';

const useStaticDemo = process.env.NEXT_PUBLIC_STATIC_DEMO === 'true';

export function listGalleryWorks(
  input: ListWorksInput,
  signal?: AbortSignal,
): Promise<CursorPage<WorkSummary>> {
  if (useStaticDemo) return localContentRepository.listWorks(input);
  return requestGalleryWorks(input, signal);
}

export function getWork(id: string, signal?: AbortSignal): Promise<WorkDetail> {
  if (useStaticDemo) return localContentRepository.getWork(id);
  return requestWork(id, signal);
}
