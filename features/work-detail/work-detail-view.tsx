import Link from 'next/link';
import type { WorkDetail } from '@/domain/work/work';
import type { WorkDetailState } from './use-work-detail';
import PromptCopyBlocks from './prompt-copy-blocks';

export function WorkAttribution({ work }: { work: WorkDetail }) {
  return (
    <p className="work-detail-attribution">
      {work.attribution.creditLine} ·{' '}
      <a href={work.attribution.sourceUrl} target="_blank" rel="noreferrer">
        作品来源
      </a>{' '}
      · {work.attribution.licenseName}
    </p>
  );
}

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
      {(work.promptZh || work.promptEn || work.negativePrompt) && (
        <details className="work-detail-copy__prompt-disclosure">
          <summary>
            <span>AI 生成提示词</span>
            <span className="work-detail-copy__prompt-motif" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none">
                <path d="M20 20C12.5 20 8 16.4 8 11.8c0-3.2 2.7-5.4 5.5-4.3C17.3 8.9 19 14.7 20 20Z" />
                <path d="M20 20c0-7.5 3.6-12 8.2-12 3.2 0 5.4 2.7 4.3 5.5C31.1 17.3 25.3 19 20 20Z" />
                <path d="M20 20c7.5 0 12 3.6 12 8.2 0 3.2-2.7 5.4-5.5 4.3C22.7 31.1 21 25.3 20 20Z" />
                <path d="M20 20c0 7.5-3.6 12-8.2 12-3.2 0-5.4-2.7-4.3-5.5C8.9 22.7 14.7 21 20 20Z" />
              </svg>
            </span>
            <span className="work-detail-copy__prompt-arrow" aria-hidden="true">
              ↓
            </span>
          </summary>
          <PromptCopyBlocks
            promptZh={work.promptZh}
            promptEn={work.promptEn}
            negativePrompt={work.negativePrompt}
          />
        </details>
      )}
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
        <div className="work-detail-page__media">
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
            }}
          />
          <WorkAttribution work={work} />
        </div>
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
