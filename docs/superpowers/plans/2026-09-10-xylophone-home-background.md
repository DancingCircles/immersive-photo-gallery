# Xylophone 首页背景 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为摄影首页加入淡色、可随页面滚动推进的玻璃螺旋 WebGL 背景，同时保留每日推荐作品的正常滚动和详情交互。

**Architecture:** 以固定的 `XylophoneBackground` 组件挂载 WebGL canvas，并将渲染器生命周期封装到独立 engine。引擎复用 MIT 参考实现的实例化螺旋、玻璃着色和流体扰动思路；滚动相位从 `window.scrollY` 采样而不是截获 wheel 事件。现有 `FeaturedHome` 只负责内容层、推荐数据和详情转场。

**Tech Stack:** React 19、Vinext、Three.js 0.180、postprocessing 6.39、TypeScript、Node test runner、CSS。

**Spec:** `docs/superpowers/specs/2026-09-10-xylophone-home-background-design.md`

## Global Constraints

- 参考 `Sujenphea/xylophone` 的 MIT 代码时必须在 `THIRD_PARTY_NOTICES.md` 保留 Codrops 的版权和完整 MIT 许可。
- 保留参考项目的木琴音频资源和声音开关，但声音默认关闭，且不得阻止页面正常纵向滚动。
- 不升级 `three`，只新增与其兼容的 `postprocessing@^6.39.3`。
- 背景 canvas 必须 `pointer-events: none`，推荐卡片、键盘焦点、Esc 和详情关闭行为不变。
- WebGL2 创建失败与 `prefers-reduced-motion: reduce` 必须安全降级为静态浅色页面。
- 除非用户再次明确要求，否则不创建 Git 提交或推送。

---

### Task 1: 引入授权材料与渲染依赖

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `THIRD_PARTY_NOTICES.md`

**Interfaces:**
- Consumes: 现有 `three@^0.180.0`。
- Produces: `postprocessing@^6.39.3` 可供背景引擎导入；授权文件可随构建产物和源码分发。

- [ ] **Step 1: 写入授权内容测试**

```ts
void test('third-party notice preserves the xylophone MIT attribution', () => {
  const notice = readFileSync(new URL('../../THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8');
  assert.match(notice, /Sujenphea\/xylophone/);
  assert.match(notice, /Copyright \(c\) 2009 - 2026 Codrops/);
  assert.match(notice, /MIT License/);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/third-party-notices.test.ts`

Expected: FAIL，因为授权文件尚未创建。

- [ ] **Step 3: 安装所需依赖并创建授权文件**

Run: `npm install postprocessing@^6.39.3`

Create `THIRD_PARTY_NOTICES.md` with this heading and required attribution:

```md
# Third-Party Notices

## Sujenphea/xylophone

Source: https://github.com/Sujenphea/xylophone

Copyright (c) 2009 - 2026 Codrops

MIT License
```

Append the complete MIT license text from the reference repository below this attribution.

- [ ] **Step 4: 运行测试确认通过**

Run: `node --test tests/third-party-notices.test.ts`

Expected: PASS。

### Task 2: 构建可释放的淡色玻璃螺旋引擎

**Files:**
- Create: `features/daily-edit/xylophone/xylophone-config.ts`
- Create: `features/daily-edit/xylophone/xylophone-engine.ts`
- Create: `features/daily-edit/xylophone/xylophone-engine.test.ts`

**Interfaces:**
- Consumes: `HTMLCanvasElement`、`three`、`postprocessing` 和 `window.scrollY`。
- Produces: `createXylophoneEngine(canvas, options)`，返回 `{ render(scrollY: number): void; resize(): void; dispose(): void }`。

- [ ] **Step 1: 写入螺旋配置与相位映射测试**

```ts
import { BAR_COUNT, phaseFromScroll } from '../../../../features/daily-edit/xylophone/xylophone-config.ts';

void test('the background keeps the reference 64-bar ring and maps document scroll to phase', () => {
  assert.equal(BAR_COUNT, 64);
  assert.equal(phaseFromScroll(0), 0);
  assert.ok(phaseFromScroll(1200) > phaseFromScroll(400));
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/features/daily-edit/xylophone/xylophone-engine.test.ts`

Expected: FAIL，因为配置模块尚不存在。

- [ ] **Step 3: 实现配置和引擎**

Create `xylophone-config.ts`:

```ts
export const BAR_COUNT = 64;
export const phaseFromScroll = (scrollY: number) => Math.max(0, scrollY) * 0.0018;
export const PALETTE = { glass: '#d8e3e8', edge: '#9db6c3', fluid: '#b7cbd3' } as const;
```

Create `xylophone-engine.ts` with this public contract:

