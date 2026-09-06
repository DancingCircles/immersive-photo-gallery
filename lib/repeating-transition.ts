export type RectSnapshot = { left: number; top: number; width: number; height: number };
export type ImageSide = 'left' | 'right';
export type RepeatingStep = {
  index: number;
  from: RectSnapshot;
  to: RectSnapshot;
  delay: number;
  duration: number;
};
export type TransitionOptions = {
  count?: number;
  duration?: number;
  interval?: number;
  revealPause?: number;
};

const DEFAULTS = { count: 6, duration: 350, interval: 50, revealPause: 140 };

export function getDetailImageSide(sourceCenterX: number, viewportWidth: number): ImageSide {
  return sourceCenterX <= viewportWidth / 2 ? 'right' : 'left';
}

export function createRepeatingSteps(
  from: RectSnapshot,
  to: RectSnapshot,
  options: TransitionOptions = {},
): RepeatingStep[] {
  const config = { ...DEFAULTS, ...options };
  return Array.from({ length: config.count }, (_, index) => ({
    index, from: { ...from }, to: { ...to }, delay: index * config.interval,
    duration: config.duration,
  }));
}

export function getTransitionTotalMs(options: TransitionOptions = {}) {
  const config = { ...DEFAULTS, ...options };
  return config.duration + (config.count - 1) * config.interval + config.revealPause;
}

export function createMoverKeyframes(step: RepeatingStep): Keyframe[] {
  const frame = (rect: RectSnapshot) => ({
    left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
  });
  return [
    { ...frame(step.from), opacity: 0, clipPath: 'inset(18% 18% 18% 18%)', offset: 0 },
    { ...frame(step.from), opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', offset: 0.18 },
    { ...frame(step.to), opacity: 0, clipPath: 'inset(0% 0% 0% 0%)', offset: 1 },
  ];
}
