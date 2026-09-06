'use client';
import { useEffect, useState } from 'react';
import { Grid2X2, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projects } from '@/lib/projects';
import type { ViewMode } from '@/lib/projection';
import Scene from '../scene';
import SiteNav from '../site-nav';
export default function Gallery() {
  const [mode, setMode] = useState<ViewMode>('space');
  useEffect(() => {
    const init = requestAnimationFrame(() => {
      if (
        window.innerWidth < 700 ||
        matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        setMode('flat');
    });
    return () => cancelAnimationFrame(init);
  }, []);
  return (
    <main className="app-shell">
      <div className="space-view">
        <Scene
          items={projects}
          mode={mode}
          theme="light"
          onError={() => setMode('flat')}
        />
      </div>
      <SiteNav current="gallery" />
      <footer className="controls">
        <Tabs value={mode} onValueChange={(v) => setMode(v as ViewMode)}>
          <TabsList className="view-tabs" aria-label="选择视角">
            <TabsTrigger value="space" aria-label="3D 空间视角">
              <Grid2X2 /> <span>3D</span>
            </TabsTrigger>
            <TabsTrigger value="flat" aria-label="平铺视角">
              <List />
              <span>Flat</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </footer>
    </main>
  );
}
