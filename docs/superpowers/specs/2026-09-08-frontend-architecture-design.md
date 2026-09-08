# 摄影内容平台前端工程化设计

## 背景与目标

当前项目使用 React、TypeScript、Vinext、Three.js 和 GSAP 构建推荐首页与沉浸式画廊，作品数据直接来自 `lib/projects.ts`。这一结构适合视觉原型，但页面、交互和数据来源耦合，无法直接承接持续上新、每日自动精选、作品详情分享、AI 分析和资源助手。

本阶段只改造前端架构，不实现 Go 后端，不重新设计页面，不改变现有转场与画廊交互。改造完成后项目继续使用本地数据运行，同时具备切换至 Go HTTP API 的清晰边界。

## 产品约束

- Go 后端未来负责作品采集、去重、授权记录、定时精选、发布和淘汰。
- Daily Edit 每日定时生成并直接发布，不经过人工审核。
- 每期 Daily Edit 固定包含 12 件作品，生成后结果保持不变。
- 画廊最多保留 1000 件有效作品，淘汰策略完全由后端执行。
- 前端只读取已发布内容，不提供管理后台和上传入口。
- 每件作品拥有稳定字符串 ID 和可直接访问的 `/works/{id}` 地址。
- 摄影师原始陈述、编辑文案和 AI 分析必须分开存储与展示。

## 方案选择

采用领域分层与适配器方案。页面通过应用层查询接口读取内容，基础设施层分别提供本地和 HTTP 实现。

不采用页面直接调用 REST API，因为它会使接口字段、加载状态和视图组件再次耦合。不在当前阶段引入 OpenAPI 代码生成，因为 Go 服务尚未实现，过早生成客户端会增加无效工具链；本阶段只维护一份轻量 HTTP 契约。

## 目录结构

```text
app/
├── page.tsx                       # Daily Edit 路由组装
├── gallery/page.tsx               # Gallery 路由组装
├── works/[id]/page.tsx            # 可直接访问的作品详情
└── api/content/                    # 浏览器访问数据层的同源只读接口

domain/
├── work/
│   ├── work.ts                    # WorkSummary、WorkDetail 等领域模型
│   └── work-rules.ts              # 搜索词、显示字段等纯规则
└── daily-edit/
    └── daily-edit.ts              # DailyEdit 领域模型

application/
├── ports/content-repository.ts    # 前端需要的数据能力
└── queries/
    ├── get-daily-edit.ts
    ├── get-work.ts
    └── list-works.ts

infrastructure/
├── config/content-source.ts       # local/http 数据源选择
├── local/
│   ├── fixtures.ts                # 当前占位作品
│   └── local-content-repository.ts
└── http/
    ├── api-client.ts              # 请求、超时与错误归一化
    ├── decoders.ts                # API 响应运行时校验
    └── http-content-repository.ts

features/
├── daily-edit/                    # 推荐列表、卡片、详情和转场
├── gallery/                       # 查询状态、视角控制和 WebGL 场景
└── work-detail/                   # 通用作品详情展示
```

现有通用 UI 组件继续放在 `components/`，纯数学与转场计算可以保留在 `lib/`。迁移只移动与当前目标直接相关的模块，不清理无关组件。

## 领域模型

```ts
type WorkId = string;

type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

type WorkSummary = {
  id: WorkId;
  title: string;
  photographerName: string;
  publishedAt: string;
  category: string;
  thumbnail: ImageAsset;
};

type Attribution = {
  sourceUrl: string;
  licenseName: string;
  licenseUrl?: string;
  creditLine: string;
};

type AIAnalysis = {
  content: string;
  generatedAt: string;
  model: string;
  version: string;
};

type WorkDetail = WorkSummary & {
  image: ImageAsset;
  artistStatement?: string;
  editorialNote?: string;
  aiAnalysis?: AIAnalysis;
  attribution: Attribution;
};

type DailyEdit = {
  date: string;
  generatedAt: string;
  selectionVersion: string;
  works: WorkSummary[];
};

type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};
```

