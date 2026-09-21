# 版本变更

## v0.2.x (2026-09-21) — 已撤回（不要装）

**错误方向**：v0.2.0 / v0.2.1 完全重写 `source/src/api/content.ts`，把上游 `https://reading.snssdk.com/reading/reader/full/v`（snssdk 老接口 + 完整 SM3 签名链 + AES-CBC 解密）替换为 `https://fanqienovel.com/api/reader/full`（fanqienovel.com 同源试读段 API）。

**实测后果**（edge 真实浏览器 + chrome-devtools-mcp 沙箱双验证）：
- 装 v0.2.1 → 章节页「本章字数：3401 字」→ 实际显示 9 段 ≈ 130–140 中文字（典型试读段）
- chrome 沙箱 `fetch('https://fanqienovel.com/api/reader/full?itemId=...')` → `contentLength=200, chapterWordNumber=2423, needPay=0, isChapterLock=true`（确认是试读段）
- 章节 ID `7445246192578986520` 完整正文必须走 snssdk 老接口 + 完整签名链才能拿到，fanqienovel.com 同源 API 对所有环境（chrome / edge / 沙箱）都只给试读段

**结论**：v0.2.x 不是"在 v0.1.x 基础上优化"，而是"把完整正文路径错切到试读段路径"。已通过 `git revert` 把源码回滚到 v0.1.1，对应 GitHub Release v0.1.0 标 Latest，v0.2.0 / v0.2.1 Release 标 Pre-release 撤回。

**状态**：master HEAD 已回滚（commit `201586a` / `3998f6a` 两个 Revert）。如果装过 v0.2.0 / v0.2.1，请卸载并装 `fanqie-assistant-v0.1.1.user.js`（GitHub Release v0.1.0 内含）。

---

## v0.1.1 (2026-09-20) — 控制面板挂载 bug 修复

**Bug**：v0.1.0 在 `document-start` 时调用 `mountPanel()`，但此时 `document.body` 还不存在，导致 `document.body.appendChild()` 抛错。结果：
- ⚙️ 控制面板看不到
- `mountRecoveryUI()` 没跑（失败恢复弹窗失效）
- `await Promise.allSettled([initCache, initPool])` 跳过 → **设备池、缓存实际未初始化**

**用户报告**（1 小时连续阅读）：
- ✅ 阅读解锁链路正常（readerHook 在 mountPanel 之前已跑）
- ❌ ⚙️ 不显示
- ⚠️ 设备池 0 槽、缓存未启用（潜在风控风险）

**修复**：
- `panel/index.ts`：`mountPanel()` 加 body 存在性保护；新增 `attachTriggerButton()` + `ensurePanelButton()`，便于自愈
- `main.ts`：把 `mountPanel()` 调用移到 `await whenBodyReady()` 之后；readerHook / onEnter 仍在 document-start 跑（不依赖 body）
- `hooks/index.ts`：`onUrlChange` / `onHashChange` / `onLoad` 触发时调 `ensurePanelButton()`，防 SPA 路由切换清掉 ⚙️
- 版本号 0.1.0 → 0.1.1

**升级（修复版）**：
- 卸载旧版（v0.1.0）
- 安装 `release/fanqie-assistant-v0.1.1.user.js`
- 刷新页面，应在右下角看到 ⚙️

**仍在 v0.1.1 已知未修**：
- 未在真实 Tampermonkey 实例验证（chrome-devtools 沙箱无 GM_* API，无法本地测试）
- 长周期（1–3 天）压测仍依赖用户报告

---

## v0.1.0 (2026-09-20) — 首次发布

