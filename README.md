# Immersive Photo Gallery

一个以摄影作品为核心的沉浸式 Web 画廊。项目包含编辑式推荐首页和可交互的 WebGL 作品墙，并针对触摸设备、键盘操作、减少动态效果偏好以及 WebGL 不可用的情况提供适配。

## 页面与体验

### Daily Edit（`/`）

- 从作品库中选取前 12 件作品，组成四列编辑式推荐网格
- 点击作品后，以 GSAP 多阶段转场进入全屏详情
- 详情关闭后恢复原卡片位置与键盘焦点
- 桌面端使用宽松的首屏排版，900px 以下切换为双列紧凑布局
- 系统开启“减少动态效果”时自动使用简化转场

### Gallery（`/gallery`）

- 使用 Three.js 生成可循环浏览的 WebGL 作品墙
- 支持 3D 空间视角与无径向畸变的 Flat 视角
- 支持鼠标拖拽、触摸、滚轮、方向键和 `Home` 键
- 包含惯性移动、循环排列、作品悬停反馈和自定义后处理 Shader
- 小屏幕、减少动态效果偏好或 WebGL 初始化失败时自动切换到 Flat 模式

## 技术栈

- **界面框架：** React 19、TypeScript、Next.js App Router 兼容 API
- **开发与构建：** Vinext、Vite
- **3D 渲染：** Three.js、WebGL、Effect Composer、自定义 Shader
- **动效：** GSAP
- **样式与组件：** Tailwind CSS 4、shadcn、Base UI、Lucide React
- **运行环境：** Cloudflare Workers、Wrangler、OpenAI Sites
- **工程工具：** Node.js Test Runner、Oxlint、Oxfmt

内容层已经与展示层解耦：开发时默认从本地 TypeScript 种子数据读取；设置 HTTP 数据源后，由同源 `/api/content/*` 路由转发到 Go 内容 API。浏览器不会直接请求后端 API。

开源展示默认使用仓库内的离线快照；它基于 2026-09-12 的已发布后端作品，包含 20 张展示图以及原始署名和许可链接。页面不提供访客可见的数据源开关，避免演示数据与实时数据混用。

## 本地开发

### 环境要求

- Node.js 22.13 或更高版本
- npm 10 或更高版本

### 安装与启动

```sh
npm install
npm run dev
```

开发服务默认运行在 [http://localhost:3000](http://localhost:3000)：

- 推荐首页：`http://localhost:3000/`
- WebGL 画廊：`http://localhost:3000/gallery`

## 常用命令

```sh
# 启动开发服务
npm run dev

# 运行单元测试
npm test

# 检查应用与业务代码
npx oxlint app application domain features infrastructure lib

# TypeScript 类型检查
npx tsc --noEmit

# 生成 Cloudflare Workers 构建产物
npm run build

# 在本地运行构建产物
npm run start

# 格式化项目
npm run format
```

## 项目结构

```text
app/
├── api/content/            # 同源内容 API：gallery、works、daily-edits
├── page.tsx                # Daily Edit 路由
├── gallery/page.tsx        # 3D / Flat Gallery 路由
├── works/[id]/page.tsx     # 可分享的作品详情路由
└── globals.css             # 全局样式与响应式布局

domain/                     # 作品与每日精选的稳定领域模型
application/                # 查询用例、仓储端口与统一错误响应
infrastructure/             # local/http 仓储、配置、同源内容客户端
features/                   # daily-edit、gallery、work-detail 的界面实现
lib/                        # 纯函数、状态与回归测试

public/art/                  # 本地摄影作品素材
.openai/hosting.json        # OpenAI Sites 能力声明
vite.config.ts              # Vinext、Vite、Sites 与 Cloudflare 配置
```

## 添加或更新作品

本地展示的作品快照位于 `infrastructure/local/fixtures.ts`，图片位于 `public/art/demo/`。新增或替换展示内容时，应同时更新两者；生产环境则由 Go API 写入并返回这些数据，而不是由页面直接读取静态数据。

作品数据结构：

```ts
type WorkDetail = {
  id: string;
  title: string;
  photographerName: string;
  publishedAt: string;
  category: string;
  thumbnail: ImageAsset;
  image: ImageAsset;
  attribution: { sourceUrl: string; licenseName: string; creditLine: string };
  artistStatement?: string;
  editorialNote?: string;
  aiAnalysis?: { content: string; generatedAt: string; model: string; version: string };
};
```

摄影师原话、编辑部文案、AI 分析必须分别存储；来源、署名与许可信息为每件作品的必填元数据。Daily Edit 由内容仓储按日期返回固定 12 件，不由页面以数组切片生成。

## 内容源与 Go API

复制 `.env.example` 为本地环境文件后，默认使用 `CONTENT_SOURCE=local`，无需运行数据库或 Go 服务。这个变量是内部数据源开关：维护者把它改为 `http` 并配置 `CONTENT_API_BASE_URL` 后，重启前端服务即可切回 Go 内容 API；改回 `local` 则恢复离线展示快照。浏览器依旧只请求同源路由，后端地址不会暴露给客户端。

首页 `SOUND ON` 旁的状态点仅用于运维观察：黑点表示 HTTP 后端已连接，红点表示已配置 HTTP 但后端未就绪；`local` 纯前端展示模式不显示状态点，也不提供访客可操作的数据源按钮。

Go 服务需要实现以下 JSON 信封接口（所有成功响应为 `{ "data": ... }`，错误响应为 `{ "error": { "code", "message", "requestId" } }`）：

- `GET /v1/works?cursor=&limit=&query=`：游标分页的作品摘要；当前 Go API 以 `nextCursor` 是否存在表示是否还有下一页，HTTP 适配器会补齐 `hasMore`。
- `GET /v1/works/:id`：单件完整 `WorkDetail`。
- `GET /v1/recommendations/:date`：指定日期的固定精选；HTTP 适配器会将其 `items` 映射为 Daily Edit。

接口字段与解码规则见 `docs/api/content-api.md`。画廊客户端以 48 张 Three.js 卡片为固定池，靠近已加载末尾时预取下一页；后端负责游标、搜索、每日精选和最多 1000 件作品的淘汰策略。

## 验证

提交修改前建议依次运行：

```sh
npm test
npx oxlint app application domain features infrastructure lib
npx tsc --noEmit
npm run build
```

测试覆盖内容契约、本地与 HTTP 仓储、API 响应、Daily Edit、画廊分页与固定卡片池，以及既有详情转场、拖拽和布局约束。

## 构建与运行

`npm run build` 通过 Vinext 和 Vite 生成 Cloudflare Workers 兼容产物。构建完成后，可使用 `npm run start` 通过 Wrangler 在本地运行生产版本。

项目包含 OpenAI Sites 配置，但当前未启用 D1 数据库或 R2 对象存储。

## 素材与许可

`public/art/demo/` 包含已发布内容的离线展示快照。每件作品的作者、来源和许可证已在 `infrastructure/local/fixtures.ts` 中保留；其中包含 CC0 及 CC BY-SA 素材。再次发布、替换或扩充快照前，请核验各作品来源页的最新授权条件。

后续新增演示素材时，应使用以下任一种：

- 自有摄影作品
- 公共领域素材
- 已获得明确展示与再分发授权的作品

新增作品时应同时记录摄影师、作品标题、发布日期、分类、来源和授权信息。仓库目前未提供正式 `LICENSE` 文件；确定开源方式后，应补充代码许可并分别说明摄影素材的授权范围。