日期使用 ISO 8601 字符串。领域层使用稳定字符串 ID，当前数字占位 ID 在本地适配器中转换。列表只返回缩略图和简要字段，长文案、原图、授权及 AI 分析仅在详情查询中返回。

## 应用层接口

```ts
type ListWorksInput = {
  cursor?: string;
  limit: number;
  query?: string;
};

interface ContentRepository {
  listWorks(input: ListWorksInput): Promise<CursorPage<WorkSummary>>;
  getWork(id: WorkId): Promise<WorkDetail>;
  getDailyEdit(date: string): Promise<DailyEdit>;
}
```

页面和 feature 只能调用应用层 query，不得直接导入 fixtures、拼接 API 地址或调用裸 `fetch`。应用层负责参数规范化，适配器负责具体 I/O 和数据转换。

## 页面与数据流

### Daily Edit

`/` 在页面层获取当天 Daily Edit，将固定的 12 件作品传给客户端 feature。客户端 feature 只管理现有转场状态。某日期没有精选时显示明确空状态，不自动选择画廊前 12 件，避免掩盖定时任务失败。

### Gallery

`/gallery` 首次获取 48 件作品。接口采用游标分页，接近当前浏览范围边界时预加载下一页。搜索输入经过约 250 毫秒防抖后调用 `listWorks({ query })`，搜索范围由 Go 后端覆盖全部有效作品，而不是只过滤浏览器已加载内容。

Three.js 场景只接收适合渲染的 `WorkSummary[]`，不获取数据、不解析 API 响应，也不决定淘汰规则。场景同时维护的纹理数量应受控，不能因为作品库上限为 1000 就一次性创建 1000 张纹理。

场景继续只维护固定的 48 个实体卡片。拖拽导致卡片从屏幕一侧循环至另一侧时，离屏卡片根据逻辑位置重新绑定目录中的作品；图片加载使用代次标识，过期加载不得覆盖已复用卡片。接近已加载目录末端时通知 Gallery feature 预取下一页。这样可以浏览最多 1000 件作品，同时将 CanvasTexture、Mesh 和图片解码数量限制在固定范围。

本地适配器实现与 HTTP 适配器相同的分页和搜索语义，使本地开发能够覆盖未来真实数据路径。

浏览器端分页与搜索统一请求前端同源的 `/api/content/*` Route Handler。Route Handler 只调用应用层 query，再由服务器端 repository 访问 local adapter 或 Go API；浏览器不直接读取后端地址，因此不需要暴露服务地址或配置跨域访问。

### Work Detail

`/works/{id}` 支持直接访问、刷新和分享。直接访问时页面获取完整 `WorkDetail` 并渲染详情。

从 Daily Edit 或 Gallery 点击作品时，先沿用现有转场，再通过 History API 将地址更新为 `/works/{id}`，避免完整路由切换卸载当前场景和打断动画。关闭详情时恢复进入前的列表 URL。浏览器前进和后退事件必须与打开、关闭状态同步。

如果页面是从外部直接进入 `/works/{id}`，关闭操作返回 `/gallery`，不播放依赖来源卡片坐标的回场动画。

## 数据源配置

使用一个明确的环境配置选择数据源：

```text
CONTENT_SOURCE=local | http
CONTENT_API_BASE_URL=https://api.example.com
```

本阶段默认 `local`。生产环境选择 `http` 后，如果 API 不可用或数据校验失败，应展示错误状态，不得静默回退本地 fixtures。这样可以避免线上展示陈旧或虚假的占位内容。

## Go HTTP API 契约

```text
GET /v1/gallery?cursor={cursor}&limit={limit}&query={query}
GET /v1/daily-edits/{date}
GET /v1/works/{id}
```

列表成功响应：

```json
{
  "data": {
    "items": [],
    "nextCursor": null,
    "hasMore": false
  }
}
```

单项成功响应：

```json
{
  "data": {}
}
```

统一失败响应：

