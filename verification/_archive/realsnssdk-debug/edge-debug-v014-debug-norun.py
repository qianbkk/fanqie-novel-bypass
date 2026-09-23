"""Diagnostic: just run realsnssdk-inject on Edge debug, then dump console messages."""
import json
import os
import subprocess
import sys
import time
import urllib.request
from websocket import create_connection

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

INIT_SCRIPT_PATH = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\realsnssdk-inject.js"
EDGE_PORT = 9556
PROFILE_DIR = r"D:\temp\edge-test-real"


def start_edge():
    subprocess.run(["powershell", "-NoProfile", "-Command",
                    "Get-NetTCPConnection -State Listen -LocalPort 9556 -ErrorAction SilentlyContinue | "
                    "ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"],
                   capture_output=True, text=True)
    time.sleep(1)
    msedge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    args = [msedge, f"--user-data-dir={PROFILE_DIR}",
            f"--remote-debugging-port={EDGE_PORT}", "--remote-allow-origins=*",
            "--no-first-run", "--no-default-browser-check", "--disable-extensions", "about:blank"]
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
        print("ERROR: Edge did not start")
        return 2

    resp = urllib.request.urlopen(f"http://127.0.0.1:{EDGE_PORT}/json/version").read()
    ws_url = json.loads(resp)['webSocketDebuggerUrl']
    ws = create_connection(ws_url, timeout=120)
    msg_id = [0]
    pending = {}
    console_msgs = []
    exceptions = []

    def send(method, params=None, session_id=None):
        msg_id[0] += 1
        msg = {"id": msg_id[0], "method": method, "params": params or {}}
        if session_id:
            msg["sessionId"] = session_id
        ws.send(json.dumps(msg))
        ws.settimeout(120)
        while True:
            r = json.loads(ws.recv())
            if r.get('method') == 'Runtime.consoleAPICalled':
                args = r['params']['args']
                txt = ' '.join(str(a.get('value', a.get('description', ''))) for a in args)
                console_msgs.append((r['params']['type'], txt))
            elif r.get('method') == 'Runtime.exceptionThrown':
                ex = r['params'].get('exceptionDetails', {})
                exceptions.append(ex.get('text', '') + ' ' + str(ex.get('exception', {}).get('description', '')))
            if r.get('id') == msg_id[0]:
                return r

    target = send("Target.createTarget", {"url": "about:blank"})
    tid = target['result']['targetId']
    attach = send("Target.attachToTarget", {"targetId": tid, "flatten": True})
    session_id = attach['result']['sessionId']

    def s(method, params=None):
        return send(method, params, session_id)

    s("Page.enable")
    s("Runtime.enable")
    s("Log.enable")
    s("Network.enable")

    with open(INIT_SCRIPT_PATH, "r", encoding="utf-8") as f:
        body = f.read()
    s("Page.addScriptToEvaluateOnNewDocument", {"source": body})

    s("Page.navigate", {"url": "https://fanqienovel.com/reader/7431911046148801086"})
    print("Navigated. Waiting 20 s ...")
    for tick in range(20):
        time.sleep(1)
        # poll read so console msgs accumulate
        ws.settimeout(0.5)
        try:
            while True:
                r = json.loads(ws.recv())
                if r.get('method') == 'Runtime.consoleAPICalled':
                    args = r['params']['args']
                    txt = ' '.join(str(a.get('value', a.get('description', ''))) for a in args)
                    console_msgs.append((r['params']['type'], txt))
                elif r.get('method') == 'Runtime.exceptionThrown':
                    ex = r['params'].get('exceptionDetails', {})
                    exceptions.append(ex.get('text', '') + ' ' + str(ex.get('exception', {}).get('description', '')))
        except Exception:
            pass

    # Diagnostic eval
    final = s("Runtime.evaluate", {
        "expression": """(() => {
          return {
            hasUserjsErrors: window.__userjsErrors || null,
            hasImportKeyStats: window.__importKeyStats || null,
            hasGM_xmlhttpRequest: typeof window.GM_xmlhttpRequest,
            hasVue: typeof window.Vue,
            hasMoment: typeof window.moment,
            bodyLen: document.body.innerText.length,
            muyeReaderExists: !!document.querySelector('div.muye-reader-content'),
            fqaExists: !!document.querySelector('#fqa-reader-content'),
            url: location.href,
          };
        })()""",
        "returnByValue": True,
    })
    info = final['result']['result'].get('value', {})
    print("\n=== Runtime state ===")
    for k, v in info.items():
        print(f"  {k}: {v}")
    print(f"\n=== Console messages ({len(console_msgs)}) ===")
    for t, m in console_msgs[-30:]:
        print(f"  [{t}] {m[:200]}")
    print(f"\n=== Exceptions ({len(exceptions)}) ===")
    for ex in exceptions[-15:]:
        print(f"  {ex[:300]}")

    ws.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())