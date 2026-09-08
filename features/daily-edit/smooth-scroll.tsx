'use client';

import { ReactLenis } from 'lenis/react';

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      className="app-shell featured-page"
      options={{ autoRaf: true, lerp: 0.08, smoothWheel: true, syncTouch: false }}
    >
      {children}
    </ReactLenis>
  );
}
