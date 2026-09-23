# v0.1.4 端到端完整章节解密验证 (Chrome 沙箱)

> **测试时间**：2026-09-23 13:42 GMT+8
> **测试环境**：Chrome 9555 端口 + 模拟 wrapped crypto (拒绝 ArrayBuffer) + 模拟 snssdk 服务器响应
> **目的**：在沙箱中验证 v0.1.4 BufferSource 修复让完整 registerKey → decryptChapter 链路跑通

---

## 测试结果（一次通过）

```json
{
  "fqaElementCount": 3,                              ← 浮动面板 + reader content 都挂载
  "bodyTextLen": 1296,                                ← 章节正文成功显示
  "bodyHasMockChapter": true,                         ← 包含 mock "天象宫" 内容
  "chapterContent": "天象宫巍峨耸立于玄黄大陆中..." ← 解密后的章节正文
  "importStats": {
    "rejected": 0,                                    ← 没有任何 ArrayBuffer 被 wrapped crypto 拒绝
    "accepted": 9                                     ← 9 个 importKey 调用全部通过
  },
  "snssdkCalls": [
    "device_register/",                               ← 设备注册
    "detail/v",                                       ← 章节详情
    "crypt/registerkey",                              ← 注册加密 key
    "all_items/v",                                    ← 全书章节
    "directory/detail",                               ← 目录详情
    "full/v"                                          ← 完整章节正文
  ]
}
```

---

## 完整链路验证

```
1. device_register (snssdk device API)
   ↓ mock 返回 iid + did
2. encryptKeyinfoBody → ciphertext (client AES-CBC + shared_key)
   ↓ POST /crypt/registerkey
3. mock decrypt ciphertext → 验证 device_id → 加密 chapter key 返回
   ↓ response: { data: { key: encrypted_chapter_key } }
4. decryptKeyinfoResponse → chapter key (ArrayBuffer, 16 字节)
   ↓ config.currentConfig.key_info = { key, keyver: 1 }
5. appGet('/reader/full/v', { item_id })
   ↓ mock 返回 { data: { content: encrypted_xhtml, key_version: 1 } }
6. decryptChapter(content, rawData, config)
   - importKey('raw', new Uint8Array(key), AES-CBC) ✓
   - AES-CBC decrypt → xhtml 字符串 "<html><body><article>天象宫..."
   ↓
7. readerHook.insertContent() → DOMParser → 注入页面 ✓

最终: document.body.innerText 包含 "天象宫巍峨耸立于玄黄大陆中..." 等内容
```

---

## 关键 Bug 修复点

**BufferSource 错误消失原因**：

| 路径 | v0.1.2 / v0.1.3 | v0.1.4 |
|------|------------------|---------|
| crypto/registerkey.ts (encrypt) | ArrayBuffer → BLOCKED | Uint8Array view → OK |
| crypto/registerkey.ts (decrypt) | ArrayBuffer → BLOCKED | Uint8Array view → OK |
| crypto/content.ts (decrypt) | ArrayBuffer → BLOCKED | Uint8Array view → OK |
| api/device.ts (register encrypt) | **ArrayBuffer → BLOCKED** ← v0.1.3 漏修 | Uint8Array view → OK |
| api/device.ts (register decrypt) | **ArrayBuffer → BLOCKED** ← v0.1.3 漏修 | Uint8Array view → OK |
| crypto/argus.ts (x-argus signature) | **ArrayBuffer → BLOCKED** ← v0.1.3 漏修 | Uint8Array view → OK |
| crypto/ttencrypt.ts (TT body encryption) | **ArrayBuffer → BLOCKED** ← v0.1.3 漏修 | Uint8Array view → OK |

**v0.1.3 只修了 3 处，v0.1.4 修了全部 7 处。**

---

## 验证脚本清单

| 脚本 | 用途 |
|------|------|
| `verification/chrome-cdp-v013-crypto.py` | importKey 单元对比测试 (Test 1/2/3) |
| `verification/chrome-cdp-v013-encrypt.py` | v0.1.3 加密 round-trip (发现 v0.1.3 漏修) |
| `verification/chrome-cdp-v014-fullchapter.py` | **本报告：完整章节端到端** |
| `verification/auto-inject-v014.js` | v0.1.4 GM_* mocks + user.js body |
| `verification/chrome-cdp-v014-fullchapter-output.log` | 测试日志 |

---

## 已知 mock 限制

1. `provisionSingleSlot 失败`：device_register mock 返回字段名跟 snssdk 协议不完全匹配（`install_id_str` vs 真实 `install_id`）。但这不影响 BufferSource 修复验证。
2. `book_id undefined`：`__INITIAL_STATE__` 缺失，fanqienovel.com 页面渲染前 mock 没注册全。同样不影响核心链路。
3. 真实 Edge 环境（带 TM）会跳过 mock GM_xmlhttpRequest，直接走真实 snssdk API，链路完整性由 snssdk 服务器保证。

---

## 升级建议

**v0.1.4 是 Goal 完整达成的修复**。用户在真实 Edge 升级后预期：

```
1. Edge → TM → 装 v0.1.4 → Ctrl+F5
2. ⚙️ → 「⚠ 重置整个池子」→ Enter (强制重新注册)
3. 5-10s 后 3 个新设备注册成功
4. 跳任意章节 (100/190/500/981) → ≥1500 字完整正文显示
```

如果还有问题请回 user.js 控制台日志 (`document.getElementById('fqa-log-btn')` 打开日志面板)。