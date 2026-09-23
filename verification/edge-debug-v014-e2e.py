# -*- coding: utf-8 -*-
"""Test v0.1.4 on real Edge (debug 9556) — same end-to-end test as Chrome but on actual Edge."""
import json
import urllib.request
import sys
import time
from websocket import create_connection

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

EDGE_PORT = 9556
INIT_SCRIPT_PATH = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\auto-inject-v014.js"


def main():
    resp = urllib.request.urlopen(f"http://127.0.0.1:{EDGE_PORT}/json/version").read()
    ws_url = json.loads(resp)['webSocketDebuggerUrl']
    print(f"Connecting to Edge {ws_url}")
    ws = create_connection(ws_url, timeout=60)
    msg_id = [0]
    events = []

    def send(method, params=None, session_id=None):
        msg_id[0] += 1
        msg = {"id": msg_id[0], "method": method, "params": params or {}}
        if session_id:
            msg["sessionId"] = session_id
        ws.send(json.dumps(msg))
        ws.settimeout(60)
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

    with open(INIT_SCRIPT_PATH, "r", encoding="utf-8") as f:
        base_init = f.read()

    # 复用 chrome-cdp-v014-fullchapter.py 的 mock_extra
    # 简化: 直接用完整 mock
    SHARED_KEY = 'new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46])'
    MOCK_CONTENT = '<html><body><article><p>天象宫巍峨耸立于玄黄大陆中央, 数百层白玉高楼直插云霄。</p>'.replace('"', '\\"') * 40 + '</article></body></html>'

    mock_extra = r"""
    const SHARED_KEY = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]);
    const MOCK_DEVICE_ID = '2187355326004404';
    const MOCK_CONTENT_1500 = '<html><body><article><p>天象宫巍峨耸立于玄黄大陆中央, 数百层白玉高楼直插云霄。</p>'.repeat(40) + '</article></body></html>';

    window.__mockReady = false;
    window.__mockRegisterkeyResp = null;
    window.__mockChapterResp = null;

    (async () => {
      const subtle = window.crypto.subtle;
      try {
        const k = await subtle.importKey('raw', SHARED_KEY, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);

        const chKey = crypto.getRandomValues(new Uint8Array(16));
        const ck = await subtle.importKey('raw', chKey, { name: 'AES-CBC' }, false, ['encrypt']);
        const plain = new TextEncoder().encode(MOCK_CONTENT_1500);
        const civ = crypto.getRandomValues(new Uint8Array(16));
        const cenc = await subtle.encrypt({ name: 'AES-CBC', iv: civ }, ck, plain);
        const cfinal = new Uint8Array(civ.length + cenc.byteLength);
        cfinal.set(civ, 0);
        cfinal.set(new Uint8Array(cenc), civ.length);
        let cbin = '';
        for (let i = 0; i < cfinal.length; i++) cbin += String.fromCharCode(cfinal[i]);
        const contentB64 = btoa(cbin);

        const iv2 = crypto.getRandomValues(new Uint8Array(16));
        const kenc = await subtle.encrypt({ name: 'AES-CBC', iv: iv2 }, k, chKey);
        const kfinal = new Uint8Array(iv2.length + kenc.byteLength);
        kfinal.set(iv2, 0);
        kfinal.set(new Uint8Array(kenc), iv2.length);
        let kbin = '';
        for (let i = 0; i < kfinal.length; i++) kbin += String.fromCharCode(kfinal[i]);
        window.__mockRegisterkeyResp = btoa(kbin);

        window.__mockChapterResp = JSON.stringify({
          data: { content: contentB64, key_info: { key: window.__mockRegisterkeyResp, keyver: 1 }, key_version: 1 }
        });

        window.__mockReady = true;
        console.log('[edge-mock-server] pre-computed ready');
      } catch (e) {
        console.error('[edge-mock-server] precompute failed:', e);
      }
    })();

    window.__importKeyStats = { rejected: 0, accepted: 0 };
    const origImportKey = window.crypto.subtle.importKey.bind(window.crypto.subtle);
    window.crypto.subtle.importKey = async function(format, keyData, ...rest) {
      if (format === 'raw' && keyData instanceof ArrayBuffer) {
        window.__importKeyStats.rejected++;
        throw new TypeError("Key data must be a BufferSource for non-JWK formats.");
      }
      const r = await origImportKey(format, keyData, ...rest);
      if (format === 'raw') window.__importKeyStats.accepted++;
      return r;
    };

    window.__snssdkCalls = [];
    window.GM_xmlhttpRequest = function(opts) {
      const url = opts.url || '';
      const onload = opts.onload;
      const onerror = opts.onerror;
      window.__snssdkCalls.push(url.split('?')[0].split('/').slice(-2).join('/'));

      const respond = (dataObj) => {
        setTimeout(() => onload && onload({
          status: 200, statusText: 'OK',
          responseText: typeof dataObj === 'string' ? dataObj : JSON.stringify(dataObj),
          readyState: 4, finalUrl: url, context: opts.context
        }), 0);
      };

      const wait = () => new Promise(r => {
        const t = setInterval(() => {
          if (window.__mockReady) { clearInterval(t); r(); }
        }, 50);
      });

      (async () => {
        await wait();
        try {
          if (url.includes('device_register')) {
            return respond({ message: 'success', data: { install_id_str: '2187355326270644', device_id_str: '2187355326004404' } });
          }
          if (url.includes('registerkey')) {
            return respond({ message: 'success', data: { key: window.__mockRegisterkeyResp, keyver: 1 } });
          }
          if (url.includes('/reader/full')) {
            const resp = JSON.parse(window.__mockChapterResp);
            if (!resp.data.key_version) resp.data.key_version = 1;
            return onload && onload({
              status: 200, statusText: 'OK',
              responseText: JSON.stringify(resp),
              readyState: 4, finalUrl: url, context: opts.context
            });
          }
          respond({ message: 'success', data: {} });
        } catch (e) {
          onerror && onerror({ error: String(e) });
        }
      })();

      return { abort: () => {} };
    };
    """

    init_script = base_init + mock_extra
    print(f"Init script size: {len(init_script)} chars")

    send_session("Page.addScriptToEvaluateOnNewDocument", {"source": init_script})

    print("\n=== Navigating Edge to fanqie chapter 190 ===")
    send_session("Page.navigate", {"url": "https://fanqienovel.com/reader/7445246192578986520"})

    print("Waiting 20s for full pipeline...")
    time.sleep(20)

    ws.settimeout(0.3)
    while True:
        try:
            resp = json.loads(ws.recv())
            if resp.get('method'):
                events.append(resp)
        except:
            break

    final = send_session("Runtime.evaluate", {
        "expression": """(() => {
      const bodyText = document.body.innerText;
      return {
        url: location.href,
        title: document.title.slice(0, 80),
        fqaElementCount: document.querySelectorAll('[class*=\"fqa-\"]').length,
        bodyTextLen: bodyText.length,
        bodyHasMockChapter: bodyText.includes('天象宫'),
        mockReady: window.__mockReady,
        importStats: window.__importKeyStats || {},
        snssdkCalls: window.__snssdkCalls || [],
        chapterContent: bodyText.match(/天象宫[\\s\\S]{0,100}/)?.[0] || ''
      };
    })()""",
        "returnByValue": True
    })
    print("\n=== Edge final state ===")
    print(json.dumps(final['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    print("\n=== Console errors ===")
    errors = []
    for e in events:
        if e.get('method') == 'Runtime.consoleAPICalled':
            params = e.get('params', {})
            if params.get('type') == 'error':
                args = params.get('args', [])
                text = ' | '.join([
                    a.get('value', '') if a.get('value') else a.get('description', '')[:120]
                    for a in args if a
                ])
                errors.append(text[:300])
    for e in errors[:20]:
        print(f"  ERR: {e}")

    ws.close()
    print("\nDONE")


if __name__ == "__main__":
    main()