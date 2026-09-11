import Link from 'next/link';
import type { WorkDetail } from '@/domain/work/work';
import type { WorkDetailState } from './use-work-detail';

export function WorkDetailCopy({ detail }: { detail: WorkDetailState }) {
  if (detail.status === 'loading') return <output>加载作品介绍…</output>;
  if (detail.status === 'error')
    return <div role="alert">{detail.error.message}</div>;
  if (detail.status !== 'ready') return null;
  const work = detail.work;
  const description = work.localizedDescription ?? work.artistStatement;
  return (
    <div className="work-detail-copy">
      {description && (
        <section aria-label="图片说明">
          <h2>图片说明</h2>
          <p>{description}</p>
        </section>
      )}
      {work.editorialNote && (
        <section aria-label="编辑推荐">
          <h2>编辑推荐</h2>
          <p>{work.editorialNote}</p>
        </section>
      )}
      {work.imageAnalysis && (
        <section aria-label="AI 图像解读">
          <h2>AI 图像解读</h2>
          <p>{work.imageAnalysis}</p>
        </section>
      )}
      {work.aiAnalysis && (
        <section aria-label="AI 分析">
          <h2>AI 分析</h2>
          <p>{work.aiAnalysis.content}</p>
        </section>
      )}
      <p>
        {work.attribution.creditLine} ·{' '}
        <a href={work.attribution.sourceUrl} target="_blank" rel="noreferrer">
          作品来源
        </a>{' '}
        · {work.attribution.licenseName}
      </p>
    </div>
  );
}

export default function WorkDetailView({ work }: { work: WorkDetail }) {
  const displayTitle = work.localizedTitle ?? work.title;
  return (
    <main className="work-detail-page">
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>SELECTED WORK</span>
        <Link href="/gallery">返回画廊</Link>
      </header>
      <article className="work-detail-page__article">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={work.image.src}
          alt={work.image.alt}
          width={work.image.width}
          height={work.image.height}
          style={{
            display: 'block',
            width: 'auto',
            maxWidth: '100%',
            height: 'auto',
            maxHeight: 320,
            margin: '0 auto 48px',
          }}
        />
        <p>{work.category}</p>
        <h1>{displayTitle}</h1>
        <p>摄影师：{work.photographerName}</p>
        {work.localizedTitle && (
          <p className="work-detail-page__original-title">
            英文原标题：{work.title}
          </p>
        )}
        <p>{work.publishedAt}</p>
        <WorkDetailCopy detail={{ status: 'ready', work, error: null }} />
      </article>
    </main>
  );
}
