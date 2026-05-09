---
name: js-reverse
description: 在使用 MCP 做前端 JavaScript 逆向时使用，适用于签名链路定位、页面观察取证、本地补环境复现、VMP 类插桩分析、AST 去混淆与证据化输出。触发：JS逆向、签名参数、加密参数、补环境、反混淆、Hook注入、request signing、token generation、anti-bot、反爬、h5st、x-bogus。
---

# JS 逆向工程 — GA 作业规范

通过 JSReverser-MCP 连接 Chrome DevTools，结合 GA 本地工具链（TMWebDriver/screen_ocr/ljqCtrl/Playwright），实现签名参数定位、Hook 采样、本地补环境复现、AST 去混淆、VMP 插桩与算法移植全流程。

## 前置条件

JSReverser-MCP 需注册为 MCP 服务器。若 `mcp__js-reverse__check_browser_health` 不可用：
```
claude mcp add -s user js-reverse node <JSREVERSER_MCP_PATH>/build/src/index.js
```
远程调试：Chrome 启动加 `--remote-debugging-port=9222`，设 `REMOTE_DEBUGGING_URL=http://127.0.0.1:9222`。

---

## 任务路由

| 用户要做什么 | 入口 |
|-------------|------|
| "分析这个站" | 快速工作流：一键侦察 → `analyze_target` |
| "参数 X 怎么生成的" | 快速工作流：参数追踪 → 网络→initiator→Hook |
| "反混淆这段代码" | 快速工作流：去混淆 → `deobfuscate_code` |
| "用 Python/Node 复现签名" | 完整六阶段 → 从 Phase 1 开始 |
| "绕过反爬/反bot" | Phase 1-2 侦察 + GA 增强工具（验证码/物理事件） |
| "监控这个页面在干什么" | Phase 1-2 观察+Hook，无需 Rebuild |

---

## 核心原则

1. **Observe-first** — 先观察再行动，不猜环境。跳过观察直接 Hook 会打错函数，浪费整轮调试。
2. **Hook-preferred** — Hook 非阻塞，页面正常运行；断点会暂停执行、触发反调试、断 WebSocket。仅在需要看局部变量且 Hook 无法覆盖时才用断点。
3. **Evidence-first** — 每个补丁必须有代理日志或运行时捕获数据支撑。猜测 `window.xxx` 应该返回什么会导致本地通过但服务端验证失败。
4. **一次一补丁** — 多个问题时只修第一个失败点（first divergence），复跑，确认前移，再修下一个。批量补丁出错后无法定位是哪个补丁的问题。
5. **服务端验证为准** — 本地输出匹配浏览器是必要不充分条件，必须用真实服务器请求验证。

---

## 六阶段工作流

### Phase 1: Observe — 搞清楚目标

目标：确认目标请求、相关脚本、候选函数、触发动作。

步骤：
1. `check_browser_health` 验证连接
2. `new_page`/`navigate_page` 导航到目标页
3. `list_network_requests` 找目标 API（sign/token/_signature/h5st/nonce/x-bogus）
4. `get_request_initiator` 追溯调用栈
5. `search_in_scripts` 定位脚本和函数
6. 设定目标边界：`targetKeywords`、`targetUrlPatterns`、`targetFunctionNames`、`targetActionDescription`

退出条件：能回答 — 谁发起请求、哪个脚本、如何触发。

### Phase 2: Capture — 非侵入式采样

目标：用 Hook 采集参数样例、调用顺序、运行时证据。

步骤：
1. `create_hook`（fetch/xhr/function）+ `inject_hook`
2. 触发业务动作（登录/搜索/下单等）
3. `get_hook_data(summary)` 扫描命中 → `get_hook_data(raw)` 下钻
4. `record_reverse_evidence` 持久化

关键规则：
- **首屏初始化场景**：先 `inject_preload_script` 挂早期采样，再导航页面
- 命中后先看 summary 去噪，再按需看 raw
- Hook 不足时才考虑断点

退出条件：至少一组可复用的运行时样本（输入/输出数据）。

### Phase 3: Rebuild — 导出本地工程

目标：导出 Node 复现工程。

步骤：
1. `export_rebuild_bundle` → 生成 `env/entry.js`、`env/env.js`、`env/polyfills.js`、`env/capture.json`
2. 本地 `node env/entry.js`，观察第一个错误

退出条件：入口可运行，能看到当前失败点。

### Phase 4: Patch — 按日志补环境

目标：迭代补环境直到本地输出通过服务端验证。

**First Divergence 方法**（核心循环）：
1. 跑入口脚本，读代理 env log
2. 找到第一个失败的属性访问/API 调用 = first divergence
3. 只补这一个点（最小因果单元：值 / 函数壳 / 返回对象 / 最小对象契约）
4. 复跑，确认 divergence 前移
5. 重复直到输出一致
6. **真实服务器请求验证**

注意事项：
- 没有代理日志 / 没有 first divergence 记录 → 禁止直接补宿主
- `diff_env_requirements` 仅辅助，不替代代理日志
- 连续 6 个补丁未收敛 → 回浏览器取证（Phase 1-2）

常见补丁项：`navigator`、`webdriver`、`crypto`、`atob/btoa`、`TextEncoder`、`window`、`document`、`location`、`localStorage/sessionStorage`、`fetch/XMLHttpRequest`

退出条件：本地输出通过服务端验证。

### Phase 5: Extract — 提纯算法

目标：将纯算法从环境噪声中分离。

步骤：
1. 区分算法输入 vs 环境状态
2. 提取核心签名/加密逻辑为干净函数
3. 用采样数据创建测试 fixture
4. 验证纯实现与补环境版本输出一致

