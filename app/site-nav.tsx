import Link from 'next/link';

export default function SiteNav({ current }: { current: 'daily' | 'gallery' }) {
  return (
    <nav className="site-nav" aria-label="页面导航">
      <Link href="/" aria-current={current === 'daily' ? 'page' : undefined}>每日推荐</Link>
      <Link href="/gallery" aria-current={current === 'gallery' ? 'page' : undefined}>画廊</Link>
    </nav>
  );
}
