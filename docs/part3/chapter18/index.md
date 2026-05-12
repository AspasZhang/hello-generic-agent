# Case 5：B站收藏夹语义分类

> **学完本章，你将掌握如何让 GA 自动将 B 站收藏夹中的海量视频按大模型语义理解归类到各主题文件夹——告别手动分类，效率提升百倍**

> **📍 For GA · 给智能体看的输入**
> 
> ```
> 我的B站默认收藏夹里积了几百个视频，太乱了，帮我整理一下。我已经在chrome登录了B站，请你：
> 1. 先拉取我所有收藏夹文件夹列表，告诉我有哪些
> 2. 从默认收藏夹拉取全部视频（自动翻页），把标题列表发出来
> 3. 用大模型逐条语义理解每个视频标题的含义，归类到我已有的文件夹里——注意是语义理解不是关键词匹配，比如「3分钟搞定各大合同类型横向对比」不是娱乐是技术教程
> 4. 列出分类计划表（视频→目标文件夹，汇总每个文件夹收多少条），我确认后再执行
> 5. 批量移动时注意 resources 参数格式是 "id:2,id2:2"，别搞错了
> ```
> 
> 上面这段是用户原话，**直接复制粘贴给 GA 就能跑**——读者无需关心 GA 怎么拆解。 下面是给**人类读者**看的章节解析：GA 把这一句话拆成了哪些步、为什么这么拆、踩了哪些坑。

---

## 🎯 学习目标

1. 理解「API 拉取 → LLM 语义分类 → 批量移动」的流水线设计
2. 学会通过 B 站非公开 API 获取收藏夹数据并执行批量操作
3. 掌握「语义优先，禁止关键词硬匹配」的核心分类原则
4. 学会将成功经验沉淀为可复用的 SOP

---

## 18.1 适用场景

> 💡 本章介绍的方法适用于 **B 站收藏夹混乱、急需归类整理** 的场景。当你收藏了几百甚至上千个视频，手动分类既费时又容易遗漏，GA 可以帮你一键完成。
>
> 本方法的核心理念：**分类不由关键词决定，而由大模型理解视频标题的真正含义后决定**。例如「3分钟搞定各大合同类型横向对比」不是娱乐，而是专业工具类知识；「DeepSeek R1本地RAG知识库」属于 AI 工具而非技术教程。

---

## 18.2 整体流程概览

```
┌─────────────┐
│  Step 1      │   通过 B 站 API 拉取源收藏夹全部条目（自动翻页）
│  拉取数据    │   获取每条视频的 id、bvid、title
└──────┬──────┘
       ▼
┌─────────────┐
│  Step 2      │   将标题发给大模型逐条语义理解
│  LLM 语义分类 │   列出分类计划（标题→目标文件夹）给用户确认
│  ⚠核心步骤   │   严禁使用关键词/正则硬匹配
└──────┬──────┘
       ▼
┌─────────────┐
│  Step 3      │   拿到所有目标文件夹的 media_id
│  批量移动    │   按分类构建 resources 参数（格式：id:2,id2:2,...）
│  ⚠参数名坑点 │   POST 请求到 /x/v3/fav/resource/move
└──────┬──────┘
       ▼
┌─────────────┐
│  Step 4      │   再次调用 API 统计各文件夹视频数量
│  验证结果    │   确认分类后的数量与预期一致
└─────────────┘
```

> ⚠️ **前置条件**：目标收藏夹必须预先在 B 站网页端创建好，GA 不会帮你新建文件夹。

---

## 18.3 Step 1：获取收藏夹数据

### 18.3.1 获取文件夹列表

首先需要知道有哪些收藏夹以及它们的 `media_id`。在 B 站已登录状态下，打开 bilibili.com 任意页面，按 `F12` 打开开发者工具，切换到 **Console** 标签，执行以下 JS：

```javascript
(async () => {
  // 替换为你自己的 up_mid（可在个人空间 URL 中找到）
  const up_mid = '你的UID';
  const r = await fetch(
    `https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${up_mid}&platform=web`,
    { credentials: 'include' }
  );
  const d = await r.json();
  return JSON.stringify(
    d.data.list.map(f => ({
      name: f.title,
      id: f.id,
      count: f.media_count
    }))
  );
})();
```

返回结果示例：
```json
[{"name":"默认收藏","id":"1305627179","count":521},{"name":"健身","id":"3980411279","count":12}]
```

> 💡 **如何获取 up_mid？** 打开你的 B 站个人空间，URL 形如 `space.bilibili.com/482921779`，末尾的数字就是你的 UID。

### 18.3.2 拉取源收藏夹全部条目

以「默认收藏」为例，拉取其中所有视频（自动翻页）：

