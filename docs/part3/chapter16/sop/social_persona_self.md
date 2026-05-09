# 自我探寻 · 全网社交画像 SOP（hello-ga case2）

> **场景**：用户一句"帮我全网的社交平台做个性格分析，发过的帖子和内容"——GA 自动探测当前 Chrome 已登录的所有社交平台，抓公开发文与互动指标，吐两份产物：① 给自己看的 Markdown 速读 ② 给同行看的深色档案风 HTML。
> **验收**：`./全网社交性格分析_快速版.md` + `./社交档案_深度版.html` 双产物 + `./social_scan/<platform>_*.json` 原始留档 + 末尾合规声明 + 一键删除原始数据的 ask_user 收尾。

---

## 链路一图

```
web_tabs() → 正则匹配 (github|zhihu|x\.com|weibo|jike|xiaohongshu|
                       douban|bilibili|douyin|linux\.do|v2ex|reddit|instagram)
    ↓
对每个匹配 tab：web_execute_js 检测「我」标识
    ↓
分两栏：active[] / inactive[]
    ↓
┌─ GitHub:   /users/{u} + /users/{u}/repos?sort=stars + /users/{u}/events/public
│
├─ 知乎:     /api/v4/members/{slug} + /answers + /articles
│
├─ Discourse 类（LinuxDo / Meta）:
│           /u/{u}.json + /u/{u}/summary.json + /u/{u}/activity.json   ← skills/discourse_shot.md
│
├─ B站:      /x/space/wbi/acc/info + /x/polymer/web-dynamic/v1/feed/space
│
├─ X:        DOM 抓 (bio + 创建时间 + counters)
│
└─ 抖音:     profile DOM（命中验证码就跳过）
    ↓
落盘 ./social_scan/<platform>_raw.json + <platform>_content.txt
    ↓
reasoning 模型（gpt-5.5 / glm-5.1 / minimax-m2.7）一次调用 JSON-mode
  → identity_matrix / big5 / mbti / values / blindspots / one-line verdict
    ↓
中间态 ./.dossier_intermediate.json   ← skills/dossier_dual_render.md
    ↓
┌─ render_md  →  全网社交性格分析_快速版.md（给自己看）
└─ render_html → 社交档案_深度版.html      （给同行看，frontend-design 风）
    ↓
ask_user：保留 / 删除原始 social_scan/* ？
```

---

## 关键避坑（每条都被踩过）

1. **只扫已登录 tab，不要"尽量抓"**：第一版让 GA 对所有 13 个平台都尝试，结果它去硬刚微博/抖音的反爬，浪费 5 轮还啥也没拿到。**未登录 → 直接标 ❌ 跳过**，10 个平台 5 分钟扫完。
2. **平台特征要双重确认**：`document.cookie` 含目标 token + 个人页 DOM 出 handle 才算「我登录了」。只看 cookie 会被失效 session 骗，只看 DOM 会被 SEO 元素骗（比如未登录页的"登录后查看"占位符也常带个昵称）。
3. **抓数据用公开 API，不用 wbi_sign**：GitHub / 知乎 / B站 / Discourse 都有不需登录或需登录但不需签名的公开 API。**绕开 wbi 是这条 case 能稳跑的关键**。
4. **discourse 一把抓**：LinuxDo / Meta Discourse / 大量论坛走同一引擎，三个端点 `/u/{u}.json + /summary.json + /activity.json` 拿全所有可见字段——见 `skills/discourse_shot.md`。
5. **reasoning 一次调用、JSON-mode 输出多目标**：第一版让模型分别调 6 次（big5/mbti/values/...），结果模型每次"重新理解"用户、口径不一致。改成单次 JSON-mode 同时吐 8 个 key 后，**口径自洽且省一半 token**。
6. **MD/HTML 同源**：所有数字、引语、布尔值都先落 `dossier_intermediate.json`，再分别渲染 MD 和 HTML。**发现数字不对，改 JSON，不要去改 MD/HTML** ——后者每次都从 JSON 重渲染。
7. **HTML 视觉走 `frontend-design` SKILL**：暗金 / 粉红双色调 / Cormorant Garamond + JetBrains Mono + Noto Serif SC / 大号衬线 H1 + 等宽副标。**避免 AI slop**（默认 Inter + 紫色渐变 + 居中卡片）见 `memory/frontend-design/SKILL.md`。
8. **大五 / MBTI 是软标签，不是诊断**：模型输出**必须**带 evidence 字段（每维度依据），且报告末尾必须写「不作心理诊断」。这条 case 的版权风险不在抓取，在"判读"——加 evidence 让"判读可追溯"。
9. **Cookie 一次都没出过浏览器**：全流程没有 `document.cookie` 的导出、没有 `chrome://settings` 的复制。**所有抓取都是"DOM 上肉眼可见的内容"**——这是 case 能"自我授权"的底线。
10. **可一键删除原始数据**：报告末尾必须 ask_user 是否保留 `social_scan/*.json`。用户随时能让画像"凭空消失"——这是合规的最后一道关。
11. **发布前先脱敏**：跑出真实数据版后用 `assets/anonymize.sh`（21 条 sed 规则）替换为虚拟 handle 才能发——这是 case 能"光明正大公开"的最后一步。

