# Immersive Photo Gallery

一个面向摄影师与摄影作品的沉浸式 WebGL 画廊。访客可以在球幕内部的 3D 视角中浏览作品，也可以切换到无畸变的平铺视角。

## 功能

- 每日推荐首页：12 件作品沿球幕内壁排列，上下拖拽、惯性与循环浏览
- Bertoia 金属网椅、展厅灯光与地面阴影
- 3D 球幕内部视角与 Flat 平铺视角无缝切换
- 鼠标、触摸、滚轮与键盘浏览
- 惯性移动和循环排列
- 作品悬停反馈
- 黑夜与白天主题切换
- 小屏幕、减少动态效果偏好以及 WebGL 异常时自动使用平铺模式

## 本地运行

需要 Node.js 22.13 或更新版本。

```sh
npm install
npm run dev
```

默认访问地址为 http://localhost:3000/ 。

首页位于 `/`，原有球幕画廊位于 `/gallery`。首页推荐列表由 `lib/daily.ts` 管理，目前选取前 12 件作品，不会自动按日期更换。

## 添加摄影作品

1. 将已获授权的图片放入 `public/art/`。
2. 在 `lib/projects.ts` 中添加作品标题、摄影师、发布日期、分类和图片路径。
3. 使用 `npm run dev` 预览；画廊会自动复用数据并生成循环作品墙。

单项数据示例：

```ts
{
  id: 0,
  title: 'Untitled 01',
  photographer: 'Photographer 01',
  publishedAt: '2026-01-01',
  category: 'portrait',
  image: '/art/0.png',
}
```

## 验证

```sh
npm test
npx oxlint app lib
npx tsc --noEmit
npm run build
```

## 贡献与素材许可

欢迎通过 Issue 或 Pull Request 推荐摄影师、提交功能改进。收录作品时应同时提供作者信息、作品标题及明确的展示授权。

当前 `public/art/` 仅含私有开发阶段的占位素材，不应视为可再分发内容。仓库公开前请替换为自有、公共领域或已取得明确授权的作品，并根据计划采用的开放方式补充正式 `LICENSE` 文件。

首页椅子模型由 DELTAHEDRA 制作，采用 CC BY 4.0，来源与署名见 `public/models/ATTRIBUTION.txt`；再分发时请保留署名。模型许可与摄影作品许可相互独立。
