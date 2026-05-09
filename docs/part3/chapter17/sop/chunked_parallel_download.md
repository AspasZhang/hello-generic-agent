# Skill 速查卡 · 分块并行下载（HTTP Range + 主备切换 + 双层并发）

> 一句话：**8MB chunk + 主备 URL 切换 + 单文件断点续传 + 双层 ThreadPool（全局 N 集 / 单集音视频）= VPN 友好的工业级下载器**。

---

## 设计原则

| 原则 | 为什么 |
|---|---|
| 8MB chunk | 太小：HTTP 连接开销吃满；太大：失败重传成本高；8MB 是甜区 |
| `Range: bytes={existing}-{end}` 续传 | 网络抽风 / VPN 重连后从断点续，不重头 |
| 主链接挂掉切 backup_url | PCDN 经常 503，B 站官方 CDN 是兜底 |
| 全局 ≤ 2 集并发 | 怼太狠 PCDN 拉黑、VPN 转圈 |
| 集内音视频并发 | 单集 audio 12MB / video 280MB，并行省 5 秒/集 |

---

## 极简骨架

```python
import requests, os, time
from concurrent.futures import ThreadPoolExecutor

CHUNK = 8 * 1024 * 1024
MAX_RETRIES = 5
HEADERS = {"User-Agent": "Mozilla/5.0 ... Chrome/...", "Referer": "https://www.bilibili.com/"}

def probe_total(url, backup):
    for u in [url, backup]:
        if not u: continue
        try:
            r = requests.get(u, headers={**HEADERS, "Range": "bytes=0-0"}, timeout=15)
            if r.status_code == 206:
                cr = r.headers.get("Content-Range", "")
                return int(cr.split("/")[-1]), u
        except: pass
    return 0, None

def download(url, backup, dest, label=""):
    existing = os.path.getsize(dest) if os.path.exists(dest) else 0
    total, active = probe_total(url, backup)
    if not active: return False
    if existing >= total > 0: return True

    retries = 0
    with open(dest, "ab") as f:
        while existing < total:
            end = min(existing + CHUNK - 1, total - 1)
            try:
                r = requests.get(active, headers={**HEADERS, "Range": f"bytes={existing}-{end}"},
                                 stream=True, timeout=30)
                if r.status_code not in (200, 206):
                    if backup and active != backup:
                        active = backup; continue
                    return False
                for c in r.iter_content(65536):
                    f.write(c); existing += len(c)
                retries = 0
            except Exception:
                retries += 1
                if retries > MAX_RETRIES: return False
                if backup and active != backup: active = backup
                time.sleep(2)
    return True
```

---

## 双层并发（全局 + 集内）

```python
MAX_EP_PARALLEL = 2

def download_episode(ep):
    with ThreadPoolExecutor(max_workers=2) as pool:    # 集内：v + a 并发
        fv = pool.submit(download, ep["video_url"], ep.get("video_backup"), v_tmp, "v")
        fa = pool.submit(download, ep["audio_url"], ep.get("audio_backup"), a_tmp, "a")
        if not (fv.result() and fa.result()): return False
    return merge_av(v_tmp, a_tmp, output)              # ffmpeg -c copy

# 全局：每批 2 集
for batch in chunks(episodes, MAX_EP_PARALLEL):
    with ThreadPoolExecutor(max_workers=MAX_EP_PARALLEL) as pool:
        for ep in batch: pool.submit(download_episode, ep)
```

---

## ffmpeg 合流（音视频两条流的"最后一公里"）

```bash
ffmpeg -y -i video.m4s -i audio.m4s -c copy -movflags +faststart out.mp4
```

- `-c copy`：零重编码，12 集 ~3.4GB 合流只花 8 秒
- `-movflags +faststart`：moov 移到文件头，**手机端秒开**
- 合成功后 `rm video.m4s audio.m4s`；失败保留中间件给下次续传

---

## 在本案例集出现的位置

- **case3 · B 站番剧 12 集**：完整管线见 `assets/download_reference.py`（166 行）

---

## 适配其他场景

| 场景 | 改法 |
|---|---|
| YouTube 私有 playlist | `web_execute_js` 在已登录 tab 拿到 stream URL → 同样 chunk + ThreadPool |
| 内部会议录像 | 单文件下载用 chunk + Range；省掉 ffmpeg 合流（已是 mp4） |
| 自己录的播客切片 | 把单集音视频并发改成"按章节并发"，逻辑不变 |

## 注意事项

- **Referer 必填**：B 站 CDN 不给 Referer 的请求一律 403
- **chunk 不要贪**：单文件 ≤ 1.5 MB/s 是健康节奏；走 PCDN 容易被瞬时拉黑
- **续传文件指针**：必须 `open(dest, "ab")` 不是 `"wb"`，前者是 append；`"wb"` 会清空已下载部分
- **不要写 cron**：本 skill 是一次性下载用，不为追新订阅而生
