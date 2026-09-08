import type { WorkSummary } from '@/domain/work/work';

export type GalleryCard = WorkSummary & {
  directoryPosition: number;
  sceneImageSrc: string;
};

export function toGalleryCard(work: WorkSummary, index: number): GalleryCard {
  return { ...work, directoryPosition: index + 1, sceneImageSrc: work.thumbnail.src };
}
