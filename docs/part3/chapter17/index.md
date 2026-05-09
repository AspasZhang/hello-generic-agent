# Case 4：登录态视频离线 · 飞机上看一部番

> **学完本章，你将掌握如何让 GA 借用你已经登录的 B 站账号，把任意番剧/课程视频以最高画质抓到本地的 mp4。聪明的读者一定会触类旁通——同样的"借登录态 + DASH 解析 + 双层并发 + ffmpeg 合流"姿势可以无缝迁移到 YouTube 私有 playlist / 内部会议录像 / 自己录的播客切片。**

> **📍 For GA · 给智能体看的输入**
>
> ```text
> 请你帮我下载b站最高画质的视频，我已经chrome登录了b站的tab，用你内置的web能力，可以结合 js-reverse 帮我下载正相反的你与我 12集的视频到本地，我要飞机上看。不要给我的vpn弄崩，你可以分chunk分集并行下载。
> ```
>
> 上面这段是用户原话，**直接复制粘贴给 GA 就能跑**——读者无需关心 GA 怎么拆解。
> 下面是给**人类读者**看的章节解析：GA 把这一句话拆成了哪些步、为什么这么拆、踩了哪些坑。

---

## 🎯 学习目标

1. 理解 GA「**借登录态而不偷 cookie**」的核心姿势——`web_execute_js` 在已登录 tab 内 fetch
2. 学会「找 tab → 取分集列表 → 拿 DASH 主备 URL → 写并发下载脚本 → ffmpeg 零重编码合流」八步流程
3. 掌握「**双层 ThreadPool**」（全局 N 集 + 集内音视频）VPN 友好的下载范式

![Hero · GA 实跑当天的 B 站番剧主页](assets/screenshot_01_hero.png)

> *上图是 `https://www.bilibili.com/bangumi/play/ss129142`《正相反的你与我》番剧主页，
> 12 集 + PV，登录态可见全部分集。GA 借这个 tab 的 cookie 通过
> `web_execute_js fetch(..., credentials:'include')` 拿到每集 DASH 流主备 URL。*

---

## 17.1 适用场景

> 💡 本章方法适用于 **"借自己的账号下载自己有权看的内容到自己的硬盘"** 这类离线观看需求。
> 典型例子：明天飞行模式 5 小时、想看的番剧没缓存、官方 App 缓存掉缓存或封顶 720P、不想为这件事再装一个第三方客户端。

> ⚠️ **目的明确：仅个人离线观看**。不上传、不二次发布、不批量爬取——本章反复强调"用你自己的账号下你自己有权看的内容到你自己的硬盘"，**这是它能光明正大公开的边界**。

---

## 17.2 整体流程概览

```
┌─────────────┐
│  Step 1     │  找已登录 B 站 tab
│  探测        │  没找到 → ask_user 要番剧 ss / BV，不要"猜"
└──────┬──────┘
       ▼
┌─────────────┐
│  Step 2     │  取分集列表：/pgc/view/web/season?season_id=...
│  全集元信息  │  → ep_id / title / cid 一个不漏
└──────┬──────┘
       ▼
┌─────────────┐
│  Step 3     │  拿 DASH 主备 URL：/pgc/player/web/playurl
│  最高画质    │  qn=120 + fnval=4048 → 主 (PCDN) + 备 (官方 CDN)
└──────┬──────┘
       ▼
┌─────────────┐
│  Step 4     │  落盘 all_episodes.json：12 集元数据
│  调度依据    │  含 video_url + video_backup + 大小预估
└──────┬──────┘
       ▼
┌─────────────┐
│  Step 5     │  写独立 download.py（脱离 GA 跑得动）
│  下载器      │  Python + requests + ThreadPool + 8MB chunk
└──────┬──────┘
       ▼
┌─────────────┐
│  Step 6     │  双层并发：全局 N 集 + 集内 v/a 并发
│  VPN 友好    │  N=2 是 PCDN + VPN 都不抖的甜区
└──────┬──────┘
       ▼
┌─────────────┐
│  Step 7     │  ffmpeg -c copy -movflags +faststart 合流
│  零重编码    │  12 集 ~3.4GB 合流 8 秒
└──────┬──────┘
       ▼
┌─────────────┐
│  Step 8     │  rm 中间 m4s、保留 mp4，**不写 cron**
│  收尾        │  一次性任务，下完即停
└─────────────┘
```

---

## 17.3 本案用到的能力（动手前先看一眼）

### GA 内置能力（开箱即用，不需要额外安装）

