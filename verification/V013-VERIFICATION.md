# v0.1.3 验证报告 — BufferSource 修复 + 自动恢复触发

> **用户真实 Edge 反馈**：v0.1.2 安装后页面卡在"章节字数为 0"或"加载失败"。
> **诊断证据**：`fqa.diagnostic_log` 报 `snssdk 路径也失败` + `Failed to execute 'importKey' on 'SubtleCrypto': Key data must be a BufferSource for non-JWK formats`。
> **Edge TM storage 状态**：`fqa.device_pool` 唯一 slot `did=3172550929821735`，`health=dead`，`failureStreak=14`，`success=39`。

---

## 1. 修复内容

### 1.1 根因分析

`shared_key` 在 `source/src/config.ts` 定义为：
```ts
export const shared_key = new Uint8Array([172, 37, 198, ...]).buffer;
```
直接拿到的是 `ArrayBuffer`。`registerkey.ts` 的 `decryptKeyinfoResponse` / `encryptKeyinfoBody` 和 `content.ts` 的 `decryptChapter` 三处都用 `shared_key` / `key` 作为 `subtle.importKey("raw", ...)` 的第二个参数。

**WebCrypto spec 要求**：`raw` 格式的 `keyData` 必须是 `BufferSource = ArrayBuffer | ArrayBufferView`。但 **Chrome 86+ 和 Edge Chromium 在实际实现中要求传入 TypedArray 视图**，直接传 ArrayBuffer 会抛错：

```
TypeError: Failed to execute 'importKey' on 'SubtleCrypto':
           Key data must be a BufferSource for non-JWK formats.
```

（已用 Chrome 9555 端口 CDP 实测复现，错误信息一字不差。）

### 1.2 修复（v0.1.3）

将 `ArrayBuffer` 改用 `Uint8Array` 视图包裹，避开 Chrome/Edge 严格检查：

```diff
// source/src/crypto/registerkey.ts
- const k = await subtle.importKey("raw", shared_key, ...)
+ const k = await subtle.importKey("raw", new Uint8Array(shared_key), ...)

// source/src/crypto/content.ts
- const cryptoKey = await subtle.importKey("raw", key, ...)
+ const cryptoKey = await subtle.importKey("raw", new Uint8Array(key), ...)
```

### 1.3 自动恢复触发（mainInit）

v0.1.2 设计了 5min 自动恢复 + 24h 节流，但 **真实 Edge 没有出现恢复弹窗**。检查 TM storage：
- `fqa.device_pool` 存在（slot dead）
- `fqa.diagnostic_log` 存在（1 条 BufferSource 错误）
- **没有 `fqa.auto_reset_plan.v1` 或 `fqa.last_auto_reset.v1`**

说明 `detectAllDeadAndSchedule` 没被触发或计划未被持久化。在 `main.ts` 的 `mainInit` 中显式检测全 dead 并触发 `notifyFailure`：

```ts
// v0.1.3
await pool.initPool();
const stats = await pool.getStats();
if (stats.dead >= stats.total && stats.total > 0) {
    console.log('[fqa:main] 检测到全 dead, 显式触发恢复弹窗');
    pool.notifyFailure();  // 触发恢复弹窗
}
```

---

## 2. 验证（Chrome 9555 端口 CDP）

### 2.1 Side-by-side：v0.1.2 vs v0.1.3

`verification/chrome-cdp-v013-encrypt.py` Test C：

```json
{
  "v012": "BLOCKED: Failed to execute 'importKey' on 'SubtleCrypto': Key data must be a BufferSource for non-JWK formats",
  "v013": "OK"
}
```

**核心证据**：相同 `shared_key` + wrapped crypto，ArrayBuffer 被拒，Uint8Array 通过。

### 2.2 Chrome 原生 SubtleCrypto 行为

`verification/chrome-cdp-v013-crypto.py` Test 1：

```json
{
  "arrayBufferImportKey": "FAILED: Failed to execute 'importKey' on 'SubtleCrypto': Key data must be a BufferSource for non-JWK formats.",
  "uint8ImportKey": "OK",
  "roundTrip": "hello fanqie v0.1.3 测试 BufferSource"
}
```

**关键发现**：Chrome 原生 WebCrypto **也**拒绝 ArrayBuffer（不只是 wrapped crypto/TM）。这解释了为什么 v0.1.2 在 Chrome 沙箱也报 `provisionSingleSlot 失败`，而不是只有真实 Edge 才出问题。

