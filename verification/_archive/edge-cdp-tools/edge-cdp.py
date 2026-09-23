#!/usr/bin/env python3
"""
Drive Edge via CDP. Open a fanqie page, inject user.js, verify full chapter content.
"""
import json
import sys
import time
import urllib.request
from websocket import create_connection

EDGE_WS = "ws://127.0.0.1:9333/devtools/browser/c1a0f696-9c4a-4b15-a575-3ce6bd04f64b"

def list_pages():
    resp = urllib.request.urlopen("http://127.0.0.1:9333/json").read()
    return json.loads(resp)

def main():
    pages = list_pages()
    print(f"=== Existing pages ===")
    for p in pages:
        print(f"  {p['id'][:8]} {p['type']:15} {p.get('title', '')[:50]} {p.get('url', '')[:60]}")

    # Connect to browser-level CDP
    ws = create_connection(EDGE_WS, timeout=30)
    msg_id = [0]
    def send(method, params=None):
        msg_id[0] += 1
        msg = {"id": msg_id[0], "method": method, "params": params or {}}
        ws.send(json.dumps(msg))
        while True:
            resp = json.loads(ws.recv())
            if resp.get('id') == msg_id[0]:
                return resp
            # ignore events

    # Create a new target (page)
    new_target = send("Target.createTarget", {"url": "about:blank"})
    target_id = new_target['result']['targetId']
    print(f"\nCreated target: {target_id}")

    # Attach to it
    attach = send("Target.attachToTarget", {"targetId": target_id, "flatten": True})
    session_id = attach['result']['sessionId']
    print(f"Session: {session_id}")

    def send_session(method, params=None):
        msg_id[0] += 1
        msg = {"id": msg_id[0], "sessionId": session_id, "method": method, "params": params or {}}
        ws.send(json.dumps(msg))
        while True:
            resp = json.loads(ws.recv())
            if resp.get('id') == msg_id[0]:
                return resp

    # Navigate to fanqie
    print("\n=== Navigating to fanqie ===")
    nav = send_session("Page.enable")
    nav = send_session("Page.navigate", {"url": "https://fanqienovel.com/reader/7445246192578986520"})
    print(f"Navigate: {nav.get('result', {}).get('frameId', '')[:20]}...")

    # Wait for page to load
    time.sleep(5)

    # Check current state
    eval = send_session("Runtime.evaluate", {"expression": "({url: location.href, title: document.title, hasGM: !!window.GM_xmlhttpRequest, hasFqa: document.querySelectorAll('[class*=fqa-]').length, bodyTextLen: document.body.innerText.length})", "returnByValue": True})
    print(f"Page state: {json.dumps(eval['result']['result'].get('value', {}), indent=2)}")

    ws.close()

if __name__ == "__main__":
    main()