- `web_tabs` / `web_execute_js`：找已登录 B 站 tab、在 tab 内 `fetch('/pgc/...', credentials:'include')` 拿 DASH 流主备 URL，**cookie 不出浏览器**
- `ask_user`：找不到目标番剧时让用户给 ss / BV，**不准猜**
- `subagent`（GA 内置）：可选——> 12 集时把每集塞给一个 subagent 并行处理；本案 12 集用 ThreadPool 就够

### 本案专属 SOP（已打包到 [`sop/`](./sop/)）

| 文件 | 用途 |
|---|---|
| [`sop/chunked_parallel_download.md`](./sop/chunked_parallel_download.md) | 8MB chunk + Range 续传 + PCDN 主备切换 + 双层 ThreadPool（VPN 友好） |
| [`sop/ffmpeg_local_pipeline.md`](./sop/ffmpeg_local_pipeline.md) | `-c copy -movflags +faststart` 零重编码合流 + 手机端秒开 |
| [`sop/bili_bangumi_download.md`](./sop/bili_bangumi_download.md) | 弱模型 fallback SOP（链路一图 + 12 条避坑 + 完整润色后 prompt） |

### 外部 SKILL（已完整复制到 [`sop/js-reverse/`](./sop/js-reverse/)）

| SKILL | 复制源 | 用途 |
|---|---|---|
| `sop/js-reverse/SKILL.md` + `agents/` + `references/` | `js-reverse.zip`（GA 主仓 `memory/js-reverse/`） | **反爬兜底**——当 wbi/sign 真的拦住时，6 阶段协议（Observe → Capture → Rebuild → Patch → Extract → Port）反推签名链路。**本案没用上**（借登录态 fetch 天然规避），但作为兜底完整保留。 |

---

## 17.4 Step 1：找已登录 B 站 tab

```python
tabs = web_tabs()
bili_tabs = [t for t in tabs if 'bilibili.com' in t['url']]
if not bili_tabs:
    season = ask_user(question="请打开一集番剧 / 给我 ss 号或 BV 号")
```

**不要"猜"番剧名对应的 ss 号**——名字相近的 IP 太多，拿错了下满 12 集才发现是错的。

---

## 17.5 Step 2：取分集列表

```js
// web_execute_js 在已登录 tab 内
const r = await fetch(
  'https://api.bilibili.com/pgc/view/web/season?season_id=129142',
  {credentials: 'include'}
);
const j = await r.json();
return j.result.episodes.map(e => ({
  ep_id: e.ep_id,
  cid:   e.cid,
  title: e.long_title || e.share_copy
}));
```

> 💡 **小知识**：`season` 接口返回的 episodes 数组里既有正片（`section_type=0`）也有 PV / 番外（`section_type≠0`）。如果只想下 12 集正片，过滤 `section_type=0`。

---

## 17.6 Step 3：拿 DASH 主备 URL（**关键**）

```js
async function pickStream(ep_id, cid) {
  const r = await fetch(
    `https://api.bilibili.com/pgc/player/web/playurl?ep_id=${ep_id}&cid=${cid}&qn=120&fnval=4048&fourk=1`,
    {credentials: 'include'}     // ← 关键：浏览器登录态 cookie 自动带
  );
  const j = await r.json();
  const v = j.result.dash.video.find(x => x.id === j.result.quality);
  const a = j.result.dash.audio[0];
  return {
    video_url:    v.base_url,
    video_backup: v.backup_url?.[0],
    audio_url:    a.base_url,
    audio_backup: a.backup_url?.[0],
  };
}
```

> ⚠️ **`qn=120` + `fnval=4048` 是组合关键字**：
> - `qn=120` = 大会员 1080P 60fps（账号不够会自动降级到 80）
> - `fnval=4048` = 走 DASH 流（视频 + 音频分开 m4s），不是 FLV（一体）
> - **B 站 1080P+ 大部分只发 DASH** —— 拿 FLV 走兜底画质（最高 720P）

> 🎓 **不需要 wbi_sign**：浏览器登录态 fetch 天然带签名后的 token，**整条 case 没用上 [`sop/js-reverse/`](./sop/js-reverse/)**——但它在 sop 目录里以备真出反爬时能 6 阶段反推。

---

## 17.7 Step 4：落盘 all_episodes.json

```jsonc
{
  "season_id": "ss129142",
  "title": "正相反的你与我",
  "qn": 120, "fnval": 4048,
  "episodes": [
    {
      "title": "01_正相反的你",
      "ep_id": 2687638, "cid": 35853959698,
      "video_url":    "https://809al93l.edge.mountaintoys.cn:4483/...",  // PCDN
      "video_backup": "https://upos-sz-mirrorcoso1.bilivideo.com/...",   // 官方 CDN
      "video_size":   289760261,
      "audio_url":    "https://809aj93l.edge.mountaintoys.cn:4483/...",
      "audio_backup": "https://upos-sz-mirrorcoso1.bilivideo.com/...",
      "audio_size":   13441024
    }
    // … 11 集略
  ]
}
```

主备 URL 都要存——下一步双链路下载会用到。

---

## 17.8 Step 5：写独立 download.py

GA 不需要在 agent 循环里跑下载（10 分钟级 IO 任务会撑爆 context），让它**写一个独立的 Python 脚本**：

```python
# download.py 关键参数
FFMPEG = r"<your ffmpeg.exe>"
CHUNK = 8 * 1024 * 1024            # 8MB chunk（VPN 友好）
MAX_EP_PARALLEL = 2                # 全局 2 集并发
HEADERS = {
    'User-Agent': 'Mozilla/5.0 ... Chrome/...',
    'Referer':    'https://www.bilibili.com/'   # ← B 站 CDN 强制要 Referer
}
```

完整 166 行实跑版本见 [`assets/download_reference.py`](./assets/download_reference.py)。技术细节见 [`sop/chunked_parallel_download.md`](./sop/chunked_parallel_download.md)。

---

## 17.9 Step 6：双层并发（全局 + 集内）

```python
# 全局：每批 2 集
for batch in chunks(episodes, MAX_EP_PARALLEL):
    with ThreadPoolExecutor(max_workers=MAX_EP_PARALLEL) as pool:
        for ep in batch:
            pool.submit(download_episode, ep)