```ts
export type XylophoneEngine = {
  render(scrollY: number): void;
  resize(): void;
  dispose(): void;
};

export function createXylophoneEngine(
  canvas: HTMLCanvasElement,
  options: { reducedMotion: boolean; onContextLost?: () => void },
): XylophoneEngine;
```

Use an `InstancedMesh` with `BAR_COUNT` frosted, low-opacity rounded bars. Position each instance by a wrapped phase around a helix; add a shader material that combines a white backdrop, pale blue refraction and a Fresnel edge. Use `EffectComposer`, `RenderPass` and `SMAAEffect` only when `reducedMotion` is false. Keep pointer sampling on `window.pointermove` and feed a decaying `Vector2` into the shader; do not add wheel listeners. Expose `setSoundEnabled(enabled: boolean): void` and trigger notes only when enabled after an explicit user gesture.

- [ ] **Step 4: 在 engine 中实现释放和降级**

Implement the following teardown sequence inside `dispose()`:

```ts
window.removeEventListener('pointermove', onPointerMove);
geometry.dispose();
material.dispose();
composer?.dispose();
renderer.dispose();
```

Wrap `new WebGLRenderer({ canvas, alpha: true, antialias: true })` in `try/catch`; rethrow to let the React boundary use a static fallback. Register `webglcontextlost` with `preventDefault()` and `onContextLost`.

- [ ] **Step 5: 运行聚焦测试确认通过**

Run: `node --test tests/features/daily-edit/xylophone/xylophone-engine.test.ts`

Expected: PASS。

### Task 3: 将 WebGL 生命周期隔离为首页背景组件

**Files:**
- Create: `features/daily-edit/xylophone-background.tsx`
- Create: `tests/features/daily-edit/xylophone-background.test.ts`

**Interfaces:**
- Consumes: `createXylophoneEngine` 和浏览器的 `scroll`、`resize`、`prefers-reduced-motion`。
- Produces: `<XylophoneBackground paused={boolean} />`，渲染一个无障碍隐藏的背景 canvas 或静态 fallback。

- [ ] **Step 1: 写入组件结构测试**

```ts
void test('the homepage background canvas never captures pointer interaction', () => {
  const source = readFileSync(
    new URL('../../../features/daily-edit/xylophone-background.tsx', import.meta.url),
    'utf8',
  );
  assert.match(source, /aria-hidden="true"/);
  assert.match(source, /className="xylophone-background"/);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/features/daily-edit/xylophone-background.test.ts`

Expected: FAIL，因为组件尚不存在。

- [ ] **Step 3: 实现 React 生命周期边界**

Implement this component shape:

```tsx
export default function XylophoneBackground({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [available, setAvailable] = useState(true);
  // create engine once, sample window.scrollY in requestAnimationFrame,
  // pause animation while `paused` or reduced motion, and dispose on unmount.
  return available ? <canvas ref={canvasRef} className="xylophone-background" aria-hidden="true" /> : null;
}
```

Use a `ResizeObserver` on the canvas parent, `matchMedia('(prefers-reduced-motion: reduce)')`, and a single animation frame loop. If engine creation fails or the WebGL context is lost, set `available` to false. The loop must call `engine.render(window.scrollY)` only while not paused and motion is allowed.

- [ ] **Step 4: 运行聚焦测试确认通过**

Run: `node --test tests/features/daily-edit/xylophone-background.test.ts`

Expected: PASS。

### Task 4: 添加用户控制的木琴音效

**Files:**
- Create: `features/daily-edit/xylophone/xylophone-audio.ts`
- Create: `features/daily-edit/xylophone-sound-toggle.tsx`
- Create: `tests/features/daily-edit/xylophone-sound-toggle.test.ts`
- Modify: `features/daily-edit/xylophone/xylophone-engine.ts`
- Modify: `features/daily-edit/featured-home.tsx`
- Modify: `styles/daily-edit.css`

**Interfaces:**
- Consumes: 背景引擎的 `setSoundEnabled(enabled: boolean)` 与用户指针事件。
- Produces: `<XylophoneSoundToggle onChange={(enabled) => void} />` 和仅在用户开启时发声的引擎。

- [ ] **Step 1: 写入声音开关测试**

```ts
void test('sound toggle starts muted and exposes its pressed state', () => {
  const source = readFileSync(
    new URL('../../../features/daily-edit/xylophone-sound-toggle.tsx', import.meta.url),
    'utf8',
  );
  assert.match(source, /useState\(false\)/);
  assert.match(source, /aria-pressed=\{enabled\}/);
  assert.match(source, /声音关闭/);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/features/daily-edit/xylophone-sound-toggle.test.ts`

Expected: FAIL，因为声音开关尚不存在。

- [ ] **Step 3: 实现受手势保护的音频控制**

