import { ContentError } from '../../application/errors/content-error.ts';
import type { ContentRepository, CursorPage, ListWorksInput } from '../../application/ports/content-repository.ts';
import type { DailyEdit } from '../../domain/daily-edit/daily-edit.ts';
import type { WorkDetail, WorkSummary } from '../../domain/work/work.ts';
import { dailyFixtureWorkIDs, fixtureSearchTags, workFixtures } from './fixtures.ts';

const MAX_LIMIT = 60;

function summary(work: WorkDetail): WorkSummary {
  const { image: _image, artistStatement: _statement, editorialNote: _note, aiAnalysis: _analysis, attribution: _attribution, ...result } = work;
  return result;
}

function normalizeLimit(limit: number) {
  return Math.min(Math.max(Number.isFinite(limit) ? Math.trunc(limit) : 1, 1), MAX_LIMIT);
}

function offsetFromCursor(cursor: string | undefined) {
  if (cursor === undefined) return 0;
  const match = /^offset:(\d+)$/.exec(cursor);
  if (!match) throw new ContentError('INVALID_CURSOR', 'Invalid cursor', { status: 400 });
  const offset = Number(match[1]);
  if (!Number.isSafeInteger(offset)) {
    throw new ContentError('INVALID_CURSOR', 'Invalid cursor', { status: 400 });
  }
  return offset;
}

function matches(work: WorkDetail, query: string | undefined) {
  if (!query) return true;
  const term = query.trim().toLocaleLowerCase();
  if (!term) return true;
  return [
    work.title,
    work.photographerName,
    work.category,
    work.publishedAt,
    ... (fixtureSearchTags[work.id] ?? []),
    work.artistStatement,
    work.localizedTitle,
    work.localizedDescription,
    work.promptZh,
    work.promptEn,
    work.negativePrompt,
    work.imageAnalysis,
    work.attribution.creditLine,
    work.attribution.licenseName,
  ].some((value) => value?.toLocaleLowerCase().includes(term));
}

export const localContentRepository: ContentRepository = {
  async listWorks(input: ListWorksInput): Promise<CursorPage<WorkSummary>> {
    const offset = offsetFromCursor(input.cursor);
    const limit = normalizeLimit(input.limit);
    const filtered = workFixtures.filter((work) => matches(work, input.query));
    if (input.cursor !== undefined && offset >= filtered.length) {
      throw new ContentError('INVALID_CURSOR', 'Invalid cursor', { status: 400 });
    }
    const page = filtered.slice(offset, offset + limit).map(summary);
    const nextOffset = offset + page.length;
    const hasMore = nextOffset < filtered.length;
    return { items: page, nextCursor: hasMore ? `offset:${nextOffset}` : null, hasMore };
  },

  async getWork(id: string): Promise<WorkDetail> {
    const work = workFixtures.find((item) => item.id === id);
    if (!work) throw new ContentError('WORK_NOT_FOUND', 'Work not found', { status: 404 });
    return work;
  },

  async getDailyEdit(date: string): Promise<DailyEdit> {
    const works = dailyFixtureWorkIDs.map((id) => {
      const work = workFixtures.find((item) => item.id === id);
      if (!work) throw new Error(`missing local daily work ${id}`);
      return summary(work);
    });
    return {
      date,
      generatedAt: `${date}T00:00:00.000Z`,
      selectionVersion: 'published-backend-snapshot-2026-09-12',
      works,
    };
  },
};
