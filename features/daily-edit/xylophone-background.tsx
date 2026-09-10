'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { XylophoneRuntime } from './xylophone/xylophone-runtime';

export type XylophoneBackgroundHandle = {
  setSoundEnabled: (enabled: boolean) => void;
};

const XylophoneBackground = forwardRef<
  XylophoneBackgroundHandle,
  { soundEnabled: boolean }
>(function XylophoneBackground({ soundEnabled }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<XylophoneRuntime | null>(null);

  useImperativeHandle(ref, () => ({
    setSoundEnabled: (enabled) => runtimeRef.current?.setSoundEnabled(enabled),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const runtime = new XylophoneRuntime(canvas);
    runtimeRef.current = runtime;
    return () => {
      runtime.dispose();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
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
