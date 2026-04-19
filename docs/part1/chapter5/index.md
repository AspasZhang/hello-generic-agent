# 第 5 章 聊天平台接入

> **学完本章，你可以把 GA 接入微信、飞书、钉钉等聊天平台，随时随地用手机给 Agent 下任务。**

## 🎯 学习目标

1. 理解为什么要把 GA 接入聊天平台，以及支持哪些平台
2. 完成至少一个平台的 Bot 接入，让 GA 能在聊天窗口中回复消息
3. 掌握多平台并行运行的方法

---

## 5.1 为什么要接入 Bot

GA 默认通过本地窗口交互。这种方式要求你必须守在电脑前。把它接入聊天平台后，我们可以获得几个明显好处：

- **随时可用**：打开聊天框就能开始交互，不必一直守在终端前
- **手机可用**：在外面也能继续下发任务、查看状态
- **融入工作流**：很多信息本来就在聊天中产生，Bot 接入后可直接嵌入沟通场景
- **降低门槛**：非技术用户也能通过熟悉的聊天界面使用 Agent

---

## 5.2 支持的平台一览

| 平台       | 启动文件                     | 核心依赖                       | 配置项（`mykey.py`）                             |
| ---------- | ---------------------------- | ------------------------------ | -------------------------------------------------- |
| 微信个人号 | `frontends/wechatapp.py`   | requests, qrcode, pycryptodome | `wxbot`                                          |
| 飞书       | `frontends/fsapp.py`       | lark-oapi                      | `fs_app_id`, `fs_app_secret`                   |
| 钉钉       | `frontends/dingtalkapp.py` | dingtalk-stream                | `dingtalk_client_id`, `dingtalk_client_secret` |
| QQ 机器人  | `frontends/qqapp.py`       | qq-botpy                       | `qq_app_id`, `qq_app_secret`                   |
| Telegram   | `frontends/tgapp.py`       | python-telegram-bot            | `tg_bot_token`                                   |
| 企业微信   | `frontends/wecomapp.py`    | wecom-aibot-sdk                | `wecom_bot_id`, `wecom_secret`                 |

> 💡 所有平台的接入流程遵循相同模式：**安装依赖 → 在对应平台创建应用 → 获取密钥填入 `mykey.py` → 启动对应的 `app.py`**。选择你最常用的平台，跟着下面的指引操作即可。

---

## 5.3 微信个人号接入

微信是最常见的使用场景，我们提供两种接入方式。

### 方法一：让 GA 自己搞定（推荐）

不想手动操作？直接在 GA 对话窗口中输入一句话：

```
查看frontend/wechatapp.py，帮我接入微信 bot，最后记得生成一个二维码让我登录
```

GA 会自动完成依赖安装和启动流程，你只需在最后扫码即可。

<table><tr>
<td><img src="./images/img_3.png" width="100%"></td>
<td><img src="./images/img_4.jpg" width="100%"></td>
</tr></table>

<table><tr>
<td><img src="./images/img_5.png" width="100%"></td>
<td><img src="./images/img_6.png" width="100%"></td>
</tr></table>

扫码后，终端显示连接成功，你就可以在微信中和 GA 对话了。

<table><tr>
<td><img src="./images/img_1.png" width="100%"></td>
<td><img src="./images/img_2.png" width="100%"></td>
</tr></table>

<details>
<summary><strong>方法二：手动接入</strong></summary>

**第 1 步：安装依赖**

```bash
pip install pycryptodome qrcode requests
```

**第 2 步：启动微信前端**

```bash
cd /path/to/GenericAgent/frontends   # 替换为你本地的 frontends 目录
python wechatapp.py
```

**第 3 步：扫码登录**

启动后会自动弹出二维码，用微信扫码即可连接。

<details>
<summary>❓ 没有弹出二维码？</summary>

打开一个新的终端窗口，手动查看二维码图片：

```bash
open ~/.wxbot/wx_qr.png
```

如果显示二维码过期，重新运行 `python wechatapp.py` 即可。

</details>

**第 4 步：确认连接成功**

扫码后，终端显示连接成功，你就可以在微信中和 GA 对话了。

<table><tr>
<td><img src="./images/img_1.png" width="100%"></td>
<td><img src="./images/img_2.png" width="100%"></td>
</tr></table>

</details>

---

## 5.4 其他平台接入

以下平台的接入流程已折叠，点击展开你需要的平台即可。

<details>
<summary><strong>📘 飞书接入指引</strong></summary>

### 安装依赖

```bash
pip install lark-oapi python-socks
```

### 创建飞书应用

