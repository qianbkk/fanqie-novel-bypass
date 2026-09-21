# 版本变更

## v0.2.1 (2026-09-21) — 同源主路径 fetch → XHR 通道切换

**根因**：v0.2.0 在用户真实 EDGE 上部署后控制台仍报 `Unexpected end of JSON input`。用户通过 Network → Copy as cURL 实测对比发现：

| 路径 | URL 完整参数 | 响应 |
|------|------------|------|
| user.js 的 fetch（4.8 kB）| `?itemId=...` | 200 + **空 body** |
| fanqie 自己的 XHR（4.5 kB）| `?itemId=...&msToken=...&a_bogus=...` | 200 + 完整 JSON + `x-tt-zhal` 头 |

URL 缺 `msToken`/`a_bogus` 是 fanqie 服务端 fanqienovel.com 静默拒签的标志（返 200 + 空 body 而不是 4xx，是故意不暴露校验规则）。

**真正的根因（不是 a_bogus 算法缺失）**：字节 webmssdk (secsdk) **只 hook 了 `XMLHttpRequest.prototype.open/send`，没 hook `window.fetch`**。fanqie 页面用 XHR 时 secsdk 自动注入签名；user.js 用 fetch 时没 hook 帮忙加签名。

更深一层：`fetchHook.ts` 用 `const originalFetch = unsafeWindow.fetch.bind(unsafeWindow)` 在**模块顶层**捕获原 fetch。`@run-at document-start` 注入时，secsdk 的 fetch hook 还没装上，所以 originalFetch 是**未被 hook 的原始 fetch**——即使 secsdk 后来加了 hook，也被 user.js 覆盖掉了。

XHR 那边没这个问题：fetchHook.ts 用 `class extends originalXMLHttpRequest` 子类化整个 XHR 类，**没碰 prototype**，secsdk 之前 hook 在 prototype 上的方法完整保留。`super.open(url)` 调的就是 secsdk 想 hook 的方法。

### 改动

| 文件 | 改动 |
|------|------|
| `src/api/content.ts` | `getChapterViaWeb()` 把 `pageFetch()` 换成 `new pageXHR()`。`pageXHR = unsafeWindow.XMLHttpRequest`（来自 config.ts）。open() 时 secsdk 自动注入 a_bogus，拿到完整 JSON + zhal 头。Referer 浏览器自动从当前页推断，不需要手动 setRequestHeader |
| `src/api/content.ts` | import 改 `import { XMLHttpRequest as pageXHR } from '../config'`（原来 `import { fetch as pageFetch }`）|
| `src/api/content.ts` | 顶部 doc 注释 + 已知结论表更新为 XHR 通道 + EDGE 实测样例 |
| `package.json` | version `0.2.0` → `0.2.1` |

### EDGE 真实环境验证（用户 9/21）

```js
const xhr = new XMLHttpRequest()
xhr.open('GET', '/api/reader/full?itemId=7444020932860985881', true)
xhr.withCredentials = true
xhr.setRequestHeader('ismobile', '0')
xhr.setRequestHeader('Accept', 'application/json, text/plain, */*')
xhr.send()
// → xhr.status = 200
// → xhr.getResponseHeader('x-tt-zhal') = "k=DNMrHsV173Pd4pgy;f=dc027189e0ba4cd;d1=lf6-awef.bytetos.com;d2=lf3-awef.bytetos.com"
// → xhr.responseText.length = 1362（包含密文 + 元信息，解密后正文字数 2423）
// → content 字段已经是字体验密 JSON，跟 chrome 隔离环境抓的一字不差
```

### 不变项

- 同源主路径策略：`fanqienovel.com/api/reader/full?itemId=...`（不变）
- 字体解密：`fontDecrypt.ts` mapping 表（不变）
- L1-L6 反封禁、设备池、缓存、Pin、节流、控制面板（不变）
- snssdk fallback：保留（不变）

### 升级步骤

1. 卸载 v0.2.0
2. 安装 `release/fanqie-assistant-v0.2.1.user.js`
3. 打开任意章节，应能完整显示（之前看试读段的章节现在应能看完）
4. 切换章节（约 30 s 一次）应能看到 `[fqa:reader] 字体验密 DNMrHsV173Pd4pgy` 日志

### 已知风险（继承自 v0.2.0）

- ⚠️ mapping 表只覆盖 3 套字体（`DNMrHsV173Pd4pgy` / `fKts9tCXDjS49UhH` / `_search`），遇未知 id 显示 ▒ 字符。F12 控制台搜 `[fqa:reader] 字体验密 <id>` 把 font-id + 章节 URL 报作者补表
- ⚠️ `useWebSecsdkApi` 在 fanqie 上被阉过（只剩 `csrf`），不能用它显式签名——本方案靠 secsdk 的 XHR.prototype hook 自动签名

