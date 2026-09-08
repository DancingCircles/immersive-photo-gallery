import type { WorkSummary } from '../../domain/work/work.ts';

export type FeaturedWork = WorkSummary & {
  displayTitle: string;
  categoryLabel: string;
  year: string;
  positionLabel: string;
};

export function toFeaturedWork(
  summary: WorkSummary,
  index: number,
  total: number,
): FeaturedWork {
  return {
    ...summary,
    displayTitle: summary.title.toUpperCase(),
    categoryLabel: summary.category.toUpperCase(),
    year: summary.publishedAt.slice(0, 4),
    positionLabel: `${String(index + 1).padStart(2, '0')} / ${total}`,
  };
}
