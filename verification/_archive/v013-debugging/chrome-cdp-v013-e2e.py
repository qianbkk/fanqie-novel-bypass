# -*- coding: utf-8 -*-
"""End-to-end: use auto-inject-v013.js + mock snssdk responses, verify v0.1.3 full flow."""
import json
import urllib.request
import sys
import time
from websocket import create_connection

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

CHROME_PORT = 9555
INIT_SCRIPT_PATH = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\auto-inject-v014.js"
RELEASE_PATH = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\release\fanqie-assistant-v0.1.4.user.js"


def main():
    resp = urllib.request.urlopen(f"http://127.0.0.1:{CHROME_PORT}/json/version").read()
    ws_url = json.loads(resp)['webSocketDebuggerUrl']
    print(f"Connecting to {ws_url}")
    ws = create_connection(ws_url, timeout=30)
    msg_id = [0]
    events = []

    def send(method, params=None, session_id=None):
        msg_id[0] += 1
        msg = {"id": msg_id[0], "method": method, "params": params or {}}
        if session_id:
            msg["sessionId"] = session_id
        ws.send(json.dumps(msg))
        while True:
            resp = json.loads(ws.recv())
            if resp.get('method'):
                events.append(resp)
                continue
            if resp.get('id') == msg_id[0]:
                return resp

    new_target = send("Target.createTarget", {"url": "about:blank"})
    target_id = new_target['result']['targetId']
    attach = send("Target.attachToTarget", {"targetId": target_id, "flatten": True})
    session_id = attach['result']['sessionId']

    def send_session(method, params=None):
        return send(method, params, session_id)

    send_session("Page.enable")
    send_session("Runtime.enable")
    send_session("Network.enable")

    # 加载 auto-inject-v013.js (已经包含 GM_* + Vue + moment mocks + user.js body)
    with open(INIT_SCRIPT_PATH, "r", encoding="utf-8") as f:
        base_init = f.read()

    # 在 init script 末尾追加 snssdk mock + wrapped crypto check
    extra_init = r"""
    // ---- Snssdk API mock + Uint8Array fix verification ----
    const origImportKey = window.crypto.subtle.importKey.bind(window.crypto.subtle);
    let __importKeyArrayBufferRejected = 0;
    let __importKeyUint8Accepted = 0;

    window.crypto.subtle.importKey = async function(format, keyData, ...rest) {
      // 模拟某些 wrapped crypto 严格检查: 拒绝 ArrayBuffer
      if (format === 'raw' && keyData instanceof ArrayBuffer && !(keyData instanceof Uint8Array)) {
        __importKeyArrayBufferRejected++;
        throw new TypeError("Key data must be a BufferSource for non-JWK formats.");
      }
      const result = await origImportKey(format, keyData, ...rest);
      if (format === 'raw') __importKeyUint8Accepted++;
      return result;
    };
    window.__getImportKeyStats = () => ({
      rejected: __importKeyArrayBufferRejected,
      accepted: __importKeyUint8Accepted
    });

    // Mock GM_xmlhttpRequest: 替换为走 fetch
    window.__realGmXhr = window.GM_xmlhttpRequest;
    window.__snssdkCalls = [];

    window.GM_xmlhttpRequest = function(opts) {
      const url = opts.url || '';
      const method = opts.method || 'GET';
      const onload = opts.onload;
      const onerror = opts.onerror;
      window.__snssdkCalls.push({ url: url.slice(-60), method });

      // Snssdk mock: 全部返 200 + 有效 JSON
      const mockResponse = (dataObj) => ({
        status: 200,
        statusText: 'OK',
        responseText: JSON.stringify(dataObj),
        readyState: 4,
        finalUrl: url,
        context: opts.context
      });

      // device_register: 返回有效 iid + did
      if (url.includes('/service/2/device_register') || url.includes('device_register')) {
        const data = {
          message: 'success',
          data: {
            install_id_str: '2187355326270644',
            device_id_str: '2187355326004404'
          }
        };
        setTimeout(() => onload && onload(mockResponse(data)), 0);
        return { abort: () => {} };
      }

      // registerkey: 返回真实加密的 device_id (用与 client 相同的 shared_key)
      // 这里模拟 server: 用 shared_key 加密 device_id reversed hex 前 8 字节
      if (url.includes('/reading/crypt/registerkey')) {
        (async () => {
          try {
            const sharedKey = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]);
            const k = await origImportKey('raw', sharedKey, { name: 'AES-CBC' }, false, ['encrypt']);
            const did = '2187355326004404';
            const be = BigInt(did).toString(16).padStart(16, '0');
            let rev = '';
            for (let i = be.length; i > 0; i -= 2) rev += be.slice(i - 2, i);
            const data = new Uint8Array(rev.match(/.{1,2}/g).map(s => parseInt(s, 16))).slice(0, 8);
            const iv = crypto.getRandomValues(new Uint8Array(16));
            const enc = await origImportKey('raw', sharedKey, { name: 'AES-CBC' }, false, ['encrypt']).then(async (k2) => {
              // re-import (k 仅作 encrypt)
              return window.crypto.subtle.encrypt({ name: 'AES-CBC', iv }, k, data);
            });
            const final = new Uint8Array(iv.length + enc.byteLength);
            final.set(iv, 0);
            final.set(new Uint8Array(enc), iv.length);
            let bin = '';
            for (let i = 0; i < final.length; i++) bin += String.fromCharCode(final[i]);
            const b64 = btoa(bin);
            const data2 = { content: b64 };
            onload && onload(mockResponse(data2));
          } catch (e) {
            onerror && onerror({ error: String(e) });
          }
        })();
        return { abort: () => {} };
      }

      // 其他: 空成功响应
      setTimeout(() => onload && onload(mockResponse({ message: 'success', data: {} })), 0);
      return { abort: () => {} };
    };

    // 暴露状态给 CDP 查询
    window.__e2eInitDone = true;
    console.log('[e2e-mock] snssdk mock + importKey wrapper installed');
    """

    init_script = base_init + extra_init
    print(f"Init script size: {len(init_script)} chars")

    add_script = send_session("Page.addScriptToEvaluateOnNewDocument", {"source": init_script})
    print(f"Added init script")

    print("\n=== Navigating to fanqie chapter 190 ===")
    send_session("Page.navigate", {"url": "https://fanqienovel.com/reader/7445246192578986520"})

    # 等初始化 + 跑 snssdk
    time.sleep(12)

    ws.settimeout(0.3)
    while True:
        try:
            resp = json.loads(ws.recv())
            if resp.get('method'):
                events.append(resp)
        except:
            break

    # 检查最终状态
    print("\n=== Final state ===")
    final = send_session("Runtime.evaluate", {
        "expression": """(() => {
      const importStats = window.__getImportKeyStats ? window.__getImportKeyStats() : null;
      return {
        url: location.href,
        title: document.title.slice(0, 100),
        fqaElements: document.querySelectorAll('[class*="fqa-"]').length,
        bodyTextLen: document.body.innerText.length,
        importStats,
        snssdkCalls: (window.__snssdkCalls || []).map(c => c.url),
        e2eInitDone: window.__e2eInitDone
      };
    })()""",
        "returnByValue": True
    })
    print(json.dumps(final['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    print("\n=== Console errors ===")
    errors = []
    for e in events:
        if e.get('method') == 'Runtime.consoleAPICalled':
            params = e.get('params', {})
            if params.get('type') == 'error':
                args = params.get('args', [])
                text = ' | '.join([
                    a.get('value', '') if a.get('value') else a.get('description', '')[:100]
                    for a in args if a
                ])
                errors.append(text[:300])
    for e in errors[:20]:
        print(f"  ERR: {e}")

    # 看 network requests
    print("\n=== Network requests ===")
    network = [e for e in events if e.get('method') == 'Network.requestWillBeSent']
    print(f"Total: {len(network)}")

    ws.close()
    print("\nDONE")


if __name__ == "__main__":
    main()