'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { gsap } from 'gsap';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import type { CursorPage } from '@/application/ports/content-repository';
import type { WorkSummary } from '@/domain/work/work';
import {
  galleryCardMediaRect,
  galleryDetailReducer,
  galleryFlightStartTransform,
  initialGalleryDetailState,
  type GallerySelection,
} from '@/features/gallery/detail/detail-state';
import type { ViewMode } from '@/shared/geometry/gallery-projection';
import GalleryDetail from './detail/gallery-detail';
import GalleryScene from './scene/gallery-scene';
import { toGalleryCard } from './catalog/card-view-model';
import { useGalleryCatalog } from './catalog/use-catalog';
import SiteNav from '@/components/navigation/site-nav';
import { useWorkDetail } from '@/features/work-detail/use-work-detail';
import { useWorkHistory } from '@/features/work-detail/use-work-history';

const DETAIL_DURATION = 0.72;
const DETAIL_CLOSE_DURATION = 0.26;

export default function GalleryClient({
  initialPage,
}: {
  initialPage: CursorPage<WorkSummary>;
}) {
  const [mode, setMode] = useState<ViewMode>('space');
  const {
    items: catalogItems,
    query,
    setQuery,
    hasMore,
    loadMore,
    status: catalogStatus,
    error: catalogError,
    retry,
  } = useGalleryCatalog(initialPage);
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
  const items = useMemo(() => catalogItems.map(toGalleryCard), [catalogItems]);
  const selected = state.selection
    ? (items.find(({ id }) => id === state.selection?.projectId) ?? null)
    : null;
  const visibleProjectIds = useMemo(() => items.map(({ id }) => id), [items]);

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
    if (state.phase !== 'detail') return;
    timelineRef.current?.kill();
    dispatch({ type: 'close' });
  }, [state.phase]);
  const detail = useWorkDetail(selected?.id ?? null);
  const { begin: beginHistory, finish: finishHistory } = useWorkHistory(selected?.id ?? null, state.phase === 'detail', close);

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
    const flightStart = galleryFlightStartTransform(source, destination);
    gsap.set(panel, {
      xPercent: 100,
      visibility: 'visible',
      opacity: reduced ? 0 : 1,
    });
    gsap.set(detailImage, { opacity: 0 });
    gsap.set(copyItems, { opacity: 0, y: 28 });
    gsap.set(flight, {
      display: 'block',
      left: destination.left,
      top: destination.top,
      width: destination.width,
      height: destination.height,
      ...flightStart,
      transformOrigin: 'top left',
      opacity: 1,
    });

    const duration = reduced ? 0.22 : DETAIL_DURATION;
    const timeline = gsap.timeline({
      defaults: {
        duration,
        ease: reduced ? 'none' : 'power3.inOut',
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
      .to(scene, { x: mobile ? 0 : '-50vw', opacity: mobile ? 0.12 : 0.28 }, 0)
      .to(panel, { xPercent: 0, opacity: 1 }, 0)
      .to(
        flight,
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          autoRound: false,
        },
        0,
      )
      .to(
        copyItems,
        {
          opacity: 1,
          y: 0,
          duration: reduced ? 0.18 : 0.42,
          stagger: reduced ? 0 : 0.035,
          ease: reduced ? 'none' : 'power2.out',
        },
        reduced ? 0 : 0.24,
      )
      .set(detailImage, { opacity: 1 })
      .set(flight, { display: 'none' });
    beginHistory(state.selection.projectId);

    return () => {
      timeline.kill();
    };
  }, [beginHistory, selected, state.phase, state.selection]);

  useLayoutEffect(() => {
    if (state.phase !== 'closing' || !sceneRef.current || !panelRef.current)
      return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.innerWidth <= 900;
    const timeline = gsap.timeline({
      defaults: {
        duration: reduced ? 0 : DETAIL_CLOSE_DURATION,
        ease: reduced ? 'none' : 'power2.out',
        force3D: true,
      },
      onComplete: () => {
        finishHistory();
        dispatch({ type: 'closed' });
        requestAnimationFrame(() =>
          sceneRef.current
            ?.querySelector<HTMLElement>('.scene')
            ?.focus({ preventScroll: true }),
        );
      },
    });
    timelineRef.current = timeline;
    timeline
      .to(panelRef.current, { xPercent: mobile ? 0 : 4, opacity: 0 }, 0)
      .to(sceneRef.current, { x: 0, opacity: 1 }, 0);

    return () => {
      timeline.kill();
    };
  }, [finishHistory, state.phase]);

  useEffect(() => {
    if (state.phase === 'idle') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, state.phase]);

  return (
    <main
      className="app-shell gallery-shell"
      data-detail-open={selected !== null}
    >
      <div ref={sceneRef} className="space-view gallery-scene-view">
        <GalleryScene
          items={items}
          hasMore={hasMore}
          onNeedMore={loadMore}
          visibleProjectIds={visibleProjectIds}
          mode={mode}
          theme="light"
          paused={state.phase !== 'idle'}
          selectedTileIndex={
            state.phase === 'closing'
              ? null
              : (state.selection?.tileIndex ?? null)
          }
          onSelect={select}
          onError={() => setMode('flat')}
        />
      </div>
      <SiteNav
        current="gallery"
        searchValue={query}
        onSearchChange={setQuery}
      />
      {catalogStatus === 'search-error' && (
        <div className="gallery-catalog__notice" role="alert">
          <span>{catalogError?.message ?? '搜索作品失败'}</span>
          <button type="button" onClick={retry}>重试</button>
        </div>
      )}
      {query.trim() && catalogStatus === 'ready' && visibleProjectIds.length === 0 && (
        <output className="gallery-empty-results">
          NO WORKS FOUND / 未找到作品
        </output>
      )}
      {catalogStatus === 'load-more-error' && (
        <div className="gallery-catalog__notice" role="alert">
          <span>{catalogError?.message ?? '加载更多作品失败'}</span>
          <button type="button" onClick={retry}>重试</button>
        </div>
      )}
      <footer className="controls">
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as ViewMode)}
        >
          <TabsList
            className="view-tabs"
            variant="line"
            aria-label="选择视角"
          >
            <TabsTrigger value="space" aria-label="3D 空间视角">
              3D VIEW
            </TabsTrigger>
            <TabsTrigger value="flat" aria-label="平铺视角">
              FLAT VIEW
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {hasMore && (
          <button
            className="gallery-catalog__more"
            type="button"
            disabled={catalogStatus === 'loading-more'}
            onClick={() => void loadMore()}
          >
            {catalogStatus === 'loading-more' ? 'LOADING' : 'LOAD MORE'}
          </button>
        )}
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
            work={selected}
            detail={detail}
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
            src={selected.thumbnail.src}
            alt=""
            aria-hidden="true"
          />
        </>
      )}
    </main>
  );
}