```javascript
(async () => {
  const items = [];
  let pn = 1;
  // 替换 SOURCE_MEDIA_ID 为源文件夹 media_id
  const SOURCE_MEDIA_ID = '1305627179';
  
  while (true) {
    const r = await fetch(
      `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${SOURCE_MEDIA_ID}&pn=${pn}&ps=20&platform=web&order=mtime`,
      { credentials: 'include' }
    );
    const d = await r.json();
    const medias = d.data?.medias || [];
    items.push(...medias.map(m => ({
      id: m.id,
      bvid: m.bvid,
      title: m.title
    })));
    if (!d.data?.has_more) break;
    pn++;
  }
  return JSON.stringify({ total: items.length, items });
})();
```

> ⚠️ **注意**：B 站 API 返回的 `media_count` 可能大于实际可操作的视频数量——多出来的部分是**已被 UP 主删除或设为私有的失效视频**，这些无法被移动。

---

## 18.4 Step 2：LLM 语义分类（核心步骤）

### 18.4.1 语义理解原则

**必须使用大模型深度理解标题含义，禁止关键词硬匹配。** 例如：

| 视频标题 | 错误分类 | 正确分类 | 原因 |
|----------|----------|----------|------|
| 「3分钟搞定各大合同类型横向对比」 | 搞笑/娱乐 | **技术教程** | 内容是法律/合同知识讲解，非娱乐 |
| 「如何合法"开户"？」 | 金融/理财 | **时政** | 涉及政策法规而非具体理财技巧 |
| 「DeepSeek R1本地RAG知识库」 | 技术教程 | **AI工具** | 重点是工具使用而非教学 |
| 「点弦泛音《江南》吉他指弹」 | 搞笑/生活 | **音乐** | 演奏类内容属于音乐范畴 |
| 「CSGO 精彩集锦」 | 游戏 | **电竞** | 竞技类内容更贴合电竞标签 |
| 「健身环大冒险 第15关」 | 游戏 | **健身** | 内容本质是运动训练 |

### 18.4.2 分类流程

1. **读取 JSON**：将 Step 1 获取的全部标题列表发给大模型
2. **逐条分类**：大模型根据标题语义判断该视频属于哪个已有文件夹
3. **列出计划**：生成「视频标题（截取前20字） → 目标文件夹」的表格
4. **汇总统计**：每个文件夹预计收多少条，用户确认后执行
5. **模糊标题处理**：无法从标题判断的视频，**保留在默认夹，不强制归类**

### 18.4.3 生成移动计划

大模型需要输出一份 JSON 格式的移动计划（示例结构）：

```json
{
  "actions": [
    {"folder": "健身", "media_id": "3980411279", "bvids": ["BV1xx411c7mD", "BV1xx411c7mE"]},
    {"folder": "AI工具", "media_id": "3951973479", "bvids": ["BV1xx411c7mF"]}
  ]
}
```

---

## 18.5 Step 3：批量移动（关键避坑）

### 18.5.1 准备请求参数

移动视频需要以下几个参数：

| 参数名 | 说明 | 如何获取 |
|--------|------|----------|
| `src_media_id` | 源文件夹 ID | Step 1 已获取 |
| `tar_media_id` | 目标文件夹 ID | Step 1 已获取 |
| `resources` | 要移动的视频 ID 列表 | ⚠️ 格式为 `id1:2,id2:2,id3:2,...`，末尾的 `:2` 是固定值 |
| `mid` | 你的 UID | 同上 |
| `csrf` | B 站登录 token | 从当前页面 cookie 中提取 `bili_jct` 值 |
| `platform` | 固定为 `web` | — |

### 18.5.2 执行批量移动

```javascript
(async () => {
  // 从当前页面 cookie 获取 CSRF token
  const csrf = document.cookie
    .split(';')
    .find(c => c.trim().startsWith('bili_jct='))
    ?.split('=')[1] || '';

  const results = [];
  // 定义移动计划（由 Step 2 LLM 输出）
  const moves = [
    { name: '健身', fid: '3980411279', res: '1234567890:2,1234567891:2' },
    { name: 'AI工具', fid: '3951973479', res: '1234567892:2' },
    // ... 更多分类
  ];

  for (const m of moves) {
    const body = new URLSearchParams({
      src_media_id: '1305627179',   // 源文件夹
      tar_media_id: m.fid,          // 目标文件夹
      resources: m.res,             // ⚠️ 参数名是 resources！
      mid: '482921779',
      csrf: csrf,
      platform: 'web'
    }).toString();

    const r = await fetch(
      'https://api.bilibili.com/x/v3/fav/resource/move',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      }
    );
    const json = await r.json();
    results.push({ action: m.name, code: json.code, msg: json.message });
  }
  return JSON.stringify(results);
})();
```

