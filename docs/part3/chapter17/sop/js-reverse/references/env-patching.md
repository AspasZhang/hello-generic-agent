# 补环境规范
- 先读代理 env log，再确认 `first divergence`，最后决定补丁。
- 一次只做一个补丁决策；该决策应对应一个最小因果单元。
- 最小因果单元可以是：值 / 函数壳 / 返回对象 / 最小对象契约。
- `diff_env_requirements` 仅作辅助，不替代代理日志。
- 每次补丁都要可回滚、可复测、可追溯到页面证据。
- 常见项：`navigator`、`webdriver`、`crypto`、`atob/btoa`、`TextEncoder`。
- 避免一次性全局模拟浏览器。
- 没有代理日志或没有 `first divergence` 记录时，不允许直接补宿主。
