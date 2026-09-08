export type ViewMode = 'space' | 'flat';

export const GALLERY_BASE_SCALE = 0.88;
export const GALLERY_DISTORTION = -0.07;
export const GRID_CELL_WIDTH = 2.5;
export const GRID_CELL_HEIGHT = 2.35;

export function cameraDistanceForAspect(aspect: number) {
  return Math.min(8.4, 12.8 / aspect);
}

export function distortionForViewport(mode: ViewMode, aspect: number) {
  return mode === 'space' ? GALLERY_DISTORTION * aspect : 0;
}

export function projectGalleryUv(
  x: number,
  y: number,
  distortion: number,
): [number, number] {
  const radiusSquared = x * x + y * y;
  const scale = GALLERY_BASE_SCALE + distortion * radiusSquared;
  return [x * scale, y * scale];
}
