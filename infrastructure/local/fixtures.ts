import type { WorkDetail } from '../../domain/work/work.ts';

const categories = ['portrait', 'street', 'landscape', 'documentary'] as const;

/** Development-only content placeholders; replace with licensed records before release. */
export const workFixtures: WorkDetail[] = Array.from({ length: 16 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  const set = Math.floor(index / 6) + 1;
  const src = `/art/set-${set}/${index}.${[3, 4, 6, 8].includes(index) ? 'jpg' : 'png'}`;
  const title = `Untitled ${number}`;
  const image = { src, width: 1200, height: 800, alt: title };

  return {
    id: `work-${number}`,
    title,
    photographerName: `Photographer ${number}`,
    publishedAt: `2026-${String((index % 12) + 1).padStart(2, '0')}-01`,
    category: categories[index % categories.length],
    thumbnail: image,
    image,
    attribution: {
      sourceUrl: 'https://example.invalid/development-placeholder',
      licenseName: 'Private development placeholder',
      creditLine: 'Private development placeholder',
    },
  };
});
