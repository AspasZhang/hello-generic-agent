# Local Rebuild

本地复现的默认目标不是“完全模拟浏览器”，而是“先跑通目标参数链路”。

推荐导出文件：

- `env/entry.js`
- `env/env.js`
- `env/polyfills.js`
- `env/capture.json`

执行顺序：

1. 在页面里确认目标请求、脚本、函数
2. 导出本地复现包
3. 运行 `env/entry.js`
4. 优先读取代理 env log
5. 记录当前 `first divergence`
6. 按“最小因果单元”做一个补丁决策
7. 必要时再用 `diff_env_requirements` 做辅助比对
8. 复跑并确认 `first divergence` 是否前移
9. 补丁写回 task artifact

优先补：

- `window`
- `document`
- `navigator`
- `location`
- `localStorage/sessionStorage`
- `crypto`
- `fetch/XMLHttpRequest`

不要在没有页面证据、没有代理 env log、没有 `first divergence` 记录的情况下大量脑补环境。