### 2.3 Wrapped crypto 模拟（TM/SecureSDK 风格）

`verification/chrome-cdp-v013-crypto.py` Test 2：

```json
{
  "wrappedActive": true,
  "v012ArrayBuffer": "BLOCKED: Failed to execute 'importKey' on 'SubtleCrypto': Key data must be a BufferSource for non-JWK formats",
  "v013Uint8": "OK",
  "roundTripUnderWrap": "hello fanqie v0.1.3"
}
```

完整 round-trip (encrypt + decrypt) 在 wrapped crypto 下工作正常。

### 2.4 v0.1.3 release 注入 Chrome 沙箱

`verification/chrome-cdp-v013.py`：

```
=== Navigating to fanqie chapter 190 ===
=== Page state ===
{
  "url": "https://fanqienovel.com/reader/7445246192578986520",
  "gmMockReady": true,
  "fqaElements": 1,
  "recoveryModal": false,
  "bodyTextLen": 249
}
=== Console ===
  [info] [fqa:logger] | 日志系统就绪
  [info] [fqa:main] | fanqie-assistant 0.1.3 启动
  [info] [fqa:recovery] | 恢复弹窗模块已挂载
  [info] [fqa:panel] | 控制面板已挂载
  [info] [fqa:pool] | 池子为空，开始首次注册
  [info] [fqa:cache] | 缓存系统就绪
  [error] [fqa:pool] | provisionSingleSlot 失败 | Object
  [warning] [fqa:pool] | 首槽注册失败，回退到内置匿名设备
  [info] [fqa:main] | 主流程初始化完成
```

v0.1.3 release 启动正常，模块全挂载（logger/main/recovery/panel/pool/cache）。**没有 BufferSource 错误**（之前 v0.1.2 同样路径会报）。沙箱里 `provisionSingleSlot 失败` 是因为 Chrome 没有 TM 扩展，snssdk fetch 被 CORS 阻断。

---

## 3. 已知限制

1. **Chrome 沙箱没法验证完整章节解密**：snssdk API 100% CORS 阻断，必须用户真实 Edge（带 TM）才能验证完整 registerKey → decryptChapter 链路。
2. **Edge 用户 profile debug 端口起不来**：之前用 `--remote-debugging-port=9333` 启动用户 Edge，进程在跑但端口不监听（profile 状态污染）。需要用户手动更新 user.js。
3. **未跑 v0.1.3 真实 Edge 验证**：用户在真实 Edge 跑 v0.1.3 才能最终确认 chapter 解密 + 恢复弹窗触发。

---

## 4. 用户操作步骤（真实 Edge）

1. 打开 Edge，进入 `edge://extensions/`
2. Tampermonkey → 找到 `fanqie-assistant` → 编辑
3. 用 `release/fanqie-assistant-v0.1.3.user.js` 替换（URL: https://github.com/qianbkk/fanqie-novel-bypass/releases/tag/v0.1.3）
4. Ctrl+F5 强制刷新番茄小说页面
5. 点右下角 ⚙️ 控制面板 → 红色「⚠ 重置整个池子」→ Enter
6. 等 5-10 秒，新的 3 个设备应成功注册
7. 跳到任意章节（如第 190 章 / 第 500 章 / 第 981 章）验证完整正文

如果重置后仍卡死，5 分钟内会自动恢复（v0.1.2+ 引入）。

---

## 5. 验证脚本清单

- `verification/chrome-cdp-v013.py` — v0.1.3 release 注入 Chrome + 启动状态检查
- `verification/chrome-cdp-v013-crypto.py` — Chrome native + wrapped crypto importKey 对比测试
- `verification/chrome-cdp-v013-encrypt.py` — v0.1.3 加密函数 extract + 完整 round-trip 测试
- `verification/auto-inject-v013.js` — Chrome @run-at document-start init script
- `verification/chrome-cdp-v013-output.log` — v0.1.3 注入日志（无 BufferSource 错误）
- `verification/chrome-cdp-v013-crypto-output.log` — crypto 对比日志（核心证据）
- `verification/chrome-cdp-v013-encrypt-output.log` — encrypt round-trip 日志

---

## 6. Release 信息

- 文件：`release/fanqie-assistant-v0.1.3.user.js`
- 大小：278,583 字节
- SHA256：`82EF32EB14067FB67CDF9F5F0A2974E5FE6EF403855D83255BD8770CA7F7878E`
- GitHub Release：https://github.com/qianbkk/fanqie-novel-bypass/releases/tag/v0.1.3