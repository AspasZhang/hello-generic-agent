import { defineConfig } from 'vitepress'
// https://vitepress.dev/reference/site-config

// 1. 获取环境变量并判断
// 如果环境变量 EDGEONE 等于 '1'，说明在 EdgeOne 环境，使用根路径 '/'
// 否则默认是 GitHub Pages 环境，使用仓库子路径 '/easy-vecdb/'
const isEdgeOne = process.env.EDGEONE === '1'
const baseConfig = isEdgeOne ? '/' : '/repo-template/'

export default defineConfig({
  lang: 'zh-CN',
  title: "Datawhale开源教程",
  description: "AI前沿知识开源教程",
  base: baseConfig,
  markdown: {
    math: true
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/datawhale-logo.png',
    nav: [
      { text: 'PDF版本下载', link: 'https://github.com/datawhalechina/repo-template/releases' },
    ],
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },
    sidebar: [
      {
        text: 'Part 1：应用篇',
        items: [
          { text: '第1章：第1章的标题', link: '/part1/chapter1/' },
          { text: '第2章：第2章的标题', 
            items: [
              { text: '第2.1节：第2.1节的标题', link: '/part1/chapter2/chapter2_1' },
              { text: '第2.2节：第2.2节的标题', link: '/part1/chapter2/chapter2_2' }
            ]
           },
          { text: '第7章：进阶玩法',
            items: [
              { text: '7.1 自主行动模式', link: '/part1/chapter7/advanced-usage#_7-1-自主行动模式-autonomous' },
              { text: '7.2 定时任务', link: '/part1/chapter7/advanced-usage#_7-2-定时任务' },
              { text: '7.3 反射模式', link: '/part1/chapter7/advanced-usage#_7-3-反射模式' },
              { text: '7.4 子代理', link: '/part1/chapter7/advanced-usage#_7-4-子代理' },
              { text: '7.5 Plan 模式', link: '/part1/chapter7/advanced-usage#_7-5-plan-模式' },
              { text: '7.6 多模型切换', link: '/part1/chapter7/advanced-usage#_7-6-多模型切换' }
            ]
          }
        ]
      },
      {
        text: 'Part 2：原理篇',
        items: [
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/datawhalechina/repo-template' }
    ],

    editLink: {
      pattern: 'https://github.com/datawhalechina/repo-template/blob/main/docs/:path'
    },

    footer: {
      message: '<a href="https://beian.miit.gov.cn/" target="_blank">京ICP备2026002630号-1</a> | <a href="https://beian.mps.gov.cn/#/query/webSearch?code=11010602202215" rel="noreferrer" target="_blank">京公网安备11010602202215号</a>',
      copyright: '本作品采用 <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议（CC BY-NC-SA 4.0）</a> 进行许可'
    }
  }
})
