# 案例模板：签名算法 Node 补环境（站点无关）

## 定位
- 本模板用于“任意站点签名参数”复现，不绑定 `h5st`、不绑定特定域名。
- 只定义流程和输入契约，不提供可直接运行的完整实现代码。

## 两层能力模型
- 通用能力层（本文件）
  - 目标：抽象“Observe -> Capture -> Rebuild -> Verify”的固定流程。
- 站点能力层（单独 case）
  - 目标：补充站点字段映射、风险点、验签口径。

## 输入契约（最小）
- `target.script_url`: 目标签名脚本 URL
- `target.sign_entry`: 入口函数或类名（如 `sign`, `ParamsSignMain`）
- `target.request_spec`: 验签请求模板（URL、query/body、headers）
- `runtime.seed`: 会话种子（cookie/localStorage/sessionStorage），可为空
- `runtime.clock`: 固定时间戳策略（可选）

## 标准流程
1. Observe
- 确定签名字段、入口调用点、请求触发时机。
2. Capture
- 采集最小种子：仅保留签名必要字段，严禁全量敏感导出。
3. Rebuild
- Node `vm` 补最小浏览器能力：`window/document/navigator/storage/canvas`。
- 先用代理 env log 定位缺口，再按 `first divergence` 约束补丁边界。
- 不暴露 `process` 等 Node 特征到 `vm`。
4. Verify
- 生成签名后立即发一次验签请求（闭环），以服务端响应为最终判据。
5. Harden
- 记录 first divergence（首个差异点），按“最小因果单元补丁”迭代；`diff_env_requirements` 仅作辅助。

## 输出契约
- `signature_parts_count`
- `signature_key_part_len`（例如指纹段长度）
- `verify_status`
- `verify_body_preview`
- `first_divergence_note`

## 安全红线
- 不提交真实 cookie、token、storage 原文。
- 不提交可直接复用的完整脚本与固定参数组合。
- 文档中只保留字段名、流程、阈值与判定标准。
