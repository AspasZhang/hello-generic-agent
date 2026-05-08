# Skill 速查卡 · Discourse 论坛用户 dump

> GA 主仓位置：`memory/discourse_shot.py`（脚本即文档）。
> 一句话：**Discourse 引擎站点（LinuxDo / Meta Discourse / Hacker News-like）开放完整用户 JSON——三个端点拿全你的发言、点赞、阅读时长**。

---

## 三个核心端点（Discourse 通用，无需登录）

| 端点 | 拿什么 |
|---|---|
| `/u/{username}.json` | 用户基础：注册时间、TL、profile bio、关联 socials、可见统计 |
| `/u/{username}/summary.json` | 总结面板：top topics（自创）/ top replies / top replied to / 最常浏览板块 |
| `/u/{username}/activity.json?offset=0` | 活动流：每条 action（话题 / 回帖 / 点赞）+ 时间戳；可翻页 |

> 还有 `/u/{username}/user_actions.json?filter=15` 拿"获赞"详情，`filter` 不同值对应不同 action 类型。

---

## 极简调用（Python `requests`）

```python
import requests, time
HOST = "https://linux.do"
H = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}

def fetch_user(name):
    base = requests.get(f"{HOST}/u/{name}.json", headers=H).json()
    summ = requests.get(f"{HOST}/u/{name}/summary.json", headers=H).json()
    acts = []; offset = 0
    while True:
        r = requests.get(f"{HOST}/u/{name}/activity.json?offset={offset}",
                         headers=H, timeout=15).json()
        page = r.get("user_actions", [])
        if not page: break
        acts.extend(page)
        if len(page) < 30: break
        offset += 30
        time.sleep(0.5)         # 礼貌限速
    return {"profile": base["user"], "summary": summ["user_summary"], "actions": acts}

dump = fetch_user("virtual_panda")
```

---

## 字段映射（case2 用得上的）

```
profile.user.created_at          → 注册时间
profile.user.trust_level          → TL（0~4）
profile.user.likes_received       → 收到赞
profile.user.likes_given          → 给出赞
profile.user.post_count           → 回帖数
profile.user.topic_count          → 主题数
profile.user.time_read            → 阅读时长（秒，case2 转小时）
profile.user.recent_time_read     → 近 60 天阅读
profile.user.days_visited         → 在线天数
profile.user.posts_read_count     → 已读帖

summary.user_summary.most_replied_to_users  → 最常对谈的人
summary.user_summary.top_categories         → 偏好板块（id + topic_count + post_count）
summary.user_summary.topics                  → 自创主题前 N（带 reply_count / like_count / views）
```

---

## 在本案例集出现的位置

- **case2 · 自我画像**：拿 `topics` Top N 做主题指纹；拿 `time_read / posts_read_count` 做"潜水深度"；拿 `likes_received / likes_given` 比值做"质量型 vs 互动型"判读

---

## 注意事项

- **匿名 token 即可**：上面端点全部不要登录态，礼貌 0.5–1s 间隔即可
- **Cloudflare**：偶发 challenge → 改用浏览器内 `web_execute_js fetch(..., {credentials:'include'})`
- **大量 actions**：用户活跃度极高时 actions 可能上千条 → 按需 cap 到最近 N=200
- **隐私**：summary 里有"最常对谈"会暴露关系网；做*他人*画像时务必脱敏
