# 第 4 章 记忆与 Skill 系统：让 GA 越用越强

> **学完本章，你将掌握 GA 的记忆机制和 Skill 体系——教会 GA 一次，它就能永久记住并复用你的经验。**

## 🎯 学习目标

1. 理解 GA 四层记忆架构（L1–L4）的作用和管理方式
2. 学会让 GA 将成功经验沉淀为可复用的 Skill
3. 掌握 Skill Search 和 Skill 迁移，快速扩充 GA 的能力库

---

## 4.1 Skill 与记忆概览

GA 把 Skill 作为一种记忆来管理。它们通常以 SOP、Python 脚本或子目录的形式保存在 `./memory/` 下，属于 L3 层。

GA 的四层记忆系统如下：

| 层级 | 存储内容 | 路径 |
| --- | --- | --- |
| L1 索引层 | 极简索引（<30行），每轮启动注入，让 GA 知道自己有哪些知识 | `./memory/global_mem_insight.txt` |
| L2 事实层 | 环境事实，如路径、系统配置、用户偏好 | `./memory/global_mem.txt` |
| L3 技能层 | 具体 Skill：SOP / 脚本 / 目录 | `./memory/*.md`、`./memory/*.py` |
| L4 归档层 | 压缩归档后的历史会话 | `./memory/L4_raw_sessions/` |

![](./images/img_1.png)

**总结**：Skill 保存在 L3（`./memory/`），并通过 L1（`./memory/global_mem_insight.txt`）进行索引，帮助 GA 在每次启动时想起它们。

> ⚠️ **注意**：
> 1. 第一次成功启动后，L1 文件会自动创建
> 2. 每次 `git pull` 更新代码后，如果 `./memory/` 下有新文件且你已有 L1，需要让 GA 同步：
>
> ```
> 看 ../memory/ 下的文件，依据 memory_management_sop.md 更新 L1 索引
> ```

---

## 4.2 创建新 Skill

GA 完成任务后，我们可以让它把刚才的经验总结成 Skill。这样**只需教会 GA 一遍，它后续就能参照 Skill 流畅高效地完成整套流程**。用一段时间以后，你的 GA 就会拥有专属于你的一整套 Skill。

### 操作流程

1. **直接告诉 GA 你的任务**——如果 GA 找不到现成经验，会先逐步试错
2. **发现问题随时打断**——点击页面右上角的 Stop 按钮，指出错误并补充正确方向
3. **任务成功后，让 GA 总结为 Skill**：

   > ```
   > 依据 memory_management_sop.md，提取成功经验总结为 skill 写入 L3，并更新 L1 索引
   > ```

> ⚠️ **注意事项**：
> - GA 有时会**忘记更新 L1**，导致新窗口不知道这个 Skill 存在。记得提醒它
> - 如果单个窗口对话太长（上下文约 30K），GA 会遗忘早期内容。可以让它读日志恢复记忆：
>
>   ```
>   在 ./model_responses/ 下找到你的日志文件，依据 memory_management_sop.md，提取经验总结为 skill 写入 L3，并更新 L1 索引
>   ```
>
> - **不是所有经验都值得沉淀**。L1 中存放低价值索引会干扰 GA 查找。值得沉淀的任务特征：需要多轮试错、以后会重复做、能总结成稳定步骤

---

## 4.3 Skill Search：搜索外部 Skill

GA 内置了 **Skill Search**——"用于寻找 Skill 的 Skill"，适合在本地没有现成经验时找外部参考。

### 使用方式

1. **直接向 GA 描述需求**：

   > ```
   > 帮我找一个用来……的 skill
   > ```

2. **GA 会自动执行搜索流程**：
   - 搜索：利用内置 Skill Search API，在 10 万+ skills 中自动搜索
   - 选择：优先选评分高、环境匹配、风险低的 Skill
   - 验证：在你的环境里小步试运行

3. **任务成功后，总结为自己的 Skill**：

   > ```
   > 依据 memory_management_sop.md，提取经验改写 skill 写入 L3，并更新 L1 索引
   > ```

> ⚠️ Skill Search 的语义匹配**对中文支持较差**，GA 会自动用英文搜索。手动搜索时务必使用英文关键词。

