import { defineConfig } from 'vitepress'
// https://vitepress.dev/reference/site-config

// 1. 获取环境变量并判断
// 如果环境变量 EDGEONE 等于 '1'，说明在 EdgeOne 环境，使用根路径 '/'
// 否则默认是 GitHub Pages 环境，使用仓库子路径 '/easy-vecdb/'
const isEdgeOne = process.env.EDGEONE === '1'
const baseConfig = isEdgeOne ? '/' : '/hello-generic-agent/'

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
      { text: 'PDF版本下载', link: 'https://github.com/AspasZhang/hello-generic-agent/releases' },
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
          { text: '第1章：安装与环境配置', link: '/part1/chapter1/' },
          { text: '第2章：浏览器能力解锁', link: '/part1/chapter2/' },
          { text: '第6章：进阶玩法',
            items: [
              { text: '6.1 自主行动模式', link: '/part1/chapter6/advanced-usage#_6-1-自主行动模式-autonomous' },
              { text: '6.2 定时任务', link: '/part1/chapter6/advanced-usage#_6-2-定时任务-scheduled-task' },
              { text: '6.3 反射模式', link: '/part1/chapter6/advanced-usage#_6-3-反射模式-reflect' },
              { text: '6.4 子代理模式', link: '/part1/chapter6/advanced-usage#_6-4-子代理模式-subagent' },
              { text: '6.5 Plan 模式', link: '/part1/chapter6/advanced-usage#_6-5-plan-模式-复杂任务规划' }
            ]
          }
        ]
      },
      {
        text: 'Part 2：原理篇',
        items: [
          { text: '第7章：上下文信息密度', link: '/part2/chapter7/' },
          { text: '第8章：系统全貌', link: '/part2/chapter8/' },
          { text: '第9章：最小原子工具集', link: '/part2/chapter9/' },
          { text: '第10章：分层记忆架构', link: '/part2/chapter10/' },
          { text: '第11章：上下文截断与压缩', link: '/part2/chapter11/' },
          { text: '第12章：自我进化', link: '/part2/chapter12/' },
          { text: '第13章：涌现能力', link: '/part2/chapter13/' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/AspasZhang/hello-generic-agent' }
    ],

    editLink: {
      pattern: 'https://github.com/AspasZhang/hello-generic-agent/blob/main/docs/:path'
    },

    footer: {
      message: '<a href="https://beian.miit.gov.cn/" target="_blank">京ICP备2026002630号-1</a> | <a href="https://beian.mps.gov.cn/#/query/webSearch?code=11010602202215" rel="noreferrer" target="_blank">京公网安备11010602202215号</a>',
      copyright: '本作品采用 <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议（CC BY-NC-SA 4.0）</a> 进行许可'
    }
  }
})