def download_episode(ep):
    # 集内：v + a 并发
    with ThreadPoolExecutor(max_workers=2) as pool:
        fv = pool.submit(download, ep['video_url'], ep['video_backup'], v_tmp)
        fa = pool.submit(download, ep['audio_url'], ep['audio_backup'], a_tmp)
        if fv.result() and fa.result():
            return merge_av(v_tmp, a_tmp, output)
```

> 💡 **2 集并发是踩出来的**：第一版 12 集并发 → PCDN 503 + VPN 直接转圈；改"全局 2 集 + 集内 v/a 并发"后，CPU/网卡都没拉满但全程不抖。**慢 30 秒胜过崩盘 30 分钟**。

每个文件下载内部用 **HTTP Range 8MB chunk + 主备切换 + 5 次重试**：

```python
def download(url, backup_url, dest, label=""):
    existing = os.path.getsize(dest) if os.path.exists(dest) else 0
    # ... 用 Range 0-0 拿 Content-Range 解析 total
    while existing < total:
        try:
            r = requests.get(active_url, headers={**H, 'Range': f'bytes={existing}-{end}'},
                             stream=True, timeout=30)
            if r.status_code not in (200, 206):
                if backup_url and active_url != backup_url:
                    active_url = backup_url; continue   # ← 切备份
                return False
            for chunk in r.iter_content(65536):
                f.write(chunk); existing += len(chunk)
        except Exception:
            retries += 1
            if retries > 5: return False
            time.sleep(2)
```

> ⚠️ **`open(dest, 'ab')` 不是 `'wb'`**——后者会清空已下载部分，断点续传立刻废。

---

## 17.10 Step 7：ffmpeg 合流（最后一公里）

```bash
ffmpeg -y -i video.m4s -i audio.m4s -c copy -movflags +faststart out.mp4
```

- `-c copy`：**零重编码**，12 集 ~3.4GB 合流只花 8 秒
- `-movflags +faststart`：moov 移到文件头，**手机端秒开**

合流成功 → `os.remove` 中间 m4s（不然占双倍盘）；失败 → 保留 m4s 给下次续传。

---

## 17.11 Step 8：收尾（不写 cron）

```
✓ 12/12 episodes done in 412s
✓ Speed: 8.5MB/s avg
```

下完即停。看完即删 mp4——这是"个人离线观看"的应有之义。

> ⚠️ **不要写 cron 自动追番**：① 番剧更新有节奏，机器自动追的话很容易把"还没买"那集也下了；② B 站对单 IP 高频 playurl 调用敏感；③ "我每周登一次手动跑一下"是更安全的姿势。**这是这条 case 能合规公开的关键边界**。

---

## 17.12 实战：让 GA 读本章并跑一次

把本章 Markdown 喂给 GA，给它**最朴素的口语化 prompt**：

```text
请你帮我下载b站最高画质的视频，我已经chrome登录了b站的tab，
用你内置的web能力，可以结合 js-reverse 帮我下载正相反的你与我 12集的视频到本地，
我要飞机上看。不要给我的vpn弄崩，你可以分chunk分集并行下载。
```

**78 个字**，包含了所有约束（最高画质 / 借 chrome 登录态 / 12 集 / 不弄崩 vpn / 分 chunk + 分集并行）。GA 应该自己拆出**找 tab → 取分集 → 拿 DASH → 落 JSON → 写 download.py → 双层并发 → ffmpeg 合流 → 收尾**整整 8 步。

实跑结果（2026-04-23）：

| 指标 | 值 |
|---|---|
| 集数 | 12 集 |
| 总大小 | 3.42 GB |
| 总耗时 | 412 秒 |
| 平均速度 | 8.5 MB/s |
| 主备切换 | 0 次（PCDN 全程稳） |
| 断点续传次数 | 3 次（VPN 重连 / 路由器重启 / 合上电脑续传） |

### 将经验沉淀为 SOP

跑通后告诉 GA：

```
你：刚才"B 站最高画质 12 集离线"的流程跑通了，请把经验整理成 SOP，
    保存到 memory 目录里。
