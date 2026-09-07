'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { gsap } from 'gsap';
import { Grid2X2, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  galleryCardMediaRect,
  galleryDetailReducer,
  galleryFlightTransform,
  initialGalleryDetailState,
  type GallerySelection,
} from '@/lib/gallery-detail';
import { projects } from '@/lib/projects';
import type { ViewMode } from '@/lib/projection';
import GalleryDetail from '../gallery-detail';
import Scene from '../scene';
import SiteNav from '../site-nav';

const DETAIL_DURATION = 1.15;

export default function Gallery() {
  const [mode, setMode] = useState<ViewMode>('space');
  const [state, dispatch] = useReducer(
    galleryDetailReducer,
    initialGalleryDetailState,
  );
  const sceneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDialogElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const flightRef = useRef<HTMLImageElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const selected = state.selection
    ? projects.find(({ id }) => id === state.selection?.projectId) ?? null
    : null;

  useEffect(() => {
    const init = requestAnimationFrame(() => {
      if (
        window.innerWidth < 700 ||
        matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        setMode('flat');
    });
    return () => cancelAnimationFrame(init);
  }, []);

  const select = useCallback((selection: GallerySelection) => {
    dispatch({ type: 'select', selection });
  }, []);

  const close = useCallback(() => {
    timelineRef.current?.kill();
    if (sceneRef.current) gsap.set(sceneRef.current, { x: 0, opacity: 1 });
    dispatch({ type: 'close' });
    requestAnimationFrame(() =>
      sceneRef.current
        ?.querySelector<HTMLElement>('.scene')
        ?.focus({ preventScroll: true }),
    );
  }, []);

  useLayoutEffect(() => {
    if (
      state.phase !== 'opening' ||
      !state.selection ||
      !sceneRef.current ||
      !panelRef.current ||
      !mediaRef.current ||
      !imageRef.current ||
      !copyRef.current ||
      !flightRef.current
    )
      return;

    timelineRef.current?.kill();
    const scene = sceneRef.current;
    const panel = panelRef.current;
    const detailImage = imageRef.current;
    const flight = flightRef.current;
    const copyItems = Array.from(copyRef.current.children);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.innerWidth <= 900;
    const source = galleryCardMediaRect(state.selection.sourceRect);

    gsap.set(panel, { xPercent: 0, visibility: 'hidden' });
    const destination = mediaRef.current.getBoundingClientRect();
    const flightTransform = galleryFlightTransform(source, destination);
    gsap.set(panel, {
      xPercent: 100,
      visibility: 'visible',
      opacity: reduced ? 0 : 1,
    });
    gsap.set(detailImage, { opacity: 0 });
    gsap.set(copyItems, { opacity: 0, y: 28 });
    gsap.set(flight, {
      display: 'block',
      left: source.left,
      top: source.top,
      width: source.width,
      height: source.height,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transformOrigin: 'top left',
      opacity: 1,
    });

    const duration = reduced ? 0.22 : DETAIL_DURATION;
    const timeline = gsap.timeline({
      defaults: {
        duration,
        ease: reduced ? 'none' : 'expo.inOut',
        force3D: true,
      },
      onComplete: () => {
        dispatch({ type: 'opened' });
        requestAnimationFrame(() =>
          closeButtonRef.current?.focus({ preventScroll: true }),
        );
      },
    });
    timelineRef.current = timeline;
    timeline
      .to(scene, { x: mobile ? 0 : '-50vw', opacity: mobile ? 0.14 : 1 }, 0)
      .to(panel, { xPercent: 0, opacity: 1 }, 0)
      .to(
        flight,
        {
          ...flightTransform,
          autoRound: false,
        },
        0,
      )
      .to(
        copyItems,
        {
          opacity: 1,
          y: 0,
          duration: reduced ? 0.18 : 0.85,
          stagger: reduced ? 0 : 0.055,
          ease: reduced ? 'none' : 'expo.out',
        },
        reduced ? 0 : 0.48,
      )
      .set(flight, { opacity: 1 });

    return () => {
      timeline.kill();
    };
  }, [selected, state.phase, state.selection]);

  useEffect(() => {
    if (state.phase === 'idle') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, state.phase]);

  return (
    <main className="app-shell gallery-shell" data-detail-open={selected !== null}>
      <div ref={sceneRef} className="space-view gallery-scene-view">
        <Scene
          items={projects}
          mode={mode}
          theme="light"
          paused={state.phase !== 'idle'}
          selectedTileIndex={state.selection?.tileIndex ?? null}
          onSelect={select}
          onError={() => setMode('flat')}
        />
      </div>
      <SiteNav current="gallery" />
      <footer className="controls">
        <Tabs value={mode} onValueChange={(value) => setMode(value as ViewMode)}>
          <TabsList className="view-tabs" aria-label="选择视角">
            <TabsTrigger value="space" aria-label="3D 空间视角">
              <Grid2X2 /> <span>3D</span>
            </TabsTrigger>
            <TabsTrigger value="flat" aria-label="平铺视角">
              <List />
              <span>Flat</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </footer>
      {selected && (
        <>
          <button
            className="gallery-detail__dismiss-area"
            type="button"
            tabIndex={-1}
            aria-label="关闭作品详情"
            onClick={close}
          />
          <GalleryDetail
            project={selected}
            phase={state.phase}
            panelRef={panelRef}
            mediaRef={mediaRef}
            imageRef={imageRef}
            copyRef={copyRef}
            closeButtonRef={closeButtonRef}
            onClose={close}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={flightRef}
            className="gallery-flight"
            src={selected.image}
            alt=""
            aria-hidden="true"
          />
        </>
      )}
    </main>
  );
}
