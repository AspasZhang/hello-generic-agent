# Case 3 · skills 索引

> 通用工具（`web_scan` / `web_execute_js` / `web_tabs`）是 GA 默认能力，
> 不在本目录单独建卡——见 `case3-bili-bangumi-download/index.md` 的「用到的能力」段。
>
> 反爬兜底走 GA 主仓的 [`memory/js-reverse/SKILL.md`](./js-reverse/)
> ——本 case 不重新打包，直接引用（且本案没用上）。

---

## 本 case 专属

| 文件 | 用在 case3 哪一步 |
|---|---|
| [`chunked_parallel_download.md`](./chunked_parallel_download.md) | 8MB chunk + Range 续传 + PCDN 主备切换 + 双层 ThreadPool 并发 |
| [`ffmpeg_local_pipeline.md`](./ffmpeg_local_pipeline.md) | `-c copy -movflags +faststart` 零重编码合流 + 手机端秒开 |

---

## 一张图说明

```
GA 内置 web_*  ─►  借登录态 fetch /pgc/player/web/playurl
                              │
                              ▼
                      all_episodes.json
                              │
                              ▼
                  chunked_parallel_download
                              │
                              ▼
            *_video.m4s + *_audio.m4s（断点续传 + 主备切换）
                              │
                              ▼
                    ffmpeg_local_pipeline (-c copy)
                              │
                              ▼
                          *.mp4 × 12（手机端秒开）
```

> 两张专属卡 + GA 默认能力 = "借浏览器登录态把流媒体拼成本地成品"的最小工具集。
