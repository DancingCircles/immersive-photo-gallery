'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { featuredWorks, type FeaturedWork } from '@/lib/featured';
import { featuredReducer, initialFeaturedState } from '@/lib/featured-state';
import {
  createMoverKeyframes,
  createRepeatingSteps,
  getDetailImageSide,
  getTransitionTotalMs,
  type ImageSide,
  type RectSnapshot,
} from '@/lib/repeating-transition';
import FeaturedCard from './featured-card';
import FeaturedDetail from './featured-detail';

const snapshot = ({ left, top, width, height }: DOMRect): RectSnapshot => ({
  left,
  top,
  width,
  height,
});

export default function FeaturedHome() {
  const [state, dispatch] = useReducer(featuredReducer, initialFeaturedState);
  const [imageSide, setImageSide] = useState<ImageSide>('right');
  const sourceRef = useRef<HTMLButtonElement | null>(null);
  const sourceRectRef = useRef<RectSnapshot | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const gridRef = useRef<HTMLElement | null>(null);
  const layersRef = useRef<HTMLElement[]>([]);
  const cardAnimationsRef = useRef<Animation[]>([]);
  const transientAnimationsRef = useRef<Animation[]>([]);
  const selectionActiveRef = useRef(false);
  const closingRef = useRef(false);
  const selected = featuredWorks.find(({ id }) => id === state.selectedId) ?? null;

  const clearCardAnimations = useCallback(() => {
    for (const animation of cardAnimationsRef.current) animation.cancel();
    cardAnimationsRef.current = [];
  }, []);

  const clearTransientRuntime = useCallback(() => {
    for (const animation of transientAnimationsRef.current) animation.cancel();
    transientAnimationsRef.current = [];
    for (const layer of layersRef.current) layer.remove();
    layersRef.current = [];
  }, []);

  const clearRuntime = useCallback(() => {
    clearCardAnimations();
    clearTransientRuntime();
  }, [clearCardAnimations, clearTransientRuntime]);

  const close = useCallback(async () => {
    if (!selected || closingRef.current) return;
    closingRef.current = true;

    const fade = panelRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 180,
      fill: 'forwards',
    });
    if (fade) {
      transientAnimationsRef.current.push(fade);
      await fade.finished.catch(() => undefined);
    }

    clearRuntime();
    dispatch({ type: 'close' });
    requestAnimationFrame(() => sourceRef.current?.focus());
  }, [clearRuntime, selected]);

  const select = useCallback(
    (work: FeaturedWork, source: HTMLButtonElement) => {
      if (state.phase !== 'idle' || selectionActiveRef.current) return;
      selectionActiveRef.current = true;
      sourceRef.current = source;
      const sourceImage = source.querySelector('img');
      const sourceImageRect = sourceImage?.getBoundingClientRect();
      const rect =
        sourceImageRect && sourceImageRect.width > 0 && sourceImageRect.height > 0
          ? sourceImageRect
          : source.getBoundingClientRect();
      sourceRectRef.current = snapshot(rect);
      setImageSide(getDetailImageSide(rect.left + rect.width / 2, window.innerWidth));
      dispatch({ type: 'select', workId: work.id });
    },
    [state.phase],
  );

  useEffect(() => {
    if (state.phase !== 'leaving-grid' || !selected) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let active = true;
    const cards = [...document.querySelectorAll<HTMLElement>('[data-featured-index]')];
    for (const [index, card] of cards.entries()) {
      const animation = card.animate(
        reduce
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [
              { opacity: 1, transform: 'scale(1)' },
              { opacity: 0, transform: 'scale(.96)' },
            ],
        {
          duration: reduce ? 180 : 220,
          delay: reduce ? 0 : Math.abs(index - featuredWorks.indexOf(selected)) * 18,
          fill: 'forwards',
        },
      );
      cardAnimationsRef.current.push(animation);
    }
    if (reduce) {
      const detailFade = panelRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 180,
        fill: 'forwards',
        easing: 'linear',
      });
      if (detailFade) transientAnimationsRef.current.push(detailFade);
    }
    const timer = window.setTimeout(() => {
      if (active) dispatch({ type: 'grid-left' });
    }, reduce ? 180 : 360);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [selected, state.phase]);

  useEffect(() => {
    if (
      state.phase !== 'revealing-detail' ||
      !selected ||
      !sourceRectRef.current ||
      !imageRef.current
    ) {
      return;
    }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let active = true;
    if (!reduce) {
      const targetImageRect = imageRef.current.getBoundingClientRect();
      const targetRect =
        targetImageRect.width > 0 && targetImageRect.height > 0
          ? snapshot(targetImageRect)
          : snapshot(
              imageRef.current.parentElement?.getBoundingClientRect() ?? targetImageRect,
            );
      for (const step of createRepeatingSteps(sourceRectRef.current, targetRect)) {
        const layer = document.createElement('img');
        layer.src = selected.image;
        layer.alt = '';
        layer.className = 'featured-mover';
        document.body.appendChild(layer);
        layersRef.current.push(layer);
        const animation = layer.animate(createMoverKeyframes(step), {
          duration: step.duration,
          delay: step.delay,
          fill: 'both',
          easing: 'linear',
        });
        transientAnimationsRef.current.push(animation);
      }
    }
    const timer = window.setTimeout(() => {
      if (active) dispatch({ type: 'detail-ready' });
    }, reduce ? 1 : getTransitionTotalMs());
    return () => {
      active = false;
      window.clearTimeout(timer);
      clearCardAnimations();
      clearTransientRuntime();
    };
  }, [clearCardAnimations, clearTransientRuntime, selected, state.phase]);

  useEffect(() => {
    if (state.phase !== 'detail' || !selected) return;
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [selected, state.phase]);

  useEffect(() => {
    const grid = gridRef.current;
    const nav = document.querySelector<HTMLElement>('.site-nav');
    if (!selected || !grid || !nav) return;
    const elements = [grid, nav];
    const previous = elements.map((element) => ({
      ariaHidden: element.getAttribute('aria-hidden'),
      inert: element.inert,
    }));
    for (const element of elements) {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    }
    return () => {
      elements.forEach((element, index) => {
        element.inert = previous[index].inert;
        if (previous[index].ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', previous[index].ariaHidden);
      });
    };
  }, [selected]);

  useEffect(() => {
    if (!selected) {
      selectionActiveRef.current = false;
      closingRef.current = false;
      return;
    }
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') void close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', onKeyDown);
      clearRuntime();
    };
  }, [clearRuntime, close, selected]);

  return (
    <div className="featured-home" data-detail-open={selected !== null}>
      <section ref={gridRef} className="featured-grid" aria-label="推荐摄影作品">
        {featuredWorks.map((work, index) => (
          <FeaturedCard key={work.id} work={work} index={index} onSelect={select} />
        ))}
      </section>
      {selected && (
        <FeaturedDetail
          work={selected}
          imageSide={imageSide}
          phase={state.phase}
          panelRef={panelRef}
          imageRef={imageRef}
          closeButtonRef={closeButtonRef}
          onClose={() => void close()}
        />
      )}
    </div>
  );
}
