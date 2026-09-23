# -*- coding: utf-8 -*-
"""Full chapter e2e v0.1.4: simplified mock snssdk + decryptChapter end-to-end."""
import json
import urllib.request
import sys
import time
from websocket import create_connection

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

CHROME_PORT = 9555
INIT_SCRIPT_PATH = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\auto-inject-v014.js"


def main():
    resp = urllib.request.urlopen(f"http://127.0.0.1:{CHROME_PORT}/json/version").read()
    ws_url = json.loads(resp)['webSocketDebuggerUrl']
    print(f"Connecting to {ws_url}")
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

    # 简化 mock: 用预计算结果, 不在每次请求时计算
    mock_extra = r"""
    // 预计算章节密文 (在 init script 末尾异步执行, 不阻塞 user.js IIFE)
    const SHARED_KEY = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]);
    const MOCK_DEVICE_ID = '2187355326004404';
    const MOCK_CONTENT_1500 = '<html><body><article><p>天象宫巍峨耸立于玄黄大陆中央, 数百层白玉高楼直插云霄。</p>'.repeat(40) + '</article></body></html>';

    // 预先异步生成所有 mock 数据
    window.__mockReady = false;
    window.__mockRegisterkeyResp = null;
    window.__mockChapterResp = null;

    (async () => {
      const subtle = window.crypto.subtle;
      try {
        const k = await subtle.importKey('raw', SHARED_KEY, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);

        // 1. 预生成章节密文 + chapter key
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

        // 2. 用 shared_key 加密 chapter key 作为 key_info.key
        // decryptKeyinfoResponse 解密后得到 chKey (client 用 chKey 解密章节)
        const iv2 = crypto.getRandomValues(new Uint8Array(16));
        const kenc = await subtle.encrypt({ name: 'AES-CBC', iv: iv2 }, k, chKey);
        const kfinal = new Uint8Array(iv2.length + kenc.byteLength);
        kfinal.set(iv2, 0);
        kfinal.set(new Uint8Array(kenc), iv2.length);
        let kbin = '';
        for (let i = 0; i < kfinal.length; i++) kbin += String.fromCharCode(kfinal[i]);
        window.__mockRegisterkeyResp = btoa(kbin);

        // 3. chapter API response (含完整 mock chapter + key_info)
        window.__mockChapterResp = JSON.stringify({
          data: { content: contentB64, key_info: { key: window.__mockRegisterkeyResp, keyver: 1 } }
        });

        window.__mockReady = true;
        console.log('[mock-server] pre-computed responses ready (chapter content ' + MOCK_CONTENT_1500.length + ' chars)');
      } catch (e) {
        console.error('[mock-server] precompute failed:', e);
      }
    })();

    // Wrapped crypto: 拒绝 ArrayBuffer (验证 v0.1.4 修复)
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

    // Snssdk mock: 直接返预计算结果
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
          readyState: 4,
          finalUrl: url,
          context: opts.context
        }), 0);
      };

      // 等 mock 准备好
      const wait = () => new Promise(r => {
        const t = setInterval(() => {
          if (window.__mockReady) { clearInterval(t); r(); }
        }, 50);
      });

      (async () => {
        await wait();
        try {
          if (url.includes('device_register')) {
            return respond({
              message: 'success',
              data: { install_id_str: '2187355326270644', device_id_str: '2187355326004404' }
            });
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
              readyState: 4,
              finalUrl: url,
              context: opts.context
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
    print(f"Added init script")

    print("\n=== Navigating to fanqie chapter 190 ===")
    send_session("Page.navigate", {"url": "https://fanqienovel.com/reader/7445246192578986520"})

    # 长 sleep 等 user.js + snssdk mock + 章节解密
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

    print("\n=== Final state ===")
    # 显式触发一次 chapter fetch
    trigger = send_session("Runtime.evaluate", {
        "expression": """(async () => {
      try {
        // 找 fanqie 页面 item_id (190 = 7445246192578986520)
        const itemId = '7445246192578986520';
        // 直接调 user.js 的 getChapter? 不暴露. 改用 fetch 模拟
        const r = await fetch('https://i.snssdk.com/reading/reader/full/v?item_id=' + itemId);
        return { ok: true, status: r.status, body: (await r.text()).slice(0, 200) };
      } catch (e) {
        return { error: String(e) };
      }
    })()""",
        "awaitPromise": True,
        "returnByValue": True
    })
    print("\n=== Manual chapter fetch ===")
    print(json.dumps(trigger['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    time.sleep(3)
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
    print(json.dumps(final['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    print("\n=== Console errors (filtered) ===")
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
    for e in errors[:30]:
        print(f"  ERR: {e}")

    print("\n=== Snssdk network responses ===")
    responses = [e for e in events if e.get('method') == 'Network.responseReceived']
    snssdk_responses = [e for e in responses if 'snssdk' in e.get('params', {}).get('response', {}).get('url', '')]
    print(f"Snssdk responses: {len(snssdk_responses)}")
    for r in snssdk_responses[:10]:
        url = r['params']['response']['url']
        status = r['params']['response']['status']
        print(f"  [{status}] {url.split('?')[0].split('/').slice(-2).join('/')}")

    ws.close()
    print("\nDONE")


if __name__ == "__main__":
    main()