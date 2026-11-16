import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '铜锤 M1 开发者文档',
  description: '铜锤 M1 系列的设备使用、SDK 开发和接口参考',
  base: '/note-test/m1/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'GitHub', link: 'https://github.com/zhuanshunjishi/note-test' },
    ],
    sidebar: [
      {
        text: '产品与设备',
        items: [
          { text: '产品介绍与规格', link: '/md/01-M1产品介绍与规格' },
          { text: '设备使用与维护', link: '/md/02-M1设备使用与维护' },
          { text: '系统组成与硬件接口', link: '/md/03-M1系统组成与硬件接口' },
        ],
      },
      {
        text: 'SDK 开发',
        items: [
          { text: '快速开始', link: '/md/04-M1SDK快速开始' },
          { text: '控制流程与任务机制', link: '/md/05-M1SDK控制流程与任务机制' },
          { text: '接口参考', link: '/md/06-M1SDK接口参考' },
          { text: '回调、数据类型与状态参考', link: '/md/07-M1回调数据类型与状态参考' },
          { text: '示例程序与故障排查', link: '/md/08-M1示例程序与故障排查' },
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
