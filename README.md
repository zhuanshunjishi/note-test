# 钢镚 L1 SDK 开发文档

适用于钢镚 L1、L1-W、L1 EDU 和 L1-W EDU，涵盖设备操作、SDK 开发、硬件扩展及接口参考。

- [阅读在线文档](https://zhuanshunjishi.github.io/note-test/)
- [浏览仓库中的文档目录](./index.md)

## 本地预览

安装 Node.js 22 后，在仓库根目录运行：

```sh
npm ci
npm run docs:dev
```

按终端显示的地址打开文档。用 `npm run docs:build` 检查正式构建，用 `npm run docs:preview` 查看构建结果。

## 发布到 GitHub Pages

首次发布时，在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。之后推送到 `main` 会自动构建并发布，也可以在 **Actions** 中手动运行「发布文档到 GitHub Pages」。
