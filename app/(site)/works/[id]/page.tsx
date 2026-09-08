import { notFound } from 'next/navigation';
import { getWork } from '@/application/queries/get-work';
import { ContentError } from '@/application/errors/content-error';
import { getContentRepository } from '@/infrastructure/config/content-source';
import WorkDetailView from '@/features/work-detail/work-detail-view';

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let work;
  try {
    work = await getWork(getContentRepository(), id);
  } catch (error) {
    if (error instanceof ContentError && error.status === 404) notFound();
    throw error;
  }
  return <WorkDetailView work={work} />;
}
