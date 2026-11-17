# L1 与 M1 开发文档

| 产品 | 仓库中的文档 | GitHub Pages |
| --- | --- | --- |
| 钢镚 L1 系列 | [L1 文档首页](./l1/index.md) | [打开 L1 文档站](https://zhuanshunjishi.github.io/note-test/l1/) |
| 铜锤 M1 系列 | [M1 文档首页](./m1/index.md) | [打开 M1 文档站](https://zhuanshunjishi.github.io/note-test/m1/) |

L1 和 M1 文档分别位于 `l1/` 和 `m1/`。两个文档站各自构建，共用一个 GitHub Pages 发布流程。[仓库站点首页](https://zhuanshunjishi.github.io/note-test/)提供两个入口。

产品原图放在 `photos/`，首页使用的压缩图片放在 `pages/assets/`。

## 本地预览

安装 Node.js 22 后，在仓库根目录运行一次 `npm ci`。启动所需的文档站，按终端显示的地址打开。

| 产品 | 开发预览 | 正式构建 |
| --- | --- | --- |
| L1 | `npm run docs:dev` | `npm run docs:build` |
| M1 | `npm run docs:m1:dev` | `npm run docs:m1:build` |

## 发布到 GitHub Pages

首次发布时，在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。推送到 `main` 后，工作流会构建两个文档站并一起发布。也可以在 **Actions** 中手动运行「发布文档到 GitHub Pages」。
