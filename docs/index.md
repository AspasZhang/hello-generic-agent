---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Datawhale开源教程"
  text: "AI前沿知识开源教程"
  tagline: 开始学起来吧~
  image:
    src: /learning.GIF
    alt: Datawhale开源教程
  actions:
    - theme: brand
      text: 开始学习
      link: /part1/chapter1/

features:
  - title: 💥 前沿
    details: 紧跟技术发展输出最前沿的知识
  - title: 🎁 免费
    details: 无任何形式的收费
  - title: 🌐 开源
    details: 教程和代码源文件全部托管在GitHub
---
<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/Sm1les.png',
    name: 'Sm1les',
    title: '项目负责人',
    links: [
      { icon: 'github', link: 'https://github.com/Sm1les' },
    ]
  },
  {
    avatar: 'https://www.github.com/Sm1les.png',
    name: '马里奥',
    title: '核心贡献者',
    links: [
      { icon: 'github', link: 'https://github.com/Sm1les' },
    ]
  }
]
</script>


<h2 align="center">Team</h2>
<VPTeamMembers size="small" :members />