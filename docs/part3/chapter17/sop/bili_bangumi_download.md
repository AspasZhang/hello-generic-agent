# 登录态视频离线 SOP（hello-ga case3）

> **场景**：用户登录态下抓任意付费 / 大会员视频流到本地——本案以 B 站番剧为例，触类旁通到 YouTube 私有 playlist / 内部会议录像 / 自录播客切片。
> **验收**：① `./all_episodes.json` 12 集元数据齐全（DASH 主备 URL + 大小） ② 12 个 `*.mp4` 成片（h264 + AAC，`+faststart` 手机端秒开） ③ `./download.log` 速度 / 续传 / 切备份次数 ④ **不写 cron**——一次性任务。

---

## 链路一图

```
web_tabs → 找已登录 B 站 tab
    ↓
web_execute_js (credentials:'include')   ← cookie 不出浏览器
    ↓
└─ /pgc/view/web/season?season_id=ss129142   全集列表 (ep_id + cid)
└─ /pgc/player/web/playurl?qn=120&fnval=4048&ep_id=...&cid=...   DASH 主备
    ↓
all_episodes.json [{title,ep_id,video_url,video_backup,audio_url,audio_backup,...}]
    ↓
download.py（独立 Python，不在 GA 内）
    ↓
ThreadPoolExecutor(max_workers=2)   ← 全局 2 集并发（VPN 友好）
    │
    └─ download_episode(ep)
         ↓
         ThreadPoolExecutor(max_workers=2)   ← 集内 v + a 并发
              ├─ download(video_url, video_backup, .video.m4s)   8MB chunk + Range 续传
              └─ download(audio_url, audio_backup, .audio.m4s)
              ↓
              ffmpeg -c copy -movflags +faststart   ← 零重编码合流
              ↓
         01_<title>.mp4 ... 12_<title>.mp4
    ↓
download.log（耗时 / 速度 / 失败 / 续传 / 主备切换）
```

---

## 关键避坑（每条都被踩过）

1. **借登录态 ≠ 偷 cookie**：`web_execute_js` 在已登录 tab 内 fetch，**Python 端永远不知道 cookie 长啥样**。比"导 cookies.txt 给 yt-dlp"干净三个量级——你登出后流程立刻失效，不会有泄漏点。
2. **DASH 而不是 FLV**：`fnval=4048` 走 DASH 流（视频 + 音频分开 m4s），`fnval=0` 走 FLV（一体）。**B 站 1080P+ 大部分只发 DASH**——拿 FLV 走兜底画质（最高 720P）。
3. **qn=120 是大会员 1080P 60fps**：低账号会自动降级到 80（1080P）。GA 不需要主动判断，**直接传 120 让后端降**——返回 `quality` 字段就是真实画质。
4. **PCDN 主备切换是必须的**：`video_url` 是 PCDN（带 `mountaintoys.cn` / `mcdn` 字样），偶发 403/503；`video_backup` 是 B 站官方 CDN（`upos-sz-mirror*.bilivideo.com`），稳但带宽小。**没主备切换整个流程会断在第 3 集**。
5. **VPN 友好的并发是踩出来的**：第一版 12 集并发 → PCDN 503 + VPN 转圈。改"全局 2 集 + 集内音视频并发"后，CPU/网卡都没拉满但全程不抖。**慢 30 秒胜过崩盘 30 分钟**。
6. **8MB chunk + Range 续传**：太小连接开销吃满；太大失败重传成本高；8MB 是甜区。`open(dest, 'ab')` **必须 'ab' 不是 'wb'**——后者会清空已下载部分。
7. **Referer 必填**：B 站 CDN 不给 Referer 的请求一律 403。Python 端 `headers={'Referer': 'https://www.bilibili.com/'}` 不能省。
8. **DASH 必须合流**：B 站最高画质是 DASH（视频 m4s + 音频 m4s 分开），不合流播放器只放视频没声音。`ffmpeg -c copy -movflags +faststart` 12 集 ~3.4GB 合流 8 秒。
9. **`+faststart` 让手机端秒开**：moov 移到文件头，**没这个手机端要等下载完才能播**。
10. **失败保留 m4s 给下次续传**：合流失败 → 保留中间 .m4s（下次还能从断点续）。合流成功 → 立即 `os.remove` 中间件（不然 12 集 ~3.4GB 占双倍盘）。
11. **不要写 cron**：本 case 是一次性任务。
    - 番剧更新有节奏，机器自动追的话很容易把"还没买"那集也下了；
    - B 站对单 IP 高频 playurl 调用敏感；
    - "我每周登一次手动跑"是更安全的姿势。