<details>
<summary><strong>🔧 自定义 Skill Hub</strong></summary>

GA 默认连接官方 Hub，也可以指定其他开源 Skill 网站或私有 Hub。直接用提示词告诉 GA 即可：

> ```
> 把 skill search 的搜索源改为 http://your-hub.com:port
> ```

</details>

---

## 4.4 迁移已有 Skill

如果你在其他平台（Claude Code、OpenClaw 等）已经积累了 Skill，可以迁移到 GA 中使用。

<details>
<summary><strong>📦 从 Claude Code / OpenClaw 迁移</strong></summary>

先确认 Skill 的真实来源和实际生效目录，再把其中可复用的机制迁移到 GA 的 L3 层。

**Skill 目录位置**：
- 个人 Skill（所有项目生效）：`~/.claude/skills/<skill-name>/`
- 项目 Skill（仅单个项目生效）：项目根目录下 `.claude/skills/<skill-name>/`
- 插件市场 Skill：`~/.claude/plugins/marketplaces/<marketplace-name>/skills/<skill-name>/`

**手动迁移步骤**：

1. 提取 Skill 的有效内容。除 `SKILL.md` 外，也需要关注目录下的其他文件：

   ```
   <skill-name>/
   ├── SKILL.md          # 核心文件（必需）
   ├── agents/           # subagent 定义
   ├── scripts/          # 可执行脚本
   ├── references/       # 参考文档
   ├── assets/           # 模板、数据文件
   └── examples/         # 使用示例
   ```

2. 删除敏感信息和旧系统专属内容（包装语、旧路径、特定格式）
3. 整理成 SOP / 脚本 / 目录，放进 `./memory/`
4. 小范围试跑，确认新 SOP 在当前环境下可执行
5. 补充 L1 索引（手动编辑或让 GA 更新）：

   > ```
   > 看 ../memory/ 下的新增文件，依据 memory_management_sop.md 更新 L1 索引
   > ```

**让 GA 帮你迁移**：

> ```
> 读取 [skill 路径] 中的内容，提取可复用的机制，删除专属依赖，依据 memory_management_sop.md，改写为 SOP/脚本，小范围试跑验证，成功后补充 L1 索引
> ```

</details>

<details>
<summary><strong>⚠️ 迁移野生 Skill（社区来源）</strong></summary>

1. **先检查安全性**：

   > ```
   > 帮我检查 [skill 路径] 这个 skill 是否有安全隐患
   > ```

2. **小任务验证**：

   > ```
   > 用这个 skill 完成 [任务描述] / 帮我想一个测试案例验证这个 skill
   > ```

3. **成功后正式存入 L3**：

   > ```
   > 依据 memory_management_sop.md，提取经验改写 skill 写入 L3，并更新 L1 索引
   > ```

</details>

---

## 4.5 记忆系统详解

### 核心公理

- **无行动不记忆**：只有工具调用成功后的结果才能写入 L1/L2/L3
- **已验证数据不可删改**：重构时只能迁移不能丢失
- **禁止存储易变状态**（时间戳、PID 等）

### L1 索引层压缩原则

- **存在性编码**：只需让 GA 意识到知识存在，不存具体知识
- 用 ROI 公式评估每行索引的价值，压缩低价值内容

> 💡 记忆的详细写入和清理规则见 `./memory/memory_management_sop.md` 和 `./memory/memory_cleanup_sop.md`。

### L4 自动压缩归档

L4 用于保存较早的历史会话，避免原始日志不断堆积。

<details>
<summary><strong>📂 L4 启用方法与触发条件</strong></summary>

**启用方式**（需以 reflect/scheduler 模式启动）：

```bash
# 用 agentmain.py 启动
python agentmain.py --reflect reflect/scheduler.py

# 用 launch.pyw 启动
python launch.pyw --sched
```

> ⚠️ 直接双击 `launch.pyw` 默认**不会**启用 L4 自动压缩。

**触发条件**（需同时满足）：

1. 使用 reflect/scheduler 模式启动
2. Agent 进程在本次运行中已持续超过约 12 小时
3. 会话（日志文件）2 小时内未更新且大于 4.5KB

