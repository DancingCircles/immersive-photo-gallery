export const DRAG_THRESHOLD_PX = 3;

export function isDragGesture(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
) {
  return Math.hypot(currentX - startX, currentY - startY) > DRAG_THRESHOLD_PX;
}

export function cameraDistanceForDrag(baseDistance: number) {
  return baseDistance + Math.min(0.65, baseDistance * 0.08);
}

export function chairYawAfterDrag(currentYaw: number, horizontalPixels: number) {
  return currentYaw + horizontalPixels * 0.012;
}
