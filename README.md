# Immersive Photo Gallery

一个以摄影作品为核心的沉浸式前端画廊，包含编辑式推荐首页、可交互的 Three.js WebGL 作品墙和独立作品详情页。

项目重点放在视觉呈现、交互性能和内容层解耦：默认使用仓库内的本地快照运行，也可以在正式环境通过同源内容接口接入私有后端。后端服务、数据库和运营数据不包含在本仓库中。

## 功能概览

### Daily Edit（`/`）

- 以编辑式推荐网格呈现每日精选作品
- 使用 GSAP 完成作品到详情页的多阶段转场
- 关闭详情后恢复原卡片位置与键盘焦点
- 支持背景音乐、减少动态效果偏好和响应式布局

### Gallery（`/gallery`）

- 使用 Three.js 构建可循环浏览的 WebGL 作品墙
- 支持 3D 空间视角和 Flat 视角
- 支持鼠标拖拽、触摸、滚轮、方向键和 `Home` 键
- 使用固定卡片池、纹理复用和分页预取控制 CPU 与 GPU 开销
- 在 WebGL 不可用、设备性能受限或用户减少动态效果时降级到 Flat 模式

### Work Detail（`/works/:id`）

- 展示作品标题、摄影师、创作说明、编辑文案和来源信息
- 展示图片解读与 AI 生成提示词（如果内容存在）
- 保留作者、来源和许可证链接
- 支持直接访问和分享详情路由

## 技术栈

- **界面：** React 19、TypeScript、Next.js App Router 兼容 API
- **3D 与图形：** Three.js、WebGL、Effect Composer、GLSL Shader
- **动效：** GSAP、CSS Animation
- **样式与组件：** Tailwind CSS 4、Base UI、Lucide React
- **构建与部署：** Vinext、Vite、Cloudflare Workers、GitHub Pages
- **工程工具：** Node.js Test Runner、Oxlint、Oxfmt

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

默认使用本地作品快照，不需要启动数据库、Go 服务或配置 API Key。

## 常用命令

```sh
# 启动开发服务
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit

# 生成生产构建产物
npm run build

# 本地运行构建产物
npm run start

# 格式化项目
npm run format
```

## 内容架构

前端内容层与展示层通过仓储接口解耦，包含两种内容模式：

- `local`：从 `infrastructure/local/fixtures.ts` 读取本地快照，适合开发、开源协作和静态演示。
- `http`：通过同源 `/api/content/*` 路由接入私有实时内容服务，适合正式环境。

本地模式的图片位于 `public/art/demo/`。如需切换到实时后端，请复制 `.env.example` 为 `.env` 并配置：

```dotenv
CONTENT_SOURCE=http
CONTENT_API_BASE_URL=https://your-api.example.com
CONTENT_API_TIMEOUT_MS=8000
```

真实环境请只在部署平台配置后端地址，不要把 `.env`、API Key 或数据库连接串提交到公开仓库。浏览器通过同源路由请求内容，后端地址不会直接暴露给访客。

接口字段和响应约定见 [`docs/api/content-api.md`](docs/api/content-api.md)。

## GitHub Pages 部署

仓库包含 [`Deploy GitHub Pages`](.github/workflows/deploy-github-pages.yml) 工作流。推送到 `main` 后，GitHub Actions 会使用 `local` 内容模式构建静态前端并发布；该流程不需要后端服务、数据库或部署密钥。

GitHub Pages 版本只用于公开展示当前快照。正式环境仍可使用 `http` 内容模式接入私有后端，两种模式互不影响。

## 项目结构

```text
app/                         # 页面路由、错误页与同源内容路由
domain/                      # 作品与每日精选领域模型
application/                 # 查询用例、仓储端口与错误响应
infrastructure/              # local/http 内容适配器
features/                    # 首页、画廊、作品详情功能
shared/                      # 公共路径与展示工具
public/art/demo/             # 离线展示图片
public/audio/                # 背景音乐
docs/api/                    # 前后端内容接口契约
.github/workflows/           # GitHub Pages 部署工作流
```

## 添加或更新作品

本地展示内容需要同时更新：

1. 在 `infrastructure/local/fixtures.ts` 中添加或修改作品数据。
2. 在 `public/art/demo/` 中添加对应图片资源。
3. 为每件作品填写作者、标题、发布日期、分类、来源和许可证信息。
4. 确认图片和音频拥有展示及再分发权限。
5. 运行测试、Lint、类型检查和构建。

正式环境的实时内容由私有后端提供，不应通过修改页面组件直接写入。

## 开源贡献

欢迎通过 Pull Request 改进界面、交互、性能、无障碍体验、移动端适配和内容展示。

1. Fork 仓库，并从 `main` 创建功能分支。
2. 复制 `.env.example` 为 `.env`，默认使用 `CONTENT_SOURCE=local`。
3. 完成修改后运行：

   ```sh
   npm test
   npm run lint
   npx tsc --noEmit
   npm run build
   ```

4. 在 Pull Request 中说明改动范围、验证结果和可能涉及的素材授权问题。
5. 不要提交 `.env`、API Key、数据库连接串或没有明确再分发授权的素材。

如果改动涉及实时内容接口，请保持 [`docs/api/content-api.md`](docs/api/content-api.md) 中的契约兼容。后端业务实现和后端仓库不属于本开源项目的提交范围。

## 素材与许可证

- 前端源代码与文档以 [MIT License](LICENSE) 发布。
- 摄影作品的作者、来源和许可证保存在 `infrastructure/local/fixtures.ts`，并会在作品详情中显示。
- 第三方木琴代码、模型和音频声明见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。
- `public/audio/memories-in-soft-light.mp3` 为项目随附 BGM，重新发布或用于其他项目时，请确认其再分发授权。
- MIT License 不自动授予摄影作品、BGM 或第三方资源的使用权；新增素材前请确认拥有展示和再分发权限。

本仓库只开源前端实现。正式环境的 Go 内容 API、数据库、入库审核与运营数据属于独立的私有后端系统，不随本仓库发布。