12. **可触类旁通**：把"B 站 12 集"换成"YouTube 私有 playlist" / "内部会议录像" / "自己 OBS 录的 12 段切片" —— 下载策略（小 chunk + 主备切换 + 双层并发 + ffmpeg `-c copy`）几乎不变。

---

## 凭证 / 工具索引

| 能力 | 入口 | 备注 |
|---|---|---|
| 浏览器复用 | GA 内置 `web_execute_js` / `web_tabs` | 走 TMWebDriver |
| 反爬兜底 | `memory/js-reverse/SKILL.md` | 当 wbi/sign 真的拦住时再用，本 case 没用上 |
| 分块并行下载 | `skills/chunked_parallel_download.md` | 完整脚本 `assets/download_reference.py` |
| 合流 | `skills/ffmpeg_local_pipeline.md` 的 `-c copy +faststart` | 零重编码 |
| ffmpeg 二进制 | xiezuo / 系统自带 / portable 都行 | 路径写死成常量 |

---

## 实战参考

- **2026-04-23**：本 case 首次跑通——下载《正相反的你与我》12 集，总 ~3.4GB，全局 2 集并发 + 集内 v/a 并发，412 秒完成（平均 8.5 MB/s），主备切换 0 次（PCDN 全程稳）。完整脚本 `assets/download_reference.py`（166 行）。
- **2026-05-08+**：飞机 5 小时空白时长被填满 ✈️。

---

## 给"模型能力一般"的读者：润色后 prompt（可直接复制）

如果你的 GA 装的是中小模型，仅凭一句"下载正相反的你"它可能拆不出"探测 / 取 URL / 并发下载 / 合流"四件事。下面这段是把全部约束写明的版本，**直接粘贴**：

```text
请你帮我下载 B 站最高画质的视频，我已经在 Chrome 里登录了 B 站。
用你内置的 web 能力（web_setup_sop / tmwebdriver_sop / web_execute_js），
可以结合 js-reverse 帮我下载《正相反的你与我》12 集到本地，
我要飞机上看。不要把我的 VPN 弄崩，请你分 chunk、分集并行下载。

具体步骤：
1) 在我已登录的 Chrome 里让 B 站 tab 是 active；如果当前没打开番剧，直接 ask_user
   要番剧的 ss 号 / 任意一集的 BV 号，不要"猜"；
2) 通过 web_execute_js 调 /pgc/view/web/season?season_id=... 拿到全部分集列表
   （ep_id / title / cid 一个不漏）；
3) 对每一集调 /pgc/player/web/playurl?...&qn=120&fnval=4048（最高画质 / DASH 音视频分流），
   解析出 video_url + video_backup（PCDN 主备）和 audio_url + audio_backup；
4) 落盘 ./all_episodes.json，结构 {episodes:[{title, ep_id, video_url, video_backup,
   video_size, audio_url, audio_backup, audio_size, ...}, ...]}；
5) 写一份独立 download.py：
   - 单集内部「视频 + 音频」并行下载（2 个线程）；
   - 全局「2 集」并行（避免 PCDN 被打满 + 不要把 VPN 弄崩）；
   - 每个文件用 HTTP Range 8MB chunk 断点续传，主链接挂掉切 backup_url，重试 5 次；
   - 下完用本地 ffmpeg `-c copy -movflags +faststart` 合流，不重编码；
   - 合流成功 → rm 中间 m4s；失败 → 保留 m4s 给下次续传；
6) `python download.py` 跑完后给我一份 download.log 和 12 个 *.mp4，
   命名格式 `01_<剧情名>.mp4` ... `12_<剧情名>.mp4`。

硬约束：
- 不导出我的 cookie（用 web_execute_js 内部 fetch，不要 copy 到 Python）；
- 不写"批量爬取榜单 / 自动签到 / 下载非我已购买内容"的流程；
- 单文件下载速度限制别贪——每个 chunk 8 MB、单视频 ≤ 1.5 MB/s；
- 下完即停，不要写 cron，**这是一次性任务**。
```
