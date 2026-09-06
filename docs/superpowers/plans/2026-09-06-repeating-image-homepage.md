# Repeating Image Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current spherical daily page at `/` with a 12-work photography grid whose cards open a full-screen detail through a Codrops-inspired repeating-image transition, while leaving `/gallery` behavior unchanged.

**Architecture:** Keep the homepage as a client-side React feature composed from focused card, detail, and coordinator components. Put collection formatting, transition geometry, and transition state in framework-independent modules so Node tests cover the behavior; use GSAP timelines as the DOM adapter that renders the source-faithful sequence.

**Tech Stack:** React 19, TypeScript 5.9, CSS, GSAP 3.12.7, Node test runner, Vinext/Vite

**Spec:** `docs/superpowers/specs/2026-09-06-repeating-image-homepage-design.md`

## Global Constraints

- Keep `/gallery`, its Three.js scene, 3D/Flat switch, drag behavior, and hover behavior unchanged.
- Use exactly 12 existing local images from `public/art`; do not add remote image requests.
- Keep the page background `#ffffff` and use restrained black/gray typography.
- Keep only photographer, work number/title, category, and year on cards and details.
- Keep the small top “推荐 / 画廊” navigation and hide it while a detail is open.
- Use `gsap@3.12.7`, matching the reference source version; add no other runtime dependency.
- Use six fixed intermediate image layers with 350ms enter, 140ms pause, 350ms exit, 50ms stagger, center/size linear geometry, and no rotation or random wobble.
- Respect `prefers-reduced-motion: reduce` by replacing repeated layers with a direct crossfade.
- Preserve focus, support `Escape`, lock background scrolling during details, and remove every temporary DOM layer after use.
- Credit Codrops Repeating Image Transition and its MIT License; do not copy its sample images, fonts, or marketing copy.
- Do not deploy or push as part of this implementation.

---

## File Map

- Create `lib/featured.ts`: selects the 12 homepage works and formats display metadata.
- Create `lib/featured.test.ts`: verifies selection size, ordering, metadata, and local image paths.
- Create `lib/repeating-transition.ts`: calculates image side, repeated-layer timing, geometry, and keyframes.
- Create `lib/repeating-transition.test.ts`: verifies geometry endpoints, direction, count, and timing.
- Create `lib/featured-state.ts`: defines the four transition phases and reducer.
- Create `lib/featured-state.test.ts`: verifies legal transitions and ignores re-entry.
- Create `app/featured-card.tsx`: renders one accessible recommendation card.
- Create `app/featured-detail.tsx`: renders the full-screen work detail and close control.
- Create `app/featured-home.tsx`: coordinates selection, DOM animation, scroll lock, keyboard close, cleanup, and focus restoration.
- Modify `app/page.tsx`: render the new featured homepage and shared navigation.
- Modify `app/site-nav.tsx`: rename the homepage state and visible label from “每日推荐” to “推荐”.
- Modify `app/globals.css`: remove old daily-room styles and add the grid, detail, layer, responsive, and reduced-motion styles.
- Delete `app/daily-scene.tsx`: remove the superseded Three.js homepage.
- Delete `lib/daily.ts` and `lib/daily.test.ts`: remove superseded sphere layout logic.
- Delete `public/models/bertoia.glb` and `public/models/ATTRIBUTION.txt`: remove the unused chair and its dedicated attribution.
- Create `THIRD_PARTY_NOTICES.md`: retain the Codrops copyright and MIT terms.
- Modify `package.json` and `package-lock.json`: add the exact `gsap@3.12.7` runtime dependency.

---

### Task 1: Featured collection model

**Files:**
- Create: `lib/featured.ts`
- Create: `lib/featured.test.ts`

**Interfaces:**
- Consumes: `projects: Project[]` and `Project` from `lib/projects.ts`.
- Produces: `FeaturedWork`, `featuredWorks: FeaturedWork[]`, and `formatFeaturedWork(work: Project, index: number, total: number): FeaturedWork`.

- [ ] **Step 1: Write the failing collection tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { featuredWorks, formatFeaturedWork } from './featured.ts';
import { projects } from './projects.ts';

void test('featured homepage contains the first twelve gallery works', () => {
  assert.equal(featuredWorks.length, 12);
  assert.deepEqual(featuredWorks.map(({ id }) => id), projects.slice(0, 12).map(({ id }) => id));
});

