# JS Reverse MCP 专用任务模板

按固定阶段执行：

1. 页面观察
   - `check_browser_health`
   - `new_page` + 可选 `restore_session_state`
   - `analyze_target`
   - `search_in_scripts`
   - `list_network_requests` / `get_request_initiator`
   - 设定目标边界：`targetKeywords`、`targetUrlPatterns`、`targetFunctionNames`、`targetActionDescription`

2. 运行时采样
   - 如果目标在首屏初始化或首次请求前生成：先 `inject_preload_script`
   - `create_hook(fetch/xhr)` + `inject_hook`
   - 触发动作
   - `get_hook_data(summary)`
   - 命中后 `get_hook_data(raw)` + `record_reverse_evidence`

3. 本地补环境
   - `export_rebuild_bundle`
   - 本地执行 `env/entry.js`
   - 优先读取代理 env log
   - 记录当前 `first divergence`
   - 按“最小因果单元”做一个补丁决策
   - 必要时再用 `diff_env_requirements` 做辅助比对
   - 复跑并确认 `first divergence` 是否前移

4. 深挖
   - `deobfuscate_code`
   - 必要时插桩 / VMP 分析

核心要求：

- 页面观察先于本地补环境
- 本地补环境先于深度去混淆
- 补环境默认遵循“代理日志 + `first divergence` + 最小因果单元”
- 每一步都要写 task artifact
- 参数名不明显时，优先靠请求、函数、时间窗和动作描述锁定目标