> 仅出签名可降级；需长期复用算法链路则必须做。

### Phase 6: Port — 迁移到目标语言

目标：重写为 Python/Go/Java 等。

步骤：
1. 逐段移植，用 Node.js fixture 校验中间值
2. 跨语言 test fixture 验证
3. 真实服务器请求验证

---

## 快速工作流

### 一键侦察
```
analyze_target → 查看 requestFingerprints, priorityTargets, signatureChain → 决定下一步
```

### 参数追踪
```
list_network_requests → 找到带目标参数的请求
→ get_request_initiator → 定位源函数
→ search_in_scripts → 读函数代码
→ create_hook + inject_hook → 触发动作 → get_hook_data
→ record_reverse_evidence
```

### 去混淆
```
get_script_source → deobfuscate_code → understand_code → summarize_code
```
深度 AST 去混淆见 `references/cases/case-ast-deobfuscation.md`。

### 复现签名
按完整六阶段执行，不跳步。

---

## 自动化入口剧本

标准序列（每步重试上限 2 次）：

1. `check_browser_health`
2. `new_page` 或 `select_page`（可选 `restore_session_state`）
3. `analyze_target`
4. `search_in_scripts`
5. `list_network_requests` + `get_request_initiator`
6. 首屏场景：先 `inject_preload_script`
7. `record_reverse_evidence`
8. `create_hook` + `inject_hook`
9. 触发动作
10. `get_hook_data(summary)` → 命中后 `get_hook_data(raw)` + `record_reverse_evidence`
11. `export_rebuild_bundle`
12. 本地补环境（Phase 4 循环）

---

## 失败回退

| 症状 | 恢复路径 |
|------|---------|
| Hook 无数据 | 确认动作已执行 → 扩一档范围 → 仍失败则停，不猜 |
| Hook 错过首屏 | 回页面入口，先 `inject_preload_script` 再重试 |
| 数据过多 | summary 去噪 → raw 单条下钻 |
| 补环境不收敛 | 读代理 env log → 确认 first divergence → 回浏览器取证 |
| 连续两轮无进展 | 回 Phase 1-2，补 `record_reverse_evidence` |
| 断点不稳 | 回退 Hook 路径 |

---

## GA 增强工具链

以下工具在 GA 环境下可用，显著扩展逆向能力。

### TMWebDriver — 保留登录态的浏览器控制
JSReverser-MCP 用自管 Puppeteer Chrome；TMWebDriver（`web_scan`/`web_execute_js`）操控用户真实浏览器，保留登录态和 Cookie。

适用场景：
- 需要用户已登录态（不想重新认证）
- 提取 HttpOnly Cookie（CDP 桥：`'{"cmd": "cookies"}'`）
- 操控跨域 iframe
- 文件上传（CDP `DOM.setFileInputFiles`）

### screen_ocr — 验证码识别
目标流程需过验证码时：
1. 截图验证码区域
2. `screenshot_ocr()` 简单验证码 / `vision_llm_ocr()` 复杂验证码（GPT-5.4 vision）
3. 注入识别结果继续流程

### ljqCtrl — 物理键鼠模拟
某些反 bot 系统检查 `isTrusted` 属性，JS 注入的事件会被拒绝。ljqCtrl 发送 OS 级别真实键鼠事件（`isTrusted=true`）。注意先 `activate()` 目标窗口。

### Playwright MCP — 自动化流程模拟
需要同时逆向分析 + 自动化用户流程时，Playwright MCP 提供导航、表单、截图、DOM 操作。与 JSReverser-MCP 互补使用。

---

## 输出契约

完成的逆向任务必须产出：
- 目标接口与签名字段
- 函数路径
- 运行时证据（Hook 记录 + request 关联）
- 输入输出样例
- 补丁日志与回滚步骤
- 置信度与不确定点
- task artifact 路径
- 本地补环境状态（已补/未补）

---

## 参考文档（按需读取）

### 操作参考（`references/`）
| 文件 | 何时读取 |
|------|---------|
| `tool-catalog.md` | 需要完整工具列表和参数默认值 |
| `automation-entry.md` | 开始新任务，需详细入口序列 |
| `mcp-task-template.md` | 设置结构化任务和目标边界 |
| `task-input-template.md` | 定义任务输入（URL/关键词/动作/认证） |
| `env-patching.md` | 补环境规则和常见模式 |
| `node-env-rebuild.md` | Node 扣包复现细节 |
| `local-rebuild.md` | 本地复现项目结构 |
| `instrumentation.md` | VMP 插桩策略 |
| `ast-deobfuscation.md` | AST 去混淆 pass 顺序 |
| `fallbacks.md` | 扩展回退流程 |
| `output-contract.md` | 完整输出格式 |
| `tool-defaults.md` | 工具参数默认值 |
| `task-artifacts.md` | 任务产物目录结构 |

### 案例库（`references/cases/`）
| 文件 | 场景 |
|------|------|
| `case-ast-deobfuscation.md` | AST 去混淆全流程（字符串表/控制流/死代码） |
| `case-signature-node-template.md` | 签名算法 Node 补环境通用模板 |
| `case-window-honeypot.md` | window/navigator 蜜罐检测与补丁 |

### Schema（`references/schemas/`）
- `reverse-task-input.schema.json` — 结构化任务输入 JSON Schema
- `reverse-task-input.example.json` — 脱敏示例

### JSReverser-MCP 仓库文档
路径：`<JSREVERSER_MCP_PATH>/docs/reference/`
- `reverse-workflow.md` / `env-patching.md` / `reverse-task-index.md` / `tool-reference.md` / `reverse-bootstrap.md` / `case-safety-policy.md`
