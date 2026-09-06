'use client';
import { useEffect, useState } from 'react';
import { Grid2X2, List, Moon, Sun } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projects } from '@/lib/projects';
import type { ViewMode } from '@/lib/projection';
import type { ThemeMode } from '@/lib/theme';
import Scene from './scene';
export default function Home() {
  const [mode, setMode] = useState<ViewMode>('space');
  const [theme, setTheme] = useState<ThemeMode>('light');
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
    <main className={`app-shell ${theme}`}>
      <div className="space-view">
        <Scene
          items={projects}
          mode={mode}
          theme={theme}
          onError={() => setMode('flat')}
        />
      </div>
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
        <button
          className="theme-toggle"
          type="button"
          aria-label={theme === 'light' ? '切换到黑夜模式' : '切换到白天模式'}
          title={theme === 'light' ? '黑夜模式' : '白天模式'}
          onClick={() =>
            setTheme((value) => (value === 'light' ? 'dark' : 'light'))
          }
        >
          {theme === 'light' ? <Moon /> : <Sun />}
        </button>
      </footer>
    </main>
  );
}