Create `xylophone-audio.ts` with this contract:

```ts
export type XylophoneAudio = {
  setEnabled(enabled: boolean): void;
  play(index: number): void;
  dispose(): void;
};

export function createXylophoneAudio(): XylophoneAudio;
```

Create the `AudioContext` only inside `setEnabled(true)`, resume it after the user click, and construct major-pentatonic oscillator notes in `play(index)`. `play` must return without doing anything while disabled or before context creation. Wire the engine's pointer hit test to `audio.play(barIndex)` only while enabled.

- [ ] **Step 4: 实现开关并挂载到首页**

Create this component behavior:

```tsx
export default function XylophoneSoundToggle({ onChange }: { onChange: (enabled: boolean) => void }) {
  const [enabled, setEnabled] = useState(false);
  return <button type="button" aria-pressed={enabled} onClick={() => {
    const next = !enabled;
    setEnabled(next);
    onChange(next);
  }}>{enabled ? '声音开启' : '声音关闭'}</button>;
}
```

Place it above the content layer at the lower left, provide a 44px minimum touch target, and pass its state to `XylophoneBackground` so opening a work disables note triggering.

- [ ] **Step 5: 运行聚焦测试确认通过**

Run: `node --test tests/features/daily-edit/xylophone-sound-toggle.test.ts`

Expected: PASS。

### Task 5: 重组首页首屏与可滚动推荐内容

**Files:**
- Modify: `features/daily-edit/featured-home.tsx`
- Modify: `styles/daily-edit.css`
- Create: `tests/features/daily-edit/home-layout.test.ts`

**Interfaces:**
- Consumes: `<XylophoneBackground paused={selected !== null} />` 和现有 `FeaturedCard`、`FeaturedDetail`。
- Produces: 固定背景、首屏底部的推荐标题和首屏后的作品网格。

- [ ] **Step 1: 写入首页布局测试**

```ts
void test('daily recommendation keeps the background behind a full-height intro and a scrollable grid', () => {
  const source = readFileSync(
    new URL('../../../features/daily-edit/featured-home.tsx', import.meta.url),
    'utf8',
  );
  assert.match(source, /<XylophoneBackground paused=\{selected !== null\} \/>/);
  assert.match(source, /className="featured-intro"/);
  assert.match(source, /className="featured-grid"/);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/features/daily-edit/home-layout.test.ts`

Expected: FAIL，因为首页尚未挂载背景和首屏容器。

- [ ] **Step 3: 调整首页结构**

Add `XylophoneBackground` immediately inside `.featured-home`. Wrap the existing header metadata and heading in `<section className="featured-intro">`; leave `<section className="featured-grid">` after that intro, with unchanged `FeaturedCard` mapping and detail rendering.

- [ ] **Step 4: 调整样式**

Apply these non-negotiable rules in `styles/daily-edit.css`:

```css
.xylophone-background { position: fixed; inset: 0; z-index: 0; width: 100%; height: 100%; pointer-events: none; opacity: .42; }
.featured-home { position: relative; isolation: isolate; background: #f9fbfc; }
.featured-intro { position: relative; z-index: 1; min-height: 100svh; display: grid; grid-template-rows: auto 1fr; }
.featured-header__heading { align-self: end; margin: 0 0 clamp(36px, 7vh, 88px); }
.featured-header__metadata { font-size: 14px; }
.featured-grid { position: relative; z-index: 1; }
```

At `max-width: 900px`, use `font-size: 12px` for metadata, preserve the two-column grid and set the intro bottom spacing to `32px`.

- [ ] **Step 5: 运行布局测试确认通过**

Run: `node --test tests/features/daily-edit/home-layout.test.ts`

Expected: PASS。

### Task 6: 完整验证与手动交互检查

**Files:**
- Modify only if a test or build failure exposes an implementation defect in Tasks 1–4.

**Interfaces:**
- Consumes: 完整首页、HTTP 内容仓储和运行中的本地 API。
- Produces: 经过构建验证、可滚动且可打开详情的淡色 WebGL 首页。

- [ ] **Step 1: 运行全部前端验证**

Run: `npm test; npx tsc --noEmit; npx oxlint features infrastructure; npm run build`

Expected: 所有测试通过，类型检查与受影响目录 lint 无错误，构建完成。

- [ ] **Step 2: 验证浏览器关键路径**

Open `http://localhost:3000/` using the retained local development server. Confirm the glass helix stays behind the larger metadata, the title is near the first-screen bottom, page scrolling reaches cards, and selecting then closing a work preserves the page behavior.

- [ ] **Step 3: 检查工作区范围**

Run: `git status --short; git diff --check`

Expected: 仅包含本计划定义的前端、授权、测试与锁文件改动；不存在空白错误。
