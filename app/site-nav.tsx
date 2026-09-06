import Link from 'next/link';

export default function SiteNav({ current }: { current: 'featured' | 'gallery' }) {
  return (
    <nav className="site-nav" aria-label="页面导航">
      <Link href="/" aria-current={current === 'featured' ? 'page' : undefined}>推荐</Link>
      <Link href="/gallery" aria-current={current === 'gallery' ? 'page' : undefined}>画廊</Link>
    </nav>
  );
}
