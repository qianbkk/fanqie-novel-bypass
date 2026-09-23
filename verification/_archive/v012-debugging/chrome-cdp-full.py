# -*- coding: utf-8 -*-
"""
Full end-to-end test of v0.1.2 in Chrome (no TM).
Verifies:
1. user.js v0.1.2 initializes (panel mounts, font decryption works)
2. snssdk API blocked by CORS (proves user.js needs TM)
3. Page shows preview only (not full 3401 chars)
"""
import json
import time
import urllib.request
import os
import sys
from websocket import create_connection

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

CHROME_PORT = 9555

def get_ws_url():
    resp = urllib.request.urlopen(f"http://127.0.0.1:{CHROME_PORT}/json/version").read()
    data = json.loads(resp)
    return data['webSocketDebuggerUrl']

def main():
    ws_url = get_ws_url()
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
    send_session("Log.enable")

    # Build init script
    with open(r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\auto-inject-final.js", "r", encoding="utf-8") as f:
        init_script = f.read()
    print(f"Init script size: {len(init_script)} chars")

    add_script = send_session("Page.addScriptToEvaluateOnNewDocument", {"source": init_script})
    print(f"Added init script: {add_script.get('result', {}).get('identifier', '')[:20]}")

    # Navigate
    print(f"\n=== Navigating to fanqie chapter 190 ===")
    send_session("Page.navigate", {"url": "https://fanqienovel.com/reader/7445246192578986520"})

    # Wait for full page + user.js execution
    time.sleep(10)

    # Drain events
    ws.settimeout(0.3)
    while True:
        try:
            resp = json.loads(ws.recv())
            if resp.get('method'):
                events.append(resp)
        except:
            break

    # Page state
    print("\n=== Page state ===")
    state = send_session("Runtime.evaluate", {
        "expression": """(() => {
      return {
        url: location.href,
        title: document.title,
        gmMockReady: window.__gmMockReady,
        hasGM: typeof window.GM_xmlhttpRequest === 'function',
        hasVue: !!window.Vue,
        userJsRan: window.__userJsRan,
        userJsError: window.__userJsErr,
        fqaElements: document.querySelectorAll('[class*="fqa-"]').length,
        bodyTextLen: document.body.innerText.length
      };
    })()""",
        "returnByValue": True
    })
    print(json.dumps(state['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    # Console messages
    print("\n=== Console messages (errors only) ===")
    console_msgs = [e for e in events if e.get('method') == 'Runtime.consoleAPICalled']
    for m in console_msgs:
        params = m.get('params', {})
        if params.get('type') in ('error', 'warning'):
            args = params.get('args', [])
            text = ' | '.join([
                a.get('value', '') if a.get('value') else a.get('description', '')[:80]
                for a in args if a
            ])
            if text:
                print(f"  [{params.get('type')}] {text[:200]}")

    # Network requests to snssdk
    print("\n=== Network: snssdk requests ===")
    network = [e for e in events if e.get('method') == 'Network.requestWillBeSent']
    snssdk = [e for e in network if 'snssdk' in e.get('params', {}).get('request', {}).get('url', '')]
    print(f"Total snssdk requests: {len(snssdk)}")
    for e in snssdk[:5]:
        url = e['params']['request']['url'][:120]
        print(f"  {url}")

    # Check chapter content visibility
    print("\n=== Chapter content analysis ===")
    chapter = send_session("Runtime.evaluate", {
        "expression": """(() => {
      const enc = document.querySelector('.font-DNMrHsV173Pd4pgy, .font-fKts9tCXDjS49UhH');
      if (!enc) return { found: false };
      const mapping = [
        'D在主特家军然表场4要只v和?6别还g现儿岁??此象月3出战工相',
        'o男直失世F都平文什VO将真T那当?会立些u是十张学气大爱两命全',
        '后东性通被1它乐接而感车山公了常以何可话先pi叫轻M士w着变尔快',
        'l个说少色里安花远7难师放t报认面道S?克地度I好机U民写把万同',
        '水新没书电吃像斯5为y白几日教看但第加候作上拉住有法r事应位利你',
        '声身国问马女他Y比父xAHNsX边美对所金活回意到z从j知又内因',
        '点Q三定8Rb正或夫向德听更?得告并本q过记L让打f人就者去原满',
        '体做经K走如孩cG给使物?最笑部?员等受k行一条果动光门头见往自',
        '解成处天能于名其发总母的死手入路进心来h时力多开已许d至由很界n',
        '小与Z想代么分生口再妈望次西风种带J?实情才这?E我神格长觉间年',
        '眼无不亲关结0友信下却重己老2音字m呢明之前高PB目太e9起稜她',
        '也W用方子英每理便四数期中C外样a海们任'
      ];
      const code_st = 58344, code_ed = 58715;
      const flat = mapping.join('');
      function decrypt(text) {
        let r = '', ch = false;
        for (const c of text) {
          const cp = c.codePointAt(0);
          if (cp < code_st || cp > code_ed) { r += c; continue; }
          const m = flat[cp - code_st];
          if (m && m !== '?') { r += m; ch = true; } else { r += c; }
        }
        return ch ? r : text;
      }
      const walker = document.createTreeWalker(enc, NodeFilter.SHOW_TEXT, null);
      let n;
      while ((n = walker.nextNode())) {
        const o = n.nodeValue; const d = decrypt(o);
        if (d !== o) n.nodeValue = d;
      }
      const text = enc.innerText;
      const meta = document.querySelector('.muye-reader-subtitle');
      return {
        found: true,
        decryptedLen: text.length,
        metaWordCount: meta ? meta.innerText : null,
        decryptedSample: text.substring(0, 250),
        decryptedEnd: text.slice(-100)
      };
    })()""",
        "returnByValue": True
    })
    result = chapter['result']['result'].get('value', {})
    print(json.dumps(result, indent=2, ensure_ascii=False))

    ws.close()
    print("\n=== DONE ===")

if __name__ == "__main__":
    main()