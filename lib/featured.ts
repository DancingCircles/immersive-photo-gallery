import { projects, type Project } from './projects.ts';

export type FeaturedWork = Project & {
  displayTitle: string;
  categoryLabel: string;
  year: string;
  positionLabel: string;
};

export function formatFeaturedWork(work: Project, index: number, total: number): FeaturedWork {
  return {
    ...work,
    displayTitle: work.title.toUpperCase().slice(0, 25),
    categoryLabel: work.category.toUpperCase(),
    year: work.publishedAt.slice(0, 4),
    positionLabel: `${String(index + 1).padStart(2, '0')} / ${total}`,
  };
}

const selection = projects.slice(0, 12);
export const featuredWorks = selection.map((work, index) =>
  formatFeaturedWork(work, index, selection.length),
);
