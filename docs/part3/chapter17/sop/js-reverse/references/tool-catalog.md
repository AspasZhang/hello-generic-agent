# JSReverser-MCP Tool Catalog

Full tool reference organized by function. All tools are prefixed with `mcp__js-reverse__` in Claude Code.

## Observation & Navigation
| Tool | Purpose |
|------|---------|
| `check_browser_health` | Verify browser connection, always call first |
| `navigate_page` / `new_page` | Page navigation |
| `list_pages` / `select_page` | Multi-tab management |
| `list_scripts` / `get_script_source` | Script inventory and source code |
| `search_in_scripts` / `find_in_script` | Code search across loaded scripts |
| `list_network_requests` / `get_network_request` | HTTP traffic inspection |
| `list_websocket_connections` / `get_websocket_messages` | WebSocket traffic |
| `get_request_initiator` | Call stack trace for a network request |
| `get_dom_structure` | DOM tree snapshot |

## Runtime Monitoring (Hook System)
| Tool | Purpose |
|------|---------|
| `create_hook` | Define a hook — types: function / fetch / xhr / cookie / websocket / eval / timer |
| `inject_hook` | Activate a defined hook in the page |
| `get_hook_data` | Retrieve captured data (use `view=summary` first, then `raw` to drill down) |
| `remove_hook` / `list_hooks` | Manage active hooks |
| `hook_function` / `unhook_function` | Direct function hooking shortcut |
| `monitor_events` / `stop_monitor` | DOM event monitoring |
| `trace_function` | Function call tracing via logpoints |
| `inject_preload_script` | Inject script before page load — essential for first-paint interception |

## Debugging (last resort — prefer hooks)
| Tool | Purpose |
|------|---------|
| `set_breakpoint` / `set_breakpoint_on_text` | Set breakpoints |
| `resume` / `pause` / `step_over` / `step_into` / `step_out` | Execution control |
| `evaluate_on_callframe` | Inspect variables at a breakpoint |
| `break_on_xhr` | Break on specific XHR/fetch patterns |

## AI-Powered Analysis
| Tool | Purpose |
|------|---------|
| `analyze_target` | One-shot site reconnaissance — returns signature chains, priority targets, action plan |
| `understand_code` | Deep code analysis with context |
| `deobfuscate_code` | Automated deobfuscation |
| `detect_crypto` | Identify crypto algorithms in code |
| `summarize_code` | Concise code summary |
| `risk_panel` | Combined risk scoring |

## Evidence & Export
| Tool | Purpose |
|------|---------|
| `record_reverse_evidence` | Save findings to task artifact (channel: `runtime-evidence`) |
| `export_session_report` | Export full session report |
| `export_rebuild_bundle` | Export local Node.js rebuild package |
| `diff_env_requirements` | Compare local vs. browser environment gaps |
| `collect_code` / `collection_diff` | Code collection and diffing |

## Stealth & Session
| Tool | Purpose |
|------|---------|
| `inject_stealth` | Anti-detection scripts |
| `set_user_agent` | Custom User-Agent |
| `save_session_state` / `restore_session_state` | Persist and restore login state |
| `get_storage` | Read cookies, localStorage, sessionStorage |

## Default Parameters
| Parameter | Default |
|-----------|---------|
| `search_in_scripts` keywords | `sign\|token\|nonce\|encrypt\|hmac\|sha\|md5\|cookie\|h5st` |
| `get_hook_data` view | `summary`, maxRecords=80 |
| First-round hook types | `fetch` + `xhr` |
| `record_reverse_evidence` channel | `runtime-evidence` |
| `export_rebuild_bundle` output | `env/entry.js` + `env/env.js` + `env/polyfills.js` + `env/capture.json` |
| Breakpoints | Disabled by default — enable only as fallback |
