// 注入到 snssdk.com origin 的 init script (document-start 之前)
// GM_xmlhttpRequest 用回调风格 (TM 真实行为), Content-Type 强制 text/plain 绕 CORS preflight
(() => {
  const __gmStore = {};
  const hasGM = !window.GM_xmlhttpRequest;
  if (!hasGM) return;

  // 1. GM_xmlhttpRequest: 回调风格 + text/plain 绕过 preflight
  window.GM_xmlhttpRequest = function (opts) {
    const headers = Object.assign({}, opts.headers || {});
    // 强制重写 Content-Type 为 text/plain (snssdk 不响应 OPTIONS preflight)
    if (headers['Content-Type'] || headers['content-type']) {
      headers['Content-Type'] = 'text/plain;charset=UTF-8';
    }
    delete headers['Host'];
    delete headers['host'];
    delete headers['Content-Length'];
    delete headers['content-length'];
    delete headers['Accept-Encoding'];
    delete headers['accept-encoding'];

    const fetchOpts = {
      method: opts.method || 'GET',
      headers,
      credentials: 'omit',
      mode: 'cors',
      cache: 'no-store',
    };
    if (opts.responseType === 'arraybuffer') fetchOpts.headers['Accept'] = '*/*';
    if (opts.data) fetchOpts.body = String(opts.data);

    fetch(opts.url, fetchOpts).then(async (r) => {
      const buf = await r.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let text = '';
      for (let i = 0; i < bytes.length; i++) text += String.fromCharCode(bytes[i]);
      const resp = {
        status: r.status,
        statusText: r.statusText,
        responseHeaders: r.headers.get('content-type') || '',
        response: text,
        responseText: text,
        finalUrl: r.url,
        readyState: 4,
        context: opts.context,
      };
      if (typeof opts.onload === 'function') {
        try { opts.onload(resp); } catch (e) { console.error('[gm-mock] onload err', e); }
      }
    }).catch((err) => {
      if (typeof opts.onerror === 'function') {
        try { opts.onerror({ error: String(err), context: opts.context }); } catch (e) { console.error('[gm-mock] onerror err', e); }
      }
    });
    return { abort: () => {} };
  };

  // 2. GM_storage 内存 mock
  window.GM_getValue = (k, def) => k in __gmStore ? __gmStore[k] : def;
  window.GM_setValue = (k, v) => { __gmStore[k] = v; };
  window.GM_deleteValue = (k) => { delete __gmStore[k]; };
  window.GM_addStyle = (css) => {
    const s = document.createElement('style');
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  };
  window.unsafeWindow = window;

  // 3. Vue 3 + moment stub (user.js @require 不会自动加载)
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
  console.log('[gm-mock] init script loaded');
})();