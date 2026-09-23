# -*- coding: utf-8 -*-
"""Test v0.1.3 BufferSource fix on fanqie page (secure context)."""
import json
import time
import urllib.request
import sys
from websocket import create_connection

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

CHROME_PORT = 9555


def main():
    resp = urllib.request.urlopen(f"http://127.0.0.1:{CHROME_PORT}/json/version").read()
    ws_url = json.loads(resp)['webSocketDebuggerUrl']
    print(f"Connecting to {ws_url}")
    ws = create_connection(ws_url, timeout=30)
    msg_id = [0]

    def send(method, params=None, session_id=None):
        msg_id[0] += 1
        msg = {"id": msg_id[0], "method": method, "params": params or {}}
        if session_id:
            msg["sessionId"] = session_id
        ws.send(json.dumps(msg))
        while True:
            resp = json.loads(ws.recv())
            if resp.get('method'):
                continue
            if resp.get('id') == msg_id[0]:
                return resp

    # 列出 pages, 选 fanqie 页面 (pageId=1 from earlier)
    list_res = send("")
    pages_resp = send("Target.getTargets")
    fanqie_page = None
    for t in pages_resp['result']['targetInfos']:
        if 'fanqie' in t.get('url', ''):
            fanqie_page = t
            break

    if not fanqie_page:
        print("No fanqie page found, navigating...")
        new_target = send("Target.createTarget", {"url": "https://fanqienovel.com/reader/7445246192578986520"})
        target_id = new_target['result']['targetId']
    else:
        target_id = fanqie_page['targetId']
        print(f"Found fanqie page: {fanqie_page.get('url')[:80]}")

    attach = send("Target.attachToTarget", {"targetId": target_id, "flatten": True})
    session_id = attach['result']['sessionId']

    def send_session(method, params=None):
        return send(method, params, session_id)

    send_session("Page.enable")
    send_session("Runtime.enable")
    time.sleep(2)

    # ---- TEST 1: 直接在 fanqie 页 evaluate SubtleCrypto importKey + encrypt + decrypt round-trip ----
    print("\n=== Test 1: SubtleCrypto BufferSource behavior (Chrome native) ===")
    test1 = send_session("Runtime.evaluate", {
        "expression": """
    (async () => {
      const subtle = window.crypto.subtle;
      if (!subtle) return { error: 'no subtle in this context' };
      const keyBytes = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]);
      const keyAsArrayBuffer = keyBytes.buffer;  // 旧 v0.1.2 风格: shared_key 是 ArrayBuffer
      const keyAsUint8 = new Uint8Array(keyAsArrayBuffer);  // 新 v0.1.3 风格: 视图
      const results = {};

      try {
        const k1 = await subtle.importKey('raw', keyAsArrayBuffer, { name: 'AES-CBC' }, false, ['encrypt']);
        results.arrayBufferImportKey = 'OK';
      } catch (e) { results.arrayBufferImportKey = 'FAILED: ' + e.message; }

      try {
        const k2 = await subtle.importKey('raw', keyAsUint8, { name: 'AES-CBC' }, false, ['encrypt']);
        results.uint8ImportKey = 'OK';
      } catch (e) { results.uint8ImportKey = 'FAILED: ' + e.message; }

      // 完整 round-trip: encrypt + decrypt with both key types
      try {
        const k = await subtle.importKey('raw', keyAsUint8, { name: 'AES-CBC' }, false, ['encrypt','decrypt']);
        const iv = new Uint8Array(16).fill(0);
        const plain = new TextEncoder().encode('hello fanqie v0.1.3 测试 BufferSource');
        const enc = await subtle.encrypt({ name: 'AES-CBC', iv }, k, plain);
        const dec = await subtle.decrypt({ name: 'AES-CBC', iv }, k, enc);
        results.roundTrip = new TextDecoder().decode(dec);
      } catch (e) { results.roundTrip = 'FAILED: ' + e.message; }

      return results;
    })()
    """,
        "awaitPromise": True,
        "returnByValue": True
    })
    print(json.dumps(test1['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    # ---- TEST 2: 模拟 wrapped crypto —— monkey patch SubtleCrypto.importKey 拒绝 ArrayBuffer ----
    # 这是真实 Edge TM/SecureSDK 包装的行为: 把 ArrayBuffer 当作普通对象拒绝
    print("\n=== Test 2: Simulate wrapped crypto rejecting ArrayBuffer (TM/SecureSDK style) ===")
    test2 = send_session("Runtime.evaluate", {
        "expression": """
    (async () => {
      // 包装 importKey: 只接受 Uint8Array/TypedArray, 拒绝 ArrayBuffer
      // 模拟 TM/SecureSDK 等 wrapped crypto 的实际行为
      const orig = window.crypto.subtle.importKey.bind(window.crypto.subtle);
      const wrappedImportKey = async function(format, keyData, ...rest) {
        if (format === 'raw' && keyData instanceof ArrayBuffer) {
          throw new TypeError("Failed to execute 'importKey' on 'SubtleCrypto': Key data must be a BufferSource for non-JWK formats.");
        }
        return orig(format, keyData, ...rest);
      };
      window.crypto.subtle.importKey = wrappedImportKey;
      window.__wrappedCryptoActive = true;

      const keyBytes = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]);
      const results = { wrappedActive: window.__wrappedCryptoActive };

      // 关键测试: 用被 wrapper 包装的 importKey 调用 (而不是绕过)
      try {
        await window.crypto.subtle.importKey('raw', keyBytes.buffer, { name: 'AES-CBC' }, false, ['encrypt']);
        results.v012ArrayBuffer = 'OK (wrapped did not block - bug?)';
      } catch (e) { results.v012ArrayBuffer = 'BLOCKED: ' + e.message.slice(0, 100); }

      try {
        await window.crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt']);
        results.v013Uint8 = 'OK';
      } catch (e) { results.v013Uint8 = 'BLOCKED: ' + e.message.slice(0, 100); }

      // 验证完整 round-trip under wrapper
      try {
        const k = await window.crypto.subtle.importKey('raw', new Uint8Array(keyBytes), { name: 'AES-CBC' }, false, ['encrypt','decrypt']);
        const iv = new Uint8Array(16).fill(0);
        const plain = new TextEncoder().encode('hello fanqie v0.1.3');
        const enc = await window.crypto.subtle.encrypt({ name: 'AES-CBC', iv }, k, plain);
        const dec = await window.crypto.subtle.decrypt({ name: 'AES-CBC', iv }, k, enc);
        results.roundTripUnderWrap = new TextDecoder().decode(dec);
      } catch (e) { results.roundTripUnderWrap = 'BLOCKED: ' + e.message.slice(0, 100); }

      return results;
    })()
    """,
        "awaitPromise": True,
        "returnByValue": True
    })
    print(json.dumps(test2['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    # ---- TEST 3: 用 wrap 后的 importKey 跑 v0.1.3 release 的加密流程 ----
    print("\n=== Test 3: Run v0.1.3 encryptKeyinfoBody under wrapped crypto ===")
    with open(r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\release\fanqie-assistant-v0.1.3.user.js", "r", encoding="utf-8") as f:
        release_js = f.read()

    # 用模块动态 import 跑 (user.js 是 IIFE, 用 Function 包装)
    test3 = send_session("Runtime.evaluate", {
        "expression": """
    (async () => {
      const releaseJs = %s;
      try {
        const fn = new Function('GM_getValue','GM_setValue','GM_xmlhttpRequest','GM_info','GM_registerMenuCommand', 'window','document',
          releaseJs + '\\nreturn { hasGM: typeof GM_xmlhttpRequest !== "undefined", hasVue: typeof Vue !== "undefined", fqaVersion: typeof __fqaVersion };');
        const r = fn(
          (k, d) => d, (k, v) => {}, () => ({}),
          { script: { version: '0.1.3-test' } },
          () => {},
          window, document
        );
        return { ok: true, ...r };
      } catch (e) {
        return { ok: false, error: String(e).slice(0, 500) };
      }
    })()
    """ % json.dumps(release_js),
        "awaitPromise": True,
        "returnByValue": True
    })
    print(json.dumps(test3['result']['result'].get('value', {}), indent=2, ensure_ascii=False)[:1000])

    ws.close()
    print("\nDONE")


if __name__ == "__main__":
    main()