**产出目录**：

```
./memory/L4_raw_sessions/
├── all_histories.txt       ← 所有会话历史的工作记忆汇总（追加写入）
├── 2026-04.zip             ← 月度压缩包
├── 2026-03.zip
└── ...
```

> 💡 也可以跳过 scheduler，直接让 GA 用 `L4_raw_sessions/compress_session.py` 手动压缩日志。

</details>

**检索历史对话**：

> ```
> 到 L4 下找对话记录，[描述对话（对话时间是 XXX / 内容是 XXX）]
> ```

<table><tr>
<td width="25%"><img src="./images/img_2.png" width="100%"></td>
<td width="75%"><img src="./images/img_3.png" width="100%"></td>
</tr></table>

---

## 4.6 内置 Skill 一览

GA 仓库中内置了以下 Skill，启动后可以直接使用：

| Skill | 描述 |
| --- | --- |
| `web_setup_sop` | 首次使用时配置浏览器自动化环境 |
| `skill_search` | 从 105K+ 技能卡中搜索技能 |
| `autonomous_operation_sop` | 指导 Agent 闲置时自主行动 |
| `scheduled_task_sop` | 设置定时任务 |
| `plan_sop` | 针对复杂任务（3 步以上 / 多文件 / 条件分支）的规划模式 |
| `subagent` | 启动并行子 Agent，上下文隔离，可与主 Agent 互相通信 |
| `ljqCtrl` | Windows 系统键鼠物理控制（macOS 用户可适配） |
| `adb_ui.py` | 安卓手机界面控制（点击、滑动、截图） |
| `ocr_utils` | 图片文字提取，支持多语言 OCR |
| `github_contribution_sop` | 开源项目贡献工作流：fork → 修改 → 测试 → PR |
| `keychain` | 管理本地加密密钥 |

GA 大多数情况下会自动选择合适的 Skill。想主动使用时直接描述需求即可，例如：

> ```
> 开启 subagent 做任务 A，你同时做另一个任务 B
> ```

---

## 4.7 常见问题

<details>
<summary><strong>Q: memory 文件里都是 SOP，和 Skill 的关系是什么？</strong></summary>

在 GA 中，Skill 就是以 SOP（或脚本）形式存在的。SOP 是 Skill 的载体——一份 SOP 文档就是一个 Skill。GA 不像其他平台有独立的"Skill 格式"，它直接把经验写成可执行的 SOP 步骤或 Python 脚本，存放在 `./memory/` 下（L3 层）。所以你看到的 SOP 文件，本身就是 GA 的 Skill。

</details>

<details>
<summary><strong>Q: GA 有没有像 OpenClaw 那样的 skills？</strong></summary>

有。GA 采用分层记忆架构，其中 L3 层即为可执行 Skill（SOP 或脚本形式）。GA 有内置 Skill（见 4.6），外部 Skill 可通过 Skill Search 检索（见 4.3），或从 Claude Code / OpenClaw 迁移（见 4.4）。

</details>

<details>
<summary><strong>Q: Skill 怎么安装？能让 GA 自己装 Skill 吗？</strong></summary>

不需要手动"安装"。直接描述需求即可，GA 会自动通过 Skill Search 寻找。详见 4.3。

</details>

<details>
<summary><strong>Q: Claude Code 的 Skill 能直接迁移到 GA 吗？</strong></summary>

不能直接复制使用。GA 会读取外部 Skill 的内容，在你的环境中实际运行验证，成功后再将经验沉淀为自己的 SOP/脚本存入 L3。也就是说，外部 Skill 经过「读取 → 实践 → 沉淀」后才会变成 GA 自己的 Skill。详见 4.4。

</details>

<details>
<summary><strong>Q: 社区 Skill 迁移后不管用？</strong></summary>

社区 Skill 不是为你的环境定制的，先让 GA 改造、试跑后再总结为你自己的 Skill，存入记忆。详见 4.4。

</details>

<details>
<summary><strong>Q: GA 做完任务但下次还是重新摸索？</strong></summary>

任务完成后需提示 GA 将经验总结为 Skill，并按照 `memory_management_sop.md` 写入 L3 和 L1。详见 4.2。

