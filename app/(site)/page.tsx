import { getDailyEdit } from '@/application/queries/get-daily-edit';
import { getEditorialDate } from '@/application/queries/get-editorial-date';
import { listWorks } from '@/application/queries/list-works';
import { ContentError } from '@/application/errors/content-error';
import FeaturedHome from '@/features/daily-edit/featured-home';
import { getContentRepository } from '@/infrastructure/config/content-source';

export default async function Home() {
  const repository = getContentRepository();
  const date = getEditorialDate(new Date(), 'Asia/Shanghai');
  try {
    const edit = await getDailyEdit(repository, date);
    return <FeaturedHome works={edit.works} />;
  } catch (error) {
    // A completed ingestion batch can briefly precede its immutable daily
    // snapshot. Keep the public home usable during that small window.
    if (!(error instanceof ContentError) || error.code !== 'RECOMMENDATION_UNAVAILABLE') {
      throw error;
    }
    const page = await listWorks(repository, { limit: 12 });
    return <FeaturedHome works={page.items} />;
  }
}
