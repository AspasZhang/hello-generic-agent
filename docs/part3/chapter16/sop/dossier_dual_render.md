# Skill 速查卡 · 同源双渲染（MD + HTML）

> 一句话：**reasoning 模型把蒸馏结果落到一份中间 JSON，再分别渲染成 Markdown 和 HTML——加 PDF/PPT 只需多一个分支**。

---

## 中间态 JSON 骨架（case2 实际用的）

```jsonc
{
  "subject": "@virtual_panda",
  "generated_at": "2026-04-25",
  "identity_matrix": [
    {"platform":"GitHub","handle":"@vp","url":"...","status":"active","persona":"academic"},
    {"platform":"X",     "handle":"@vp","url":"...","status":"new",   "persona":"academic"},
    {"platform":"Forum", "handle":"@nightduck_23","url":"...","status":"active","persona":"wild"}
  ],
  "platforms": {
    "github": {"repos":117,"followers":96,"top_repos":[{"name":"...","stars":700}]},
    "forum":  {"likes_received":2607,"posts":383,"topics":43,"time_read_h":90.2},
    "...": {}
  },
  "big5":  {"openness":9,"conscientiousness":8,"extraversion":6,"agreeableness":7,"neuroticism":3,
            "evidence":{"openness":"117 repos across CV/LLM/...","..." :"..."}},
  "mbti":  {"primary":"INTP-A","near":["ENTP","INTJ"],"reasoning":"..."},
  "values":["效率与自由","教育普惠","工程美学","双线人格"],
  "style": ["结构化标题 emoji","代码即语言","情绪零负向"],
  "blindspots":[{"id":"B1","title":"跨平台割裂","summary":"..."}],
  "next_moves":[{"id":"M1","title":"X 启动","summary":"每周 3 推文..."}],
  "verdict": {"oneliner":"白天是 X，晚上是 Y...","tags":["PhD","INTP-A","Maker"]}
}
```

> **关键**：所有数字、引语、布尔值都先落 JSON，再走渲染——避免在模板里"算来算去"。

---

## Markdown 渲染（给自己看，三分钟）

```python
def render_md(d, out="dossier_quick.md"):
    rows = "\n".join(f"| {p['platform']} | {p['handle']} | {p['url']} | {p['status']} |"
                     for p in d["identity_matrix"])
    big5 = "\n".join(f"| {k} | {v} | {d['big5']['evidence'].get(k,'')} |"
                     for k,v in d["big5"].items() if k!="evidence")
    md = f"""# 🧬 全网社交画像 · {d['subject']}

> 生成时间：{d['generated_at']}

## 一、身份矩阵
| 平台 | handle | 主页 | 状态 |
|---|---|---|---|
{rows}

## 二、性格画像
### 大五人格
| 维度 | 分 | 依据 |
|---|---|---|
{big5}

### MBTI 估值：**{d['mbti']['primary']}**（近邻：{', '.join(d['mbti']['near'])}）

## 三、一句话
> {d['verdict']['oneliner']}
"""
    open(out,"w",encoding="utf-8").write(md)
```

---

## HTML 渲染（给同行看，深色档案风）

```python
TPL = open("templates/dossier.html",encoding="utf-8").read()
html = TPL.format(
    subject=d["subject"],
    persona_a_card=render_persona_card(d, "academic"),     # 暗金色卡片
    persona_b_card=render_persona_card(d, "wild"),          # 粉红色卡片
    big5_radar_svg=render_radar_svg(d["big5"]),             # numpy 算坐标 + 拼 svg
    timeline_dom=render_timeline(d.get("timeline",[])),
    blindspots_block=render_kv_card(d["blindspots"]),
    next_moves_block=render_kv_card(d["next_moves"], color="cyan"),
    verdict_blockquote=d["verdict"]["oneliner"]
)
open("dossier_deep.html","w",encoding="utf-8").write(html)
```

> 模板见 case2 `assets/dossier_demo_reference.html`，可作为 stub 直接改。

---

## 调色板约定（双面档案统一色系）

| 用途 | 色值 | 在哪儿 |
|---|---|---|
| 学术线 / 严肃 | `#e4b363`（暗金） | persona_a_card 左条 / radar polygon / timeline 节点 |
| 江湖线 / 玩梗 | `#ff4d8d`（粉红） | persona_b_card 左条 / wild 章节锚点 |
| 印戳 / 警示 | `#ff4c3b`（朱红） | DOSSIER 印戳 / blindspot 标题 |
| 副信息 / 弱文本 | `#8a8478` | 元信息行 / 副标题 |
| 纸面背景 | `#0b0b10` ~ `#13131a` | body 双层渐变 |

---

## 在本案例集出现的位置

- **case2 · 双格式同源产物**：`全网社交性格分析_快速版.md` + `社交档案_深度版.html`，二者来自同一份中间 JSON
- 未来可加：`dossier.pdf`（用 weasyprint 把 HTML 渲染过去）/ `dossier.pptx`（用 python-pptx 走 ppt 模板）

## 注意事项

- **JSON 是单一真相源**——发现数字不对，改 JSON，**不要去改 MD/HTML**
- **SVG 雷达自己算**——5 维 polygon 坐标 = `(r·sin(θ), -r·cos(θ))`，θ 等分 2π；不需要 d3
- **HTML 字体走 Google Fonts**：Cormorant Garamond + JetBrains Mono + Noto Serif SC，离线可改 `system-ui`
