# 版本变更

## v0.1.0 (2026-09-20) — 本次发布

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