export type Project = {
  id: number;
  title: string;
  photographer: string;
  publishedAt: string;
  category: string;
  image: string;
};

export function filterProjects(items: readonly Project[], query: string) {
  const term = query.trim().toLocaleLowerCase();
  if (!term) return [...items];

  return items.filter((project) =>
    [
      project.title,
      project.photographer,
      project.category,
      project.publishedAt,
    ].some((value) => value.toLocaleLowerCase().includes(term)),
  );
}

const categories = ['portrait', 'street', 'landscape', 'documentary'] as const;

// Replace these placeholders with credited, licensed photography before release.
export const projects: Project[] = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  title: `Untitled ${String(index + 1).padStart(2, '0')}`,
  photographer: `Photographer ${String(index + 1).padStart(2, '0')}`,
  publishedAt: `2026-${String((index % 12) + 1).padStart(2, '0')}-01`,
  category: categories[index % categories.length],
  image: `/art/${index}.${[3, 4, 6, 8].includes(index) ? 'jpg' : 'png'}`,
}));
