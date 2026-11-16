import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '钢镚 L1 SDK 开发文档',
  description: '钢镚 L1 系列的使用指南、SDK 开发说明和接口参考',
  base: '/note-test/',
  srcExclude: ['README.md'],
  async buildEnd({ srcDir, outDir }) {
    // 保留直接下载和点击产品图时使用的原文件路径。
    await Promise.all(
      ['downloads', 'images/products'].map((directory) =>
        cp(join(srcDir, 'assets', directory), join(outDir, 'assets', directory), {
          recursive: true,
        }),
      ),
    )
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'GitHub', link: 'https://github.com/zhuanshunjishi/note-test' },
    ],
    sidebar: [
      {
        text: '产品与配件',
        items: [
          { text: '产品规格对比', link: '/md/01-产品规格对比' },
          { text: '配件列表', link: '/md/02-配件列表' },
        ],
      },
      {
        text: '上手与操作',
        items: [
          { text: '设备操作、遥控器与 App', link: '/md/05-设备操作、遥控器与App使用说明' },
        ],
      },
      {
        text: 'SDK 开发',
        items: [
          { text: '硬件、软件与结构架构', link: '/md/03-硬件、软件与结构架构' },
          { text: 'SDK 开发与运行指南', link: '/md/08-SDK开发与运行指南' },
          { text: '官方示例使用说明', link: '/md/09-官方示例使用说明' },
          { text: '本体相机视频流', link: '/md/07-本体相机视频流' },
        ],
      },
      {
        text: '接口参考',
        items: [
          { text: '二次开发硬件接口', link: '/md/04-二次开发硬件接口说明' },
          {
            text: 'SDK 软件服务接口',
            link: '/md/06-SDK软件服务接口',
            collapsed: false,
            items: [
              { text: '控制指令', link: '/md/06-01-控制指令接口' },
              { text: '传感器实时上报', link: '/md/06-02-传感器实时上报接口' },
              { text: '心跳检测', link: '/md/06-03-心跳检测接口' },
              { text: 'WiFi 热点配置', link: '/md/06-04-WiFi热点配置接口' },
              { text: '故障信息查询', link: '/md/06-05-故障信息查询接口' },
            ],
          },
        ],
      },
    ],
    outline: { label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    sidebarMenuLabel: '文档目录',
    returnToTopLabel: '返回顶部',
    darkModeSwitchLabel: '外观',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '未找到相关内容',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
  },
})
