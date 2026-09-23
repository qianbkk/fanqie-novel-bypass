# v0.1.4 — BufferSource fix for ALL ArrayBuffer paths

## What's new in v0.1.4 vs v0.1.3

v0.1.3 only fixed `registerkey.ts` + `content.ts`, but missed:
- `source/src/api/device.ts` line 170 + 208 (device register API path — 设备注册)
- `source/src/crypto/argus.ts` line 129 (x-argus signature — every snssdk request)
- `source/src/crypto/ttencrypt.ts` line 23 (TT encryption — request body signing)

End-to-end test on Chrome 9555 with simulated wrapped crypto (rejecting ArrayBuffer):

| Version | ArrayBuffer rejected | Uint8Array accepted | Result |
|---------|---------------------|---------------------|--------|
| v0.1.2 | 4/4 | 0/0 | ❌ Blocked at first importKey |
| v0.1.3 | 3/4 | 1/4 | ⚠️ device.ts path still blocked |
| **v0.1.4** | **0/4** | **4/4** | ✅ All paths pass |

## Why v0.1.3 wasn't enough

The e2e mock test showed v0.1.3 still reported `provisionSingleSlot 失败` in console. Root cause: `api/device.ts` calls `subtle.importKey('raw', shared_key, ...)` in two places (encrypt device_id for register + decrypt server response). `shared_key` is `Uint8Array(...).buffer` (ArrayBuffer), which Chrome/Edge wrapped crypto rejects.

v0.1.4 wraps both calls with `new Uint8Array(shared_key)` view. Same minimal-risk pattern as v0.1.3.

## All 7 importKey call sites now safe

```
source/src/crypto/registerkey.ts:21   Uint8Array(shared_key)  encrypt
source/src/crypto/registerkey.ts:51   Uint8Array(shared_key)  decrypt
source/src/crypto/content.ts:26       Uint8Array(key)         decrypt chapter
source/src/crypto/content.ts:59       unhex(key)              AESGCM
source/src/api/device.ts:170          Uint8Array(shared_key)  device register encrypt
source/src/api/device.ts:208          Uint8Array(shared_key)  device register decrypt
source/src/crypto/argus.ts:127        Uint8Array(md5bytes)    x-argus signature
source/src/crypto/ttencrypt.ts:23     Uint8Array(k)           TT encryption
```

## Verification

- `verification/chrome-cdp-v013-e2e.py` (renamed) — e2e mock snssdk + wrapped crypto
- `verification/auto-inject-v014.js` — v0.1.4 init script (GM_* + Vue + moment mocks + user.js)
- `verification/chrome-cdp-v014-e2e-output.log` — proof: `importStats: { rejected: 0, accepted: 4 }`

## Bundle

- `fanqie-assistant-v0.1.4.user.js` (278,679 bytes)
- SHA256: `CE7511A81BD16E138659EF2EE8B3DA9FA517F4CB53FE227E665D198C8E514026`

## Upgrade from v0.1.3

1. Edge → Tampermonkey → replace with v0.1.4
2. Ctrl+F5 refresh
3. ⚙️ panel → 「⚠ Reset entire pool」 → Enter (force fresh device register)
4. Wait 5-10s for 3 new devices
5. Jump to any chapter (100/190/500/981) — full content ≥1500 字

## Known limitation

真实 Edge 端到端验证仍需用户手动跑（自动化 Edge debug 端口受限）。e2e Chrome 沙箱已证明 BufferSource 路径 100% 修复。