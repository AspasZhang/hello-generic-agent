<div align="center">

<img src="docs/public/hello-generic-agent.png" alt="Hello Generic Agent" width="70%">

<p><em>多年以后，当你的 Agent 只用两千个 token 就完成了别人两万个 token 才能启动的任务，<br>你会回想起第一次点开这个教程部署 GA 的那个午后。</em></p>

# Hello Generic Agent（🧪 Beta公测版）

<p><em>从安装到原理，全面掌握以"上下文信息密度最大化"为核心的 Generic Agent</em></p>

<p>📌 <a href="https://github.com/lsdefine/GenericAgent"><strong>Generic Agent 主仓库</strong></a> · 如果 GA 有帮助到你，别忘了给 GA 点一个 Star ⭐</p>

<img src="https://img.shields.io/github/stars/datawhalechina/hello-generic-agent?style=flat&logo=github" alt="GitHub stars"/>
<img src="https://img.shields.io/github/forks/datawhalechina/hello-generic-agent?style=flat&logo=github" alt="GitHub forks"/>
<img src="https://img.shields.io/badge/language-Chinese-brightgreen?style=flat" alt="Language"/>
<a href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img src="https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-lightgrey" alt="License"/></a>
<a href="https://datawhalechina.github.io/hello-generic-agent/"><img src="https://img.shields.io/badge/在线阅读-Online%20Reading-green?style=flat&logo=gitbook" alt="Online Reading"></a>

</div>

---

> [!WARNING]
> 🧪 Beta公测版本提示：教程主体已完成，正在优化细节，欢迎大家提Issue反馈问题或建议。

## 🎯 项目介绍

&emsp;&emsp;本项目是 Generic Agent（GA）的入门教程，从零开始带你掌握这款以"上下文信息密度最大化"为核心原则的通用智能体。教程分为三大部分：**应用指南**帮助你快速上手 GA 的安装、配置与日常使用；**原理篇**深入剖析 GA 的架构设计与关键技术，包括最小原子工具集、分层记忆体系、上下文压缩策略和自我进化机制；**案例篇**通过实战场景带你将所学融会贯通。让你不仅会用，更能理解其背后的设计哲学。

### ✨ 你将收获什么？

- 🔍 **理解核心原理** 深入理解 GA 的上下文信息密度最大化设计哲学
- 🏗️ **亲手实践** 从安装配置到浏览器自动化、聊天平台集成，全流程上手
- 🧠 **掌握记忆与进化** 四层记忆架构、技能蒸馏、自我进化机制
- ⚙️ **高级技能** Reflect 模式、子智能体、Plan 模式等进阶玩法
- 🚀 **实战案例** 办公、娱乐、挖宝等真实场景落地

## 🎯 项目受众

- 为Openclaw、ClaudeCode 超大token消耗而苦恼的Agent使用者，GA的token使用效率是Openclaw的10x-30x
- 还在对比各种自进化智能体性能的Agent开发者和爱好者，给GA一天时间就能进化成你的专属助手
- 还在愁找不到好用web插件的openclaw使用者，GA的web操作能力绝对能让你眼前一亮
- 希望了解GA设计原理（上下文工程、记忆系统、工具设计、自我进化）的技术学习者
- 基础要求：无基础要求，无门槛安装使用

## 📚 在线阅读

