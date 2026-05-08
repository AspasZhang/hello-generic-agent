# Case 2 · skills 索引

> 通用工具（`web_scan` / `web_execute_js` / `web_tabs` / `web_cdp`）是 GA 默认能力，
> 不在本目录单独建卡——见 `case2-social-persona-self/index.md` 的「用到的能力」段。
>
> HTML 视觉走 GA 主仓的 [`memory/frontend-design/SKILL.md`](file:///D:/GenericAgent/memory/frontend-design/SKILL.md)
> ——本 case 不重新打包，直接引用。

---

## 本 case 专属

| 文件 | 用在 case2 哪一步 |
|---|---|
| [`discourse_shot.md`](./discourse_shot.md) | LinuxDo / Meta 类 Discourse 站点的三联端点（`/u/{u}.json + /summary.json + /activity.json`）一把抓 |
| [`dossier_dual_render.md`](./dossier_dual_render.md) | JSON 中间态 → MD + HTML 双格式同源渲染；加 PDF/PPT 只多一个分支 |

---

## 一张图说明

```
GA 内置 web_*  ─►  枚举已登录 tab + 各平台个人页字段抓取
                                     │
                  ┌──────────────────┤
                  ▼                  ▼
           各平台公开 API     discourse_shot（论坛通用）
                  │                  │
                  └────────┬─────────┘
                           ▼
                各平台 raw_*.json + content.txt
                           │
                           ▼
                reasoning 模型 JSON-mode 蒸馏
                           │
                           ▼
                dossier_intermediate.json
                           │
                  dossier_dual_render
                  ┌────────┴─────────┐
                  ▼                  ▼
           render_md           render_html (frontend-design)
                  │                  │
                  ▼                  ▼
            快速版.md          深度版.html
```

> 两张专属卡 + GA 默认能力 + frontend-design 引用 = "从我已登录的浏览器到一份能裱起来的档案"的最小工具集。