void test('featured metadata is compact and derived from the gallery record', () => {
  assert.deepEqual(formatFeaturedWork(projects[0], 0, 12), {
    ...projects[0],
    displayTitle: 'UNTITLED 01',
    categoryLabel: 'PORTRAIT',
    year: '2026',
    positionLabel: '01 / 12',
  });
});

void test('featured works use only local art assets', () => {
  for (const work of featuredWorks) assert.match(work.image, /^\/art\/\d+\.(png|jpg)$/);
});
```

- [ ] **Step 2: Run the test and confirm the module is missing**

Run: `node --test lib/featured.test.ts`

Expected: FAIL because `lib/featured.ts` does not exist.

- [ ] **Step 3: Implement the collection model**

```ts
import { projects, type Project } from './projects.ts';

export type FeaturedWork = Project & {
  displayTitle: string;
  categoryLabel: string;
  year: string;
  positionLabel: string;
};

export function formatFeaturedWork(work: Project, index: number, total: number): FeaturedWork {
  return {
    ...work,
    displayTitle: work.title.toUpperCase().slice(0, 25),
    categoryLabel: work.category.toUpperCase(),
    year: work.publishedAt.slice(0, 4),
    positionLabel: `${String(index + 1).padStart(2, '0')} / ${total}`,
  };
}

const selection = projects.slice(0, 12);
export const featuredWorks = selection.map((work, index) =>
  formatFeaturedWork(work, index, selection.length),
);
```

- [ ] **Step 4: Run the focused and full tests**

Run: `node --test lib/featured.test.ts`

Expected: 3 tests pass.

Run: `npm test`

Expected: all existing and new tests pass.

- [ ] **Step 5: Commit the collection model**

```powershell
git add -- lib/featured.ts lib/featured.test.ts
git commit -m "feat(home): 建立首页推荐作品数据"
```

---

### Task 2: Transition geometry and state machine

**Files:**
- Create: `lib/repeating-transition.ts`
- Create: `lib/repeating-transition.test.ts`
- Create: `lib/featured-state.ts`
- Create: `lib/featured-state.test.ts`

**Interfaces:**
- Produces: `RectSnapshot`, `ImageSide`, `RepeatingStep`, `TransitionOptions`, `getDetailImageSide`, `createRepeatingSteps`, `createMoverKeyframes`, and `getTransitionTotalMs` from `lib/repeating-transition.ts`.
- Produces: `FeaturedPhase`, `FeaturedState`, `FeaturedAction`, `initialFeaturedState`, and `featuredReducer` from `lib/featured-state.ts`.
- Consumed by: `app/featured-home.tsx` in Task 3.

- [ ] **Step 1: Write failing geometry tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createMoverKeyframes,
  createRepeatingSteps,
  getDetailImageSide,
  getTransitionTotalMs,
  type RectSnapshot,
} from './repeating-transition.ts';

const source: RectSnapshot = { left: 40, top: 80, width: 200, height: 140 };
const target: RectSnapshot = { left: 700, top: 60, width: 500, height: 700 };

void test('detail image lands opposite the clicked half of the viewport', () => {
  assert.equal(getDetailImageSide(200, 1200), 'right');
  assert.equal(getDetailImageSide(900, 1200), 'left');
});

void test('repeating steps preserve exact source and target geometry', () => {
  const steps = createRepeatingSteps(source, target);
  assert.equal(steps.length, 6);
  assert.deepEqual(steps[0].from, source);
  assert.deepEqual(steps.at(-1)?.to, target);
  assert.deepEqual(steps.map(({ delay }) => delay), [0, 50, 100, 150, 200, 250]);
});

void test('transition duration includes the last stagger and reveal pause', () => {
  assert.equal(getTransitionTotalMs(), 740);
});

void test('mover keyframes use fixed pixel geometry without rotation', () => {
  const [first, , last] = createMoverKeyframes(createRepeatingSteps(source, target)[0]);
  assert.deepEqual(first, {
    left: '40px', top: '80px', width: '200px', height: '140px',
    opacity: 0, clipPath: 'inset(18% 18% 18% 18%)', offset: 0,
  });
  assert.equal(last.left, '700px');
  assert.equal(last.top, '60px');
  assert.equal(last.transform, undefined);
});
```

- [ ] **Step 2: Write failing reducer tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { featuredReducer, initialFeaturedState } from './featured-state.ts';

