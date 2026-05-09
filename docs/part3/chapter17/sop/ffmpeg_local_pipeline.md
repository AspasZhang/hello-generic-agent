# Skill 速查卡 · 本地视频流水线（xiezuo ffmpeg 受限版）

> 灵感来源：case3 全程踩坑总结。GA 主仓尚未单列 SOP 文件，本卡即为"事实标准"。
> 一句话：**当 ffmpeg 缺 libx264 / drawtext / png decoder 时，把"渲染帧"全部交给 PIL+cv2，ffmpeg 只做 concat + 混音**。

---

## 适用场景

- 30–60 秒成片：分镜 → 关键帧 → 运镜 → 字幕烧入 → BGM 混音
- xiezuo / 部分 portable ffmpeg 编解码器残缺
- 想离线 / cron 跑（不依赖剪辑软件）

## 全管线总览（case3 实战）

```
storyboard.md            ← LLM 写
   │
   ▼
image_gen_api × 8        ← GPT /v1/responses，medium 1536×1024
   │
   ├─→ frames/shot_NN.png
   │
   ▼
PIL 渲染字幕 PNG × 8       ← YaHei Bold 52px + 4px stroke
   │
   ▼
cv2.VideoWriter × 8        ← Ken Burns 运镜 + 字幕 alpha overlay → clips/clip_NN.mp4
   │
   ▼
ffmpeg concat demuxer      ← -c copy 零重编码 → final_silent.mp4
                                                ▲
mmx music generate (BGM)  ─────────────────────┘
   │
   ▼
ffmpeg amix + afade + h264_mf  ← BGM 淡入淡出 + AAC 192k → final.mp4
```

---

## 关键代码片段

### Ken Burns + 字幕烧入（cv2.VideoWriter，绕开 ffmpeg）

```python
import cv2, numpy as np
from PIL import Image

def lerp(a,b,t): return a + (b-a)*t
def ease_in_out(t): return t*t*(3-2*t)

def render_clip(src_png, sub_png, out_mp4, duration=4.5, fps=24,
                zoom=(1.00,1.08), pan=(0,30), W=1920, H=1080):
    src = cv2.imread(src_png)
    src = cv2.resize(src, (W, H), interpolation=cv2.INTER_LANCZOS4)
    sub = np.array(Image.open(sub_png).convert("RGBA"))    # 字幕 PNG（带 alpha）
    n = int(duration * fps)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')               # 不依赖 libx264
    vw = cv2.VideoWriter(out_mp4, fourcc, fps, (W, H))
    cx, cy = W//2, H//2
    for i in range(n):
        t = ease_in_out(i / max(n-1, 1))
        z = lerp(*zoom, t)
        x = lerp(0, pan[0], t); y = lerp(0, pan[1], t)
        M = cv2.getRotationMatrix2D((cx, cy), 0, z); M[0,2]+=x; M[1,2]+=y
        frame = cv2.warpAffine(src, M, (W, H))
        # 字幕 alpha overlay
        alpha = sub[..., 3:4] / 255.0
        frame = (frame * (1-alpha) + sub[..., :3][..., ::-1] * alpha).astype('uint8')
        vw.write(frame)
    vw.release()
```

### concat demuxer（最快拼接，零重编码）

```bash
# _list.txt（每行一段）
file 'clips/clip_01.mp4'
file 'clips/clip_02.mp4'
...

ffmpeg -y -f concat -safe 0 -i _list.txt -c copy final_silent.mp4
```

> 前提：每段 mp4 的 codec / fps / 尺寸严格一致——所以 `cv2.VideoWriter` 的参数都要写死成常量。

### BGM 混音 + h264_mf 编码

```bash
ffmpeg -y -i final_silent.mp4 -i audio/bgm.mp3 \
  -filter_complex "[1:a]atrim=0:36,afade=t=in:st=0:d=1.5,afade=t=out:st=34:d=2,volume=0.55[bgm]" \
  -map 0:v -map "[bgm]" -c:v copy -c:a aac -b:a 192k -shortest final.mp4
```

> 视频 `-c:v copy` 不重编码；只有当字幕 / 滤镜真要烧进视频流再上 `h264_mf`（Windows 硬编码器，xiezuo ffmpeg 自带）。

---

## 必踩坑（按踩坑顺序）

1. **`-vf drawtext` 不存在** → PIL 渲染字幕成 PNG，cv2 alpha overlay
2. **`-loop 1 -i shot.png` 报 `No such PNG decoder`** → 别让 ffmpeg 解 PNG，cv2 自己读
3. **`ffprobe` 不存在** → 用 `ffmpeg -i file.mp4` 看 stderr 替代
4. **每段编码参数不一致 → concat 出鬼畜画面** → 编码器 / fps / 尺寸全写死成常量
5. **没设 `-shortest`** → BGM 比视频长会拖出黑场
6. **`mmx music` 必须有 `MINIMAX_API_KEY` 环境变量** → 从 `global_mem.txt` `[LLM_APIS]` 取
7. **`mmx music` 子命令是 `generate` 不是 `gen`**；模型名必须是 `music-2.6`，旧名 `music-01` 报 2061
8. **moderation 拒图时 `output_tokens=0` 静默** → 改 prompt 泛化（去名人 / 品牌 / 暴力词）

## 在本案例集出现的位置

- **case3 全程**：分镜 → 8 帧 → 8 段 → concat → BGM 混音 → final.mp4（36 s · 1080p · 33.5 MB）
- 顶层 **`assets/hello_ga_intro.mp4`**：30 秒片头同样走这条管线 + edge-tts 中文旁白
