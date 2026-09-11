'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { XylophoneRuntime } from './xylophone/xylophone-runtime';

export type XylophoneBackgroundHandle = {
  setSoundEnabled: (enabled: boolean) => void;
};

const XylophoneBackground = forwardRef<
  XylophoneBackgroundHandle,
  { soundEnabled: boolean }
>(function XylophoneBackground({ soundEnabled }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<XylophoneRuntime | null>(null);
  const soundEnabledRef = useRef(soundEnabled);

  useImperativeHandle(
    ref,
    () => ({
      setSoundEnabled: (enabled) => {
        soundEnabledRef.current = enabled;
        runtimeRef.current?.setSoundEnabled(enabled);
      },
    }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let runtime: XylophoneRuntime | null = null;

    void import('./xylophone/xylophone-runtime')
      .then(({ XylophoneRuntime }) => {
        if (cancelled) return;
        runtime = new XylophoneRuntime(canvas);
        runtimeRef.current = runtime;
        runtime.setSoundEnabled(soundEnabledRef.current);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      runtime?.dispose();
      if (runtimeRef.current === runtime) runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    runtimeRef.current?.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);
  return (
    <canvas
      ref={canvasRef}
      className="xylophone-background"
      aria-hidden="true"
    />
  );
});

export default XylophoneBackground;
