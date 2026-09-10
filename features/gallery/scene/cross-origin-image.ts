export function createCrossOriginImage(): HTMLImageElement {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  return image;
}
