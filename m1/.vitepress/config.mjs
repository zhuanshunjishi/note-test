import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '智身钢镚M1 SDK 开发文档',
  description: '铜锤 M1 系列的设备使用、SDK 开发和接口参考',
  base: '/note-test/m1/',
  async buildEnd({ srcDir, outDir }) {
    await cp(join(srcDir, 'assets', 'downloads'), join(outDir, 'assets', 'downloads'), {
      recursive: true,
    })
  },
  themeConfig: {
    nav: [
      { component: 'M1DocsVersion', props: { docsVersion: 'V0.1', sdkVersion: '0.2.3' } },
      { text: '首页', link: '/' },
      { text: 'GitHub', link: 'https://github.com/zhuanshunjishi/note-test' },
    ],
    sidebar: [
      {
        text: '产品与设备',
        items: [
          { text: '产品介绍与规格', link: '/md/01-product-introduction-and-specifications' },
          { text: '设备使用与维护', link: '/md/02-operation-and-maintenance' },
          { text: '系统组成、硬件接口与结构设计资料', link: '/md/03-system-components-and-hardware-interfaces' },
        ],
      },
      {
        text: 'SDK 开发',
        items: [
          { text: 'M1 系统与 SDK 版本兼容性', link: '/md/sdk-version-compatibility' },
          { text: '快速开始', link: '/md/04-sdk-quickstart' },
          {
            text: '数据读取',
            items: [
              { text: '视频流读取', link: '/md/video-stream-reading' },
            ],
          },
          { text: '控制流程与任务机制', link: '/md/05-sdk-control-flow-and-task-handling' },
          {
            text: '接口参考',
            link: '/md/06-sdk-api-reference',
            collapsed: false,
            items: [
              { text: '连接与设备信息', link: '/md/06-01-connection-and-device-info' },
              { text: '机器人控制', link: '/md/06-02-robot-control' },
              { text: '数据上报', link: '/md/06-03-data-reporting' },
              { text: '充电桩与任务', link: '/md/06-04-dock-and-tasks' },
              { text: '外设与相机', link: '/md/06-05-peripherals-and-camera' },
            ],
          },
          { text: '回调、数据类型与状态参考', link: '/md/07-callbacks-data-types-and-status-reference' },
          { text: '示例程序与故障排查', link: '/md/08-examples-and-troubleshooting' },
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