void test('featured transition follows the four approved phases', () => {
  const leaving = featuredReducer(initialFeaturedState, { type: 'select', workId: 3 });
  const revealing = featuredReducer(leaving, { type: 'grid-left' });
  const detail = featuredReducer(revealing, { type: 'detail-ready' });
  assert.deepEqual([leaving.phase, revealing.phase, detail.phase], [
    'leaving-grid', 'revealing-detail', 'detail',
  ]);
  assert.deepEqual(featuredReducer(detail, { type: 'close' }), initialFeaturedState);
});

void test('a second selection is ignored while a transition is active', () => {
  const leaving = featuredReducer(initialFeaturedState, { type: 'select', workId: 3 });
  assert.strictEqual(featuredReducer(leaving, { type: 'select', workId: 4 }), leaving);
});
```

- [ ] **Step 3: Run both tests and confirm the modules are missing**

Run: `node --test lib/repeating-transition.test.ts lib/featured-state.test.ts`

Expected: FAIL because both implementation modules do not exist.

- [ ] **Step 4: Implement the geometry module**

```ts
export type RectSnapshot = { left: number; top: number; width: number; height: number };
export type ImageSide = 'left' | 'right';
export type RepeatingStep = {
  index: number;
  from: RectSnapshot;
  to: RectSnapshot;
  delay: number;
  duration: number;
};
export type TransitionOptions = {
  count?: number;
  duration?: number;
  interval?: number;
  revealPause?: number;
};

const DEFAULTS = { count: 6, duration: 350, interval: 50, revealPause: 140 };

export function getDetailImageSide(sourceCenterX: number, viewportWidth: number): ImageSide {
  return sourceCenterX <= viewportWidth / 2 ? 'right' : 'left';
}

export function createRepeatingSteps(
  from: RectSnapshot,
  to: RectSnapshot,
  options: TransitionOptions = {},
): RepeatingStep[] {
  const config = { ...DEFAULTS, ...options };
  return Array.from({ length: config.count }, (_, index) => ({
    index, from: { ...from }, to: { ...to }, delay: index * config.interval,
    duration: config.duration,
  }));
}

export function getTransitionTotalMs(options: TransitionOptions = {}) {
  const config = { ...DEFAULTS, ...options };
  return config.duration + (config.count - 1) * config.interval + config.revealPause;
}

