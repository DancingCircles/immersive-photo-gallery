'use client';
// This canvas region deliberately accepts keyboard focus for arrow navigation.
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import type { GalleryCard } from '../catalog/card-view-model';
import {
  firstVisibleRaycastHit,
  isGalleryTileExtracted,
  projectedCornersToScreenRect,
  type GallerySelection,
} from '@/features/gallery/detail/detail-state';
import { getThemePalette, type ThemeMode } from '@/shared/theme/palette';
import {
  GRID_CELL_HEIGHT,
  GRID_CELL_WIDTH,
  GALLERY_BASE_SCALE,
  cameraDistanceForAspect,
  distortionForViewport,
  type ViewMode,
} from '@/shared/geometry/gallery-projection';
import { cameraDistanceForDrag, isDragGesture } from '@/shared/input/drag';
import { createCrossOriginImage } from './cross-origin-image';
import {
  virtualCellForOffset,
  catalogIndexForCell,
  shouldPrefetchCatalog,
  createBindingGeneration,
} from './virtual-grid';

// These values and the radial mapping mirror the public production shader.
const lens = {
  uniforms: {
    tDiffuse: { value: null },
    distortion: { value: new THREE.Vector2() },
    backgroundColor: { value: new THREE.Color(0xffffff) },
  },
  vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 distortion; uniform vec3 backgroundColor; varying vec2 vUv; const vec2 CENTER=vec2(.5); void main(){vec2 p=2.0*(vUv-.5); vec2 q=(.88+distortion*dot(p,p))*p; vec2 uv=q*.5+.5; vec3 color=backgroundColor; if(uv.x>=0.0&&uv.x<=1.0&&uv.y>=0.0&&uv.y<=1.0){color=texture2D(tDiffuse,uv).rgb;} float dist=distance(vUv,CENTER); color*=1.0-.045*smoothstep(.28,.72,dist); gl_FragColor=vec4(color,1.0);}`,
};
type CardSurface = {
  tileIndex: number;
  material: THREE.MeshBasicMaterial;
  bind: (work: GalleryCard | undefined) => void;
  release: () => void;
  repaint: (theme: ThemeMode, hovered: boolean, extracted: boolean) => void;
};
export default function Scene({
  items,
  mode,
  theme,
  paused = false,
  selectedTileIndex = null,
  visibleProjectIds,
  hasMore = false,
  onNeedMore,
  onSelect,
  onError,
}: {
  items: GalleryCard[];
  mode: ViewMode;
  theme: ThemeMode;
  paused?: boolean;
  selectedTileIndex?: number | null;
  visibleProjectIds?: readonly string[];
  hasMore?: boolean;
  onNeedMore?: () => void;
  onSelect?: (selection: GallerySelection) => void;
  onError: () => void;
}) {
  const host = useRef<HTMLElement>(null),
    itemsRef = useRef(items),
    hasMoreRef = useRef(hasMore),
    needMoreRef = useRef(onNeedMore),
    applyItemsRef = useRef<((value: GalleryCard[]) => void) | null>(null),
    modeRef = useRef(mode),
    themeRef = useRef(theme),
    pausedRef = useRef(paused),
    selectedTileRef = useRef(selectedTileIndex),
    visibleProjectIdsRef = useRef<readonly string[] | undefined>(
      visibleProjectIds,
    ),
    selectRef = useRef(onSelect),
    applyThemeRef = useRef<((value: ThemeMode) => void) | null>(null),
    applyVisibilityRef = useRef<
      ((projectIds: readonly string[] | undefined) => void) | null
    >(null),
    fail = useRef(onError);
  useLayoutEffect(() => {
    itemsRef.current = items;
    hasMoreRef.current = hasMore;
    needMoreRef.current = onNeedMore;
    applyItemsRef.current?.(items);
  }, [items, hasMore, onNeedMore]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    themeRef.current = theme;
    applyThemeRef.current?.(theme);
  }, [theme]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useLayoutEffect(() => {
    selectedTileRef.current = selectedTileIndex;
    applyThemeRef.current?.(themeRef.current);
  }, [selectedTileIndex]);
  useLayoutEffect(() => {
    visibleProjectIdsRef.current = visibleProjectIds;
    applyVisibilityRef.current?.(visibleProjectIds);
  }, [visibleProjectIds]);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    fail.current = onError;
  }, [onError]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      fail.current();
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setClearColor(getThemePalette(themeRef.current).surface);
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100);
    camera.position.z = 8.4;
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const warp = new ShaderPass(lens);
    composer.addPass(warp);
    composer.addPass(new OutputPass());
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const initialDistortion = reduced
      ? 0
      : distortionForViewport(modeRef.current, camera.aspect);
    warp.uniforms.distortion.value.setScalar(initialDistortion);
    let alive = true,
      raf = 0,
      down = false,
      dragging = false,
      pressX = 0,
      pressY = 0,
      lastX = 0,
      lastY = 0,
      vx = 0,
      vy = 0,
      offsetX = 0,
      offsetY = 0,
      px = 0,
      py = 0,
      baseCameraZ = camera.position.z,
      distortionCurrent = initialDistortion,
      distortionFrom = initialDistortion,
      distortionTarget = initialDistortion,
      distortionStartedAt = performance.now();
    const materials: THREE.Material[] = [],
      textures: THREE.Texture[] = [],
      cardSurfaces: CardSurface[] = [];
    const width = GRID_CELL_WIDTH,
      height = GRID_CELL_HEIGHT,
      cols = 8,
      rows = 6,
      geometry = new THREE.PlaneGeometry(width - 0.012, height - 0.012);
    // Each repeating tile owns its texture so only the hovered position changes.
    const createCardSurface = (tileIndex: number): CardSurface => {
      let p: GalleryCard | undefined;
      let pendingImage: HTMLImageElement | undefined;
      const generation = createBindingGeneration();
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 740;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      textures.push(texture);
      let loadedImage: HTMLImageElement | undefined;
      const paint = (
        activeTheme: ThemeMode,
        hovered: boolean,
        extracted: boolean,
        img = loadedImage,
      ) => {
        const palette = getThemePalette(activeTheme);
        ctx.fillStyle = palette.surface;
        ctx.fillRect(0, 0, 640, 740);
        if (!p) {
          texture.needsUpdate = true;
          return;
        }
        if (hovered && img && !extracted) {
          const scale = Math.max(640 / img.width, 740 / img.height) * 1.2;
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.save();
          ctx.globalAlpha = 0.56;
          ctx.filter = 'blur(24px) saturate(1.35)';
          ctx.drawImage(img, 320 - w / 2, 370 - h / 2, w, h);
          ctx.restore();
          ctx.fillStyle = palette.hoverOverlay;
          ctx.fillRect(0, 0, 640, 740);
        }
        ctx.strokeStyle = hovered ? palette.hoverBorder : palette.border;
        ctx.lineWidth = hovered ? 5 : 2;
        ctx.strokeRect(1, 1, 638, 738);
        ctx.fillStyle = palette.text;
        ctx.font = '700 24px Arial';
        ctx.fillText(p.photographerName, 24, 42);
        ctx.font = '700 19px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(p.title.toUpperCase().slice(0, 25), 616, 42);
        ctx.textAlign = 'left';
        ctx.fillStyle = extracted ? palette.surface : palette.mediaSurface;
        ctx.fillRect(90, 118, 460, 480);
        if (img && !extracted) {
          const scale = Math.min(460 / img.width, 480 / img.height),
            w = img.width * scale,
            h = img.height * scale;
          ctx.drawImage(img, 320 - w / 2, 358 - h / 2, w, h);
        } else {
          ctx.fillStyle = palette.fallbackText;
          ctx.font = '700 25px Arial';
          ctx.fillText(p.title.slice(0, 23), 108, 360);
        }
        ctx.fillStyle = palette.pill;
        ctx.beginPath();
        ctx.roundRect(24, 680, 195, 30, 15);
        ctx.fill();
        ctx.fillStyle = palette.pillText;
        ctx.font = '700 18px monospace';
        ctx.fillText(p.category.toUpperCase(), 37, 700);
        ctx.textAlign = 'right';
        ctx.fillText(p.publishedAt.slice(0, 4), 612, 700);
        ctx.textAlign = 'left';
        texture.needsUpdate = true;
      };
      paint(themeRef.current, false, false);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      materials.push(material);
      const surface: CardSurface = {
        tileIndex,
        material,
        repaint: (activeTheme, hovered, extracted) =>
          paint(activeTheme, hovered, extracted),
        bind: (work) => {
          const currentGeneration = generation.next();
          if (pendingImage) {
            pendingImage.onload = pendingImage.onerror = null;
            pendingImage.src = '';
          }
          if (surface === hoveredSurface) hoveredSurface = null;
          p = work;
          loadedImage = undefined;
          surface.repaint(
            themeRef.current,
            false,
            isGalleryTileExtracted(tileIndex, selectedTileRef.current),
          );
          if (!work) return;
          const img = createCrossOriginImage();
          pendingImage = img;
          img.onload = () => {
            if (!alive || !generation.isCurrent(currentGeneration)) return;
            loadedImage = img;
            surface.repaint(
              themeRef.current,
              surface === hoveredSurface,
              isGalleryTileExtracted(
                surface.tileIndex,
                selectedTileRef.current,
              ),
            );
          };
          img.src = work.sceneImageSrc;
        },
        release: () => {
          generation.next();
          if (pendingImage) {
            pendingImage.onload = pendingImage.onerror = null;
            pendingImage.src = '';
          }
          loadedImage = pendingImage = undefined;
          if (surface === hoveredSurface) hoveredSurface = null;
        },
      };
      return surface;
    };
    let hoveredSurface: CardSurface | null = null;
    const applyTheme = (value: ThemeMode) => {
      const palette = getThemePalette(value);
      renderer.setClearColor(palette.surface);
      warp.uniforms.backgroundColor.value.set(palette.surface);
      cardSurfaces.forEach((surface) =>
        surface.repaint(
          value,
          surface === hoveredSurface,
          isGalleryTileExtracted(surface.tileIndex, selectedTileRef.current),
        ),
      );
    };
    applyThemeRef.current = applyTheme;
    applyTheme(themeRef.current);
    const tiles: THREE.Mesh[] = [];
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++) {
        const tileIndex = row * cols + col;
        const surface = createCardSurface(tileIndex);
        cardSurfaces.push(surface);
        const mesh = new THREE.Mesh(geometry, surface.material);
        mesh.userData = {
          x: (col - cols / 2 + 0.5) * width,
          y: (row - rows / 2 + 0.5) * height,
          surface,
          row,
          column: col,
          catalogIndex: tileIndex,
          project: undefined,
          tileIndex,
        };
        scene.add(mesh);
        tiles.push(mesh);
      }
    const applyVisibility = (projectIds: readonly string[] | undefined) => {
      const visibleIds = projectIds ? new Set(projectIds) : null;
      tiles.forEach((tile) => {
        const project = tile.userData.project as GalleryCard | undefined;
        tile.visible = !!project && (!visibleIds || visibleIds.has(project.id));
      });
    };
    const bindTile = (tile: THREE.Mesh, index: number) => {
      const catalog = itemsRef.current;
      const project = catalog.length
        ? catalog[hasMoreRef.current ? index : index % catalog.length]
        : undefined;
      const previousProject = tile.userData.project as GalleryCard | undefined;
      tile.userData.catalogIndex = index;
      tile.userData.project = project;
      if (
        previousProject?.id !== project?.id ||
        previousProject?.sceneImageSrc !== project?.sceneImageSrc
      ) {
        (tile.userData.surface as CardSurface).bind(project);
        tile.position.z = 0;
      }
      const visibleIds = visibleProjectIdsRef.current;
      tile.visible =
        !!project && (!visibleIds || visibleIds.includes(project.id));
    };
    let prefetchedLength = -1;
    let lastPrefetchAt = -Infinity;
    const applyItems = (catalog: GalleryCard[]) => {
      // Appending a page preserves logical cells and all existing surface images.
      // A replaced search catalog starts at the first page without a renderer reset.
      const previousFirst = tiles[0]?.userData.catalogFirstId as
        | string
        | undefined;
      if (previousFirst !== catalog[0]?.id) {
        offsetX = offsetY = vx = vy = 0;
        prefetchedLength = -1;
      }
      for (const tile of tiles) {
        tile.userData.catalogFirstId = catalog[0]?.id;
        const cell = virtualCellForOffset(
          tile.userData as { row: number; column: number },
          { x: offsetX / width, y: offsetY / height },
          { columns: cols, rows },
        );
        bindTile(tile, catalogIndexForCell(cell, { columns: cols, rows }));
      }
    };
    applyItemsRef.current = applyItems;
    applyItems(itemsRef.current);
    applyVisibilityRef.current = applyVisibility;
    applyVisibility(visibleProjectIdsRef.current);
    const resize = () => {
      const w = element.clientWidth,
        h = element.clientHeight;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      camera.aspect = w / h;
      baseCameraZ = cameraDistanceForAspect(camera.aspect);
      if (!dragging) camera.position.z = baseCameraZ;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const updatePointer = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      px = (clientX - rect.left) / rect.width - 0.5;
      py = (clientY - rect.top) / rect.height - 0.5;
      const x = px * 2;
      const y = -py * 2;
      const radialScale =
        GALLERY_BASE_SCALE + distortionCurrent * (x * x + y * y);
      pointer.set(x * radialScale, y * radialScale);
    };
    const meshScreenRect = (mesh: THREE.Mesh) => {
      const halfWidth = (width - 0.012) / 2;
      const halfHeight = (height - 0.012) / 2;
      const corners = [
        new THREE.Vector3(-halfWidth, halfHeight, 0),
        new THREE.Vector3(halfWidth, halfHeight, 0),
        new THREE.Vector3(halfWidth, -halfHeight, 0),
        new THREE.Vector3(-halfWidth, -halfHeight, 0),
      ];
      scene.updateMatrixWorld();
      camera.updateMatrixWorld();
      return projectedCornersToScreenRect(
        corners.map((corner) => {
          const projected = corner
            .applyMatrix4(mesh.matrixWorld)
            .project(camera);
          return [projected.x, projected.y] as const;
        }),
        { width: element.clientWidth, height: element.clientHeight },
        distortionCurrent,
      );
    };
    const wrap = (n: number, span: number) =>
      ((((n + span / 2) % span) + span) % span) - span / 2;
    const pointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || pausedRef.current) return;
      down = true;
      dragging = false;
      pressX = e.clientX;
      pressY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      vx = vy = 0;
      element.setPointerCapture(e.pointerId);
      element.classList.add('dragging');
    };
    const pointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
      if (!down) return;
      dragging ||= isDragGesture(pressX, pressY, e.clientX, e.clientY);
      const scale =
          (2 *
            Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
            camera.position.z) /
          element.clientHeight,
        dx = (e.clientX - lastX) * scale,
        dy = -(e.clientY - lastY) * scale;
      offsetX += dx;
      offsetY += dy;
      vx = dx;
      vy = dy;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const resetPointer = () => {
      down = false;
      dragging = false;
      element.classList.remove('dragging');
      if (reduced) vx = vy = 0;
    };
    const pointerUp = (e: PointerEvent) => {
      const wasDragging = dragging;
      resetPointer();
      if (wasDragging || pausedRef.current || !selectRef.current) return;
      updatePointer(e.clientX, e.clientY);
      scene.updateMatrixWorld();
      camera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, camera);
      const mesh = firstVisibleRaycastHit(raycaster.intersectObjects(tiles))
        ?.object as THREE.Mesh | undefined;
      const project = mesh?.userData.project as GalleryCard | undefined;
      if (!mesh || !project) return;
      vx = vy = 0;
      selectRef.current({
        projectId: project.id,
        tileIndex: mesh.userData.tileIndex as number,
        sourceRect: meshScreenRect(mesh),
      });
    };
    const wheel = (e: WheelEvent) => {
      if (pausedRef.current) return;
      e.preventDefault();
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? element.clientHeight : 1;
      vx = -e.deltaX * unit * 0.001;
      vy = e.deltaY * unit * 0.001;
      offsetX += vx;
      offsetY += vy;
    };
    const key = (e: KeyboardEvent) => {
      if (pausedRef.current) return;
      const d = 0.35;
      if (e.key.startsWith('Arrow')) e.preventDefault();
      if (e.key === 'ArrowLeft') offsetX += d;
      if (e.key === 'ArrowRight') offsetX -= d;
      if (e.key === 'ArrowUp') offsetY -= d;
      if (e.key === 'ArrowDown') offsetY += d;
      if (e.key === 'Home') {
        offsetX = offsetY = vx = vy = 0;
      }
      if ((e.key === 'Enter' || e.key === ' ') && selectRef.current) {
        e.preventDefault();
        scene.updateMatrixWorld();
        camera.updateMatrixWorld();
        const center = new THREE.Vector3();
        const mesh = tiles.reduce<THREE.Mesh | null>((closest, tile) => {
          if (!tile.visible) return closest;
          const point = center
            .setFromMatrixPosition(tile.matrixWorld)
            .project(camera);
          if (Math.abs(point.x) > 1.1 || Math.abs(point.y) > 1.1)
            return closest;
          if (!closest) return tile;
          const closestPoint = new THREE.Vector3()
            .setFromMatrixPosition(closest.matrixWorld)
            .project(camera);
          return point.x * point.x + point.y * point.y <
            closestPoint.x * closestPoint.x + closestPoint.y * closestPoint.y
            ? tile
            : closest;
        }, null);
        const project = mesh?.userData.project as GalleryCard | undefined;
        if (mesh && project) {
          vx = vy = 0;
          selectRef.current({
            projectId: project.id,
            tileIndex: mesh.userData.tileIndex as number,
            sourceRect: meshScreenRect(mesh),
          });
        }
      }
    };
    element.addEventListener('pointerdown', pointerDown);
    element.addEventListener('pointermove', pointerMove);
    element.addEventListener('pointerup', pointerUp);
    element.addEventListener('pointercancel', resetPointer);
    element.addEventListener('lostpointercapture', resetPointer);
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('keydown', key);
    const lost = (e: Event) => {
      e.preventDefault();
      fail.current();
    };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    let previous = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const targetCameraZ =
        dragging && !reduced ? cameraDistanceForDrag(baseCameraZ) : baseCameraZ;
      camera.position.z +=
        (targetCameraZ - camera.position.z) * (1 - Math.exp(-10 * dt));
      if (!pausedRef.current && !down && !reduced) {
        offsetX += vx * dt * 60;
        offsetY += vy * dt * 60;
        vx *= Math.exp(-5 * dt);
        vy *= Math.exp(-5 * dt);
      }
      tiles.forEach((tile) => {
        tile.position.x = wrap(tile.userData.x + offsetX, cols * width);
        tile.position.y = wrap(tile.userData.y + offsetY, rows * height);
        const cell = virtualCellForOffset(
          tile.userData as { row: number; column: number },
          { x: offsetX / width, y: offsetY / height },
          { columns: cols, rows },
        );
        const index = catalogIndexForCell(cell, { columns: cols, rows });
        if (!pausedRef.current && index !== tile.userData.catalogIndex)
          bindTile(tile, index);
        if (
          !pausedRef.current &&
          shouldPrefetchCatalog(
            index,
            itemsRef.current.length,
            hasMoreRef.current,
          ) &&
          prefetchedLength !== itemsRef.current.length &&
          now - lastPrefetchAt >= 500 &&
          needMoreRef.current
        ) {
          prefetchedLength = itemsRef.current.length;
          lastPrefetchAt = now;
          needMoreRef.current();
        }
      });
      const requestedDistortion = reduced
        ? 0
        : distortionForViewport(modeRef.current, camera.aspect);
      if (requestedDistortion !== distortionTarget) {
        distortionFrom = distortionCurrent;
        distortionTarget = requestedDistortion;
        distortionStartedAt = now;
      }
      const transitionProgress = Math.min(
          1,
          (now - distortionStartedAt) / 1000,
        ),
        easedProgress = 1 - (1 - transitionProgress) ** 2;
      distortionCurrent =
        distortionFrom + (distortionTarget - distortionFrom) * easedProgress;
      warp.uniforms.distortion.value.setScalar(distortionCurrent);
      const fullDistortion = Math.abs(
          distortionForViewport('space', camera.aspect),
        ),
        depth = fullDistortion
          ? Math.abs(distortionCurrent) / fullDistortion
          : 0;
      camera.position.x += (px * 0.17 * depth - camera.position.x) * 0.05;
      camera.position.y += (-py * 0.12 * depth - camera.position.y) * 0.05;
      // Ray picking uses the same UV deformation as the postprocessing shader.
      const x = px * 2,
        y = -py * 2,
        radialScale = GALLERY_BASE_SCALE + distortionCurrent * (x * x + y * y);
      pointer.set(x * radialScale, y * radialScale);
      scene.updateMatrixWorld();
      camera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, camera);
      const hovered =
        pausedRef.current || down
          ? null
          : firstVisibleRaycastHit(raycaster.intersectObjects(tiles))?.object;
      const nextSurface = hovered?.userData.surface as CardSurface | undefined;
      if (nextSurface !== hoveredSurface) {
        if (hoveredSurface)
          hoveredSurface.repaint(
            themeRef.current,
            false,
            isGalleryTileExtracted(
              hoveredSurface.tileIndex,
              selectedTileRef.current,
            ),
          );
        if (nextSurface)
          nextSurface.repaint(
            themeRef.current,
            true,
            isGalleryTileExtracted(
              nextSurface.tileIndex,
              selectedTileRef.current,
            ),
          );
        hoveredSurface = nextSurface ?? null;
      }
      for (const tile of tiles) {
        tile.position.z +=
          ((tile === hovered ? 0.06 + 0.06 * depth : 0) - tile.position.z) *
          (reduced ? 1 : 0.12);
      }
      composer.render();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      applyThemeRef.current = null;
      applyVisibilityRef.current = null;
      applyItemsRef.current = null;
      cardSurfaces.forEach((surface) => surface.release());
      cancelAnimationFrame(raf);
      observer.disconnect();
      element.removeEventListener('pointerdown', pointerDown);
      element.removeEventListener('pointermove', pointerMove);
      element.removeEventListener('pointerup', pointerUp);
      element.removeEventListener('pointercancel', resetPointer);
      element.removeEventListener('lostpointercapture', resetPointer);
      element.removeEventListener('wheel', wheel);
      element.removeEventListener('keydown', key);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      composer.passes.forEach((p) => p.dispose());
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  // The keyboard-focusable canvas region handles arrows and Home itself.
  return (
    <section
      className="scene"
      ref={host}
      tabIndex={0}
      aria-label={`${mode === 'space' ? '球体内部 3D' : '平铺'}作品墙。拖拽、滚轮或方向键浏览，Enter 键打开中心作品，Home 键重置。`}
    />
  );
}
