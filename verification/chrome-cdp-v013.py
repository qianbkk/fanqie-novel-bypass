# -*- coding: utf-8 -*-
"""Test v0.1.3 with BufferSource fix + auto-recovery trigger."""
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

    with open(r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\auto-inject-v013.js", "r", encoding="utf-8") as f:
        init_script = f.read()
    print(f"Init script size: {len(init_script)} chars")

    add_script = send_session("Page.addScriptToEvaluateOnNewDocument", {"source": init_script})
    print(f"Added init script")

    print("\n=== Navigating to fanqie chapter 190 ===")
    send_session("Page.navigate", {"url": "https://fanqienovel.com/reader/7445246192578986520"})

    time.sleep(8)
    ws.settimeout(0.3)
    while True:
        try:
            resp = json.loads(ws.recv())
            if resp.get('method'):
                events.append(resp)
        except:
            break

    print("\n=== Page state ===")
    state = send_session("Runtime.evaluate", {
        "expression": """(() => {
      return {
        url: location.href,
        title: document.title,
        gmMockReady: window.__gmMockReady,
        fqaElements: document.querySelectorAll('[class*="fqa-"]').length,
        recoveryModal: !!document.getElementById('fqa-recovery-modal'),
        bodyTextLen: document.body.innerText.length
      };
    })()""",
        "returnByValue": True
    })
    print(json.dumps(state['result']['result'].get('value', {}), indent=2, ensure_ascii=False))

    print("\n=== Console (errors) ===")
    msgs = [e for e in events if e.get('method') == 'Runtime.consoleAPICalled']
    for m in msgs:
        params = m.get('params', {})
        if params.get('type') in ('error', 'warning', 'info', 'log'):
            args = params.get('args', [])
            text = ' | '.join([
                a.get('value', '') if a.get('value') else a.get('description', '')[:80]
                for a in args if a
            ])
            if text and ('fqa' in text or 'error' in text.lower() or 'snssdk' in text):
                print(f"  [{params.get('type')}] {text[:200]}")

    print("\n=== Snssdk requests ===")
    network = [e for e in events if e.get('method') == 'Network.requestWillBeSent']
    snssdk = [e for e in network if 'snssdk' in e.get('params', {}).get('request', {}).get('url', '')]
    print(f"Total: {len(snssdk)}")
    for e in snssdk[:5]:
        print(f"  {e['params']['request']['url'][:100]}")

    ws.close()
    print("\nDONE")

if __name__ == "__main__":
    main()