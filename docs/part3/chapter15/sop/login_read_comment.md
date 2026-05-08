# 登录态围观热榜 + 礼貌评论 SOP（hello-ga case1）

> **场景**：借用户当前 Chrome 已登录态，把任意社交平台「最热一条」读到「能聊一句」的程度，再起草 N 条候选评论给用户审稿后发出。本案以 B 站为例，触类旁通到 知乎热榜 / X For You / 小红书话题首条。
> **验收**：① `raw_top.json` 含全字段（BV/标题/UP/三连/Top20 评论/弹幕样本）② `summary.md` ≤ 300 字成"网感速读" ③ `draft_comments.md` 三条候选 ④ **未发送任何评论**——发送由用户两次 ask_user 后自行决定。

---

## 链路一图

```
web_tabs → 找已登录平台 tab
    ↓
web_execute_js (credentials:'include')   ← cookie 不出浏览器
    ↓
└─ /x/web-interface/popular?ps=1&pn=1   榜首
└─ /x/v2/reply?type=1&oid={aid}&sort=2  Top20 热评
└─ /x/v1/dm/list.so?oid={cid}            XML 弹幕（取 30+ 条样本）
    ↓
raw_top.json
    ↓
reasoning 模型（glm-5.1 / minimax-m2.7 任选，便宜的）
    ↓
summary.md（钩子+三段式）+ draft_comments.md（走心/玩梗/提问）
    ↓
ask_user N 选 1 → 二次确认 →（用户决定）发送
    ↓
（可选）rapid_ocr 截屏 + DOM 双验证：评论是否上墙
```

---

## 关键避坑（每条都被踩过）

1. **不要污染原 tab**：用户已登录的 tab 可能在看视频 / 聊天，直接 `web_navigate` 跳走他会骂你。改在原 tab 内 `fetch('/x/web-interface/popular?ps=1&pn=1', {credentials:'include'})` —— 走同源 fetch，浏览器自动带 cookie，不污染历史。
2. **不要走 wbi_sign**：B 站 wbi 签名是反 Python 端伪造的设计，**走浏览器 fetch 天然规避**。能 `web_execute_js` 解决就不要去手撕 sign。
3. **Top20 热评要按热度**：`sort=2`（按热度），不是 `sort=0`（按时间）。后者拿到的全是新留的水贴。
4. **弹幕走 XML 接口**：`/x/v1/dm/list.so?oid={cid}` 返回 `<d p="t,...">text</d>` XML，不要去找 protobuf API（被 wbi 锁）。本案实际可见弹幕 305 条，按要求保留 30+ 条样本即可，不要全拉。
5. **评论可能被付费墙拦**：B 站「全组大红包包月充电」/ 知乎付费专栏 / 小红书「私密笔记」会让评论框 `disabled`，对应 `control.input_disable=true`。**起草前先检查这个字段**——不然写完三条草稿才发现发不出，浪费用户时间。
6. **summary 不要堆数据**：第一版让模型抓全部评论 + 全部弹幕，结果输出变成 1500 字流水账。改成「Top20 + 30 条采样 + 显式聚类」喂给模型后，输出从 1500 字压到 300 字「钩子 + 三段式」。**summary 是"够你聊一句"，不是数据集**。
7. **发送前必须 ask_user 两次**：① 三选一选哪条 ② 二次确认"最终发送『xxx』，确认？"。任何一次"否 / 都不发"立即收尾。**不能把"重试 3 次"当作"用户没拒绝"** —— 详 `skills/human_in_loop.md`。
8. **OCR 验证用 rapid_ocr**：发送后双验证之一是「截图评论区 + OCR 是否含刚发关键词」。GA 内置走 `memory/ocr_utils.py` 的 `ocr_image()` —— 后端是 `rapidocr_onnxruntime`，1s/次 + 中英文都准。**不要用 vision API**——OCR 够准，又快又免费。
9. **不要写 cron**：本 case 是「我刷热榜」一次性任务。挂 cron 会触发风控（同 IP 高频读 popular API + 评论），且评论质量随心情，机器写的不是好评论。
10. **触类旁通时按平台改 step 2**：把第 2 步的 popular API 换成 `zhihu/api/v3/feed/topstory/recommend` / X 的 `HomeTimeline.json` / 小红书的 `/api/sns/web/v1/explore/feed_v2`，**其余 step 几乎不用改**。

---

## 凭证 / 工具索引

| 能力 | 入口 | 备注 |
|---|---|---|
| 浏览器复用 | GA 内置 `web_scan` / `web_execute_js` / `web_navigate` | 不需要单独配置，走 TMWebDriver |
| 截图 | GA 内置 `web_cdp` `Page.captureScreenshot` | 双验证用 |
| 本地 OCR | `memory/ocr_utils.py` 的 `ocr_image()` | rapidocr-onnxruntime, ~1s/次 |
| reasoning 模型 | `mykey.py` 任一 cfg（glm-5.1 / minimax-m2.7 优先选便宜的） | summary + 起草 |
| ask_user 二次确认 | GA 内置 `ask_user` | 详 `skills/human_in_loop.md` |

---

## 实战参考

- **2026-05-09**：本 case 实跑一次，跑完 10 个 turn / 5 分钟。榜首抓到 `BV1VXdcBwEVT`《千呼万唤！《ENEMY》无码 5k 重制完整版上线了！》 UP 煎饼果仔呀，66.4w 播放 / 8.8w 赞 / 5.9w 投币。GA 自己识别到 `control.input_disable=true`（视频开了 30 元包月充电墙），即便允许真发也会被前端拦——给"未发送"约束做了最佳注脚。产物全部落 `case1-login-read-comment/assets/`。

---

## 给"模型能力一般"的读者：润色后 prompt（可直接复制）

如果你的 GA 装的是中小模型，仅凭一句"读最热的一条然后评一句"它可能拆不出 7 步。下面这段是把全部约束写明的版本，**直接粘贴**：

```text
我已经在 Chrome 里登录了 B 站。请用 web_setup_sop / tmwebdriver_sop 复用我现在的登录态（不要导出我的 cookie，也不要新开匿名窗口）：

1) 打开 https://www.bilibili.com/v/popular/all 取当前「全站热门」榜首一条视频，
   把 BV 号、标题、UP 主、发布时间、tags 抓下来；
2) 进入该视频详情页，用 web_scan 看简化结构，再用 web_execute_js 拿
   播放量 / 点赞 / 投币 / 收藏 / 转发 / 弹幕数 / 评论数；
3) 取 Top 20 楼热评（按热度排序），以及当前可见的 30 条左右弹幕，
   落盘 ./assets/raw_top.json；
4) 用 reasoning 模型（glm-5.1 / minimax-m2.7 任选）写一段 ≤300 字「这条视频是啥 +
   评论区氛围 + 弹幕在玩什么梗」总结，输出 ./summary.md；
5) 起草三条 ≤100 字、与视频内容/热评氛围呼应的评论草稿，三种风格
   （走心 / 玩梗 / 提问），写到 ./draft_comments.md，并通过 ask_user 让我挑一条；
6) 我确认后再点进评论框、粘贴、回车——发送前再次 ask_user 二次确认；
7) 发送后双验证：rapid_ocr 截图评论区 + web_execute_js 查我刚发的评论是否在 DOM 里。

硬约束：
- 全程只读我已打开的 Chrome，不准登录、不准导出 cookie、不准切账号；
- 评论由我审核后发，GA 不得自己决定发哪一条；
- 任何一步抓取失败超过 2 次重试，停下来 ask_user，不要硬绕；
- 一次性流程，跑完不要写计划任务、不要循环执行。
```