1. 打开 [飞书开放平台](https://open.feishu.cn/)，登录账号

<table><tr>
<td><img src="./images/img_7.png" width="100%"></td>
<td><img src="./images/img_8.png" width="100%"></td>
</tr></table>

2. 点击「创建企业自建应用」，填写应用信息：
   - 应用名称：`我的Agent助手`（可自定义）
   - 应用描述：`个人AI助手`
   - 应用图标：可选

<table><tr>
<td><img src="./images/img_9.png" width="100%"></td>
<td><img src="./images/img_10.png" width="100%"></td>
</tr></table>

3. 进入应用详情页，左侧菜单选择「添加应用能力」→ 找到「机器人」→ 点击「添加」
4. 左侧菜单「权限管理」→「开通权限」，搜索并开通以下权限：

   - `im:message` — 获取与发送单聊、群组消息
   - `im:message:send_as_bot` — 以应用身份发送消息
   - `contact:user.id:readonly` — 获取用户 ID
   - `im:message.p2p_msg:readonly`

<table><tr>
<td><img src="./images/img_11.png" width="100%"></td>
<td><img src="./images/img_12.png" width="100%"></td>
</tr></table>

### 获取密钥并配置

5. 左侧菜单「凭证与基础信息」，记录 **App ID** 和 **App Secret**

![](./images/img_13.png)

6. 在 `mykey.py` 中填入：

```python
fs_app_id = 'cli_xxxx'           # 替换为你的 App ID
fs_app_secret = 'xxxxxxx'        # 替换为你的 App Secret
fs_allowed_users = [""]           # 空列表表示允许所有用户
```

![](./images/img_14.png)

### 启动服务

7. 启动飞书前端，看到「等待消息…」表示服务已就绪：

```bash
cd /path/to/GenericAgent/frontends
python fsapp.py
```

![](./images/img_15.png)

### 配置事件订阅

8. 回到飞书开放平台的应用配置页面：
   - 点击「回调配置」→ 订阅方式选择「**使用长连接接收事件**」
   - 点击「事件配置」→ 同样选择「**长连接**」→ 点击「添加事件」→ 搜索添加 `im.message.receive_v1`

<table><tr>
<td><img src="./images/img_16.png" width="100%"></td>
<td><img src="./images/img_17.png" width="100%"></td>
<td><img src="./images/img_18.png" width="100%"></td>
</tr></table>

### 发布应用

9. 填写版本信息 → 保存 → 确认发布

<table><tr>
<td><img src="./images/img_19.png" width="100%"></td>
<td><img src="./images/img_20.png" width="100%"></td>
<td><img src="./images/img_21.png" width="100%"></td>
</tr></table>

### 开始对话

10. 下载 [飞书客户端](https://www.feishu.cn/download)，登录后搜索你的 Agent 名称，即可开始对话

<table><tr>
<td>
<img src="./images/img_22.png" width="100%"><br>
<em>搜索框搜索你建立的个人助手名字</em>
</td>
<td>
<img src="./images/img_23.png" width="100%"><br>
<em>在对话框中输入问题，手机版飞书也能继续对话</em>
</td>
</tr></table>

</details>

<details>
<summary><strong>📙 钉钉接入指引</strong></summary>

### 安装依赖

```bash
pip install dingtalk-stream
```

### 创建钉钉应用

1. 登录 [钉钉开发者后台](https://open.dingtalk.com/)（需**企业管理员账号**）
2. 进入 **应用开发 → 企业内部应用 → 钉钉应用 → 创建应用**，填写应用名称、描述、图标

<table><tr>
<td><img src="./images/img_24.png" width="100%"></td>
<td><img src="./images/img_25.jpg" width="100%"></td>
</tr></table>

### 获取密钥并配置

3. 左侧菜单「基础信息 → 凭证与基础信息」，找到：

   - **Client ID** = AppKey（公开标识）
   - **Client Secret** = AppSecret（私密密钥）
4. 在 `mykey.py` 中填入上述 ID 和 Secret

<table><tr>
<td><img src="./images/img_26.jpg" width="100%"></td>
<td><img src="./images/img_27.png" width="100%"></td>
</tr></table>

### 添加机器人能力

5. 应用详情 → **应用能力 → 添加应用能力 → 机器人**

![](./images/img_28.jpg)

6. 配置机器人信息，底部**消息接收模式**选择 **Stream 模式**（流式接收）

![](./images/img_29.jpg)

### 发布并启动

7. **应用发布 → 版本管理与发布 → 创建新版本 → 发布**，等待审批通过

![](./images/img_30.jpg)

8. 启动钉钉前端：

```bash
cd /path/to/GenericAgent/frontends
python dingtalkapp.py
```

9. 在钉钉客户端搜索 Agent 名称，即可开始对话

</details>

<details>
<summary><strong>📗 QQ 机器人接入指引</strong></summary>

### 安装依赖

```bash
pip install qq-botpy
```

### 创建 QQ 机器人

1. 打开 [QQ 开放平台](https://q.qq.com/)，扫码登录 → 选择「机器人」选项

<table><tr>
<td><img src="./images/img_31.png" width="100%"></td>
<td><img src="./images/img_32.png" width="100%"></td>
</tr></table>

2. 创建机器人

![](./images/img_33.png)

### 获取密钥并配置

3. 获取 **AppID** 和 **AppSecret**（见 step1），QQ 扫码进入机器人对话窗口（见 step2）

![](./images/img_34.png)

4. 在 `mykey.py` 中填入上述 ID 和 Secret

![](./images/img_35.png)

### 启动并对话

5. 启动 QQ 前端：

```bash
cd /path/to/GenericAgent/frontends
python qqapp.py
```

6. 开始对话

![](./images/img_36.jpg)

</details>

<details>
<summary><strong>📕 Telegram 接入指引</strong></summary>

### 安装依赖

```bash
pip install python-telegram-bot
```

### 创建 Telegram Bot

1. 在 Telegram 中搜索 **@BotFather**，发送 `/newbot`
2. 按提示设置 Bot 名称，获取 **Bot Token**

### 配置并启动

3. 在 `mykey.py` 中填入：

```python
tg_bot_token = "1234567890:ABCxxxxxxxxxxxxxxxxxxxxxxxx"
tg_allowed_users = [123456789]    # 你的 Telegram 用户 ID
```

4. 启动 Telegram 前端：

```bash
cd /path/to/GenericAgent/frontends
python tgapp.py
```

5. 在 Telegram 中搜索你的 Bot 名称，开始对话

</details>

<details>
<summary><strong>📓 企业微信接入指引</strong></summary>

### 安装依赖

```bash
pip install wecom_aibot_sdk
```

### 注册与下载

1. 打开 [企业微信官网](https://work.weixin.qq.com/)，注册账户（或登录已有账户），下载桌面端

![](./images/img_37.png)

### 创建智能机器人

2. 登录企业微信客户端，创建智能机器人

<table><tr>
<td><img src="./images/img_38.png" width="100%"></td>
<td><img src="./images/img_39.png" width="100%"></td>
</tr></table>

3. 设置机器人：

   - 选择**手动创建**

   ![](./images/img_40.png)

   - 滑到底部，选择 **API 模式创建**

   ![](./images/img_41.png)

   - 选择**长连接**，获取 **Bot ID** 和 **Secret**

   ![](./images/img_42.png)

### 配置并启动

4. 在 `mykey.py` 中填入上述 Bot ID 和 Secret

![](./images/img_43.png)

5. 启动企业微信前端：

```bash
cd /path/to/GenericAgent/frontends
python wecomapp.py
```

6. 在企业微信中找到你的机器人，开始对话

</details>

---

## 5.5 常见问题

<details>
<summary><strong>Q1：关闭 GenericAgent 窗口会影响 Bot 连接吗？</strong></summary>

**不影响。** 用户启动的是对应平台的 `app.py`（如 `wechatapp.py`），它是独立进程，关闭 GenericAgent 窗口不会中断连接。

</details>

<details>
<summary><strong>Q2：怎么关闭 Bot 连接？</strong></summary>

在运行 `app.py` 的终端中按 `Ctrl + C` 即可中断连接。中断期间发出的消息不会丢失——重新运行 `python wechatapp.py` 后，会按顺序回复中断期间收到的消息。

</details>

<details>
<summary><strong>Q3：多个平台可以同时运行吗？</strong></summary>

**可以。** 每个平台是独立进程，互不影响。例如同时运行微信和飞书：

```bash
python frontends/wechatapp.py &
python frontends/fsapp.py &
```

</details>

---

<details>
<summary><strong>📂 相关文件速查</strong></summary>

| 文件 / 目录                  | 作用                       |
| ---------------------------- | -------------------------- |
| `frontends/wechatapp.py`   | 微信个人号前端启动脚本     |
| `frontends/fsapp.py`       | 飞书前端启动脚本           |
| `frontends/dingtalkapp.py` | 钉钉前端启动脚本           |
| `frontends/qqapp.py`       | QQ 机器人前端启动脚本      |
| `frontends/tgapp.py`       | Telegram 前端启动脚本      |
| `frontends/wecomapp.py`    | 企业微信前端启动脚本       |
| `mykey.py`                 | 所有平台密钥的统一配置文件 |

</details>

---

## 📝 小结

- **接入流程统一**：安装依赖 → 创建平台应用获取密钥 → 填入 `mykey.py` → 启动 `app.py`
- **推荐从微信开始**：流程最简单，扫码即用，适合快速体验
- **多平台可并行**：每个平台独立进程，互不干扰，按需启用

---

[上一章：第 4 章 记忆与 Skill 系统](../chapter4/) | [下一章：第 6 章 进阶玩法](../chapter6/)
