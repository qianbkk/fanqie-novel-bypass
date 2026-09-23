"""Probe Vue/moment loading inside Edge debug. Connect to existing instance."""
import json, time, urllib.request
from websocket import create_connection

# Don't restart Edge — assume it's already running on 9556
resp = urllib.request.urlopen('http://127.0.0.1:9556/json/version').read()
ws = create_connection(json.loads(resp)['webSocketDebuggerUrl'], timeout=30)
mid = [0]
def send(m, p=None, sid=None):
    mid[0] += 1
    msg = {'id': mid[0], 'method': m, 'params': p or {}}
    if sid:
        msg['sessionId'] = sid
    ws.send(json.dumps(msg))
    ws.settimeout(30)
    while True:
        r = json.loads(ws.recv())
        if r.get('method'):
            continue
        if r.get('id') == mid[0]:
            return r

target = send('Target.createTarget', {'url': 'about:blank'})
attach = send('Target.attachToTarget', {'targetId': target['result']['targetId'], 'flatten': True})
sid = attach['result']['sessionId']
send('Page.enable', None, sid)
send('Runtime.enable', None, sid)
with open('realsnssdk-inject.js', 'r', encoding='utf-8') as f:
    src = f.read()
send('Page.addScriptToEvaluateOnNewDocument', {'source': src}, sid)
send('Page.navigate', {'url': 'https://fanqienovel.com/reader/7431911046148801086'}, sid)
time.sleep(8)
probe_js = (
    "JSON.stringify({"
    "hasWindowVue: typeof window.Vue, "
    "hasWindowMoment: typeof window.moment, "
    "VueReactive: typeof (window.Vue && window.Vue.reactive), "
    "VueCreateApp: typeof (window.Vue && window.Vue.createApp), "
    "lastFunction: typeof window.Vue, "
    "vueKeys: window.Vue ? Object.keys(window.Vue).slice(0, 20) : null"
    "})"
)
r = send('Runtime.evaluate', {'expression': probe_js, 'returnByValue': True}, sid)
print('STATE:', r['result']['result'].get('value'))
ws.close()