# Case 1 · skills 索引

> 通用工具（`web_scan` / `web_execute_js` / `web_cdp` / `ocr_image`）是 GA 默认能力，
> 不在本目录单独建卡——见 `case1-login-read-comment/index.md` 的「用到的能力」段。

---

## 本 case 专属

| 文件 | 用在 case1 哪一步 |
|---|---|
| [`human_in_loop.md`](./human_in_loop.md) | 发评论前的两次 `ask_user`——这是 case 能合规公开的底线 |

---

## 一张图说明

```
GA 内置 web_*  ─►  抓页面 / 取数 / 走同源 fetch
   │
   ▼
GA 内置 ocr_image  ─►  rapidocr_onnxruntime 验证评论上墙
   │
   ▼
human_in_loop  ─►  ask_user 二次确认 → 才发评论
```

> 一张专属卡叠加上 GA 默认能力 ≈ "GA 在登录态浏览器里安全做事"的最小工具集。
