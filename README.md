# Immersive Photo Gallery

一个以摄影作品为核心的沉浸式前端画廊。它用简约的编辑式界面呈现摄影作品，同时加入 Three.js WebGL 作品墙、GSAP 转场、AI 图像解读与提示词展示，让浏览图片更像一次完整的视觉体验。

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-111111?style=flat-square)](https://dancingcircles.github.io/immersive-photo-gallery/)
[![License](https://img.shields.io/badge/license-MIT-111111?style=flat-square)](LICENSE)

**在线演示：** [dancingcircles.github.io/immersive-photo-gallery](https://dancingcircles.github.io/immersive-photo-gallery/)

**源码仓库：** [github.com/DancingCircles/immersive-photo-gallery](https://github.com/DancingCircles/immersive-photo-gallery)

`Photography` · `Creative Coding` · `WebGL` · `Three.js` · `GSAP` · `CSS Animation` · `React` · `TypeScript` · `Awwwards-inspired`

> 这是一个前端开源展示仓库。GitHub Pages 使用仓库内的 20 张作品快照离线运行，不需要数据库或后端服务；私有后端仅用于正式环境的实时内容接入，不包含在本仓库中。

## 页面体验

### Daily Edit · `/`

- 以编辑式推荐首页呈现 12 件摄影作品
- 点击作品后，通过 GSAP 多阶段转场进入详情
- 详情关闭后恢复原卡片位置与键盘焦点
- 背景音乐 `Memories in Soft Light` 默认静音，用户点击后播放
- 支持减少动态效果偏好与小屏幕布局

### Gallery · `/gallery`

- 使用 Three.js 构建可循环浏览的 WebGL 作品墙
- 支持 3D 空间视角与无径向畸变的 Flat 视角
- 支持鼠标拖拽、触摸、滚轮、方向键和 `Home` 键
- 使用惯性移动、循环排列、自定义 Shader 和作品悬停反馈
- WebGL 不可用或设备性能受限时自动切换到 Flat 模式

### Work Detail · `/works/:id`

- 展示摄影师、作品标题、创作说明与来源信息
- 展示图片解读和 AI 生成提示词
- 每件作品保留作者、来源与许可证链接
- 详情页支持直接访问和分享

## 技术关键词

- **界面：** React 19、TypeScript、Tailwind CSS 4、Base UI、Lucide React
- **视觉：** Three.js、WebGL、Effect Composer、GLSL Shader
- **动效：** GSAP、CSS Animation、View Transition 风格转场
- **构建：** Vinext、Vite、Cloudflare Workers 兼容产物
- **工程：** Node.js Test Runner、Oxlint、Oxfmt
- **部署：** GitHub Pages（静态展示）、Cloudflare Workers / Sites（正式环境）

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

## 内容模式

前端内容层与展示层已经解耦，默认从 `infrastructure/local/fixtures.ts` 读取离线快照，图片位于 `public/art/demo/`。如果需要接入私有实时后端，可以复制 `.env.example` 为 `.env`，再配置：

```dotenv
CONTENT_SOURCE=http
CONTENT_API_BASE_URL=https://your-api.example.com
CONTENT_API_TIMEOUT_MS=8000
```

真实环境请只在部署平台配置后端地址，不要把 `.env`、API Key 或数据库连接串提交到公开仓库。浏览器通过同源路由请求内容，后端地址不会直接暴露给访客。

接口契约见 [`docs/api/content-api.md`](docs/api/content-api.md)。前端的本地展示模式与正式 HTTP 模式可以独立运行，GitHub Pages 只启用前者。

## GitHub Pages 在线展示

仓库已配置 [`Deploy GitHub Pages`](.github/workflows/deploy-github-pages.yml) 工作流。每次推送到 `main` 后，GitHub Actions 会自动构建静态展示版并发布到：

**[打开在线演示 →](https://dancingcircles.github.io/immersive-photo-gallery/)**

GitHub Pages 是静态托管服务，因此这个地址展示的是当前仓库的前端快照，不会暴露或依赖私有后端。GitHub 仓库中的 README、顶部 Live Demo 按钮和上面的文字链接都可以直接跳转到在线站点。

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

## 开源贡献

欢迎通过 Pull Request 改进界面、交互、性能、无障碍体验、移动端适配和内容展示。

1. Fork 仓库，并从 `main` 创建功能分支。
2. 复制 `.env.example` 为 `.env`，默认使用 `CONTENT_SOURCE=local`。
3. 完成修改后运行测试、Lint、类型检查和构建。
4. 在 Pull Request 中说明改动范围与验证结果。
5. 不要提交 `.env`、API Key、数据库连接串或没有明确再分发授权的素材。

如果改动涉及实时内容接口，请保持 [`docs/api/content-api.md`](docs/api/content-api.md) 中的契约兼容；后端业务实现和后端仓库不属于本开源项目的提交范围。

## 素材与许可

- 前端源代码与文档以 [MIT License](LICENSE) 发布。
- 摄影作品的作者、来源和许可证保存在 `infrastructure/local/fixtures.ts`，并会在作品详情中显示。
- 第三方木琴代码、模型和音频声明见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。
- `public/audio/memories-in-soft-light.mp3` 为项目随附 BGM，重新发布或用于其他项目时，请确认其再分发授权。
- MIT License 不自动授予摄影作品、BGM 或第三方资源的使用权；新增素材前请确认拥有展示和再分发权限。

## 许可边界

本仓库只开源前端实现。在线演示使用仓库内的静态快照；正式环境的 Go 内容 API、数据库、入库审核与运营数据属于独立的私有后端系统，不随本仓库发布。