> ⚠️ **最容易踩的坑——参数名错误**：很多参考资料会写成 `res_media_ids` 或 `resources_ids`，**实际 API 接受的参数名是 `resources`**。写错参数名会返回 `-400` 错误，批量移动全部失败。

### 18.5.3 URLSearchParams 的重要性

不要手工拼接参数字符串，例如：

```javascript
// ❌ 错误：手工拼接可能导致编码问题
const body = `src_media_id=${src}&resources=${res}&...`;

// ✅ 正确：使用 URLSearchParams 自动处理编码
const body = new URLSearchParams({ src_media_id: src, resources: res, ... }).toString();
```

---

## 18.6 Step 4：验证结果

移动完成后，逐个文件夹统计视频数量，确认与预期一致：

```javascript
(async () => {
  const results = {};
  const folders = [
    { name: '默认收藏', id: '1305627179' },
    { name: '健身', id: '3980411279' },
    { name: 'AI工具', id: '3951973479' },
    { name: '音乐', id: '3969954679' },
    { name: '技术教程', id: '3864916079' },
    { name: '游戏', id: '3995258979' },
    { name: '搞笑', id: '3915954679' },
    { name: '时政', id: '3909937879' },
    { name: '烹饪', id: '3980411179' },
    { name: '围棋', id: '2180410479' }
  ];

  for (const f of folders) {
    const r = await fetch(
      `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${f.id}&pn=1&ps=20&platform=web`,
      { credentials: 'include' }
    );
    const d = await r.json();
    results[f.name] = d.data?.info?.media_count || 0;
  }
  return JSON.stringify(results);
})();
```

> 💡 **如果数量不对**：检查是否有视频属于多个分类导致重复移动，或确认 CSRF token 是否已过期（需要刷新页面重新获取）。

---

## 18.7 实战：让 GA 读本章并执行整理

让 GA 亲自动手整理你的收藏夹：

1. **给 GA 看本章内容**：将本章 Markdown 内容或链接发给 GA
2. **提供必要信息**：告诉 GA 你的 UID、源文件夹 media_id、已建立的目标文件夹列表
3. **让 GA 执行**：GA 会按本章流程执行拉取→分类→移动→验证
4. **一起调试**：如果某个 API 请求失败，和 GA 一起查看错误码并修复

---

## 18.8 避坑指南

### 🚫 绝对禁止的操作

| 操作 | 后果 | 替代方案 |
|------|------|----------|
| 关键词硬匹配分类 | 遗漏语义相近的视频，分类质量低 | 必须用大模型语义理解逐条判断 |
| 参数名写 `res_media_ids` | API 返回 -400，移动全部失败 | 正确参数名是 **`resources`** |
| CSRF token 过期后继续操作 | 请求返回权限错误 | 刷新 B 站页面重新获取 `bili_jct` cookie |
| 不确认计划就执行移动 | 分类不满意或发错文件夹 | **移动不可逆，必须先让用户确认分类计划** |
| 忽略失效视频 | 以为能移动全部，实际很多已失效 | 注意 `media_count` 大于 list 返回数量的情况 |

### 💡 实用技巧

1. **提前建好文件夹**：GA 只负责移动，不负责创建文件夹，需要提前在 B 站网页手动建立好目标分类
2. **分类数量控制**：建议先建立 5-8 个大类（健身/音乐/技术教程/AI工具/游戏/搞笑/时政/其他），太细的分类反而难处理
3. **标题歧义处理**：对于标题含义模糊的视频（「教程」「指南」类），大模型会根据视频封面/标签综合判断
4. **分批执行**：如果视频超过 200 条，可以分批拉取和移动，避免单次请求超时
5. **移动完成后可删除源视频**：归类完成后，默认收藏夹会变空，可手动清理

---

## 18.9 本章小结

本章我们通过「B 站收藏夹语义分类」这个 Case，学习了 GA 调用第三方平台非公开 API 实现批量操作的完整流程：

| 核心概念 | 说明 |
|----------|------|
| 三步流水线 | 拉取（API翻页）→ 分类（LLM语义）→ 移动（批量POST）|
| 语义优先原则 | 禁止关键词硬匹配，必须理解标题真实含义 |
| 参数名陷阱 | `resources` 不是 `res_media_ids`，写错直接 -400 |
| URLSearchParams | 自动处理编码，避免手工拼接出错 |
| 安全验证 | 移动前用户确认计划，移动后验证结果 |
| SOP 沉淀 | 成功后把经验固化存入记忆，下次直接复用 |

> 🎓 **举一反三**：本章的「API 拉取 → LLM 分析 → 批量写入」模式可以套用到任何支持 API 的平台（如知乎收藏夹、Notion 数据库、Evernote 笔记等）。核心是找到正确的 API 端点和参数格式，剩下的分析决策全部交给大模型。