# Frontend Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前静态摄影画廊改造成可接入 Go 内容服务的分层前端，同时保持现有视觉、转场和交互。

**Architecture:** 页面通过 application queries 访问 `ContentRepository`，repository 由 local 或 HTTP adapter 实现。Daily Edit、Gallery 和 Work Detail 各自成为 feature；Gallery 使用同源只读 Route Handler 获取游标分页数据，Three.js 只维护固定卡片池并复用离屏纹理。

**Tech Stack:** React 19、TypeScript、Vinext/Next App Router API、Three.js、GSAP、Node.js Test Runner、Oxlint、Oxfmt

**Spec:** `docs/superpowers/specs/2026-09-08-frontend-architecture-design.md`

## Global Constraints

- 本阶段不实现 Go 服务、数据库、对象存储、定时任务、AI 评审或 AI 助手。
- 不改变现有页面视觉、详情排版、动画节奏和键盘行为。
- 作品库上限 1000；前端不执行淘汰策略。
- Daily Edit 必须固定 12 件作品，缺失时不得回退画廊前 12 件。
- 生产 HTTP 数据源失败时不得静默回退本地 fixtures。
- 摄影师陈述、编辑文案、AI 分析和授权信息必须保持独立字段。
- 不新增全局状态库、请求缓存库或 OpenAPI 代码生成依赖。
- 每个任务使用 TDD；每个阶段保持测试、Lint、类型检查和构建可运行。
- 未经用户明确要求不得创建 Git commit 或 push；任务末尾只提供可审阅的工作区变更。

---

### Task 1: 建立领域模型与 Repository 端口

**Files:**
- Create: `domain/work/work.ts`
- Create: `domain/daily-edit/daily-edit.ts`
- Create: `application/errors/content-error.ts`
- Create: `application/ports/content-repository.ts`
- Test: `lib/content-contract.test.ts`

**Interfaces:**
- Consumes: 无。
- Produces: `WorkId`、`ImageAsset`、`WorkSummary`、`WorkDetail`、`DailyEdit`、`CursorPage<T>`、`ListWorksInput`、`ContentRepository`、`ContentError`。

- [ ] **Step 1: 写失败的领域契约测试**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { ContentError } from '../application/errors/content-error.ts';

