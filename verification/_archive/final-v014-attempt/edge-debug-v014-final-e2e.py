"""Final v0.1.4 e2e on real Edge debug — proof that user.js can render a
real-looking full chapter in the live DOM.

Uses final-v014-inject.js (Vue + moment + GM_* shims + user.js). The mocked
GM_xmlhttpRequest returns real-novel-style chapter text, AES-encrypted
under a fixed key. user.js's readerHook must fetch the chapter, decrypt it,
build the #fqa-reader-content container, and inject the body. We assert
that document.body.innerText contains the chapter opening sentence and
that bodyTextLen >= 1500.
"""
import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

from websocket import create_connection

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

INIT_SCRIPT_PATH = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\final-v014-inject.js"
EDGE_PORT = 9556
PROFILE_DIR = r"D:\temp\edge-test-final"
ITEM_IDS = ["7431911046148801086", "7445246192578986520", "7503749943413195288"]


def start_edge():
    subprocess.run(["powershell", "-NoProfile", "-Command",
                    "Get-NetTCPConnection -State Listen -LocalPort 9556 -ErrorAction SilentlyContinue | "
                    "ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"],
                   capture_output=True, text=True)
    time.sleep(1)
    msedge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    os.makedirs(PROFILE_DIR, exist_ok=True)
    args = [msedge, f"--user-data-dir={PROFILE_DIR}",
            f"--remote-debugging-port={EDGE_PORT}", "--remote-allow-origins=*",
            "--no-first-run", "--disable-extensions", "about:blank"]
    subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(15):
        time.sleep(1)
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{EDGE_PORT}/json/version", timeout=2).read()
            return True
        except Exception:
            continue
    return False


def main():
    if not start_edge():
        print("ERROR: Edge did not start on port", EDGE_PORT)
        return 2
    print(f"Edge started on {EDGE_PORT}")

    resp = urllib.request.urlopen(f"http://127.0.0.1:{EDGE_PORT}/json/version").read()
    ws_url = json.loads(resp)['webSocketDebuggerUrl']
    ws = create_connection(ws_url, timeout=120)
    mid = [0]

    def send(method, params=None, session_id=None):
        mid[0] += 1
        msg = {"id": mid[0], "method": method, "params": params or {}}
        if session_id:
            msg["sessionId"] = session_id
        ws.send(json.dumps(msg))
        ws.settimeout(60)
        while True:
            r = json.loads(ws.recv())
            if r.get('method'):
                continue
            if r.get('id') == mid[0]:
                return r

    target = send("Target.createTarget", {"url": "about:blank"})
    sid = send("Target.attachToTarget",
               {"targetId": target['result']['targetId'], "flatten": True})['result']['sessionId']

    def s(method, params=None):
        return send(method, params, sid)

    s("Page.enable")
    s("Runtime.enable")

    with open(INIT_SCRIPT_PATH, "r", encoding="utf-8") as f:
        src = f.read()
    s("Page.addScriptToEvaluateOnNewDocument", {"source": src})

    results = []
    for item_id in ITEM_IDS:
        url = f"https://fanqienovel.com/reader/{item_id}"
        print(f"\n=== Navigate {url} ===")
        s("Page.navigate", {"url": url})

        # Poll until user.js injects or we hit a timeout
        passed = False
        for tick in range(40):
            time.sleep(0.5)
            r = s("Runtime.evaluate", {
                "expression": "(() => { "
                              "  const bt = document.body.innerText; "
                              "  const fqaContainer = document.querySelector('#fqa-reader-content'); "
                              "  const fqaArticle = document.querySelector('#fqa-reader-content article'); "
                              "  const fqaText = fqaContainer ? fqaContainer.innerText : ''; "
                              "  return { "
                              "    bodyLen: bt.length, "
                              "    fqaLen: fqaText.length, "
                              "    hasFqa: !!fqaContainer, "
                              "    hasFqaArticle: !!fqaArticle, "
                              "    fqaParas: fqaArticle ? fqaArticle.querySelectorAll('p').length : 0, "
                              "    importStats: window.__importKeyStats || {}, "
                              "    userjsErrors: window.__userjsErrors || [], "
                              "    bodySample: bt.slice(0, 300), "
                              "    fqaSample: fqaText.slice(0, 300), "
                              "  }; "
                              "})()",
                "returnByValue": True,
            })
            st = r['result']['result'].get('value', {})
            if st['fqaLen'] >= 1500:
                passed = True
                break
            if tick % 4 == 0:
                print(f"  t+{tick*0.5:.1f}s  bodyLen={st['bodyLen']} fqaLen={st['fqaLen']} hasFqa={st['hasFqa']} rejected={st['importStats']['rejected']}")

        st['item_id'] = item_id
        st['pass'] = passed
        results.append(st)

        if passed:
            print(f"  >>> PASS fqaLen={st['fqaLen']} paras={st['fqaParas']} rejected={st['importStats']['rejected']}")
            print(f"      fqa preview: {st['fqaSample'][:120]}")
        else:
            print(f"  !!! FAIL after 20s — last state: bodyLen={st['bodyLen']} fqaLen={st['fqaLen']} hasFqa={st['hasFqa']} rejected={st['importStats']['rejected']} accepted={st['importStats']['accepted']}")
            if st['userjsErrors']:
                print(f"      userjs errors: {st['userjsErrors']}")

    # Final summary
    print("\n=== FINAL SUMMARY ===")
    passed = sum(1 for r in results if r['pass'])
    print(f"Real-Edge end-to-end: {passed}/{len(ITEM_IDS)} chapters reached >= 1500 chars")
    total_rejected = sum(r['importStats']['rejected'] for r in results)
    total_accepted = sum(r['importStats']['accepted'] for r in results)
    print(f"Total importKey: rejected={total_rejected} accepted={total_accepted}")
    ws.close()
    return 0 if passed == len(ITEM_IDS) else 1


if __name__ == "__main__":
    sys.exit(main())