```json
{
  "error": {
    "code": "WORK_NOT_FOUND",
    "message": "Work not found",
    "requestId": "..."
  }
}
```

HTTP 适配器应处理非 2xx 状态、请求超时、网络失败和响应结构错误，并统一转换成前端 `ContentError`。前端不依赖 Go 内部数据库字段或任务状态。

## 加载与错误策略

- Daily Edit 初始加载失败：显示页面级错误和重试入口。
- Gallery 初始加载失败：显示页面级错误；加载下一页失败：保留现有作品并提供局部重试。
- 搜索失败：保留搜索词，显示搜索错误，不回退未搜索列表冒充结果。
- 作品不存在：`/works/{id}` 显示 Not Found 状态。
- 图片加载失败：继续使用现有占位与元数据表现。
- API 响应校验失败：按数据错误处理并保留 `requestId` 供排查。
- AI 分析缺失：隐藏对应区块，不影响作品详情。

## 缓存与性能

- Daily Edit 可以按日期缓存，发布后视为不可变内容。
- Gallery 列表使用短时缓存；搜索请求通过防抖和取消前序请求避免乱序覆盖。
- Work Detail 可按 ID 缓存，淘汰作品由后端返回 404 或 410。
- 首屏只加载缩略图，进入详情后再加载原图和长文案。
- 不在本阶段引入 React Query、全局状态库或复杂虚拟列表。
- WebGL 渲染与数据缓存分离，数据刷新不应无条件销毁 renderer 和全部纹理。

## 测试策略

- 领域单元测试：ID、日期、分页和显示字段规则。
- Repository 契约测试：local 与 http 适配器对相同输入返回相同领域结构。
- Decoder 测试：合法响应、缺失字段、错误状态和未知可选字段。
- Query 测试：参数规范化、错误转换和取消过期搜索请求。
- Feature 测试：加载、空状态、失败、重试、搜索和分页合并。
- 路由测试：直接详情、列表进入详情、关闭恢复 URL、浏览器前进后退。
- 回归测试：现有 Daily Edit 和 Gallery 转场、隐藏卡片命中、键盘操作和 WebGL 降级继续通过。
- 每个迁移阶段运行测试、Oxlint、TypeScript 检查和生产构建。

## 迁移顺序

1. 建立领域模型、Repository 端口和应用层 query。
2. 将现有占位数据迁移到 local adapter，保持页面输出不变。
3. 将 Daily Edit、Gallery 和 Work Detail 拆入 feature，路由只负责组装。
4. 将数字作品 ID 迁移为稳定字符串，并增加 `/works/[id]` 路由。
5. 接入 History API，使列表转场与稳定详情 URL 共存。
6. 实现 HTTP client、运行时 decoder 和 HTTP repository。
7. 写入 Go API 契约文档及环境配置说明。
8. 更新 README，并完成全量回归验证。

每一步都必须保持应用可运行。迁移期间 local adapter 是唯一默认数据源；HTTP adapter 完成但不会在缺少 API 时自动启用。

## 本阶段不做

- 不实现 Go 服务、数据库、对象存储或定时任务。
- 不实现作品采集脚本、AI 评审 Skill 或 AI 助手。
- 不实现后台管理、登录、上传和人工审核。
- 不实现后端淘汰算法。
- 不改变视觉设计、作品详情排版或现有动画节奏。
- 不引入前端全局状态库、请求状态库或 OpenAPI 代码生成工具。

## 验收标准

- 页面不再直接依赖 `lib/projects.ts` 中的全局数组。
- Daily Edit、Gallery 和 Work Detail 通过同一 ContentRepository 边界读取数据。
- local 数据源下，现有视觉与交互保持一致。
- Gallery 具备游标分页和全库搜索接口语义。
- 每件作品拥有可直接访问的稳定详情 URL。
- HTTP adapter 能校验响应并统一处理错误，且未配置 API 时不会被误用。
- 数据结构明确区分摄影师陈述、编辑文案、AI 分析和授权信息。
- 现有测试与新增架构、路由、数据适配器测试全部通过。