```

GA 会自动把「`qn=120` + `fnval=4048` 组合 / 双层 ThreadPool / 8MB chunk / `-c copy +faststart`」一起写入 SOP，下次同样的需求直接复用。

---

## 17.13 避坑指南

### 🚫 绝对禁止的操作

| 操作 | 后果 | 替代方案 |
|---|---|---|
| 导出 cookies.txt 给 yt-dlp | 一旦泄漏不可控 | `web_execute_js` 内 fetch，cookie 不出浏览器 |
| 12 集全并发 | PCDN 503 + VPN 转圈 | **全局 2 集 + 集内 v/a 并发** |
| `open(dest, 'wb')` 续传 | 清空已下载部分 | **必须 `'ab'`** append 模式 |
| 合流后不 `+faststart` | 手机端要等下载完才能播 | `-movflags +faststart` 必加 |
| 写 cron 自动追番 | 会把"还没买"那集也下 | 一次性任务，**不留 cron** |

### 💡 实用技巧

1. **Referer 必填**：B 站 CDN 不给 Referer 的请求一律 403。Python 端 `headers={'Referer': 'https://www.bilibili.com/'}` 不能省。
2. **PCDN 主备切换是必须的**：`video_url`（PCDN）偶发 403/503；`video_backup`（官方 CDN）兜底。**没主备切换整个流程会断在第 3 集**。
3. **`-c copy` 零重编码**：12 集 ~3.4GB 合流 8 秒。**重编码会让合流阶段比下载还久**。
4. **触类旁通**：YouTube 私有 playlist / 内部会议录像 / OBS 切片——下载策略（小 chunk + 主备切换 + 双层并发 + ffmpeg `-c copy`）几乎不变。

---

## 17.14 本章小结

| 核心概念 | 说明 |
|---|---|
| 借登录态 | `web_execute_js` 在已登录 tab 内 fetch，cookie 永远不出浏览器 |
| 八步流程 | 找 tab → 取分集 → DASH 主备 → 落 JSON → 写 download.py → 双层并发 → ffmpeg 合流 → 收尾 |
| 双层并发 | 全局 N 集（VPN 友好甜区 N=2）+ 集内音视频并发 |
| HTTP Range 续传 | 8MB chunk + `'ab'` append + 5 次重试 + 主备切换 |
| 零重编码合流 | `-c copy -movflags +faststart`，手机端秒开 |
| 不写 cron | 一次性任务，下完即停，看完即删 |

> 🎓 **三个"借力"姿势**：本案例集到这里，三条 case 共同教会你 GA 工作流里最重要的三种姿势：
>
> 1. **借浏览器的登录态**（case1 / case2 / case3 都用）—— cookie 永远不出 Chrome
> 2. **借浏览器的 fetch**（case3 重点）—— 不写 wbi_sign，不动 js-reverse
> 3. **借本地的 ffmpeg / ThreadPool / rapidocr**（case3 / case1）—— 把网络上拿到的素材拼成本地能用的成品
>
> **抽象层在 prompt，不在代码**——这是整个案例集想反复讲的一句话。

---

## 📎 给"模型能力一般"的读者

如果你的 GA 装的是中小模型，仅凭一句 78 字的 prompt 它可能拆不出"探测 / 取 URL / 并发下载 / 合流"四件事。去看 [`sop/bili_bangumi_download.md`](./sop/bili_bangumi_download.md)：

- **链路一图** + **12 条踩过的避坑** + **凭证 / 工具索引** + **实战参考**
- 末尾附**完整的「润色后 prompt」**——把全部约束写明，直接复制粘贴给 GA。

如果遇到 wbi_sign 真的拦住的反爬场景（本 case 没用上但作为兜底），去看 [`sop/js-reverse/SKILL.md`](./sop/js-reverse/)——6 阶段协议（Observe → Capture → Rebuild → Patch → Extract → Port）反推签名链路。
