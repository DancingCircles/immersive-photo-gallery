'use client';

import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

export default function SiteNav({
  current,
  searchValue = '',
  onSearchChange,
  children,
}: {
  current: 'featured' | 'gallery';
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children?: ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const closeSearch = () => {
    onSearchChange?.('');
    setSearchOpen(false);
  };

  return (
    <nav className="site-nav" aria-label="页面导航">
      {children}
      <div className="site-nav__links">
        <Link
          href="/"
          aria-current={current === 'featured' ? 'page' : undefined}
        >
          推荐
        </Link>
        <Link
          href="/gallery"
          aria-current={current === 'gallery' ? 'page' : undefined}
        >
          画廊
        </Link>
      </div>
      {current === 'gallery' && onSearchChange && (
        <div className="site-nav__search" data-open={searchOpen}>
          <input
            ref={searchInputRef}
            type="search"
            value={searchValue}
            tabIndex={searchOpen ? 0 : -1}
            aria-label="搜索作品"
            aria-hidden={!searchOpen}
            placeholder="标题 / 摄影师 / 分类 / 年份"
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeSearch();
            }}
          />
          <button
            type="button"
            aria-label={searchOpen ? '关闭搜索' : '搜索作品'}
            aria-expanded={searchOpen}
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
          >
            {searchOpen ? (
              <X aria-hidden="true" />
            ) : (
              <Search aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </nav>
  );
}