---

## v0.2.0 (2026-09-21) — 章节获取路径重构（同源 + 字体验密主路径）

**根因**：v0.1.x 沿用上游 v0.0.6 的 snssdk 跨域设备接口 `reading.snssdk.com/reading/reader/full/v`。该接口**设计上只返回试读段**（locked 章节 ~300 字预览），无论设备 VIP 是否到期，正文都拿不全。用户反映的"前面部分"就是这个设计限制的体现——不是 v0.1.1 退化了，是从来就没完整过。

**真相（chrome 隔离环境 9/21 抓网络包验证）**：

| 接口 | 路径 | 真实章节长度（实测） | 备注 |
|---|---|---|---|
| snssdk 设备接口（v0.0.6/v0.1.1 旧路径）| `reading.snssdk.com/reading/reader/full/v` | ~300 字试读段 | 设计如此，匿名也得试读 |
| 同源页面 fetch（番茄浏览器自己用的）| `fanqienovel.com/api/reader/full` | 2701 / 2423 / 2016 字完整 | 字节 secsdk 注入 msToken/a_bogus |

第二个接口返回的 content **是字体验密过的**（中文 → 私有 unicode 区字符），但响应头 `x-tt-zhal` 暴露了字体 id 和 font 文件 hash：

```
x-tt-zhal: k=DNMrHsV173Pd4pgy;f=dc027189e0ba4cd;d1=lf6-awef.bytetos.com;d2=lf3-awef.bytetos.com
```

fontDecrypt.ts 已有的 mapping 表正好覆盖 `DNMrHsV173Pd4pgy`（3 个测试章节全部命中）。**整条链路直接可用，不用新增 font 资源**。

### 改动

| 文件 | 改动 |
|------|------|
| `src/api/content.ts` | 重写。新增 `getChapterViaWeb()` 走同源 `pageFetch('/api/reader/full?itemId=...')`，从响应头 `x-tt-zhal` 解析 fontId/fontHash/fontDomain；`getChapter()` 优先 web 路径，失败 fallback 原 snssdk；旧 `getChapterInfo()` 改名为别名 |
| `src/hooks/readerHook.ts` | `insertContent` 检测到 chapter 是 web 源时，给 scriptContainer 加 `font-<id>` 类，新增 `decryptFontIn()` 用 mapping 表替换加密字符为真实中文 |
| `package.json` | version `0.1.1` → `0.2.0` |

### chrome 隔离环境验证（3 章节，3 本书）

| 章节 | 字数 | font-id | mapping 命中 | 解密样例 |
|------|------|---------|------|------|
| 七零退亲后…第115章 | 2016 | `DNMrHsV173Pd4pgy` | ✅ | "容玉娇气的不行直接回了屋里" |
| 武道不敌机甲…第184章 | 2423 | `DNMrHsV173Pd4pgy` | ✅ | "冷月幻境，感官错位，一阶一年。但现实，仅仅过去一瞬。李青山已经睁开双眼，意犹未尽，迈步登上第二阶" |
| 部族荣光…第351章 | 2701 | `DNMrHsV173Pd4pgy` | ✅ | （同上字体 id） |

全部章节均为 `isChapterLock: true` `needPay: 0`（锁定但免费），同源 fetch 直接拿到完整。

### 不变项

- L1-L6 反封禁防线：未变动（节流、设备池、缓存、Pin 都在）
- 控制面板：未变动
- match / connect：未变动（同源 fetch 不需要跨域权限）
- fontDecrypt.ts：未新增 / 修改（mapping 表原本就覆盖该字体）

### 升级步骤

1. 卸载 v0.1.x
2. 安装 `release/fanqie-assistant-v0.2.0.user.js`
3. 打开任意一本小说任意一章，正文应能完整显示（不再是试读段）
4. 控制面板里设备池、Pin、节流都跟以前一样

### 已知风险 / 后续 TODO

- ⚠️ **未知字体 id 处理**：mapping 仅覆盖 3 套表（`DNMrHsV173Pd4pgy` / `fKts9tCXDjS49UhH` / `_search`）。遇到未知字体 id 时 `decryptText` 直接原样返回（不报错也不解密），**该章会显示 ▒ 字符**。如果碰到，请 F12 控制台搜 `[fqa:reader]` 找到 `字体验密 <id>` 那一行，把 font-id + 章节 URL 报给作者补表。
- ⚠️ **真实 Tampermonkey 端到端**仍是用户行为（chrome-devtools 沙箱无 GM_*），期望 v0.1.1 → v0.2.0 在真实 EDGE 上直接拿到原文。
- ⚠️ **fallback snssdk** 行为不变（设备 VIP 过期或接口下线时还有内容）。v0.2.0 改了主路径，默认行为变了；snssdk 现在只走 fallback。

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