> ```
> 依据 memory_management_sop.md，提取成功经验总结为 skill 写入 L3，并更新 L1 索引
> ```

</details>

<details>
<summary><strong>Q: Skill Search 搜不到想要的？</strong></summary>

任何 Skill 库都不可能覆盖所有场景。如果官方 Hub 搜不到，可以尝试换英文关键词重试；也可以将 GA 的 Skill Search 指向其他开源 Skill 网站或自建的私有 Skill Hub（见 4.3 自定义 Skill Hub），GA 会到你指定的 Skill 库中检索。实在没有现成 Skill，也可以让 GA 从零探索，成功后再总结成你自己的 Skill。

</details>

<details>
<summary><strong>Q: 窗口关闭后怎么恢复历史对话？</strong></summary>

当前会话间不直接共享记忆，但可以让 GA 读历史日志恢复：

> ```
> 去 model_responses 和 L4 下找对话记录，[描述对话（时间是 XXX / 内容是 XXX）]，读取记录恢复上下文
> ```

若日志尚未归档至 L4，可在 `./temp/model_responses/` 下按时间戳手动查找。

</details>

<details>
<summary><strong>Q: 怎么开多个会话？GUI 只有一个对话框</strong></summary>

直接新开实例即可——再打开一个终端运行启动命令，或再次双击 `launch.pyw`。

</details>

<details>
<summary><strong>Q: 对话太长能压缩上下文吗？</strong></summary>

可以让 GA 用 `L4_raw_sessions/compress_session.py` 压缩历史日志。目前没有在线压缩功能，上下文到 30K 后会被直接截断。建议：

- 长任务使用 `plan_sop` 分阶段执行，缓解失忆
- 关键结论及时沉淀到 L2/L3，避免依赖长上下文

</details>

<details>
<summary><strong>Q: GA 的记忆（L1–L4）必须手动添加吗？</strong></summary>

几乎不需要。GA 会自动更新或在简单提示下完成：

- **L4**：用 reflect/scheduler 模式自动归档，或让 GA 主动压缩
- **L3**：多种方式详见 4.2、4.3、4.4，可提醒 GA 根据 `memory_management_sop` 自动总结
- **L2/L1**：GA 会依据提示词和 SOP 自动管理

</details>

<details>
<summary><strong>Q: global_mem.txt 是空文件，正常吗？</strong></summary>

正常。`global_mem.txt` 是 L2 层（环境事实）存储文件，首次使用时为空。GA 在探索过程中发现环境事实后会自动写入。也可以主动提醒：

> ```
> 请查阅 memory_management_sop.md，将已发现的环境事实写入 L2 层
> ```

</details>

<details>
<summary><strong>Q: GA 如何在不同系统中保持成长进度 / 迁移？</strong></summary>

GA 日常运行和自进化几乎只涉及 `memory` 和 `temp` 两个目录，迁移这两个目录即可。

</details>

---

<details>
<summary><strong>📂 相关文件速查</strong></summary>

| 内容 | 路径 |
| --- | --- |
| L1 索引层，每轮启动注入 | `./memory/global_mem_insight.txt` |
| L2 事实层，环境配置和用户偏好 | `./memory/global_mem.txt` |
| L3 技能层，Skill 存放位置 | `./memory/*.md` / `./memory/*.py` |
| L4 归档层，历史会话压缩包 | `./memory/L4_raw_sessions/` |
| 记忆管理规范（写入/清理规则） | `./memory/memory_management_sop.md` |
| Skill Search 工具目录 | `./memory/skill_search/` |
| 当前会话原始日志 | `./temp/model_responses/` |

</details>

---

## 📝 小结

- **四层记忆**：L1 索引 → L2 事实 → L3 技能 → L4 归档，层层递进、自动管理
- **Skill 沉淀**：任务成功后一句话提示 GA，即可将经验固化为可复用 Skill
- **Skill 获取**：内置 11 个开箱即用，Skill Search 提供 10 万+ 外部技能检索，还可从 Claude Code 等平台迁移

---

[上一章：第 3 章 基础使用](../chapter3/) | [下一章：第 5 章 聊天平台接入](../chapter5/)
