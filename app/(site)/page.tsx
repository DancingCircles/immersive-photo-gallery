import { getDailyEdit } from '@/application/queries/get-daily-edit';
import { getEditorialDate } from '@/application/queries/get-editorial-date';
import FeaturedHome from '@/features/daily-edit/featured-home';
import { getContentRepository } from '@/infrastructure/config/content-source';

export default async function Home() {
  const repository = getContentRepository();
  const date = getEditorialDate(new Date(), 'Asia/Shanghai');
  const edit = await getDailyEdit(repository, date);

  return <FeaturedHome works={edit.works} />;
}
