# v0.1.3 — BufferSource fix + auto-recovery explicit trigger

## What's fixed

**Root cause**: v0.1.2 in real Edge reports `Failed to execute 'importKey' on 'SubtleCrypto': Key data must be a BufferSource for non-JWK formats` (Chrome 86+/Edge Chromium WebCrypto standard behavior; `importKey('raw', ArrayBuffer, ...)` is rejected — must be a TypedArray view).

**Fix** (`source/src/crypto/registerkey.ts` + `source/src/crypto/content.ts`):

```diff
- subtle.importKey("raw", shared_key, ...)
+ subtle.importKey("raw", new Uint8Array(shared_key), ...)
```

`Uint8Array(buffer)` creates a view (no memory copy) that satisfies the BufferSource check.

**Auto-recovery trigger** (`source/src/main.ts`): after `initPool()`, check pool stats and explicitly call `notifyFailure()` if all slots are dead (defensive against missed subscribe event).

## Verification

- `verification/V013-VERIFICATION.md` — full report
- `verification/chrome-cdp-v013-encrypt.py` — side-by-side v0.1.2 vs v0.1.3: ArrayBuffer BLOCKED, Uint8Array OK
- `verification/chrome-cdp-v013-crypto.py` — Chrome native + wrapped crypto importKey tests
- `verification/chrome-cdp-v013.py` — v0.1.3 release injection on Chrome 9555 (clean startup, no BufferSource errors)

## Bundle

- `fanqie-assistant-v0.1.3.user.js` (278,583 bytes)
- SHA256: `82EF32EB14067FB67CDF9F5F0A2974E5FE6EF403855D83255BD8770CA7F7878E`

## Upgrade

1. Edge → Tampermonkey → replace script with v0.1.3
2. Ctrl+F5 refresh fanqie page
3. ⚙️ panel → 「⚠ Reset entire pool」 → Enter
4. Wait 5-10s for 3 new devices to register
5. Jump to any chapter (100/190/500/981) — full content