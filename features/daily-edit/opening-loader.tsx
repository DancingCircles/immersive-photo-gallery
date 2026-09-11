'use client';

import { useEffect, useState, type CSSProperties } from 'react';

const COLUMN_COUNT = 24;
const LOADING_DURATION = 2400;
const EXIT_DURATION = 420;

const PINK_PIXEL_PALETTE = [
  '#e3a0ad', '#ecad9a', '#d794c7', '#e69aa3',
  '#dda0bf', '#f0b19a', '#d98e98', '#e0a0cc',
] as const;

type Pixel = {
  column: number;
  row: number;
  color: (typeof PINK_PIXEL_PALETTE)[number];
  delay: number;
};

function createPixelPattern(): Pixel[] {
  return Array.from({ length: COLUMN_COUNT }, (_, column) => {
    const count = 1 + Math.floor(Math.random() * 4);
    const rows = [0, 1, 2, 3]
      .sort(() => Math.random() - .5)
      .slice(0, count);

    return rows.map((row) => ({
      column,
      row,
      color: PINK_PIXEL_PALETTE[Math.floor(Math.random() * PINK_PIXEL_PALETTE.length)],
      delay: Math.round(Math.random() * 100),
    }));
  }).flat();
}

export default function OpeningLoader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'exiting'>('loading');
  const [visible, setVisible] = useState(true);
  const [pixels, setPixels] = useState<Pixel[]>([]);

  useEffect(() => {
    setPixels(createPixelPattern());
  }, []);

  useEffect(() => {
    let frame = 0;
    let exitTimer = 0;
    let removeTimer = 0;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const leave = () => {
      setProgress(100);
      setPhase('exiting');
      removeTimer = window.setTimeout(() => setVisible(false), EXIT_DURATION);
    };

    if (reduceMotion) {
      frame = window.requestAnimationFrame(() => {
        setProgress(100);
        removeTimer = window.setTimeout(() => setVisible(false), 120);
      });
    } else {
      let startedAt: number | undefined;
      const advance = (now: number) => {
        startedAt ??= now;
        const amount = Math.min((now - startedAt) / LOADING_DURATION, 1);
        setProgress(Math.round(amount * 100));

        if (amount < 1) {
          frame = window.requestAnimationFrame(advance);
          return;
        }

        exitTimer = window.setTimeout(leave, 160);
      };
      frame = window.requestAnimationFrame(advance);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  const filledColumns = Math.ceil((progress / 100) * COLUMN_COUNT);

  return (
    <div className="opening-loader" data-phase={phase} aria-label="正在载入首页">
      <div className="opening-loader__content">
        <div className="opening-loader__readout" aria-hidden="true">
          <div className="opening-loader__pixels">
            {pixels.map(({ column, row, color, delay }) => {
              const style = {
                '--pixel-color': color,
                '--pixel-delay': `${delay}ms`,
                gridColumnStart: column + 1,
                gridRowStart: row + 1,
              } as CSSProperties;

              return (
                <span
                  key={`${column}-${row}`}
                  className="opening-loader__tile"
                  data-filled={column < filledColumns}
                  style={style}
                />
              );
            })}
          </div>
          <output className="opening-loader__percentage">{progress}%</output>
        </div>
      </div>
    </div>
  );
}