---

## 凭证 / 工具索引

| 能力 | 入口 | 备注 |
|---|---|---|
| 浏览器复用 | GA 内置 `web_scan` / `web_execute_js` / `web_tabs` | TMWebDriver 桥接 |
| Discourse 三联端点 | `skills/discourse_shot.md` | 论坛 dump 通用 |
| reasoning JSON-mode | `mykey.py` 中任一支持 JSON 的 cfg | 一次调用多目标输出 |
| HTML 模板 / 配色 | `memory/frontend-design/SKILL.md` + `references_minimax/` | 暗金 / 粉红 / Noto Serif SC |
| 同源双渲染 | `skills/dossier_dual_render.md` | JSON → MD + HTML |
| 脱敏 | `assets/anonymize.sh`（21 条规则） | handle / 学校 / 二次元 ID 全部替换 |
| 长期记忆沉淀 | `memory/memory_management_sop.md` | 把"双身份"特征沉淀成长期记忆 |

---

## 实战参考

- **2026-04-25**：本 case 首次跑通——扫到 6 个活跃平台、7 个未登录平台。reasoning 模型一次调用产出 INTP-A 倾向 + 5w6 + 双线人格判读，落两份产物：MD 8.7KB + HTML 34KB。原始 6 个 raw_*.json 共 ~120KB。
- **2026-05-09**：用 `anonymize.sh` 脱敏后产出可发布 demo（虚拟身份 `@virtual_panda` / `@nightduck_23` / `@VPResearch`），见 `assets/dossier_*_demo.{md,html}`，**21 条 sed 规则跑完 grep 残留为 0**。

---

## 给"模型能力一般"的读者：润色后 prompt（可直接复制）

如果你的 GA 装的是中小模型，仅凭一句"帮我做个性格分析"它可能拆不出 4 个阶段。下面这段是把全部约束写明的版本，**直接粘贴**：

```text
帮我做一份「全网社交画像」。

发现阶段：
1) 用 web_setup_sop / tmwebdriver_sop 检视我当前 Chrome 已登录的所有 tab，
   枚举常见社交平台（GitHub / 知乎 / X / 微博 / 即刻 / 小红书 / 豆瓣 / 哔哩哔哩 /
   抖音 / LinuxDo / V2EX / Reddit / Instagram 等），
   通过 cookie 状态 + 各平台个人页 DOM 探测「是否登录 + 我的 user_id / handle」；
2) 把活跃账号与未登录账号分两栏列出，前者进入抓取，后者跳过；

抓取阶段（活跃账号 each）：
3) 走平台公开 API / DOM，抓「头像 / 昵称 / bio / 注册时间 / 关注 / 粉丝 /
   公开发文（最近 ≤30 条：标题 / 时间 / 互动数 / 摘要 / 自创 or 转发）」；
4) 原始数据落盘 ./social_scan/<platform>_raw.json，
   纯文本可读版落 <platform>_content.txt（方便后续 reasoning 模型摘要）；

蒸馏阶段：
5) 用 reasoning 模型（gpt-5.5 / glm-5.1 / minimax-m2.7 任选）一次 JSON-mode 调用同时输出：
   ① 大五人格雷达（0-10 主观分 + evidence）
   ② MBTI 倾向估值（带备选倾向 + reasoning）
   ③ 价值观与表达风格关键词
   ④ 跨平台一致性（学术 / 江湖 / 玩梗 / 实名是否割裂）
   ⑤ 一句话画像

产出阶段：
6) 写两份产物（**双格式同源**，同一份 JSON 渲染两遍）：
   - ./全网社交性格分析_快速版.md   ← 给自己看
   - ./社交档案_深度版.html          ← 给别人看，深色档案风（参考 memory/frontend-design）
7) 文末必须写明：① 公开内容 + 自我授权 ② 仅供自我洞察、非心理诊断 ③ 可一键删除 raw_*.json
8) ask_user：保留 / 删除原始抓取数据？

硬约束：
- 不导出 cookie、不切账号、不发任何内容；
- 任一平台抓取失败 ≥ 2 次 → 跳过并在报告中标注「未命中」，不要硬绕 wbi/sign；
- 全部产物落本地，**默认不上传**；
- 视觉上「学术线」用金色、「江湖线」用粉红，给读者一眼能分清的"双身份"暗示。
```
