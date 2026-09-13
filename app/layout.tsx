import type { Metadata } from 'next';
import BackgroundMusic from '@/components/audio/background-music';
import OpeningLoader from '@/features/daily-edit/opening-loader';
import { withPublicPath } from '@/shared/paths/public-path';
import './globals.css';

const openingVisitScript = `(() => {
  if (window.location.hash !== '#skip-opening') return;
  window.__skipOpening = true;
  document.documentElement.dataset.skipOpening = 'true';
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
})();`;

export const metadata: Metadata = {
  title: '拾光集 · 光影漫游',
  description:
    'A spatial WebGL gallery for discovering photographers and their work.',
  icons: { icon: withPublicPath('/icon.png') },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: openingVisitScript }} />
        <OpeningLoader />
        <BackgroundMusic />
        {children}
      </body>
    </html>
  );
}
