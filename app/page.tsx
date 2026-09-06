'use client';
import DailyScene from './daily-scene';
import SiteNav from './site-nav';

export default function Home() {
  return (
    <main className="app-shell daily-home">
      <DailyScene theme="light" />
      <SiteNav current="daily" />
    </main>
  );
}