**定位**：在 [naiyQAQ/fanqie-assistant](https://github.com/naiyQAQ/fanqie-assistant) v0.0.6 基础上的自用 fork。重点补齐 L1–L6 反封禁防线、设备池、Pin 缓存、浮动控制面板。

### 新增模块（6 个）

| 模块 | 行数级别 | 职责 |
|------|---------|------|
| `src/utils/logger.ts` | ~150 | 环形缓冲 200 条 + GM_setValue 持久化 + 订阅 |
| `src/utils/throttle.ts` | ~110 | Box-Muller 正态分布 5–25 s + 3 % 概率长停顿 30–90 s + 倒计时接口 |
| `src/cache/index.ts` | ~340 | IndexedDB 双 store（session 缓存 + Pin 持久化）+ 配额管理 |
| `src/pool/index.ts` | ~400 | 3 槽设备池 + 启动错开注册 + 失败 2 次切 + manualRefill 24 h 冷却 + resetPool |
| `src/panel/recovery.ts` | ~280 | 5 选项恢复弹窗 + 诊断日志 `<details>` 默认展开 |
| `src/panel/index.ts` | ~640 | 浮动 ⚙️ + Popover + 侧栏升级 + 5 分区（状态 / 池 / Pin / 节流 / 日志）|

### 集成修改

- `src/main.ts` —— 串行化初始化 `logger → cache → pool → UI`，任一步失败中止后续
- `src/api/app.ts` —— `requestAppWithRecovery()` 用 `waitForThrottle()` + `pool.recordSuccess/Failure()` 替代 `markDeviceHealthy/replaceDevice`
- `src/hooks/readerHook.ts` —— `insertContent()` 加缓存查找 / 写入 + `injectPinButton()` 顶栏 📌 按钮
- `vite.config.ts` —— 更新 `name` / `description` / `author` metadata

### 削减（fork 策略）

- ❌ 移除 `bookshelfHook`（书架页面接管）
- ❌ 移除 `searchHook`（搜索页接管 + Vue 视图）
- ❌ 移除 `audioPanel.ts` + `player/` + `audiobook/`（听书）
- ❌ 移除 `download/` + `epub/`（EPUB/TXT 下载）
- ❌ 移除 `userHook.ts` 头像菜单增强
- ❌ 移除 `GM_cookie` 权限（上游用 HttpOnly sessionid 做评论点赞，与阅读解锁无关）
- ❌ 精简 `@connect` 域名 9 → 3（保留 `fanqienovel.com` + `snssdk.com` + `jxbhmy.com`）

### 构建产物

- 体积：490 KB → 267 KB（gzip 73.62 KB）
- 兼容：Chrome / Edge / Firefox + Tampermonkey / Violentmonkey
- 输出：`release/fanqie-assistant-v0.1.0.user.js`

### 已验证

- ✅ 类型检查 `tsc` 无错
- ✅ `npm run build` 成功（64 modules transformed）
- ✅ 1–2 h 连续阅读未触发封禁（个人体感）
- ⚠️ 1–3 天长周期压测未完成

## v0.0.6 lite (2026-09-20) — 中间版（已废弃）

**定位**：第一次精简尝试。在 v0.0.6 基础上删 5 个 hooks，但保留 `replaceDevice` 自杀模式。

- 体积：490 KB → 215 KB
- **缺点**：没解决"失败就自杀"的根本问题
- **状态**：已被 v0.1.0 取代（移入回收站）

## v0.0.6 (2026-09-20) — 上游 baseline

**定位**：[naiyQAQ/fanqie-assistant](https://github.com/naiyQAQ/fanqie-assistant) v0.0.6 原始发布版。

- 体积：490 KB
- 含：阅读解锁 + 字体解密 + 书架 + 搜索 + 下载 + 听书 + 评论 + 用户面板
- **缺点**：L1 / L2 / L4 / L6 全缺，"用一段时间就被封"是已知痛点
- **状态**：作为应急 fallback 保留（`release/fanqie-assistant-v0.0.6.user.js`）

## 升级建议

从 v0.0.6 → v0.1.0：

1. 卸载旧版 Tampermonkey 脚本
2. 安装 `release/fanqie-assistant-v0.1.0.user.js`
3. 首次启动会重新注册 3 个设备（旧版的 `device_id` 不复用 —— 不复用是**有意设计**，避免旧设备死亡状态污染新池）
4. 旧的 v0.0.6 配置（设置 / 自定义 CSS 等）**不迁移**（v0.1.0 没实现设置面板精简策略）
6. 从 v0.0.6 lite → v0.1.0：直接安装新版，旧 lite 版先卸