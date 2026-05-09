# 失败回退
- Hook 无数据：确认动作执行 -> 扩一档范围 -> 仍失败则停，不要直接猜 local rebuild。
- 如果 Hook 错过首屏初始化：回到页面入口，先补 `inject_preload_script` 再重试。
- 数据过多：summary 去噪 -> raw 单条下钻。
- 本地补环境失败：先读代理 env log，确认当前 `first divergence`，再回看页面证据；`diff_env_requirements` 仅作辅助。
- local rebuild 连续两轮无进展：回到页面观察，补 `record_reverse_evidence` 后再继续。
- 断点不稳：回退 Hook 路径。
