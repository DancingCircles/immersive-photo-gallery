import { projects, type Project } from './projects.ts';
import type { ThemeMode } from './theme.ts';

// Curated selection: edit this list to publish a new daily collection.
export const dailyWorks = projects.slice(0, 12);

export function dailyRoomPalette(theme: ThemeMode) {
  return theme === 'dark'
    ? { background: '#111411', floor: '#1c201c' }
    : { background: '#ffffff', floor: '#f7f7f7' };
}

export function dailyCardCopy(work: Project, index: number, total: number) {
  return {
    photographer: work.photographer,
    title: work.title.toUpperCase().slice(0, 25),
    category: work.category.toUpperCase(),
    year: work.publishedAt.slice(0, 4),
    index: `${String(index + 1).padStart(2, '0')} / ${total}`,
  };
}

const DAILY_RADIUS = 10.05;
export const DAILY_SPHERE_CENTER_Y = 9;
const DAILY_ANGLE_STEP = 0.58;
const DAILY_ARC_STEP = DAILY_RADIUS * DAILY_ANGLE_STEP;
export const DAILY_PERIOD = DAILY_ARC_STEP * 3;

export function dailyCardPose(row: number, column: number, offset: number) {
  const theta = (column - 1.5) * DAILY_ANGLE_STEP;
  let verticalArc = wrapDailyHeight(row * DAILY_ARC_STEP + offset, DAILY_PERIOD);
  if (verticalArc > DAILY_PERIOD / 2) verticalArc -= DAILY_PERIOD;
  const phi = verticalArc / DAILY_RADIUS;
  const latitudeRadius = Math.cos(phi) * DAILY_RADIUS;
  return {
    x: Math.sin(theta) * latitudeRadius,
    y: DAILY_SPHERE_CENTER_Y + Math.sin(phi) * DAILY_RADIUS,
    z: -Math.cos(theta) * latitudeRadius,
    theta,
    phi,
  };
}

export function wrapDailyHeight(height: number, span: number) {
  return ((height % span) + span) % span;
}
