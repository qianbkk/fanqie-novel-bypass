#!/usr/bin/env python3
"""
Drive Edge via CDP. Open a fanqie page, inject user.js, verify full chapter content.
"""
# -*- coding: utf-8 -*-
import json
import sys
import time
import urllib.request
from websocket import create_connection
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

EDGE_WS = "ws://127.0.0.1:9333/devtools/browser/c1a0f696-9c4a-4b15-a575-3ce6bd04f64b"
INJECT_FILE = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\auto-inject-final.js"
USERJS_FILE = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\release\fanqie-assistant-v0.1.2.user.js"
TARGET_URL = "https://fanqienovel.com/reader/7445246192578986520"

def build_init_script():
    """Build init script with GM mocks + Vue/moment stub + user.js body"""
    with open(USERJS_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    idx = content.index("(function (vue, moment)")
    body = content[idx:]

    gm_mocks = """
(() => {
  const __gmStore = {};
  window.GM_xmlhttpRequest = function (opts) {
    const headers = Object.assign({}, opts.headers || {});
    if (headers['Content-Type'] || headers['content-type']) {
      headers['Content-Type'] = 'text/plain;charset=UTF-8';
    }
    delete headers['Host']; delete headers['host']; delete headers['Content-Length'];
    delete headers['content-length']; delete headers['Accept-Encoding']; delete headers['accept-encoding'];
    const fetchOpts = {
      method: opts.method || 'GET', headers, credentials: 'omit', mode: 'cors', cache: 'no-store',
    };
    if (opts.responseType === 'arraybuffer') fetchOpts.headers['Accept'] = '*/*';
    if (opts.data) fetchOpts.body = String(opts.data);
    fetch(opts.url, fetchOpts).then(async (r) => {
      const buf = await r.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let text = '';
      for (let i = 0; i < bytes.length; i++) text += String.fromCharCode(bytes[i]);
      const resp = { status: r.status, statusText: r.statusText, response: text, responseText: text, finalUrl: r.url, readyState: 4, context: opts.context };
      if (typeof opts.onload === 'function') try { opts.onload(resp); } catch (e) { console.error('[gm-mock] onload err', e); }
    }).catch((err) => {
      if (typeof opts.onerror === 'function') try { opts.onerror({ error: String(err), context: opts.context }); } catch (e) { console.error('[gm-mock] onerror err', e); }
    });
    return { abort: () => {} };
  };
  window.GM_getValue = (k, def) => k in __gmStore ? __gmStore[k] : def;
  window.GM_setValue = (k, v) => { __gmStore[k] = v; };
  window.GM_deleteValue = (k) => { delete __gmStore[k]; };
  window.GM_addStyle = (css) => {
    const s = document.createElement('style'); s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  };
  window.unsafeWindow = window;
  const makeStub = (n) => new Proxy(function () { return makeStub(n); }, {
    get: (t, p) => {
      if (p === Symbol.toPrimitive) return () => '';
      if (p === 'reactive') return (o) => o;
      if (p === 'ref') return (v) => ({ value: v });
      if (p === 'shallowRef') return (v) => ({ value: v });
      if (p === 'watch') return () => {};
      if (p === 'watchEffect') return () => {};
      if (p === 'defineComponent') return (c) => c;
      if (p === 'openBlock') return () => {};
      if (p === 'createElementBlock') return () => document.createElement('div');
      if (p === 'createTextVNode') return () => document.createTextNode('');
      if (p === 'withModifiers') return (fn) => fn;
      if (p === 'toRefs') return (o) => o;
      if (p === 'toRef') return (o, k) => ({ value: o[k] });
      if (p === 'computed') return (fn) => ({ value: fn ? fn() : undefined });
      if (p === 'inject') return () => ({});
      if (p === 'provide') return () => {};
      if (p === 'nextTick') return (fn) => Promise.resolve().then(fn);
      if (p === 'onMounted') return (fn) => { try { fn && fn(); } catch (e) {} };
      if (p === 'onBeforeUnmount') return () => {};
      if (p === 'onUnmounted') return () => {};
      if (p === 'h') return (tag, props, children) => {
        const el = document.createElement(tag || 'div');
        if (props) for (const k in props) el.setAttribute(k, props[k]);
        if (children) el.textContent = String(children);
        return el;
      };
      if (p === 'Fragment') return Symbol.for('Fragment');
      if (p === 'Teleport') return Symbol.for('Teleport');
      return makeStub(n);
    },
    apply: (t, thisArg, args) => makeStub(n),
  });
  window.Vue = makeStub('Vue');
  window.moment = function () { return makeStub('moment'); };
  window.moment.utc = () => makeStub('moment');
  window.moment.unix = () => makeStub('moment');
  window.__gmMockReady = true;
  console.log('[gm-mock] init OK at ' + Date.now());
})();
"""
    return gm_mocks + "\n" + body

def main():
    ws = create_connection(EDGE_WS, timeout=30)
    msg_id = [0]
    pending = {}

    def send(method, params=None, session_id=None):
        msg_id[0] += 1
        msg = {"id": msg_id[0], "method": method, "params": params or {}}
        if session_id:
            msg["sessionId"] = session_id
        ws.send(json.dumps(msg))
        while True:
            resp = json.loads(ws.recv())
            if resp.get('id') == msg_id[0]:
                return resp
            # ignore events for now

    # Create a new target
    new_target = send("Target.createTarget", {"url": "about:blank"})
    target_id = new_target['result']['targetId']
    print(f"Created target: {target_id}")

    # Attach to it
    attach = send("Target.attachToTarget", {"targetId": target_id, "flatten": True})
    session_id = attach['result']['sessionId']
    print(f"Session: {session_id}")

    def send_session(method, params=None):
        return send(method, params, session_id)

    # Enable domains
    send_session("Page.enable")
    send_session("Runtime.enable")
    send_session("Network.enable")

    # Build init script
    init_script = build_init_script()
    print(f"Init script size: {len(init_script)} chars")

    # Add script to evaluate on new document
    add_script = send_session("Page.addScriptToEvaluateOnNewDocument", {"source": init_script})
    print(f"Added init script: {add_script.get('result', {}).get('identifier', '')[:30]}...")

    # Navigate to fanqie
    print(f"\n=== Navigating to {TARGET_URL} ===")
    nav = send_session("Page.navigate", {"url": TARGET_URL})

    # Wait for page load + user.js execution
    time.sleep(8)

    # Check state
    print("\n=== Page state after init ===")
    eval = send_session("Runtime.evaluate", {
        "expression": "({url: location.href, title: document.title, hasGM: !!window.GM_xmlhttpRequest, hasVue: !!window.Vue, fqaCount: document.querySelectorAll('[class*=fqa-]').length, chapterWordCount: document.querySelector('.muye-reader-subtitle')?.innerText, bodyTextLen: document.body.innerText.length, bodyTextSample: document.body.innerText.substring(0, 300)})",
        "returnByValue": True
    })
    print(json.dumps(eval['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    # Try to find the chapter content via font decryption
    print("\n=== Decrypting chapter content ===")
    decrypt = send_session("Runtime.evaluate", {
        "expression": """
(() => {
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
  function decryptText(text) {
    let r = '', changed = false;
    for (const c of text) {
      const cp = c.codePointAt(0);
      if (cp < code_st || cp > code_ed) { r += c; continue; }
      const m = flat[cp - code_st];
      if (m && m !== '?') { r += m; changed = true; } else { r += c; }
    }
    return changed ? r : text;
  }
  const walker = document.createTreeWalker(enc, NodeFilter.SHOW_TEXT, null);
  let n;
  while ((n = walker.nextNode())) {
    const o = n.nodeValue; const d = decryptText(o);
    if (d !== o) n.nodeValue = d;
  }
  return {
    found: true,
    decryptedTextLen: enc.innerText.length,
    decryptedText: enc.innerText
  };
})()
        """,
        "returnByValue": True
    })
    result = decrypt['result']['result'].get('value', {})
    if result.get('found'):
        print(f"Decrypted text length: {result.get('decryptedTextLen')}")
        print(f"Text sample (first 300): {result.get('decryptedText', '')[:300]}")
    else:
        print(f"No encrypted element found")

    ws.close()

if __name__ == "__main__":
    main()