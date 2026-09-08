import Link from 'next/link';
import type { WorkDetail } from '@/domain/work/work';
import type { WorkDetailState } from './use-work-detail';

export function WorkDetailCopy({ detail }: { detail: WorkDetailState }) {
  if (detail.status === 'loading') return <output>加载作品介绍…</output>;
  if (detail.status === 'error') return <div role="alert">{detail.error.message}</div>;
  if (detail.status !== 'ready') return null;
  const work = detail.work;
  return (
    <div style={{ gridColumn: '1 / -1', textTransform: 'none', lineHeight: 1.6 }}>
      {work.artistStatement && <section aria-label="摄影师自述"><h2>摄影师自述</h2><p>{work.artistStatement}</p></section>}
      {work.editorialNote && <section aria-label="编辑推荐"><h2>编辑推荐</h2><p>{work.editorialNote}</p></section>}
      {work.aiAnalysis && <section aria-label="AI 分析"><h2>AI 分析</h2><p>{work.aiAnalysis.content}</p></section>}
      <p>{work.attribution.creditLine} · <a href={work.attribution.sourceUrl} target="_blank" rel="noreferrer">作品来源</a> · {work.attribution.licenseName}</p>
    </div>
  );
}

export default function WorkDetailView({ work }: { work: WorkDetail }) {
  return (
    <main style={{ background: '#fff', color: '#080808', height: '100dvh', overflowY: 'auto', padding: 'clamp(24px, 5vw, 72px)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}><span>SELECTED WORK</span><Link href="/gallery">返回画廊</Link></header>
      <article style={{ maxWidth: 820, margin: '48px auto' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={work.image.src} alt={work.image.alt} width={work.image.width} height={work.image.height} style={{ display: 'block', width: 'auto', maxWidth: '100%', height: 'auto', maxHeight: 320, margin: '0 auto 48px' }} />
        <p>{work.category}</p><h1>{work.photographerName}</h1><h2>{work.title}</h2><p>{work.publishedAt}</p>
        <WorkDetailCopy detail={{ status: 'ready', work, error: null }} />
      </article>
    </main>
  );
}
