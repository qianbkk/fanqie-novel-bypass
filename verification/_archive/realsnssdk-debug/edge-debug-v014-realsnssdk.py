# -*- coding: utf-8 -*-
"""v0.1.4 e2e against REAL snssdk endpoints, not mocked.

Previous harnesses mocked GM_xmlhttpRequest entirely, which proved the
BufferSource fix but did NOT prove that v0.1.4 can decrypt real chapter
payloads. fanqienovel.com's SSR page only renders ~365 chars (front-matter
+ encrypted first paragraph + paywall banner); the actual chapter body is
returned by reader/full/v on snssdk and decrypted by user.js.

This script:
  - launches a clean msedge profile on port 9556
  - injects v0.1.4 via Page.addScriptToEvaluateOnNewDocument
  - lets GM_xmlhttpRequest hit snssdk for real
  - waits 25 s for registerDevice + registerkey + reader/full to land
  - reports the resulting body length and any BufferSource errors
"""
import json
import os
import subprocess
import sys
import time
import urllib.request
from websocket import create_connection

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

EDGE_PORT = 9556
PROFILE_DIR = r"D:\temp\edge-test-real"
INIT_SCRIPT_PATH = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\realsnssdk-inject.js"
ITEM_IDS = [
    ("Ch100", "7431911046148801086"),
    ("Ch500", "7503749943413195288"),
]


def start_edge():
    """Kill any prior debug instance, then start a fresh one."""
    # Find and stop prior 9556 listener.
    res = subprocess.run(
        ["powershell", "-NoProfile", "-Command",
         "Get-NetTCPConnection -State Listen -LocalPort 9556 -ErrorAction SilentlyContinue | "
         "ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"],
        capture_output=True, text=True)
    time.sleep(1)

    msedge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.isdir(PROFILE_DIR):
        os.makedirs(PROFILE_DIR, exist_ok=True)
    args = [
        msedge,
        f"--user-data-dir={PROFILE_DIR}",
        f"--remote-debugging-port={EDGE_PORT}",
        "--remote-allow-origins=*",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "about:blank",
    ]
    subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    # Wait for /json/version to respond
    for _ in range(15):
        time.sleep(1)
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{EDGE_PORT}/json/version", timeout=2).read()
            return True
        except Exception:
            continue
    return False


def main():
    print("Starting fresh Edge on port 9556 with clean profile...")
    if not start_edge():
        print("ERROR: Edge did not start")
        return 2

    resp = urllib.request.urlopen(f"http://127.0.0.1:{EDGE_PORT}/json/version").read()
    ws_url = json.loads(resp)['webSocketDebuggerUrl']
    ws = create_connection(ws_url, timeout=60)
    msg_id = [0]

    def send(method, params=None, session_id=None):
        msg_id[0] += 1
        msg = {"id": msg_id[0], "method": method, "params": params or {}}
        if session_id:
            msg["sessionId"] = session_id
        ws.send(json.dumps(msg))
        ws.settimeout(60)
        while True:
            r = json.loads(ws.recv())
            if r.get('method'):
                continue
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
    s("Network.enable")

    with open(INIT_SCRIPT_PATH, "r", encoding="utf-8") as f:
        user_js = f.read()

    # Wrap with importKey failure counter so we can detect any un-fixed
    # BufferSource rejection. We do NOT mock GM_xmlhttpRequest — the
    # whole point is to let it hit snssdk.
    tracker = r"""
    window.__importKeyStats = { rejected: 0, accepted: 0 };
    const __orig = window.crypto.subtle.importKey.bind(window.crypto.subtle);
    window.crypto.subtle.importKey = async function(format, keyData, ...rest) {
      if (format === 'raw' && keyData instanceof ArrayBuffer) {
        window.__importKeyStats.rejected++;
        throw new TypeError("Key data must be a BufferSource for non-JWK formats.");
      }
      const r = await __orig(format, keyData, ...rest);
      if (format === 'raw') window.__importKeyStats.accepted++;
      return r;
    };
    window.__userjsErrors = [];
    window.addEventListener('error', e => window.__userjsErrors.push(String(e.error || e.message)));
    window.addEventListener('unhandledrejection', e => window.__userjsErrors.push('unhandledrejection: ' + String(e.reason)));
    """
    # realsnssdk-inject.js already includes Vue, moment, and the user.js IIFE,
    # plus an importKey watcher. Inject ours AFTER so it overrides any
    # duplicate global variables.
    s("Page.addScriptToEvaluateOnNewDocument", {"source": user_js + "\n" + tracker})

    print(f"\nEdge debug profile: {PROFILE_DIR}")
    print(f"User.js: {INIT_SCRIPT_PATH}")
    print(f"Tracker installed. importKey ArrayBuffer will be rejected.\n")

    results = []
    for label, item_id in ITEM_IDS:
        url = f"https://fanqienovel.com/reader/{item_id}"
        print(f"--- {label}: navigate to {url} ---")
        s("Page.navigate", {"url": url})

        # Real snssdk flow: device_register → registerkey → reader/full → decrypt → DOM
        # 25 s is generous; we've seen 15-20 s typical on real pages.
        wait = 25
        for w in [5, 10, 15, 20, 25]:
            time.sleep(w if w == 5 else 5)
            final = s("Runtime.evaluate", {
                "expression": """(w => { const bt = document.body.innerText;
            const muye = document.querySelector('div.muye-reader-content:not(.fqa)');
            const muyeText = muye ? muye.innerText : '';
            const fqaContainer = document.querySelector('#fqa-reader-content');
            const fqaArticle = document.querySelector('#fqa-reader-content article');
            const fqaText = fqaContainer ? fqaContainer.innerText : '';
            return {
              waitS: w,
              bodyLen: bt.length,
              muyeLen: muyeText.length,
              fqaLen: fqaText.length,
              hasFqa: !!fqaContainer,
              hasFqaArticle: !!fqaArticle,
              fqaArticleParas: fqaArticle ? fqaArticle.querySelectorAll('p').length : 0,
              importStats: window.__importKeyStats || {},
              bodySample: bt.slice(0, 200),
              fqaSample: fqaText.slice(0, 200)
            };
          })(""" + str(w) + """)""",
                "returnByValue": True,
            })
            r = final['result']['result'].get('value', {})
            print(f"  [t+{w:2d}s] bodyLen={r['bodyLen']} muyeLen={r['muyeLen']} fqaLen={r['fqaLen']} hasFqa={r['hasFqa']} paras={r['fqaArticleParas']} import.rejected={r['importStats']['rejected']} accepted={r['importStats']['accepted']}")
            if r['fqaLen'] >= 1500:
                print(f"  >>> {label} PASSED at t+{w}s")
                results.append({'label': label, 'pass': True, **r})
                break
        else:
            results.append({'label': label, 'pass': False, **r})
            print(f"  !!! {label} did not reach 1500 chars within 25s")

        ws.settimeout(0.3)
        try:
            while True:
                ws.recv()
        except Exception:
            pass

    print("\n=== SUMMARY ===")
    passed = sum(1 for r in results if r['pass'])
    print(f"Real-snssdk e2e: {passed}/{len(ITEM_IDS)} chapters reached >= 1500 chars via #fqa-reader-content")
    total_rejected = sum(r['importStats']['rejected'] for r in results)
    total_accepted = sum(r['importStats']['accepted'] for r in results)
    print(f"Total importKey: rejected={total_rejected} accepted={total_accepted}")
    ws.close()
    return 0 if passed == len(ITEM_IDS) else 1


if __name__ == "__main__":
    sys.exit(main())