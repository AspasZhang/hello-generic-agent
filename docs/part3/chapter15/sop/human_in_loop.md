# Skill 速查卡 · Human-in-Loop（ask_user 双确认范式）

> GA 主仓位置：`memory/ask_user_sop.md`（部分约定散落于 `global_mem.txt` `[RULES]`）。
> 一句话：**任何"对外发出去 / 不可撤销"的动作，都必须 ask_user 二次确认**——这是 GA 不会"跑飞"的关键。

---

## 三类强制 ask_user 场景

| 场景 | 例 | 为什么必须 |
|---|---|---|
| 写出去 | 发评论 / 发微博 / 推 PR / 发邮件 / 发飞书消息 | 不可撤销、面向第三方 |
| 写本地高代价 | `rm -rf`、覆写 `~/.ssh/`、删数据库表 | 误操作恢复成本高 |
| 调用付费 API | `/v1/images/generations` 16 张 / 大模型 long context | 直接花钱 |

> **case1 命中第 1 类**：发 B 站评论 → 必须 ask_user 两次（先选风格，再确认内容）。

---

## 双确认范式

```
草稿 N 选 1 → 用户选定 → 二次确认"最终发送『xxx』" → 通过 → 真发送
                       └─ 否 / 都不发 → 直接收尾
```

```python
# 步骤 1：N 选 1 草稿
choice = ask_user(
    candidates=["候选1: 走心版", "候选2: 玩梗版", "候选3: 提问版", "都不发"],
    question="挑一条评论，或者都不发"
)
if choice == "都不发":
    return "user_aborted"

# 步骤 2：二次确认
confirm = ask_user(
    candidates=["确认发送", "改一下", "算了不发"],
    question=f"最终发送『{drafts[choice]}』，确认？"
)
if confirm != "确认发送":
    return "user_aborted"

# 步骤 3：真发送
send_comment(drafts[choice])
```

---

## 反范式（不要这么写）

```python
# ❌ 一次确认就发
draft = llm.write_comment(...)
send_comment(draft)              # 没有任何 ask_user

# ❌ 用 max_retries 假装"安全"
for _ in range(3):
    try: send_comment(...); break
    except: pass                 # 失败就重试 = 把误发当 transient error 处理

# ❌ "保留一个我能 abort 的 5 秒窗口"
print("5 秒后发送，按 Ctrl-C 取消")
time.sleep(5); send_comment(...) # 用户可能根本没盯着
```

---

## 在本案例集出现的位置

- **case1 · 发评论**：草稿 3 选 1 + 最终内容确认
- **case2 · 删除原始抓取数据**：保留 / 删除 二选一
- **case3 · 找不到目标番剧**：让用户给 BV / ss 号，不要"猜"

---

## 注意事项

- **`ask_user` 是阻塞调用**——等 GA 收到答复才往下走，期间不许"猜默认"
- **candidates 必须有"否"分支**——没有"都不发 / 算了 / 跳过"选项的 ask_user 是流氓 ask_user
- **二次确认的文字要包含具体内容**——`"确认？"` 不算确认，`"确认发送『xxx』？"` 才算
- **不要 chain 三层以上**——超过两次确认就该重新设计流程
