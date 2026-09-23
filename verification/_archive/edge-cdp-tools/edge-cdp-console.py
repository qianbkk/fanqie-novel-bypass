# -*- coding: utf-8 -*-
"""
Drive Edge via CDP. Get console messages and check for errors.
"""
import json
import time
import urllib.request
from websocket import create_connection

EDGE_WS = "ws://127.0.0.1:9333/devtools/browser/c1a0f696-9c4a-4b15-a575-3ce6bd04f64b"
TARGET_URL = "https://fanqienovel.com/reader/7445246192578986520"

def main():
    ws = create_connection(EDGE_WS, timeout=30)
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
    send_session("Log.enable")
    send_session("Network.enable")

    # Add init script with user.js
    with open(r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\auto-inject-final.js", "r", encoding="utf-8") as f:
        init_script = f.read()

    send_session("Page.addScriptToEvaluateOnNewDocument", {"source": init_script})
    send_session("Page.navigate", {"url": TARGET_URL})

    # Wait
    time.sleep(8)

    # Drain events
    ws.settimeout(0.5)
    while True:
        try:
            resp = json.loads(ws.recv())
            if resp.get('method'):
                events.append(resp)
        except:
            break

    # Get console messages
    msgs = [e for e in events if e.get('method') == 'Runtime.consoleAPICalled' or e.get('method') == 'Runtime.exceptionThrown' or e.get('method') == 'Log.entryAdded']
    print(f"=== Console messages ({len(msgs)}) ===")
    for m in msgs[:50]:
        method = m.get('method')
        params = m.get('params', {})
        if method == 'Runtime.consoleAPICalled':
            args = params.get('args', [])
            text = ' | '.join([a.get('value', a.get('description', ''))[:100] for a in args])
            level = params.get('type', '')
            print(f"  [{level}] {text}")
        elif method == 'Runtime.exceptionThrown':
            ex = params.get('exceptionDetails', {})
            print(f"  [EXCEPTION] {ex.get('text', '')}: {ex.get('exception', {}).get('description', '')[:200]}")
        elif method == 'Log.entryAdded':
            entry = params.get('entry', {})
            print(f"  [NET-{entry.get('source', '')}-{entry.get('level', '')}] {entry.get('text', '')[:150]}")

    # Get network requests
    print("\n=== Network requests to snssdk ===")
    network_events = [e for e in events if e.get('method') == 'Network.requestWillBeSent']
    snssdk_reqs = [e for e in network_events if 'snssdk' in e.get('params', {}).get('request', {}).get('url', '')]
    for e in snssdk_reqs[:20]:
        url = e['params']['request']['url'][:100]
        method = e['params']['request'].get('method', '')
        print(f"  [{method}] {url}")

    ws.close()

if __name__ == "__main__":
    main()