import type { DailyEdit } from '../../domain/daily-edit/daily-edit.ts';
import type { WorkDetail, WorkId, WorkSummary } from '../../domain/work/work.ts';

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type ListWorksInput = {
  cursor?: string;
  limit: number;
  query?: string;
};

export interface ContentRepository {
  listWorks(input: ListWorksInput): Promise<CursorPage<WorkSummary>>;
  getWork(id: WorkId): Promise<WorkDetail>;
  getDailyEdit(date: string): Promise<DailyEdit>;
}
