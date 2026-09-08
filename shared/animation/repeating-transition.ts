export type RectSnapshot = {
  left: number;
  top: number;
  width: number;
  height: number;
};
export type ImageSide = 'left' | 'right';
export type ClipPathDirection =
  | 'top-bottom'
  | 'bottom-top'
  | 'left-right'
  | 'right-left';

export const transitionConfig = {
  steps: 6,
  stepDuration: 0.35,
  stepInterval: 0.05,
  moverPauseBeforeExit: 0.14,
  clipPathDirection: 'top-bottom' as ClipPathDirection,
};

export function getDetailImageSide(
  sourceCenterX: number,
  viewportWidth: number,
): ImageSide {
  return sourceCenterX < viewportWidth / 2 ? 'right' : 'left';
}

export function getClipPathsForDirection(direction: ClipPathDirection) {
  const reveal = 'inset(0% 0% 0% 0%)';
  switch (direction) {
    case 'bottom-top':
      return {
        from: 'inset(0% 0% 100% 0%)',
        reveal,
        hide: 'inset(100% 0% 0% 0%)',
      };
    case 'left-right':
      return {
        from: 'inset(0% 100% 0% 0%)',
        reveal,
        hide: 'inset(0% 0% 0% 100%)',
      };
    case 'right-left':
      return {
        from: 'inset(0% 0% 0% 100%)',
        reveal,
        hide: 'inset(0% 100% 0% 0%)',
      };
    default:
      return {
        from: 'inset(100% 0% 0% 0%)',
        reveal,
        hide: 'inset(0% 0% 100% 0%)',
      };
  }
}

const center = (rect: RectSnapshot) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

export function computeStaggerDelays(
  clicked: RectSnapshot,
  items: RectSnapshot[],
): number[] {
  const base = center(clicked);
  const distances = items.map((rect) => {
    const point = center(rect);
    return Math.hypot(point.x - base.x, point.y - base.y);
  });
  const max = Math.max(0, ...distances);
  return distances.map((distance) => (max === 0 ? 0 : (distance / max) * 0.3));
}

export function generateMotionPath(
  start: RectSnapshot,
  end: RectSnapshot,
  steps = 6,
): RectSnapshot[] {
  const fullSteps = steps + 2;
  const startCenter = center(start);
  const endCenter = center(end);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const path = Array.from({ length: fullSteps }, (_, index) => {
    const t = index / (fullSteps - 1);
    const width = lerp(start.width, end.width, t);
    const height = lerp(start.height, end.height, t);
    return {
      left: lerp(startCenter.x, endCenter.x, t) - width / 2,
      top: lerp(startCenter.y, endCenter.y, t) - height / 2,
      width,
      height,
    };
  });
  return path.slice(1, -1);
}