**[🌐 在线阅读](https://datawhalechina.github.io/hello-generic-agent/)** - 无需下载，随时随地学习

## 📖 目录

### 第一部分：应用指南

| 章节名                                                  | 简介                                                       | 状态 |
| ------------------------------------------------------- | ---------------------------------------------------------- | ---- |
| [第1章 安装与环境配置](docs/part1/chapter1/index.md)       | Python 安装、项目下载、API Key 配置、GUI 与命令行启动      | ✅   |
| [第2章 浏览器能力解锁](docs/part1/chapter2/index.md)       | 安装 tmwd_cdp_bridge 插件，实现浏览器自动化操控            | ✅   |
| [第3章 基础入门：第一个小时](docs/part1/chapter3/index.md) | GA 界面介绍、OCR/视觉能力、飞书CLI、文件搜索、多轮对话技巧 | ✅   |
| [第4章 记忆与技能体系](docs/part1/chapter4/index.md)       | 四层记忆架构（L1-L4）、技能蒸馏、技能搜索与迁移            | ✅   |
| [第5章 聊天平台集成](docs/part1/chapter5/index.md)         | 微信、飞书、钉钉、QQ、Telegram、企业微信接入指南           | ✅   |
| [第6章 进阶技巧](docs/part1/chapter6/index.md)             | 自主行动模式、定时任务、Reflect 模式、子智能体、Plan 模式  | ✅   |

### 第二部分：原理篇

| 章节名                                                  | 简介                                                          | 状态 |
| ------------------------------------------------------- | ------------------------------------------------------------- | ---- |
| [第7章 上下文信息密度最大化](docs/part2/chapter7/index.md) | GA 的第一性原理：信息密度优先于上下文长度                     | ✅   |
| [第8章 系统架构总览](docs/part2/chapter8/index.md)         | 统一智能体循环、双执行模式、四大机制协同                      | ✅   |
| [第9章 最小原子工具集](docs/part2/chapter9/index.md)       | 9 个原子工具覆盖五大能力类别，Token 消耗仅 Claude Code 的 35% | ✅   |
| [第10章 分层记忆架构](docs/part2/chapter10/index.md)       | 四层记忆（L1 索引→L2 事实→L3 SOP→L4 归档）与按需加载策略   | ✅   |
| [第11章 上下文截断与压缩](docs/part2/chapter11/index.md)   | 四级压缩流水线，将上下文控制在 30k Token 以内                 | ✅   |
| [第12章 自我进化](docs/part2/chapter12/index.md)           | 从自然语言到 SOP 再到代码执行的三阶段进化，节省 89.6% Token   | ✅   |
| [第13章 涌现能力](docs/part2/chapter13/index.md)           | 三个简单原语组合涌现出子智能体、看门狗、定时任务等高级行为    | ✅   |

### 第三部分：案例篇

| 章节名   | 简介                           | 状态 |
| -------- | ------------------------------ | ---- |
| 实战案例 | 手把手教你用GA办公、娱乐、挖宝 | 🚧   |

## 💡 如何学习

&emsp;&emsp;项目分为三大部分，每一部分都是通往下一阶段的坚实阶梯：

- **第一部分：应用指南**（第1章～第6章），从安装环境、解锁浏览器能力开始，到记忆与技能体系、聊天平台集成，最后掌握自主行动、定时任务、子智能体等进阶技巧。零门槛上手，一步步把 GA 变成你的专属助手。
- **第二部分：原理篇**（第7章～第13章），深入 GA 的设计哲学。从"上下文信息密度最大化"这一第一性原理出发，逐步拆解系统架构、最小原子工具集、分层记忆、上下文压缩、自我进化机制，直到理解简单原语如何涌现出复杂能力。
- **第三部分：案例篇**，通过办公、娱乐、挖宝等真实场景的实战案例，将前两部分所学融会贯通。

&emsp;&emsp;建议按顺序学习，也可以根据自己的需求选择性阅读：

- **零基础用户**：从第一部分开始，先跑通安装和基本使用
- **想了解原理**：直接进入第二部分，深入架构设计与技术细节
- **想快速实战**：跳到第三部分案例篇，边做边学

## 🙏 贡献者名单

| 姓名   | 职责             | 简介                    |
| :----- | :--------------- | :---------------------- |
| 张洲嘉 | 项目负责人       | 复旦大学                |
| 沈豪   | 实战Case贡献者   | 复旦大学，Datawhale成员 |
| 朱家杰 | 第一章内容贡献者 | 复旦大学                |
| 杨航   | 第二章内容贡献者 | 复旦大学                |
| 袁雨奇 | 第三章内容贡献者 | 复旦大学                |
| 曹兮   | 第四章贡献者     | 复旦大学                |
| 宋坤   | 第五章贡献者     | 复旦大学                |

## 🤝 参与贡献

- 如果你发现了一些问题，可以提Issue进行反馈，如果提完没有人回复你可以联系[保姆团队](https://github.com/datawhalechina/DOPMC/blob/main/OP.md)的同学进行反馈跟进~
- 如果你想参与贡献本项目，可以提Pull Request，如果提完没有人回复你可以联系[保姆团队](https://github.com/datawhalechina/DOPMC/blob/main/OP.md)的同学进行反馈跟进~
- 如果你对 Datawhale 很感兴趣并想要发起一个新的项目，请按照[Datawhale开源项目指南](https://github.com/datawhalechina/DOPMC/blob/main/GUIDE.md)进行操作即可~

## 关注我们

<div align=center>
<p>扫描下方二维码关注公众号：Datawhale</p>
<img src="https://raw.githubusercontent.com/datawhalechina/pumpkin-book/master/res/qrcode.jpeg" width = "180" height = "180">
</div>

## 📄 LICENSE

<div align="center">
<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
  <img alt="知识共享许可协议" style="border-width:0" src="https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-lightgrey" />
</a>
<br />
本作品采用
<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
  知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议
</a>
进行许可。
</div>

---

<div align="center">
  <p>⭐ 如果这个项目对你有帮助，请给我们一个 Star！</p>
</div>
