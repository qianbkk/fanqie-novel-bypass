"""Build an init script that wraps v0.1.4 with minimal GM_* shims, but
lets GM_xmlhttpRequest hit the real snssdk endpoints.

Output: verification/realsnssdk-inject.js
"""
import sys
from pathlib import Path

USERJS = Path(r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\release\fanqie-assistant-v0.1.4.user.js")
VUE = Path(r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\_archive\auto-chunks-temp-data\chunk-000.json")
OUT = Path(r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\realsnssdk-inject.js")

# Vue global prod build (small) + moment — we need them as IIFE inputs.
# Since we don't have them in node_modules, fetch from the @require URL
# via curl (or use a previously cached copy from the auto-chunks dir).
# Fallback: inline a tiny shim that mimics Vue's createApp enough to satisfy
# what user.js calls. We'll grab the real files from the npm CDN.

import urllib.request

def fetch_text(url):
    return urllib.request.urlopen(url, timeout=20).read().decode("utf-8")

print("Fetching Vue 3.5.40 global prod ...")
vue_src = fetch_text("https://registry.npmmirror.com/vue/3.5.40/files/dist/vue.global.prod.js")
print(f"  vue bytes: {len(vue_src)}")

print("Fetching moment 2.30.1 ...")
moment_src = fetch_text("https://registry.npmmirror.com/moment/2.30.1/files/min/moment.min.js")
print(f"  moment bytes: {len(moment_src)}")

print("Reading user.js ...")
userjs_src = USERJS.read_text(encoding="utf-8")
# Strip the ==UserScript== header block (everything between the markers).
import re
stripped = re.sub(r"^// ==UserScript==.*?^// ==/UserScript==\s*", "", userjs_src, count=1, flags=re.S | re.M)
print(f"  user.js bytes after header strip: {len(stripped)}")

shim = r"""
(function(){
  // unsafeWindow: Tampermonkey global. user.js reads it at IIFE top level
  // (readerHook.ts uses (unsafeWindow as typeof unsafeWindow & {...}) — without
  // TM, this is undefined and the script throws ReferenceError immediately).
  if (typeof window.unsafeWindow === 'undefined') {
    try { Object.defineProperty(window, 'unsafeWindow', { get: () => window }); } catch(e){}
  }
  const __gmStore = JSON.parse(localStorage.getItem('fqa.gmStore') || '{}');
  function save(){ try { localStorage.setItem('fqa.gmStore', JSON.stringify(__gmStore)); } catch(e){} }
  window.GM_addStyle = function(css){
    const s = document.createElement('style'); s.textContent = css; (document.head || document.documentElement).appendChild(s);
    return s;
  };
  window.GM_setValue = function(k, v){ __gmStore[k] = v; save(); };
  window.GM_getValue = function(k, def){ return k in __gmStore ? __gmStore[k] : def; };
  window.GM_deleteValue = function(k){ delete __gmStore[k]; save(); };
  // GM_xmlhttpRequest: NOT mocked. Pass straight through. user.js calls it
  // synchronously-with-callbacks so we wrap fetch() and adapt the shape.
  window.GM_xmlhttpRequest = function(opts){
    const url = opts.url, method = opts.method || 'GET', data = opts.data, headers = opts.headers || {}, user = opts.user, password = opts.password;
    const onload = opts.onload, onerror = opts.onerror, onprogress = opts.onprogress, ontimeout = opts.ontimeout;
    const ctrl = new AbortController();
    const p = fetch(url, { method, headers, body: data, credentials: opts.anonymous ? 'omit' : 'include', signal: ctrl.signal })
      .then(async resp => {
        const text = await resp.text();
        const finalUrl = resp.url || url;
        const headersObj = {};
        resp.headers.forEach((v, k) => { headersObj[k] = v; });
        // emulate xhr-style events so user.js can read responseText/finalUrl/etc.
        let progressLoaded = 0, progressTotal = text.length;
        if (onprogress) onprogress({ lengthComputable: true, loaded: progressLoaded, total: progressTotal, finalUrl });
        onload && onload({
          readyState: 4,
          status: resp.status,
          statusText: resp.statusText,
          responseHeaders: Object.entries(headersObj).map(([k,v]) => `${k}: ${v}`).join('\r\n'),
          responseText: text,
          finalUrl: finalUrl,
          context: opts.context
        });
      })
      .catch(err => {
        if (err.name === 'AbortError') { ontimeout && ontimeout(); return; }
        onerror && onerror({ error: String(err), readyState: 4, finalUrl: url });
      });
    return { abort: () => ctrl.abort() };
  };
})();
"""

importKey_watch = r"""
window.__importKeyStats = { rejected: 0, accepted: 0 };
const __origIK = window.crypto.subtle.importKey.bind(window.crypto.subtle);
window.crypto.subtle.importKey = async function(format, keyData, ...rest){
  if (format === 'raw' && keyData instanceof ArrayBuffer) {
    window.__importKeyStats.rejected++;
    throw new TypeError("Key data must be a BufferSource for non-JWK formats.");
  }
  const r = await __origIK(format, keyData, ...rest);
  if (format === 'raw') window.__importKeyStats.accepted++;
  return r;
};
window.__userjsErrors = [];
window.addEventListener('error', e => window.__userjsErrors.push(String(e.error || e.message)));
window.addEventListener('unhandledrejection', e => window.__userjsErrors.push('unhandledrejection: ' + String(e.reason)));
"""

# IIFE form: (function (vue, moment) { ... })(Vue, moment);
# Slice the body out between the opening brace and the closing })(Vue, moment);.
start = stripped.index("function (vue, moment) {") + len("function (vue, moment) {")
end_marker = "})(Vue, moment);"
end = stripped.rindex(end_marker)
body = stripped[start:end]
print(f"  IIFE body bytes: {len(body)}")

vue_shim_note = r"""
// vue param shim: user.js expects `vue` to be a namespace object with every
// Vue 3 API as a property (reactive, ref, computed, watch, h, createApp,
// onMounted, etc.). Vue 3's runtime-global build is itself a function
// (Vue.createApp etc. hang off it), so we Proxy into it.
"""
assembled = (
    importKey_watch + "\n"
    + shim + "\n"
    + vue_shim_note
    + "var Vue = (function(){\n" + vue_src + "\nreturn window.Vue; }).call(window);\n"
    + "var moment = (function(){\n" + moment_src + "\nreturn window.moment; }).call(window);\n"
    + "var vue = new Proxy({}, { get: function(_, k){ var v = Vue[k]; return typeof v === 'function' ? v.bind(Vue) : v; }, has: function(){ return true; } });\n"
    + "(function (vue, moment) {" + body + "})(vue, moment);\n"
)

OUT.write_text(assembled, encoding="utf-8")
print(f"Wrote {OUT} ({len(assembled)} bytes)")