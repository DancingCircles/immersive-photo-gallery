import { listWorks } from '@/application/queries/list-works';
import GalleryClient from '@/features/gallery/gallery-client';
import { getContentRepository } from '@/infrastructure/config/content-source';

export default async function GalleryPage() {
  const initialPage = await listWorks(getContentRepository(), { limit: 48 });
  return <GalleryClient initialPage={initialPage} />;
}