export function createMoverKeyframes(step: RepeatingStep): Keyframe[] {
  const frame = (rect: RectSnapshot) => ({
    left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
  });
  return [
    { ...frame(step.from), opacity: 0, clipPath: 'inset(18% 18% 18% 18%)', offset: 0 },
    { ...frame(step.from), opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', offset: 0.18 },
    { ...frame(step.to), opacity: 0, clipPath: 'inset(0% 0% 0% 0%)', offset: 1 },
  ];
}
```

- [ ] **Step 5: Implement the reducer**

```ts
export type FeaturedPhase = 'idle' | 'leaving-grid' | 'revealing-detail' | 'detail';
export type FeaturedState = { phase: FeaturedPhase; selectedId: number | null };
export type FeaturedAction =
  | { type: 'select'; workId: number }
  | { type: 'grid-left' }
  | { type: 'detail-ready' }
  | { type: 'close' };

export const initialFeaturedState: FeaturedState = { phase: 'idle', selectedId: null };

export function featuredReducer(state: FeaturedState, action: FeaturedAction): FeaturedState {
  if (action.type === 'close') return initialFeaturedState;
  if (action.type === 'select') {
    return state.phase === 'idle'
      ? { phase: 'leaving-grid', selectedId: action.workId }
      : state;
  }
  if (action.type === 'grid-left' && state.phase === 'leaving-grid') {
    return { ...state, phase: 'revealing-detail' };
  }
  if (action.type === 'detail-ready' && state.phase === 'revealing-detail') {
    return { ...state, phase: 'detail' };
  }
  return state;
}
```

- [ ] **Step 6: Run the focused and full tests**

Run: `node --test lib/repeating-transition.test.ts lib/featured-state.test.ts`

Expected: 6 tests pass.

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 7: Commit geometry and state**

```powershell
git add -- lib/repeating-transition.ts lib/repeating-transition.test.ts lib/featured-state.ts lib/featured-state.test.ts
git commit -m "feat(home): 建立重复影像转场模型"
```

---

### Task 3: Accessible cards, detail panel, and animation coordinator

**Files:**
- Create: `app/featured-card.tsx`
- Create: `app/featured-detail.tsx`
- Create: `app/featured-home.tsx`
- Modify: `app/page.tsx`
- Modify: `app/site-nav.tsx`

**Interfaces:**
- Consumes: `FeaturedWork` and `featuredWorks` from `lib/featured.ts`.
- Consumes: `ImageSide`, `createRepeatingSteps`, `createMoverKeyframes`, and `getTransitionTotalMs` from `lib/repeating-transition.ts`.
- Consumes: `featuredReducer` and `initialFeaturedState` from `lib/featured-state.ts`.
- Produces: `FeaturedCard({ work, index, onSelect })`, `FeaturedDetail({ work, imageSide, phase, panelRef, imageRef, onClose })`, and default `FeaturedHome()`.

- [ ] **Step 1: Make the route expect the new component before it exists**

Replace `app/page.tsx` with:

```tsx
'use client';
import FeaturedHome from './featured-home';
import SiteNav from './site-nav';

export default function Home() {
  return (
    <main className="app-shell featured-page">
      <FeaturedHome />
      <SiteNav current="featured" />
    </main>
  );
}
```

Update `app/site-nav.tsx` to:

```tsx
import Link from 'next/link';

export default function SiteNav({ current }: { current: 'featured' | 'gallery' }) {
  return (
    <nav className="site-nav" aria-label="页面导航">
      <Link href="/" aria-current={current === 'featured' ? 'page' : undefined}>推荐</Link>
      <Link href="/gallery" aria-current={current === 'gallery' ? 'page' : undefined}>画廊</Link>
    </nav>
  );
}
```

- [ ] **Step 2: Run the type checker and confirm the missing component failure**

Run: `npx tsc --noEmit`

Expected: FAIL with a missing `./featured-home` module.

- [ ] **Step 3: Create the accessible card component**

```tsx
import type { FeaturedWork } from '@/lib/featured';

export default function FeaturedCard({
  work,
  index,
  onSelect,
}: {
  work: FeaturedWork;
  index: number;
  onSelect: (work: FeaturedWork, source: HTMLButtonElement) => void;
}) {
  return (
    <article className="featured-card" data-featured-index={index}>
      <button type="button" onClick={(event) => onSelect(work, event.currentTarget)}>
        <span className="featured-card__head">
          <span>{work.photographer}</span><span>{work.displayTitle}</span>
        </span>
        <span className="featured-card__image">
          <img src={work.image} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
        </span>
        <span className="featured-card__meta">
          <span>{work.categoryLabel}</span><span>{work.year} · {work.positionLabel}</span>
        </span>
      </button>
    </article>
  );
}
```

- [ ] **Step 4: Create the detail component**

```tsx
import type { RefObject } from 'react';
import type { FeaturedWork } from '@/lib/featured';
import type { FeaturedPhase } from '@/lib/featured-state';
import type { ImageSide } from '@/lib/repeating-transition';

export default function FeaturedDetail({ work, imageSide, phase, panelRef, imageRef, onClose }: {
  work: FeaturedWork;
  imageSide: ImageSide;
  phase: FeaturedPhase;
  panelRef: RefObject<HTMLElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  onClose: () => void;
}) {
  return (
    <section ref={panelRef} className={`featured-detail image-${imageSide}`} data-phase={phase}
      data-featured-detail aria-label={`${work.photographer} — ${work.displayTitle}`}>
      <div className="featured-detail__media">
        <img ref={imageRef} src={work.image} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
      </div>
      <div className="featured-detail__copy">
        <p>{work.positionLabel}</p><h1>{work.photographer}</h1>
        <p>{work.displayTitle}</p><p>{work.categoryLabel} · {work.year}</p>
        <button type="button" onClick={onClose}>返回</button>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create the animation coordinator**

Implement `app/featured-home.tsx` with these concrete behaviors:

```tsx
'use client';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { featuredWorks, type FeaturedWork } from '@/lib/featured';
import { featuredReducer, initialFeaturedState } from '@/lib/featured-state';
import {
  createMoverKeyframes, createRepeatingSteps, getDetailImageSide,
  getTransitionTotalMs, type ImageSide, type RectSnapshot,
} from '@/lib/repeating-transition';
import FeaturedCard from './featured-card';
import FeaturedDetail from './featured-detail';

const snapshot = ({ left, top, width, height }: DOMRect): RectSnapshot => ({ left, top, width, height });

export default function FeaturedHome() {
  const [state, dispatch] = useReducer(featuredReducer, initialFeaturedState);
  const [imageSide, setImageSide] = useState<ImageSide>('right');
  const sourceRef = useRef<HTMLButtonElement | null>(null);
  const sourceRectRef = useRef<RectSnapshot | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const layersRef = useRef<HTMLElement[]>([]);
  const animationsRef = useRef<Animation[]>([]);
  const selected = featuredWorks.find(({ id }) => id === state.selectedId) ?? null;

  const clearRuntime = useCallback(() => {
    for (const animation of animationsRef.current) animation.cancel();
    animationsRef.current = [];
    for (const layer of layersRef.current) layer.remove();
    layersRef.current = [];
  }, []);

  const close = useCallback(async () => {
    if (!selected) return;
    const fade = panelRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
    if (fade) await fade.finished;
    clearRuntime();
    dispatch({ type: 'close' });
    requestAnimationFrame(() => sourceRef.current?.focus());
  }, [clearRuntime, selected]);

  const select = useCallback((work: FeaturedWork, source: HTMLButtonElement) => {
    if (state.phase !== 'idle') return;
    sourceRef.current = source;
    const rect = source.querySelector('img')?.getBoundingClientRect() ?? source.getBoundingClientRect();
    sourceRectRef.current = snapshot(rect);
    setImageSide(getDetailImageSide(rect.left + rect.width / 2, window.innerWidth));
    dispatch({ type: 'select', workId: work.id });
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'leaving-grid' || !selected) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = [...document.querySelectorAll<HTMLElement>('[data-featured-index]')];
    for (const [index, card] of cards.entries()) {
      const animation = card.animate(
        [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.96)' }],
        { duration: reduce ? 1 : 220, delay: reduce ? 0 : Math.abs(index - featuredWorks.indexOf(selected)) * 18, fill: 'forwards' },
      );
      animationsRef.current.push(animation);
    }
    const timer = window.setTimeout(() => dispatch({ type: 'grid-left' }), reduce ? 1 : 360);
    return () => window.clearTimeout(timer);
  }, [selected, state.phase]);

  useEffect(() => {
    if (state.phase !== 'revealing-detail' || !selected || !sourceRectRef.current || !imageRef.current) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      const targetRect = snapshot(imageRef.current.getBoundingClientRect());
      for (const step of createRepeatingSteps(sourceRectRef.current, targetRect)) {
        const layer = document.createElement('img');
        layer.src = selected.image; layer.alt = ''; layer.className = 'featured-mover';
        document.body.append(layer); layersRef.current.push(layer);
        const animation = layer.animate(createMoverKeyframes(step), {
          duration: step.duration, delay: step.delay, fill: 'both', easing: 'linear',
        });
        animationsRef.current.push(animation);
      }
    }
    const timer = window.setTimeout(() => dispatch({ type: 'detail-ready' }), reduce ? 1 : getTransitionTotalMs());
    return () => { window.clearTimeout(timer); clearRuntime(); };
  }, [clearRuntime, selected, state.phase]);

  useEffect(() => {
    if (!selected) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') void close(); };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener('keydown', onKeyDown); clearRuntime(); };
  }, [clearRuntime, close, selected]);

  return (
    <div className="featured-home" data-detail-open={selected !== null}>
      <section className="featured-grid" aria-label="推荐摄影作品">
        {featuredWorks.map((work, index) => <FeaturedCard key={work.id} work={work} index={index} onSelect={select} />)}
      </section>
      {selected && <FeaturedDetail work={selected} imageSide={imageSide} phase={state.phase}
        panelRef={panelRef} imageRef={imageRef} onClose={() => void close()} />}
    </div>
  );
}
```

Keep the source rectangle captured at click time so layout fading cannot change it. The `leaving-grid` effect runs only the card exit, then advances to `revealing-detail`; by that phase the hidden detail DOM and `imageRef` are mounted. Store every returned `Animation`, cancel it together with `clearRuntime()`, and remove every layer so navigation cannot leave active animations behind.

- [ ] **Step 6: Run the type checker**

Run: `npx tsc --noEmit`

Expected: PASS with no TypeScript errors.

- [ ] **Step 7: Commit the React interaction layer**

```powershell
git add -- app/featured-card.tsx app/featured-detail.tsx app/featured-home.tsx app/page.tsx app/site-nav.tsx
git commit -m "feat(home): 新增重复影像作品浏览交互"
```

---

### Task 4: Visual system, responsive layout, and navigation visibility

#### Approved source-faithful revision

This revision supersedes conflicting Task 4 instructions below and the earlier Web Animations implementation in Tasks 2–3.

- Add `gsap@3.12.7` to `package.json` and `package-lock.json`.
- Refactor `lib/repeating-transition.ts` and its tests to match the reference functions: `getClipPathsForDirection`, Euclidean `computeStaggerDelays`, and `generateMotionPath` with `fullSteps = steps + 2` and `path.slice(1, -1)`.
- Refactor `app/featured-home.tsx` to use GSAP timelines matching `js/index.js`: non-clicked grid items scale to `0.8` over `0.3s`; the clicked item keeps scale `1`, runs for `stepDuration * 2`, and clips to the configured `from` value; delays are normalized by spatial distance up to `0.3s`.
- Each mover is fixed at one generated intermediate rectangle. Its delayed timeline enters from opacity `0.4` and `clipPaths.hide` to opacity `1` and `clipPaths.reveal` over `0.35s` with `sine.in`, pauses `0.14s`, then exits to `clipPaths.from` over `0.35s` with `sine`.
- Reveal the destination image from `clipPaths.hide` to `clipPaths.reveal` over `0.7s` with `sine.inOut`, delayed `steps * stepInterval`; reveal detail copy from `y: 25` to `y: 0` and opacity `1` over `1s` with `expo` at the reference relative timeline position.
- Close with the reference reset sequence: fade the panel, restore overlay/navigation, reset image clip, set grid items to opacity `0` and scale `0.8`, then restore them with the same distance delays using `expo`.
- Keep the existing accessibility additions: transition lock, reduced-motion crossfade, dialog focus, inert background, Escape, focus restoration, scroll restoration, GSAP timeline kill, and mover removal.
- Add a reference-style editorial header before the grid: four compact factual metadata blocks, a large `DAILY EDIT` title, and a short `SELECT A WORK TO VIEW` prompt. The blocks must derive from the real collection: `DAILY SELECTION`, `12 PHOTOGRAPHERS / 12 WORKS`, `PORTRAIT, STREET, LANDSCAPE, DOCUMENTARY`, and `2026 COLLECTION`.
- Remove the gray card hover background. Hover must only reduce image opacity to `0.7` and may strengthen text color; it must not add a black border.
- Files additionally modified by this revision: `package.json`, `package-lock.json`, `lib/repeating-transition.ts`, `lib/repeating-transition.test.ts`, `app/featured-home.tsx`, `app/featured-detail.tsx`, and `app/featured-card.tsx` when markup hooks are needed.
- Tests must prove six intermediate positions exclude exact endpoints, preserve center/size interpolation, return the four source clip-path triplets, and normalize spatial grid delays to the `0.3s` maximum.

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes the class names and `data-*` attributes emitted by Task 3.
- Produces desktop four-column and mobile two-column layouts, detail-side ordering, transition-layer presentation, hover feedback, and reduced-motion behavior.

- [ ] **Step 1: Record the pre-style browser failure**

Run: `npm run dev -- --port 3000`

Open: `http://localhost:3000/`

Expected: the new semantic content renders without the approved grid, card, detail, and transition styling.

- [ ] **Step 2: Remove only obsolete homepage selectors**

Delete these selector blocks from `app/globals.css` while keeping gallery selectors such as `.scene`, `.space-view`, `.controls`, and `.view-tabs` intact:

```css
.daily-home
.model-credit
.dark .model-credit
.daily-fallback
.daily-fallback img
.daily-fallback figcaption
.chair-load-note
```

Also remove the mobile `.model-credit` and `.daily-fallback` declarations from the existing media query.

- [ ] **Step 3: Add the featured grid and card styles**

```css
.featured-page { overflow: auto; }
.featured-home { min-height: 100%; padding: 88px 28px 52px; background: #fff; }
.featured-grid { width: min(1680px, 100%); margin: 0 auto; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 72px 28px; }
.featured-card { min-width: 0; }
.featured-card button { width: 100%; padding: 12px; border: 0; background: transparent; color: #171717; text-align: left; }
.featured-card__head, .featured-card__meta { display: flex; justify-content: space-between; gap: 16px; font: 10px/1.25 monospace; letter-spacing: .01em; }
.featured-card__head { margin-bottom: 14px; }
.featured-card__meta { margin-top: 14px; color: #565656; }
.featured-card__image { display: block; aspect-ratio: 4 / 3; overflow: hidden; background: #f2f2f2; }
.featured-card__image img { width: 100%; height: 100%; display: block; object-fit: contain; transition: opacity 150ms cubic-bezier(.2,0,.2,1); }
.featured-card button:hover img { opacity: .7; }
.featured-home[data-detail-open='true'] + .site-nav { opacity: 0; pointer-events: none; }
.site-nav { transition: opacity 180ms ease; }
```

- [ ] **Step 4: Add detail and mover styles**

```css
.featured-detail { position: fixed; inset: 0; z-index: 50; display: grid; grid-template-columns: 1fr 1fr; background: #fff; opacity: 0; pointer-events: none; }
.featured-detail[data-phase='revealing-detail'], .featured-detail[data-phase='detail'] { pointer-events: auto; }
.featured-detail[data-phase='detail'] { opacity: 1; }
.featured-detail.image-left .featured-detail__media { order: 1; }
.featured-detail.image-left .featured-detail__copy { order: 2; }
.featured-detail.image-right .featured-detail__copy { order: 1; }
.featured-detail.image-right .featured-detail__media { order: 2; }
.featured-detail__media { min-width: 0; padding: 28px; display: grid; place-items: center; background: #f4f4f4; }
.featured-detail__media img { width: 100%; height: 100%; object-fit: contain; }
.featured-detail__copy { padding: clamp(32px, 6vw, 96px); display: flex; flex-direction: column; justify-content: center; gap: 14px; }
.featured-detail__copy h1 { margin: 0; font-size: clamp(34px, 5vw, 78px); font-weight: 400; letter-spacing: -.045em; }
.featured-detail__copy p { margin: 0; font: 11px/1.4 monospace; text-transform: uppercase; }
.featured-detail__copy button { align-self: flex-start; margin-top: 28px; padding: 10px 18px; border: 1px solid #1b1b1b; border-radius: 999px; background: #fff; color: #1b1b1b; }
.featured-mover { position: fixed; z-index: 60; display: block; object-fit: contain; pointer-events: none; will-change: left, top, width, height, opacity, clip-path; }
```

- [ ] **Step 5: Add responsive and reduced-motion rules**

```css
@media (max-width: 900px) {
  .featured-home { padding: 76px 14px 36px; }
  .featured-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 42px 10px; }
  .featured-card button { padding: 8px; }
  .featured-card__head, .featured-card__meta { font-size: 9px; }
  .featured-detail { grid-template-columns: 1fr; grid-template-rows: minmax(0, 62vh) 1fr; overflow: auto; }
  .featured-detail.image-left .featured-detail__media,
  .featured-detail.image-right .featured-detail__media { order: 1; }
  .featured-detail.image-left .featured-detail__copy,
  .featured-detail.image-right .featured-detail__copy { order: 2; }
  .featured-detail__media { padding: 14px; }
  .featured-detail__copy { padding: 28px 20px 42px; }
}

@media (prefers-reduced-motion: reduce) {
  .featured-card__image img { transition: none; }
  .featured-mover { display: none; }
}
```

- [ ] **Step 6: Verify the page at desktop and mobile widths**

Desktop checks at 1440×900:

- 4 columns and 12 cards are visible through vertical scrolling.
- White background is `rgb(255, 255, 255)`.
- Card hover has a light-gray background and no black outline.
- A left-side card sends the detail image right; a right-side card sends it left.
- Six layers travel between the source and target, and no `.featured-mover` remains afterward.
- The top nav disappears in detail and returns after close.

Mobile checks at 390×844:

- 2 columns render without horizontal overflow.
- Detail stacks image above text.
- `Escape` and “返回” close the detail.

Reduced-motion check:

- Emulate `prefers-reduced-motion: reduce` and verify no `.featured-mover` becomes visible.

- [ ] **Step 7: Commit the visual system**

```powershell
git add -- app/globals.css
git commit -m "style(home): 对齐画廊视觉与响应式布局"
```

---

### Task 5: Remove the old sphere homepage and preserve third-party notice

**Files:**
- Delete: `app/daily-scene.tsx`
- Delete: `lib/daily.ts`
- Delete: `lib/daily.test.ts`
- Delete: `public/models/bertoia.glb`
- Delete: `public/models/ATTRIBUTION.txt`
- Create: `THIRD_PARTY_NOTICES.md`

**Interfaces:**
- Removes modules and assets with no remaining imports after Tasks 3–4.
- Produces a repository-level notice for the transition reference.

- [ ] **Step 1: Confirm every old homepage reference is isolated**

Run:

```powershell
rg -n "DailyScene|dailyWorks|dailyCard|dailyRoom|bertoia|model-credit|chair-load-note|daily-fallback" app lib public
```

Expected: matches exist only in `app/daily-scene.tsx`, `lib/daily.ts`, `lib/daily.test.ts`, and `public/models/ATTRIBUTION.txt`. Stop and remove any remaining new-code reference before deletion.

- [ ] **Step 2: Delete the superseded implementation and assets**

Use `apply_patch` to delete the three text source files. After resolving and verifying the exact project paths, remove these two binary/text model assets:

```powershell
Remove-Item -LiteralPath 'C:\Users\xoberon\Documents\Codex\2026-09-06\new-chat\outputs\phantom-study\public\models\bertoia.glb'
Remove-Item -LiteralPath 'C:\Users\xoberon\Documents\Codex\2026-09-06\new-chat\outputs\phantom-study\public\models\ATTRIBUTION.txt'
```

- [ ] **Step 3: Create the third-party notice**

Create `THIRD_PARTY_NOTICES.md` with:

```markdown
# Third-Party Notices

## Repeating Image Transition

The homepage transition is inspired by [Codrops Repeating Image Transition](https://github.com/codrops/RepeatingImageTransition/).

MIT License

Copyright (c) 2009 - 2024 Codrops

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 4: Prove no removed reference remains**

Run:

```powershell
rg -n "DailyScene|dailyWorks|dailyCard|dailyRoom|bertoia|model-credit|chair-load-note|daily-fallback" app lib public
```

Expected: no matches and exit code 1.

- [ ] **Step 5: Run focused quality checks**

Run: `npx tsc --noEmit`

Expected: PASS.

Run: `npx oxlint app lib`

Expected: 0 warnings and 0 errors.

Run: `npm test`

Expected: all remaining and new tests pass; the deleted daily tests are absent.

- [ ] **Step 6: Commit the cleanup and notice**

```powershell
git add -- app/daily-scene.tsx lib/daily.ts lib/daily.test.ts public/models/bertoia.glb public/models/ATTRIBUTION.txt THIRD_PARTY_NOTICES.md
git commit -m "chore(home): 清理旧球幕首页资源"
```

---

### Task 6: Production and regression verification

**Files:**
- Modify only files implicated by a failing verification; do not broaden scope.

**Interfaces:**
- Verifies the complete homepage feature and protects the gallery route.

- [ ] **Step 1: Run the full automated suite from a clean command**

Run:

```powershell
npm test
npx tsc --noEmit
npx oxlint app lib
npm run build
```

Expected: every command exits 0; Oxlint reports no warnings or errors; the production build emits both `/` and `/gallery` without compilation failure.

- [ ] **Step 2: Verify homepage keyboard and cleanup behavior in-browser**

At `http://localhost:3000/`:

1. Tab to a recommendation card and press Enter.
2. Confirm the detail opens and the top navigation is not interactive.
3. Press Escape and confirm focus returns to the same card.
4. Open and close three different cards rapidly after each prior transition completes.
5. Inspect the DOM and confirm zero `.featured-mover` elements remain.
6. Confirm the document body is scrollable again after each close.

- [ ] **Step 3: Verify gallery regression**

At `http://localhost:3000/gallery`:

1. Confirm the initial 3D view still renders.
2. Drag horizontally and vertically and confirm the spatial camera responds.
3. Hover a card and confirm its existing background response remains.
4. Switch to Flat and back to 3D.
5. Confirm the top navigation reads “推荐 / 画廊” and returns to `/`.

- [ ] **Step 4: Inspect the final diff**

Run:

```powershell
git status --short
git diff --check
git diff --stat f38e2d4..HEAD
```

Expected: only the files listed in this plan changed, `git diff --check` prints nothing, and no generated build output is tracked.

- [ ] **Step 5: Create the final feature commit only if verification required fixes**

If Step 1–4 required source changes, stage only those files and commit them:

```powershell
git add -- app lib THIRD_PARTY_NOTICES.md
git commit -m "fix(home): 完善推荐页转场与可访问性"
```

If no verification fix was required, do not create an empty commit.
