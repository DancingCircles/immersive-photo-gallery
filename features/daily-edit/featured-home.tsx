'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { gsap } from 'gsap';
import type { WorkSummary } from '@/domain/work/work';
import { featuredReducer, initialFeaturedState } from '@/features/daily-edit/state/featured-state';
import {
  computeStaggerDelays,
  generateMotionPath,
  getClipPathsForDirection,
  getDetailImageSide,
  transitionConfig,
  type ImageSide,
  type RectSnapshot,
} from '@/shared/animation/repeating-transition';
import FeaturedCard from './featured-card';
import FeaturedDetail from './featured-detail';
import { toFeaturedWork, type FeaturedWork } from './daily-edit-view-model';
import { useWorkDetail } from '@/features/work-detail/use-work-detail';
import { useWorkHistory } from '@/features/work-detail/use-work-history';
import SmoothScroll from './smooth-scroll';
import XylophoneBackground, {
  type XylophoneBackgroundHandle,
} from './xylophone-background';
import XylophoneSoundToggle from './xylophone-sound-toggle';
import BackendStatusIndicator from '@/components/navigation/backend-status-indicator';
import SiteNav from '@/components/navigation/site-nav';

const SOUND_STORAGE_KEY = 'xylophone:sound';
const soundPreferenceListeners = new Set<() => void>();

function subscribeToSoundPreference(listener: () => void) {
  soundPreferenceListeners.add(listener);
  return () => soundPreferenceListeners.delete(listener);
}

function readSoundEnabled() {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

function persistSoundEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
  soundPreferenceListeners.forEach((listener) => listener());
}

const snapshot = ({ left, top, width, height }: DOMRect): RectSnapshot => ({
  left,
  top,
  width,
  height,
});

