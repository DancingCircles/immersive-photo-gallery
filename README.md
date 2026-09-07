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

项目目前使用本地 TypeScript 数据和静态图片，不依赖数据库、对象存储、登录系统或外部 API。

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
npx oxlint app lib

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
├── page.tsx                 # 推荐首页路由
├── featured-home.tsx       # 推荐页状态、交互与 GSAP 转场
├── featured-card.tsx       # 推荐作品卡片
├── featured-detail.tsx     # 全屏作品详情
├── gallery/page.tsx        # 3D / Flat 画廊路由
├── scene.tsx               # Three.js 场景与交互
└── globals.css             # 全局样式与响应式布局

lib/
├── projects.ts             # 全部作品数据
├── featured.ts             # 首页推荐作品映射
├── featured-state.ts       # 推荐页状态机
├── repeating-transition.ts # 首页转场路径与节奏计算
├── projection.ts           # 画廊投影与畸变参数
├── interaction.ts          # 拖拽交互计算
└── *.test.ts               # 单元与回归测试

public/art/                  # 本地摄影作品素材
.openai/hosting.json        # OpenAI Sites 能力声明
vite.config.ts              # Vinext、Vite、Sites 与 Cloudflare 配置
```

## 添加或更新作品

1. 将已获授权的图片放入 `public/art/`。
2. 在 `lib/projects.ts` 中添加或修改作品信息。
3. 启动开发服务，检查推荐首页和 WebGL 画廊中的显示效果。
4. 运行测试、类型检查和构建。

作品数据结构：

```ts
type Project = {
  id: number;
  title: string;
  photographer: string;
  publishedAt: string;
  category: string;
  image: string;
};
```

推荐首页当前由 `lib/featured.ts` 选取作品库中的前 12 项，不会根据日期自动轮换。两种展示模式共用 `lib/projects.ts`，因此作品只需维护一份数据。

## 验证

提交修改前建议依次运行：

```sh
npm test
npx oxlint app lib
npx tsc --noEmit
npm run build
```

测试主要覆盖推荐作品映射、详情转场状态、重复影像路径、拖拽阈值、画廊投影以及响应式布局约束。

## 构建与运行

`npm run build` 通过 Vinext 和 Vite 生成 Cloudflare Workers 兼容产物。构建完成后，可使用 `npm run start` 通过 Wrangler 在本地运行生产版本。

项目包含 OpenAI Sites 配置，但当前未启用 D1 数据库或 R2 对象存储。

## 素材与许可

`public/art/` 当前包含私有开发阶段的占位素材，不应视为可再分发内容。公开仓库或发布正式版本前，请将其替换为以下任一种素材：

- 自有摄影作品
- 公共领域素材
- 已获得明确展示与再分发授权的作品

新增作品时应同时记录摄影师、作品标题、发布日期、分类、来源和授权信息。仓库目前未提供正式 `LICENSE` 文件；确定开源方式后，应补充代码许可并分别说明摄影素材的授权范围。
