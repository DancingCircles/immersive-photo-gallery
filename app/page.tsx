'use client';
import FeaturedHome from './featured-home';
import SiteNav from './site-nav';

export default function Home() {
  return (
    <main className="app-shell featured-page">
      <FeaturedHome />
      <SiteNav current="featured" />
    </main>
  );
}
