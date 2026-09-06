import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Immersive Photo Gallery',
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
      <body>{children}</body>
    </html>
  );
}
