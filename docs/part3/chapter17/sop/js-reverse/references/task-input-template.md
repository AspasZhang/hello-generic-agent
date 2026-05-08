# 自动化任务输入模板
- 目标 URL
- 目标接口关键字 / `targetUrlPatterns`
- 目标字段 / `targetKeywords`
- 目标函数 / `targetFunctionNames`
- 触发动作 / `targetActionDescription`
- 是否涉及首屏初始化 / 首次请求前逻辑
- 登录要求
- 成功判定
- 目标时间窗
- 超时与重试策略
- 是否允许补环境/断点

## 结构化输入（推荐）
- 推荐使用 JSON Schema 约束输入结构：
  - `references/schemas/reverse-task-input.schema.json`
- 最小脱敏示例：
  - `references/schemas/reverse-task-input.example.json`
- 重点：
  - 必填 `target/request/runtime/verify`
  - 仅允许脱敏种子（`keys-only` 或 `masked-values`）
  - 禁止提交真实 cookie/token/secrets
