import { GALLERY_BASE_SCALE } from '../../../shared/geometry/gallery-projection.ts';

export type ScreenRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type GallerySelection = {
  projectId: string;
  tileIndex: number;
  sourceRect: ScreenRect;
};

export type GalleryDetailPhase = 'idle' | 'opening' | 'detail' | 'closing';

export type GalleryDetailState = {
  phase: GalleryDetailPhase;
  selection: GallerySelection | null;
};

export type GalleryDetailAction =
  | { type: 'select'; selection: GallerySelection }
  | { type: 'opened' }
  | { type: 'close' }
  | { type: 'closed' };

export const initialGalleryDetailState: GalleryDetailState = {
  phase: 'idle',
  selection: null,
};

export function galleryCardMediaRect(rect: ScreenRect): ScreenRect {
  return {
    left: rect.left + rect.width * (90 / 640),
    top: rect.top + rect.height * (118 / 740),
    width: rect.width * (460 / 640),
    height: rect.height * (480 / 740),
  };
}

export function isGalleryTileExtracted(
  tileIndex: number,
  selectedTileIndex: number | null,
) {
  return selectedTileIndex !== null && tileIndex === selectedTileIndex;
}

export function firstVisibleRaycastHit<
  T extends { object: { visible: boolean } },
>(hits: readonly T[]) {
  return hits.find(({ object }) => object.visible);
}

export function galleryFlightStartTransform(
  source: ScreenRect,
  destination: ScreenRect,
) {
  return {
    x: source.left - destination.left,
    y: source.top - destination.top,
    scaleX: source.width / destination.width,
    scaleY: source.height / destination.height,
  };
}

export function galleryDetailReducer(
  state: GalleryDetailState,
  action: GalleryDetailAction,
): GalleryDetailState {
  if (action.type === 'select') {
    return state.phase === 'idle'
      ? { phase: 'opening', selection: action.selection }
      : state;
  }
  if (action.type === 'opened' && state.phase === 'opening') {
    return { ...state, phase: 'detail' };
  }
  if (action.type === 'close' && state.phase === 'detail') {
    return { ...state, phase: 'closing' };
  }
  if (action.type === 'closed' && state.phase === 'closing') {
    return initialGalleryDetailState;
  }
  return state;
}

function unwarpPoint(x: number, y: number, distortion: number) {
  let outputX = x / GALLERY_BASE_SCALE;
  let outputY = y / GALLERY_BASE_SCALE;
  for (let index = 0; index < 8; index++) {
    const radiusSquared = outputX * outputX + outputY * outputY;
    const scale = GALLERY_BASE_SCALE + distortion * radiusSquared;
    outputX = x / scale;
    outputY = y / scale;
  }
  return [outputX, outputY] as const;
}

export function projectedCornersToScreenRect(
  corners: ReadonlyArray<readonly [number, number]>,
  viewport: { width: number; height: number },
  distortion: number,
): ScreenRect {
  const points = corners.map(([x, y]) => unwarpPoint(x, y, distortion));
  const xs = points.map(([x]) => ((x + 1) / 2) * viewport.width);
  const ys = points.map(([, y]) => ((1 - y) / 2) * viewport.height);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}
