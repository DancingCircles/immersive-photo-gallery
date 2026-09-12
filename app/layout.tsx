import type { Metadata } from 'next';
import BackgroundMusic from '@/components/audio/background-music';
import OpeningLoader from '@/features/daily-edit/opening-loader';
import './globals.css';
export const metadata: Metadata = {
  title: '拾光集 · 光影漫游',
  description:
    'A spatial WebGL gallery for discovering photographers and their work.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OpeningLoader />
        <BackgroundMusic />
        {children}
      </body>
    </html>
  );
}