export default function FeaturedHome({ works }: { works: WorkSummary[] }) {
  const [state, dispatch] = useReducer(featuredReducer, initialFeaturedState);
  const [imageSide, setImageSide] = useState<ImageSide>('right');
  const soundEnabled = useSyncExternalStore(
    subscribeToSoundPreference,
    readSoundEnabled,
    () => true,
  );
  const xylophoneRef = useRef<XylophoneBackgroundHandle | null>(null);
  const sourceRef = useRef<HTMLButtonElement | null>(null);
  const sourceRectRef = useRef<RectSnapshot | null>(null);
  const panelRef = useRef<HTMLDialogElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const gridRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const layersRef = useRef<HTMLElement[]>([]);
  const timelinesRef = useRef<gsap.core.Timeline[]>([]);
  const selectionActiveRef = useRef(false);
  const readyRef = useRef(false);
  const closingRef = useRef(false);
  const finishHistoryRef = useRef<() => void>(() => {});
  const dailyWorks = useMemo(
    () => works.map((work, index) => toFeaturedWork(work, index, works.length)),
    [works],
  );
  const selected =
    state.selectedId === null ? null : (dailyWorks[state.selectedId] ?? null);

  const changeSoundEnabled = useCallback((enabled: boolean) => {
    persistSoundEnabled(enabled);
    xylophoneRef.current?.setSoundEnabled(enabled);
  }, []);

  const removeMovers = useCallback(() => {
    layersRef.current.forEach((layer) => layer.remove());
    layersRef.current = [];
  }, []);

  const clearRuntime = useCallback(() => {
    timelinesRef.current.forEach((timeline) => timeline.kill());
    timelinesRef.current = [];
    removeMovers();
  }, [removeMovers]);

  const close = useCallback(() => {
    if (!selected || !readyRef.current || closingRef.current) return;
    closingRef.current = true;
    readyRef.current = false;
    clearRuntime();
    const cards = Array.from(
      gridRef.current?.querySelectorAll<HTMLElement>('[data-featured-index]') ??
        [],
    );
    const clicked = sourceRef.current?.closest<HTMLElement>(
      '[data-featured-index]',
    );
    if (!clicked || !panelRef.current || !imageRef.current) return;
    const delays = computeStaggerDelays(
      snapshot(clicked.getBoundingClientRect()),
      cards.map((card) => snapshot(card.getBoundingClientRect())),
    );
    const frames = [
      headerRef.current,
      document.querySelector('.site-nav'),
    ].filter(Boolean);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeline = gsap.timeline({
      defaults: {
        duration: reduce ? 0.18 : transitionConfig.stepDuration,
        ease: reduce ? 'none' : 'expo',
      },
      onComplete: () => {
        finishHistoryRef.current();
        dispatch({ type: 'close' });
      },
    });
    timelinesRef.current.push(timeline);
    if (reduce) {
      timeline
        .to(panelRef.current, { opacity: 0 }, 0)
        .to(frames, { opacity: 1, pointerEvents: 'auto' }, 0)
        .to(cards, { opacity: 1 }, 0);
    } else {
      // Reference reset order and positions, including frame restoration at time zero.
      timeline
        .to(panelRef.current, { opacity: 0 })
        .to(
          frames,
          {
            opacity: 1,
            duration: 0.5,
            ease: 'sine.inOut',
            pointerEvents: 'auto',
          },
          0,
        )
        .set(
          panelRef.current,
          { opacity: 0, pointerEvents: 'none' },
          transitionConfig.stepDuration,
        )
        .set(
          imageRef.current,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          transitionConfig.stepDuration,
        )
        .set(cards, { clipPath: 'none', opacity: 0, scale: 0.8 }, 0)
        // The source '>' follows the grid set at zero, so restoration overlaps the panel fade.
        .to(
          cards,
          { opacity: 1, scale: 1, delay: (index) => delays[index] },
          '>',
        );
    }
  }, [clearRuntime, selected]);
  const detail = useWorkDetail(selected?.id ?? null);
  const { begin: beginHistory, finish: finishHistory } = useWorkHistory(selected?.id ?? null, state.phase === 'detail', close);
  useEffect(() => { finishHistoryRef.current = finishHistory; }, [finishHistory]);

  const select = useCallback(
    (work: FeaturedWork, source: HTMLButtonElement) => {
      if (selectionActiveRef.current) return;
      selectionActiveRef.current = true;
      sourceRef.current = source;
      sourceRectRef.current = snapshot(
        (source.querySelector('img') ?? source).getBoundingClientRect(),
      );
      const cardRect =
        source.closest('[data-featured-index]')?.getBoundingClientRect() ??
        source.getBoundingClientRect();
      setImageSide(
        getDetailImageSide(
          cardRect.left + cardRect.width / 2,
          window.innerWidth,
        ),
      );
      source.blur();
      dispatch({ type: 'select', workId: dailyWorks.indexOf(work) });
    },
    [dailyWorks],
  );

  useEffect(() => {
    if (
      !selected ||
      !panelRef.current ||
      !imageRef.current ||
      !copyRef.current ||
      !sourceRectRef.current
    )
      return;
    const cards = Array.from(
      gridRef.current?.querySelectorAll<HTMLElement>('[data-featured-index]') ??
        [],
    );
    const clicked = sourceRef.current?.closest<HTMLElement>(
      '[data-featured-index]',
    );
    if (!clicked) return;
    const frames = [
      headerRef.current,
      document.querySelector('.site-nav'),
    ].filter(Boolean);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const {
      steps,
      stepDuration,
      stepInterval,
      moverPauseBeforeExit,
      clipPathDirection,
    } = transitionConfig;
    const clips = getClipPathsForDirection(clipPathDirection);
    const delays = computeStaggerDelays(
      snapshot(clicked.getBoundingClientRect()),
      cards.map((card) => snapshot(card.getBoundingClientRect())),
    );
    const timeline = gsap.timeline({
      onComplete: () => {
        readyRef.current = true;
        dispatch({ type: 'detail-ready' });
      },
    });
    timelinesRef.current.push(timeline);
    dispatch({ type: 'grid-left' });

    if (reduce) {
      timeline
        .to(cards, { opacity: 0, duration: 0.18, ease: 'none' }, 0)
        .to(
          frames,
          { opacity: 0, pointerEvents: 'none', duration: 0.18, ease: 'none' },
          0,
        )
        .fromTo(
          panelRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.18, ease: 'none', pointerEvents: 'auto' },
          0,
        );
    } else {
      cards.forEach((card, index) => {
        timeline.to(
          card,
          {
            opacity: 0,
            scale: card === clicked ? 1 : 0.8,
            duration: card === clicked ? stepDuration * 2 : 0.3,
            ease: 'sine',
            clipPath: card === clicked ? clips.from : 'none',
            delay: delays[index],
          },
          0,
        );
      });
      timeline.to(
        frames,
        {
          opacity: 0,
          duration: 0.5,
          ease: 'sine.inOut',
          pointerEvents: 'none',
        },
        0,
      );
      const path = generateMotionPath(
        sourceRectRef.current,
        snapshot(imageRef.current.getBoundingClientRect()),
        steps,
      );
      const fragment = document.createDocumentFragment();
      path.forEach((rect, index) => {
        const mover = document.createElement('img');
        mover.src = selected.thumbnail.src;
        mover.alt = '';
        mover.setAttribute('aria-hidden', 'true');
        mover.className = 'featured-mover';
        gsap.set(mover, {
          ...rect,
          position: 'fixed',
          clipPath: clips.from,
          zIndex: 1000 + index,
        });
        fragment.appendChild(mover);
        layersRef.current.push(mover);
        const moverTimeline = gsap
          .timeline()
          .fromTo(
            mover,
            { opacity: 0.4, clipPath: clips.hide },
            {
              opacity: 1,
              clipPath: clips.reveal,
              duration: stepDuration,
              ease: 'sine.in',
            },
          )
          .to(
            mover,
            { clipPath: clips.from, duration: stepDuration, ease: 'sine' },
            `+=${moverPauseBeforeExit}`,
          );
        timeline.add(moverTimeline, index * stepInterval);
      });
      document.body.appendChild(fragment);
      timeline.call(
        removeMovers,
        [],
        steps * stepInterval + stepDuration * 2 + moverPauseBeforeExit,
      );
      gsap.set(copyRef.current, { opacity: 0 });
      gsap.set(panelRef.current, { opacity: 1, pointerEvents: 'auto' });
      const reveal = gsap
        .timeline({
          defaults: { duration: stepDuration * 2, ease: 'sine.inOut' },
        })
        .fromTo(
          imageRef.current,
          { clipPath: clips.hide },
          {
            clipPath: clips.reveal,
            pointerEvents: 'auto',
            delay: steps * stepInterval,
          },
        )
        .fromTo(
          copyRef.current,
          { y: 25 },
          {
            duration: 1,
            ease: 'expo',
            opacity: 1,
            y: 0,
            delay: steps * stepInterval,
          },
          '<-=.2',
        );
      timeline.add(reveal, 0);
    }

    beginHistory(selected.id);
    return () => {
      clearRuntime();
      gsap.set(cards, { clearProps: 'opacity,transform,clipPath' });
      gsap.set(frames, { clearProps: 'opacity,pointerEvents' });
    };
  }, [beginHistory, clearRuntime, removeMovers, selected]);

  useEffect(() => {
    if (state.phase !== 'detail') return;
    const frame = requestAnimationFrame(() =>
      closeButtonRef.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [state.phase]);

  useEffect(() => {
    if (!selected) {
      selectionActiveRef.current = false;
      readyRef.current = false;
      closingRef.current = false;
      // Run after the selected-state cleanup has removed inert from the grid.
      const frame = requestAnimationFrame(() =>
        sourceRef.current?.focus({ preventScroll: true }),
      );
      return () => cancelAnimationFrame(frame);
    }
    const elements = [
      gridRef.current,
      headerRef.current,
      document.querySelector<HTMLElement>('.site-nav'),
    ].filter((element): element is HTMLElement => element !== null);
    const previous = elements.map((element) => ({
      ariaHidden: element.getAttribute('aria-hidden'),
      inert: element.inert,
    }));
    elements.forEach((element) => {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      elements.forEach((element, index) => {
        element.inert = previous[index].inert;
        const ariaHidden = previous[index].ariaHidden;
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      });
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [close, selected]);

  return (
    <>
      <SmoothScroll>
        <div className="featured-home" data-detail-open={selected !== null}>
          <XylophoneBackground ref={xylophoneRef} soundEnabled={soundEnabled} />
        <section className="featured-intro">
          <header ref={headerRef} className="featured-header">
            <div className="featured-header__metadata">
              <p>DAILY SELECTION</p>
              <p>12 PHOTOGRAPHERS / 12 WORKS</p>
            </div>
            <div className="featured-header__heading">
              <h1>DAILY RECOMMENDATION</h1>
              <p>SCROLL TO EXPLORE THE WORKS</p>
            </div>
          </header>
        </section>
      <section
        ref={gridRef}
        className="featured-grid"
        aria-label="推荐摄影作品"
      >
        {dailyWorks.map((work, index) => (
          <FeaturedCard
            key={work.id}
            work={work}
            index={index}
            onSelect={select}
          />
        ))}
      </section>
      {selected && (
        <FeaturedDetail
          work={selected}
          detail={detail}
          imageSide={imageSide}
          phase={state.phase}
          panelRef={panelRef}
          imageRef={imageRef}
          copyRef={copyRef}
          closeButtonRef={closeButtonRef}
          onClose={close}
        />
      )}
        </div>
      </SmoothScroll>
      <SiteNav current="featured">
        <BackendStatusIndicator />
        <XylophoneSoundToggle
          enabled={soundEnabled}
          onChange={changeSoundEnabled}
        />
      </SiteNav>
    </>
  );
}