void test('content errors keep a stable code and optional request id', () => {
  const error = new ContentError('WORK_NOT_FOUND', 'Work not found', {
    requestId: 'request-1',
    status: 404,
  });
  assert.equal(error.code, 'WORK_NOT_FOUND');
  assert.equal(error.status, 404);
  assert.equal(error.requestId, 'request-1');
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test lib/content-contract.test.ts`

Expected: FAIL，提示 `application/errors/content-error.ts` 不存在。

- [ ] **Step 3: 定义领域类型与错误类型**

`domain/work/work.ts` 导出：

```ts
export type WorkId = string;
export type ImageAsset = { src: string; width: number; height: number; alt: string };
export type WorkSummary = {
  id: WorkId;
  title: string;
  photographerName: string;
  publishedAt: string;
  category: string;
  thumbnail: ImageAsset;
};
export type Attribution = {
  sourceUrl: string;
  licenseName: string;
  licenseUrl?: string;
  creditLine: string;
};
export type AIAnalysis = {
  content: string;
  generatedAt: string;
  model: string;
  version: string;
};
export type WorkDetail = WorkSummary & {
  image: ImageAsset;
  artistStatement?: string;
  editorialNote?: string;
  aiAnalysis?: AIAnalysis;
  attribution: Attribution;
};
```

`application/ports/content-repository.ts` 导出：

```ts
export type CursorPage<T> = { items: T[]; nextCursor: string | null; hasMore: boolean };
export type ListWorksInput = { cursor?: string; limit: number; query?: string };
export interface ContentRepository {
  listWorks(input: ListWorksInput): Promise<CursorPage<WorkSummary>>;
  getWork(id: WorkId): Promise<WorkDetail>;
  getDailyEdit(date: string): Promise<DailyEdit>;
}
```

`ContentError` 继承 `Error`，构造参数为错误码、消息以及可选的 `status`、`requestId`、`cause`。

- [ ] **Step 4: 运行领域契约测试**

Run: `node --test lib/content-contract.test.ts`

Expected: PASS。

- [ ] **Step 5: 运行当前完整测试作为迁移基线**

Run: `npm test`

Expected: 现有 33 项测试与新测试全部通过。

### Task 2: 实现本地数据适配器与应用查询

**Files:**
- Create: `infrastructure/local/fixtures.ts`
- Create: `infrastructure/local/local-content-repository.ts`
- Create: `application/queries/list-works.ts`
- Create: `application/queries/get-work.ts`
- Create: `application/queries/get-daily-edit.ts`
- Create: `application/queries/get-editorial-date.ts`
- Test: `lib/local-content-repository.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `ContentRepository` 和领域模型。
- Produces: `localContentRepository`、`listWorks(repository, input)`、`getWork(repository, id)`、`getDailyEdit(repository, date)`、`getEditorialDate(now, timeZone)`。

- [ ] **Step 1: 写失败的本地 Repository 测试**

测试必须覆盖：字符串 ID、空查询分页、标题/摄影师/分类/年份的不区分大小写搜索、游标续页、未知 ID 的 `WORK_NOT_FOUND`、Daily Edit 恰好 12 件、上海时区日期。

```ts
void test('local repository paginates with an opaque cursor', async () => {
  const first = await localContentRepository.listWorks({ limit: 5 });
  const second = await localContentRepository.listWorks({
    limit: 5,
    cursor: first.nextCursor ?? undefined,
  });
  assert.equal(first.items.length, 5);
  assert.equal(second.items.length, 5);
  assert.notEqual(first.items[0].id, second.items[0].id);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test lib/local-content-repository.test.ts`

Expected: FAIL，提示 local repository 模块不存在。

- [ ] **Step 3: 迁移 fixtures 并实现 Repository**

将 16 件现有作品迁移为 `WorkDetail[]`，ID 使用 `work-01` 至 `work-16`。`thumbnail` 与 `image` 指向当前 `/art/*`；授权字段使用明确的开发占位值 `Private development placeholder`，不得伪造摄影师陈述。

本地游标使用 `offset:<number>`，解析失败抛出 `INVALID_CURSOR`。`limit` 限制为 1–60。搜索使用 `title`、`photographerName`、`category`、`publishedAt`。Daily Edit 返回请求日期和前 12 件作品的 summary。

- [ ] **Step 4: 实现薄应用查询**

query 函数只负责输入规范化并委托 repository。例如：

```ts
export function listWorks(repository: ContentRepository, input: ListWorksInput) {
  return repository.listWorks({
    ...input,
    query: input.query?.trim() || undefined,
    limit: Math.min(Math.max(input.limit, 1), 60),
  });
}
```

`getEditorialDate` 使用 `Intl.DateTimeFormat('en-CA', { timeZone })`，默认调用方传入 `Asia/Shanghai`。

- [ ] **Step 5: 运行本地 Repository 与完整测试**

Run: `node --test lib/local-content-repository.test.ts && npm test`

Expected: PASS。

### Task 3: 增加服务器 Repository 工厂与只读 Route Handlers

**Files:**
- Create: `infrastructure/config/content-source.ts`
- Create: `app/api/content/gallery/route.ts`
- Create: `app/api/content/daily-edits/[date]/route.ts`
- Create: `app/api/content/works/[id]/route.ts`
- Create: `application/http/content-response.ts`
- Test: `lib/content-source.test.ts`
- Test: `lib/content-response.test.ts`

**Interfaces:**
- Consumes: Task 2 的 local repository 和 queries；Task 7 后续提供 HTTP repository。
- Produces: `getContentRepository(env?)`、`dataResponse(data, init?)`、`errorResponse(error)`，以及浏览器可访问的同源 `/api/content/*`。

- [ ] **Step 1: 写失败的配置和错误响应测试**

```ts
void test('production http mode never falls back to local content', () => {
  assert.throws(
    () => getContentRepository({ CONTENT_SOURCE: 'http' }),
    (error: unknown) =>
      error instanceof ContentError && error.code === 'CONTENT_API_NOT_CONFIGURED',
  );
});
```

同时断言 `errorResponse(new ContentError(...))` 返回统一 `{ error: { code, message, requestId } }` 和对应 HTTP 状态。

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test lib/content-source.test.ts lib/content-response.test.ts`

Expected: FAIL，提示模块不存在。

- [ ] **Step 3: 实现工厂与响应函数**

`CONTENT_SOURCE` 缺失或为 `local` 时返回 local repository；为 `http` 且缺少 `CONTENT_API_BASE_URL` 时抛出配置错误；未知值抛出 `INVALID_CONTENT_SOURCE`。不得捕获后自动返回 local repository。

- [ ] **Step 4: 实现三个只读 Route Handlers**

Gallery 解析 `cursor`、`limit`、`query`；Daily Edit 解析日期；Work Detail 解码路径 ID。所有 handler 只调用 application query，并使用统一响应函数。`limit` 默认 48。

- [ ] **Step 5: 运行配置、响应和完整测试**

Run: `node --test lib/content-source.test.ts lib/content-response.test.ts && npm test`

Expected: PASS。

### Task 4: 迁移 Daily Edit 为独立 Feature

**Files:**
- Create: `features/daily-edit/daily-edit-view-model.ts`
- Move: `app/featured-home.tsx` → `features/daily-edit/featured-home.tsx`
- Move: `app/featured-card.tsx` → `features/daily-edit/featured-card.tsx`
- Move: `app/featured-detail.tsx` → `features/daily-edit/featured-detail.tsx`
- Modify: `app/page.tsx`
- Remove after migration: `lib/featured.ts`
- Modify test: `lib/featured.test.ts`

**Interfaces:**
- Consumes: Task 2 的 `getDailyEdit`、`getEditorialDate` 和 Task 3 的 repository 工厂。
- Produces: `FeaturedHome({ works }: { works: WorkSummary[] })` 与 `toFeaturedWork(summary, index, total)`。

- [ ] **Step 1: 将 view-model 测试改写为新领域结构并确认失败**

```ts
void test('daily edit view model derives only presentation metadata', () => {
  assert.deepEqual(toFeaturedWork(summary, 0, 12), {
    ...summary,
    displayTitle: summary.title.toUpperCase(),
    categoryLabel: summary.category.toUpperCase(),
    year: '2026',
    positionLabel: '01 / 12',
  });
});
```

Run: `node --test lib/featured.test.ts`

Expected: FAIL，提示新 view-model 不存在。

- [ ] **Step 2: 移动组件并改为 props 驱动**

`FeaturedHome` 不再导入全局 `featuredWorks`，而是接收 `WorkSummary[]` 并映射 view-model。卡片和详情使用 `photographerName`、`thumbnail.src`。所有 GSAP refs、状态机和时间参数保持原样。

- [ ] **Step 3: 将首页改成薄路由**

```tsx
export default async function Home() {
  const repository = getContentRepository();
  const date = getEditorialDate(new Date(), 'Asia/Shanghai');
  const edit = await getDailyEdit(repository, date);
  return <FeaturedPageShell><FeaturedHome works={edit.works} /></FeaturedPageShell>;
}
```

路由级错误交给 `app/error.tsx`（若 Task 8 创建前暂由构建错误边界处理）；不得在这里读取 fixtures。

- [ ] **Step 4: 运行推荐页测试、类型检查和构建**

Run: `node --test lib/featured.test.ts lib/featured-state.test.ts lib/repeating-transition.test.ts && npx tsc --noEmit && npm run build`

Expected: PASS；首页视觉结构测试保持通过。

### Task 5: 迁移 Gallery Feature 与领域类型

**Files:**
- Move: `app/scene.tsx` → `features/gallery/gallery-scene.tsx`
- Move: `app/gallery-detail.tsx` → `features/gallery/gallery-detail.tsx`
- Create: `features/gallery/gallery-client.tsx`
- Create: `features/gallery/gallery-card-view-model.ts`
- Modify: `app/gallery/page.tsx`
- Modify: `lib/gallery-detail.ts`
- Modify tests: `lib/gallery-detail.test.ts`, `lib/gallery-detail-layout.test.ts`, `lib/projects.test.ts`
- Remove after migration: `lib/projects.ts`, `lib/projects.test.ts`

**Interfaces:**
- Consumes: `WorkSummary`、Task 2 的 local semantics、现有 gallery detail state machine。
- Produces: `GalleryClient({ initialPage })`、`GalleryScene({ items, ... })`。

- [ ] **Step 1: 写字符串作品 ID 的失败回归测试**

将 gallery selection fixture 的 `projectId` 改为 `'work-04'`，断言 reducer 在 opening/detail/closing 全流程中保留字符串 ID。新增 view-model 测试，断言 `thumbnail.src` 映射到场景图片。

Run: `node --test lib/gallery-detail.test.ts`

Expected: FAIL，现有 `number` 类型或旧 Project 字段不匹配。

- [ ] **Step 2: 移动 Gallery 组件并替换领域字段**

场景和详情使用 `WorkSummary`，将：

```text
project.photographer -> work.photographerName
project.image        -> work.thumbnail.src
project.id + 1       -> 当前目录位置标签
```

现有射线命中、搜索隐藏卡片过滤、图片宽高比、详情动画和 WebGL 降级逻辑保持不变。

- [ ] **Step 3: 将 Gallery 路由改成服务器初始加载＋客户端交互**

`app/gallery/page.tsx` 只获取 `listWorks(repository, { limit: 48 })` 并将 `CursorPage<WorkSummary>` 传入 `GalleryClient`。现有大组件主体移动至 `features/gallery/gallery-client.tsx`。

- [ ] **Step 4: 删除旧全局数组依赖**

确认以下命令无输出后删除 `lib/projects.ts`：

Run: `rg -n "@/lib/projects|from './projects" app features application domain infrastructure lib`

Expected: 无引用。

- [ ] **Step 5: 运行 Gallery 回归、类型检查和构建**

Run: `node --test lib/gallery-detail.test.ts lib/gallery-detail-layout.test.ts lib/interaction.test.ts lib/projection.test.ts && npx tsc --noEmit && npm run build`

Expected: PASS。

### Task 6: 实现 Gallery 目录状态、搜索和分页

**Files:**
- Create: `features/gallery/gallery-catalog-state.ts`
- Create: `features/gallery/use-gallery-catalog.ts`
- Create: `infrastructure/http/same-origin-content-client.ts`
- Modify: `features/gallery/gallery-client.tsx`
- Modify: `app/site-nav.tsx`
- Test: `lib/gallery-catalog-state.test.ts`

**Interfaces:**
- Consumes: `/api/content/gallery` 和 `CursorPage<WorkSummary>`。
- Produces: `galleryCatalogReducer`、`useGalleryCatalog(initialPage)`，返回 `{ items, query, setQuery, hasMore, loadMore, status, retry }`。

- [ ] **Step 1: 写失败的目录状态测试**

覆盖：追加分页时按 ID 去重、全新搜索替换列表、过期请求结果被忽略、下一页失败保留已有列表、清空搜索恢复初始目录。

```ts
void test('stale search results cannot replace a newer query', () => {
  const searching = galleryCatalogReducer(initial, { type: 'search-started', requestId: 2, query: 'new' });
  const stale = galleryCatalogReducer(searching, { type: 'search-succeeded', requestId: 1, page });
  assert.equal(stale, searching);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test lib/gallery-catalog-state.test.ts`

Expected: FAIL，提示 reducer 模块不存在。

- [ ] **Step 3: 实现 reducer 与同源 client**

同源 client 请求 `/api/content/gallery`，非 2xx 响应转换为 `ContentError`。Reducer 使用递增 `requestId` 拒绝过期响应。

- [ ] **Step 4: 实现 hook**

搜索等待 250ms；每次新搜索 abort 前一个请求。`loadMore` 在 `loading-more` 或 `hasMore=false` 时直接返回。卸载时 abort 当前请求。

- [ ] **Step 5: 接入 GalleryClient**

SiteNav 的搜索值连接 hook。初始失败、搜索失败和加载更多失败分别显示页面级或局部重试状态；无结果保留现有极简提示。

- [ ] **Step 6: 运行目录状态与完整测试**

Run: `node --test lib/gallery-catalog-state.test.ts && npm test`

Expected: PASS。

### Task 7: 将 Three.js 场景改为固定卡片池

**Files:**
- Create: `features/gallery/gallery-virtual-grid.ts`
- Modify: `features/gallery/gallery-scene.tsx`
- Modify: `features/gallery/gallery-client.tsx`
- Test: `lib/gallery-virtual-grid.test.ts`

**Interfaces:**
- Consumes: Task 6 的 `items`、`hasMore`、`loadMore`。
- Produces: `virtualCellForOffset`、`catalogIndexForCell`，以及 `GalleryScene` 的 `onNeedMore` 回调。

- [ ] **Step 1: 写失败的虚拟卡片池测试**

覆盖横向和纵向跨越边界、负偏移、同一逻辑单元的稳定索引、接近已加载尾部的预取阈值。

```ts
void test('a wrapped mesh advances to a stable logical cell', () => {
  assert.deepEqual(
    virtualCellForOffset({ row: 0, column: 0 }, { x: 8.2, y: 0 }, { columns: 8, rows: 6 }),
    { row: 0, column: -8 },
  );
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test lib/gallery-virtual-grid.test.ts`

Expected: FAIL，提示 virtual grid 模块不存在。

- [ ] **Step 3: 提取纯虚拟网格计算**

计算函数不得依赖 Three.js。它根据初始 row/column、累计偏移和 8×6 池尺寸返回逻辑单元；逻辑单元再稳定映射到已加载目录索引。

- [ ] **Step 4: 让 CardSurface 支持安全重绑定**

为每个 surface 增加 `bind(work, generation)`。图片 `onload` 只有在 generation 与 surface 当前代次一致时才 repaint，防止离屏复用后旧图片闪回。释放或重绑时清除 hover 状态。

- [ ] **Step 5: 接入固定 48 卡片池和预取**

Mesh、CanvasTexture、Material 总数固定为 48。卡片跨越 wrap 边界时只重绘该 surface，不重建 renderer。目录索引进入已加载数据最后 12 件时调用节流后的 `onNeedMore`。

- [ ] **Step 6: 验证 Scene 不因 items 追加重建**

添加静态回归断言：初始化 effect 不依赖 `items` 数组引用，数据通过 ref/bind 更新；保留 `renderer.dispose()` 仅在组件卸载执行。

Run: `node --test lib/gallery-virtual-grid.test.ts lib/projection.test.ts lib/interaction.test.ts && npx tsc --noEmit && npm run build`

Expected: PASS。

### Task 8: 增加稳定作品 URL 与详情数据加载

**Files:**
- Create: `features/work-detail/work-detail-view.tsx`
- Create: `features/work-detail/work-detail-history.ts`
- Create: `features/work-detail/use-work-detail.ts`
- Create: `app/works/[id]/page.tsx`
- Modify: `features/daily-edit/featured-home.tsx`
- Modify: `features/gallery/gallery-client.tsx`
- Modify: `features/gallery/gallery-detail.tsx`
- Test: `lib/work-detail-history.test.ts`

**Interfaces:**
- Consumes: `/api/content/works/{id}`、`WorkDetail`、现有详情转场状态。
- Produces: `workPath(id)`、`openWorkHistory(id, returnTo)`、`closeWorkHistory(returnTo)`、`useWorkDetail(id)` 和可直接路由渲染的详情视图。

- [ ] **Step 1: 写失败的历史状态测试**

覆盖 ID URL 编码、从 `/gallery?q=street` 进入后保存完整返回地址、关闭恢复、直接详情默认返回 `/gallery`。

```ts
void test('work paths encode stable string ids', () => {
  assert.equal(workPath('work/a b'), '/works/work%2Fa%20b');
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test lib/work-detail-history.test.ts`

Expected: FAIL，提示 history 模块不存在。

- [ ] **Step 3: 实现纯历史状态函数和详情 hook**

历史 state 使用 `{ workDetail: true, returnTo: string }`。Hook 对 ID 变化取消旧请求，返回 `idle | loading | ready | error`，不允许旧响应覆盖新作品。

- [ ] **Step 4: 接入列表转场**

点击作品仍先使用 summary 启动现有动画，同时请求 detail；地址在转场开始后更新。关闭时先播放当前回场，再恢复 `returnTo`。`popstate` 触发与关闭相同的状态收敛，但不得再次写 history。

- [ ] **Step 5: 实现直接详情路由**

`app/works/[id]/page.tsx` 使用 repository 获取完整详情。不存在时进入 Not Found；直接路由的返回按钮前往 `/gallery`，不执行依赖来源卡片坐标的动画。

- [ ] **Step 6: 运行路由、转场、类型和构建验证**

Run: `node --test lib/work-detail-history.test.ts lib/gallery-detail.test.ts lib/featured-state.test.ts && npx tsc --noEmit && npm run build`

Expected: PASS。

### Task 9: 实现 Go API HTTP Adapter 与运行时 Decoder

**Files:**
- Create: `infrastructure/http/api-client.ts`
- Create: `infrastructure/http/decoders.ts`
- Create: `infrastructure/http/http-content-repository.ts`
- Create: `docs/api/content-api.md`
- Modify: `infrastructure/config/content-source.ts`
- Test: `lib/http-content-repository.test.ts`
- Test: `lib/content-decoders.test.ts`

**Interfaces:**
- Consumes: Task 1 的 repository 契约和 `CONTENT_API_BASE_URL`。
- Produces: `createHttpContentRepository({ baseUrl, fetchImpl, timeoutMs })` 与三个响应 decoder。

- [ ] **Step 1: 写失败的 decoder 测试**

覆盖完整合法响应、缺少必填字段、允许未知附加字段、可选 AI 分析缺失、非 ISO 日期、错误 envelope。

- [ ] **Step 2: 写失败的 HTTP repository 测试**

使用注入的 fake `fetchImpl`，断言 URL 查询参数、非 2xx 错误转换、`requestId` 保留、超时 abort、响应结构错误转换为 `INVALID_CONTENT_RESPONSE`。

- [ ] **Step 3: 运行测试并确认失败**

Run: `node --test lib/content-decoders.test.ts lib/http-content-repository.test.ts`

Expected: FAIL，提示 HTTP 模块不存在。

- [ ] **Step 4: 实现无依赖 decoder**

使用 `unknown` 输入与小型断言函数校验 object、string、number、array 和 ISO 日期。未知字段忽略；缺失必填字段抛出包含字段路径的 `ContentError`。不安装 schema 库。

- [ ] **Step 5: 实现 API client 与 repository**

API client 使用 `AbortSignal.timeout(timeoutMs)` 与调用方 signal 合并；默认 8 秒。Repository 请求已确认的三个 `/v1/*` 路径，并只返回解码后的领域对象。

- [ ] **Step 6: 更新 repository 工厂与 API 文档**

`CONTENT_SOURCE=http` 时创建 HTTP repository。`docs/api/content-api.md` 写明参数、成功 envelope、错误 envelope、字段定义、最大 limit=60、404/410 语义和示例，不包含 Go 框架实现细节。

- [ ] **Step 7: 运行 HTTP 测试和完整验证**

Run: `node --test lib/content-decoders.test.ts lib/http-content-repository.test.ts && npm test && npx tsc --noEmit && npm run build`

Expected: PASS。

### Task 10: 错误边界、文档与最终清理

**Files:**
- Create: `app/error.tsx`
- Create: `app/not-found.tsx`
- Create: `.env.example`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-09-08-frontend-architecture-design.md` only if implementation revealed an explicit contract correction
- Test: all existing and new `lib/*.test.ts`

**Interfaces:**
- Consumes: 所有前序任务。
- Produces: 可运行、可配置、可接入 Go API 的完整前端工程。

- [ ] **Step 1: 增加错误与 Not Found UI**

保持项目黑白编辑式视觉；错误页展示简短错误、重试按钮和返回画廊链接。不得显示堆栈、API 地址或内部响应内容。

- [ ] **Step 2: 写环境配置示例**

```dotenv
CONTENT_SOURCE=local
CONTENT_API_BASE_URL=http://localhost:8080
CONTENT_API_TIMEOUT_MS=8000
EDITORIAL_TIME_ZONE=Asia/Shanghai
```

- [ ] **Step 3: 更新 README**

更新目录、数据流、本地/HTTP 数据源、Go API 对接、添加作品方式、环境变量和验证命令。删除“页面直接读取 `lib/projects.ts`”等过期说明。

- [ ] **Step 4: 执行架构验收搜索**

Run: `rg -n "@/lib/projects|featuredWorks|projects\.slice" app features application domain infrastructure`

Expected: 无旧全局数据依赖。

Run: `rg -n "fetch\(" app features`

Expected: feature 中只有 `same-origin-content-client.ts` 封装处存在请求；页面组件无裸 fetch。

- [ ] **Step 5: 执行最终验证**

Run: `npm test`

Expected: 全部测试通过，0 failed。

Run: `npx oxlint app application domain features infrastructure lib`

Expected: 0 errors。

Run: `npx tsc --noEmit`

Expected: exit 0。

Run: `npm run build`

Expected: exit 0，路由至少包含 `/`、`/gallery`、`/works/[id]` 和三个 `/api/content/*` handler。

Run: `git diff --check`

Expected: 无空白错误。

- [ ] **Step 6: 汇报工作区状态**

列出新增/移动/删除文件、验证结果和 Go 后端应实现的接口。保持所有变更未提交，等待用户明确要求 commit/push。
