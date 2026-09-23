# -*- coding: utf-8 -*-
"""Run v0.1.3 encryptKeyinfoBody under simulated wrapped crypto."""
import json
import urllib.request
import sys
import re
from websocket import create_connection

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

CHROME_PORT = 9555


def main():
    resp = urllib.request.urlopen(f"http://127.0.0.1:{CHROME_PORT}/json/version").read()
    ws_url = json.loads(resp)['webSocketDebuggerUrl']
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

    pages_resp = send("Target.getTargets")
    target_id = None
    for t in pages_resp['result']['targetInfos']:
        if 'fanqie' in t.get('url', ''):
            target_id = t['targetId']
            break
    if not target_id:
        new_target = send("Target.createTarget", {"url": "https://fanqienovel.com/reader/7445246192578986520"})
        target_id = new_target['result']['targetId']

    attach = send("Target.attachToTarget", {"targetId": target_id, "flatten": True})
    session_id = attach['result']['sessionId']

    def send_session(method, params=None):
        return send(method, params, session_id)

    send_session("Page.enable")
    send_session("Runtime.enable")

    with open(r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\release\fanqie-assistant-v0.1.3.user.js", "r", encoding="utf-8") as f:
        release_js = f.read()

    # 找各个函数的字符位置 (用上一步的结果)
    positions = {
        'b64decode': release_js.find('function b64decode'),
        'b64encode': release_js.find('function b64encode'),
        'getSubtle': release_js.find('function getSubtle'),
        'randomString': release_js.find('function randomString'),
        'unhex': release_js.find('function unhex'),
        'reverseHex': release_js.find('function reverseHex'),
        'encryptKeyinfoBody': release_js.find('async function encryptKeyinfoBody'),
        'decryptKeyinfoResponse': release_js.find('async function decryptKeyinfoResponse'),
    }

    print("Function positions:")
    for k, v in positions.items():
        print(f"  {k}: {v}")

    # 抽取每个函数 (从位置开始到下一个顶层 var/function/const/let 关键字 或匹配的右大括号)
    # 简化: 用 brace matcher, 因为 esbuild bundle 顶层函数没有嵌套问题
    def extract_function(name, start_pos):
        if start_pos < 0:
            return None
        # 找到函数体的开始 {
        brace_start = release_js.find('{', start_pos)
        if brace_start < 0:
            return None
        depth = 0
        pos = brace_start
        in_string = False
        in_template = False
        string_char = ''
        prev = ''
        while pos < len(release_js):
            ch = release_js[pos]
            if in_string:
                if ch == string_char and prev != '\\':
                    in_string = False
            elif in_template:
                if ch == '`':
                    in_template = False
            else:
                if ch in ('"', "'"):
                    in_string = True
                    string_char = ch
                elif ch == '`':
                    in_template = True
                elif ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        return release_js[start_pos:pos+1]
            prev = ch
            pos += 1
        return None

    # 抽取各个函数
    extracted = {}
    for name in positions:
        fn_code = extract_function(name, positions[name])
        if fn_code:
            extracted[name] = fn_code
            print(f"  {name}: {len(fn_code)} chars")

    # 注入到 fanqie 页全局
    init_script = """
    """ + '\n'.join(f"window.__fqa_{name} = {fn};" for name, fn in extracted.items()) + """

    // 同时定义 shared_key (从 release 提取)
    window.__fqa_shared_key_buffer = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]).buffer;
    window.__fqa_device_id = "2187355326004404";
    window.__fqa_install_id = "2187355326270644";

    // monkey patch SubtleCrypto.importKey 拒绝 ArrayBuffer (模拟 wrapped crypto)
    (() => {
      const orig = window.crypto.subtle.importKey.bind(window.crypto.subtle);
      window.__fqa_wrappedImportKey = async function(format, keyData, ...rest) {
        if (format === 'raw' && keyData instanceof ArrayBuffer) {
          throw new TypeError("Failed to execute 'importKey' on 'SubtleCrypto': Key data must be a BufferSource for non-JWK formats.");
        }
        return orig(format, keyData, ...rest);
      };
      window.crypto.subtle.importKey = window.__fqa_wrappedImportKey;
      window.__fqa_wrappedActive = true;
    })();

    window.__fqa_init_complete = true;
    """

    res = send_session("Runtime.evaluate", {
        "expression": init_script,
        "returnByValue": True
    })
    print(f"\nInit script executed: {res.get('result', {}).get('exceptionDetails') or 'OK'}")

    # 跑 v0.1.3 encryptKeyinfoBody
    print("\n=== Test A: v0.1.3 encryptKeyinfoBody under wrapped crypto ===")
    test_a = send_session("Runtime.evaluate", {
        "expression": """
    (async () => {
      try {
        const result = await window.__fqa_encryptKeyinfoBody({
          device_id: window.__fqa_device_id
        });
        return { ok: true, result, resultLength: result.length };
      } catch (e) {
        return { ok: false, error: String(e).slice(0, 300), stack: String(e.stack || '').slice(0, 500) };
      }
    })()
    """,
        "awaitPromise": True,
        "returnByValue": True
    })
    print(json.dumps(test_a['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    # 跑 v0.1.3 decryptKeyinfoResponse (用上一轮的 ciphertext)
    print("\n=== Test B: v0.1.3 decryptKeyinfoResponse round-trip ===")
    test_b = send_session("Runtime.evaluate", {
        "expression": """
    (async () => {
      // 先 encrypt 一次
      let ciphertext;
      try {
        ciphertext = await window.__fqa_encryptKeyinfoBody({ device_id: window.__fqa_device_id });
      } catch (e) {
        return { stage: 'encrypt', error: String(e).slice(0, 300) };
      }
      // ciphertext = JSON.stringify({content: base64})
      const parsed = JSON.parse(ciphertext);
      try {
        const decrypted = await window.__fqa_decryptKeyinfoResponse(parsed.content);
        // decrypted 应该是 8 字节 device_id 反向 hex
        const arr = new Uint8Array(decrypted);
        const hex = Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
        const expected = '0430063002009c01';  // device_id 2187355326004404 (16 位数字)
        // 2187355326004404.toString(16).padStart(16, '0') = '07c79eeed3c0e8'
        // reverseHex 后取前 8 字节: 'e09ec3079eec7c07' -> slice(0,8) = 'e09ec307'
        const dec = new TextDecoder();
        const recoveredDeviceId = dec.decode(arr);
        return {
          ok: true,
          decryptedHex: hex,
          recoveredDeviceId,
          roundTrip: 'OK'
        };
      } catch (e) {
        return { stage: 'decrypt', error: String(e).slice(0, 300) };
      }
    })()
    """,
        "awaitPromise": True,
        "returnByValue": True
    })
    print(json.dumps(test_b['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    # 对比 v0.1.2 (ArrayBuffer) vs v0.1.3 (Uint8Array) 在 wrapped crypto 下
    print("\n=== Test C: side-by-side v0.1.2 (ArrayBuffer) vs v0.1.3 (Uint8Array) ===")
    test_c = send_session("Runtime.evaluate", {
        "expression": """
    (async () => {
      const shared_key = window.__fqa_shared_key_buffer;
      const results = {};

      // v0.1.2 风格: 直接传 ArrayBuffer
      try {
        await window.crypto.subtle.importKey('raw', shared_key, { name: 'AES-CBC' }, false, ['encrypt']);
        results.v012 = 'OK';
      } catch (e) { results.v012 = 'BLOCKED: ' + e.message.slice(0, 100); }

      // v0.1.3 风格: 传 Uint8Array view
      try {
        await window.crypto.subtle.importKey('raw', new Uint8Array(shared_key), { name: 'AES-CBC' }, false, ['encrypt']);
        results.v013 = 'OK';
      } catch (e) { results.v013 = 'BLOCKED: ' + e.message.slice(0, 100); }

      return results;
    })()
    """,
        "awaitPromise": True,
        "returnByValue": True
    })
    print(json.dumps(test_c['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    ws.close()
    print("\nDONE")


if __name__ == "__main__":
    main()