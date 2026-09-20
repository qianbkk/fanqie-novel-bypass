// ==UserScript==
// @name         番茄小说助手
// @namespace    https://github.com/naiyQAQ/fanqie-assistant
// @version      0.1.0
// @author       naiyQAQ / lite fork (L1-L6 + pool + pin)
// @description  番茄小说网页版助手：章节解锁 + L1-L6 反封禁（设备池+节流+缓存+行为模拟）+ 浮动控制面板。fork 自 fanqie-assistant v0.0.6。
// @license      GPLv3
// @icon         data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8cGF0aA0KICAgICAgICBkPSJNMjMuMzExNSAxSDYuNjg4NTNDMy41NDY4NCAxIDEgMy41NDY4NCAxIDYuNjg4NTNWMjMuMzExNUMxIDI2LjQ1MzIgMy41NDY4NCAyOSA2LjY4ODUzIDI5SDIzLjMxMTVDMjYuNDUzMiAyOSAyOSAyNi40NTMyIDI5IDIzLjMxMTVWNi42ODg1M0MyOSAzLjU0Njg0IDI2LjQ1MzIgMSAyMy4zMTE1IDFaIg0KICAgICAgICBmaWxsPSJ3aGl0ZSI+PC9wYXRoPg0KICAgIDxwYXRoDQogICAgICAgIGQ9Ik0yMy4zMTE1IDAuNzVINi42ODg1M0MzLjQwODc3IDAuNzUgMC43NSAzLjQwODc3IDAuNzUgNi42ODg1M1YyMy4zMTE1QzAuNzUgMjYuNTkxMiAzLjQwODc3IDI5LjI1IDYuNjg4NTMgMjkuMjVIMjMuMzExNUMyNi41OTEyIDI5LjI1IDI5LjI1IDI2LjU5MTIgMjkuMjUgMjMuMzExNVY2LjY4ODUzQzI5LjI1IDMuNDA4NzcgMjYuNTkxMiAwLjc1IDIzLjMxMTUgMC43NVoiDQogICAgICAgIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1vcGFjaXR5PSIwLjA4IiBzdHJva2Utd2lkdGg9IjAuNSI+PC9wYXRoPg0KICAgIDxtYXNrIGlkPSJtYXNrMF80NzBfNDgzNjQiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjEiIHk9IjEiIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCI+DQogICAgICAgIDxwYXRoDQogICAgICAgICAgICBkPSJNMjMuMzExNSAxSDYuNjg4NTNDMy41NDY4NCAxIDEgMy41NDY4NCAxIDYuNjg4NTNWMjMuMzExNUMxIDI2LjQ1MzIgMy41NDY4NCAyOSA2LjY4ODUzIDI5SDIzLjMxMTVDMjYuNDUzMiAyOSAyOSAyNi40NTMyIDI5IDIzLjMxMTVWNi42ODg1M0MyOSAzLjU0Njg0IDI2LjQ1MzIgMSAyMy4zMTE1IDFaIg0KICAgICAgICAgICAgZmlsbD0id2hpdGUiPjwvcGF0aD4NCiAgICA8L21hc2s+DQogICAgPGcgbWFzaz0idXJsKCNtYXNrMF80NzBfNDgzNjQpIj4NCiAgICAgICAgPHBhdGgNCiAgICAgICAgICAgIGQ9Ik0yMy4zMTE1IDFINi42ODg1M0MzLjU0Njg0IDEgMSAzLjU0Njg0IDEgNi42ODg1M1YyMy4zMTE1QzEgMjYuNDUzMiAzLjU0Njg0IDI5IDYuNjg4NTMgMjlIMjMuMzExNUMyNi40NTMyIDI5IDI5IDI2LjQ1MzIgMjkgMjMuMzExNVY2LjY4ODUzQzI5IDMuNTQ2ODQgMjYuNDUzMiAxIDIzLjMxMTUgMVoiDQogICAgICAgICAgICBmaWxsPSJ3aGl0ZSI+PC9wYXRoPg0KICAgICAgICA8cGF0aA0KICAgICAgICAgICAgZD0iTTE1LjAwMDggNDguNjY0MkMyNS40MDE3IDQ4LjY2NDIgMzMuODMzNCA0MC4yMzI2IDMzLjgzMzQgMjkuODMxNkMzMy44MzM0IDE5LjQzMDcgMjUuNDAxNyAxMC45OTkgMTUuMDAwOCAxMC45OTlDNC41OTk4NSAxMC45OTkgLTMuODMxNzkgMTkuNDMwNyAtMy44MzE3OSAyOS44MzE2Qy0zLjgzMTc5IDQwLjIzMjYgNC41OTk4NSA0OC42NjQyIDE1LjAwMDggNDguNjY0MloiDQogICAgICAgICAgICBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfNDcwXzQ4MzY0KSI+PC9wYXRoPg0KICAgICAgICA8cGF0aCBkPSJNMjMuMjY4OCAxVjcuMjEyOTRMMjAuNjY2MyA1LjcxNDM3TDE4LjA2NzQgNy4yMTI5NFYxSDIzLjI2ODhaIiBmaWxsPSIjRkY1RjAwIj48L3BhdGg+DQogICAgICAgIDxwYXRoDQogICAgICAgICAgICBkPSJNMTUuMTM0MyAxOC44ODFDMTUuMTM0MyAxOC44ODEgMTYuMTAxNCAxNy41NTEzIDE2LjEwMTQgMTYuNDA2NUMxNi4xMDE0IDE1LjI2MTcgMTUuNjY3NiAxNC43MzczIDE1LjEzNDMgMTQuNzM3M0MxNC42MDEgMTQuNzM3MyAxNC4xNjczIDE1LjI2MzUgMTQuMTY3MyAxNi40MDY1QzE0LjE2NzMgMTcuNTQ5NiAxNS4xMzQzIDE4Ljg4MSAxNS4xMzQzIDE4Ljg4MVoiDQogICAgICAgICAgICBmaWxsPSJ3aGl0ZSI+PC9wYXRoPg0KICAgICAgICA8cGF0aA0KICAgICAgICAgICAgZD0iTTcuNjI3MjQgMjIuNjU4NUM4Ljc3MjA1IDIyLjY1ODUgMTAuMTAxNyAyMy42MjU2IDEwLjEwMTcgMjMuNjI1NkMxMC4xMDE3IDIzLjYyNTYgOC43NzAyNyAyNC41OTI2IDcuNjI3MjQgMjQuNTkyNkM2LjQ4NDIgMjQuNTkyNiA1Ljk1ODAxIDI0LjE1ODkgNS45NTgwMSAyMy42MjU2QzUuOTU4MDEgMjMuMDkyMyA2LjQ4MjQyIDIyLjY1ODUgNy42MjcyNCAyMi42NTg1WiINCiAgICAgICAgICAgIGZpbGw9IndoaXRlIj48L3BhdGg+DQogICAgICAgIDxwYXRoDQogICAgICAgICAgICBkPSJNMjIuNjM5NiAyNC41OTI2QzIxLjQ5NDggMjQuNTkyNiAyMC4xNjUxIDIzLjYyNTYgMjAuMTY1MSAyMy42MjU2QzIwLjE2NTEgMjMuNjI1NiAyMS40OTY2IDIyLjY1ODUgMjIuNjM5NiAyMi42NTg1QzIzLjc4MjYgMjIuNjU4NSAyNC4zMDg4IDIzLjA5MjMgMjQuMzA4OCAyMy42MjU2QzI0LjMwODggMjQuMTU4OSAyMy43ODQ0IDI0LjU5MjYgMjIuNjM5NiAyNC41OTI2WiINCiAgICAgICAgICAgIGZpbGw9IndoaXRlIj48L3BhdGg+DQogICAgICAgIDxwYXRoDQogICAgICAgICAgICBkPSJNMTAuNDU1NSAxOC4zMTM5QzExLjI2NDMgMTkuMTIyNyAxMS41MjIxIDIwLjc0NzUgMTEuNTIyMSAyMC43NDc1QzExLjUyMjEgMjAuNzQ3NSA5Ljg5NzMyIDIwLjQ4OTcgOS4wODg0OCAxOS42ODA5QzguMjc5NjQgMTguODcyMSA4LjIxMzg3IDE4LjE5NDggOC41OTI1MSAxNy44MTYxQzguOTcxMTUgMTcuNDM3NSA5LjY0NjY2IDE3LjUwMzMgMTAuNDU3MyAxOC4zMTIxTDEwLjQ1NTUgMTguMzEzOVoiDQogICAgICAgICAgICBmaWxsPSJ3aGl0ZSI+PC9wYXRoPg0KICAgICAgICA8cGF0aA0KICAgICAgICAgICAgZD0iTTE4Ljc0NjUgMjAuNzQ3NkMxOC43NDY1IDIwLjc0NzYgMTkuMDA0MyAxOS4xMjI4IDE5LjgxMzEgMTguMzE0TDE5LjgxMTMgMTguMzEyMkMyMC42MjIgMTcuNTAzMyAyMS4yOTkzIDE3LjQzOTMgMjEuNjc2MSAxNy44MTYyQzIyLjA1NDggMTguMTk0OSAyMS45ODkgMTguODcyMSAyMS4xODAyIDE5LjY4MUMyMC4zNzEzIDIwLjQ4OTggMTguNzQ2NSAyMC43NDc2IDE4Ljc0NjUgMjAuNzQ3NloiDQogICAgICAgICAgICBmaWxsPSJ3aGl0ZSI+PC9wYXRoPg0KICAgIDwvZz4NCiAgICA8ZGVmcz4NCiAgICAgICAgPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDBfcmFkaWFsXzQ3MF80ODM2NCIgY3g9IjAiIGN5PSIwIiByPSIxIg0KICAgICAgICAgICAgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiDQogICAgICAgICAgICBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDE1LjAwMDggMjkuODMxNikgc2NhbGUoMTguODMyNikiPg0KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI0NDMDUwMCI+PC9zdG9wPg0KICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY1RjAwIj48L3N0b3A+DQogICAgICAgIDwvcmFkaWFsR3JhZGllbnQ+DQogICAgPC9kZWZzPg0KPC9zdmc+
// @match        *://*.fanqienovel.com/*
// @require      https://registry.npmmirror.com/vue/3.5.40/files/dist/vue.global.prod.js
// @require      https://registry.npmmirror.com/moment/2.30.1/files/min/moment.min.js
// @connect      fanqienovel.com
// @connect      snssdk.com
// @connect      jxbhmy.com
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function (vue, moment) {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  const shared_key = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]).buffer;
  const fetch$1 = unsafeWindow.fetch;
  unsafeWindow.XMLHttpRequest;
  const defaultConfig = {
    install_id: "2187355326270644",
    device_id: "2187355326004404",
    device_type: "P30"
  };
  const _config = {
    currentConfig: defaultConfig
  };
  const scriptcss = "/* 移除章节锁定图标 */\r\n.muyeicon-lock {\r\n	display: none;\r\n}\r\n/* 移除APP推广图标 */\r\n.muye-to-fanqie {\r\n	display: none!important;\r\n}\r\n.reader-toolbar-item-download {\r\n	display: none!important;\r\n}\r\n.download-btn {\r\n	display: none!important;\r\n}\r\n.download-icon {\r\n	display: none!important;\r\n}\r\n\r\n.fqa-hide {\r\n	display: none!important;\r\n}\r\n/* 404 */\r\n.no-content {\r\n	display: none!important;\r\n}\r\n\r\n.fqa-comic-img {\r\n	width: 100%!important;\r\n	height: 100%!important;\r\n	max-width: 100%!important;\r\n	max-height: 100%!important;\r\n	padding-top: 0!important;\r\n	padding-bottom: 0!important;\r\n	margin-top: 0!important;\r\n	margin-bottom: 0!important;\r\n}\r\n\r\n.fqa-comic-reader {\r\n	line-height: 0!important;\r\n}\r\n\r\n.fqa-menu-item,\r\n.arco-menu-item {\r\n	width: 100%!important;\r\n}\r\n\r\n#dynamic-el {\r\n	display: none!important;\r\n}\r\n\r\n.fqa-footnote-ref {\r\n	display: inline-block;\r\n	margin: 0 0.15em;\r\n	padding: 0 0.25em;\r\n	font-size: 0.7em;\r\n	line-height: 1.4;\r\n	vertical-align: super;\r\n	color: var(--web-brand_normal, #f14646);\r\n	cursor: pointer;\r\n	user-select: none;\r\n	border-radius: 3px;\r\n	text-indent: 0;\r\n}\r\n\r\n.fqa-footnote-ref:hover,\r\n.fqa-footnote-ref:focus-visible {\r\n	background: var(--web-brand_light, rgba(241, 70, 70, 0.12));\r\n	outline: none;\r\n}\r\n\r\n\r\n.fqa-footnote {\r\n	margin-top: 2em;\r\n	padding-top: 1em;\r\n	border-top: 1px solid var(--web-gray_20, rgba(128, 128, 128, 0.25));\r\n	font-size: var(--fqa-body-size, 1.6rem);\r\n}\r\n\r\n.muye-reader-content-16 .fqa-footnote { font-size: var(--fqa-body-size, 1.6rem); }\r\n.muye-reader-content-20 .fqa-footnote { font-size: var(--fqa-body-size, 2rem); }\r\n.muye-reader-content-24 .fqa-footnote { font-size: var(--fqa-body-size, 2.4rem); }\r\n.muye-reader-content-28 .fqa-footnote { font-size: var(--fqa-body-size, 2.8rem); }\r\n.muye-reader-content-32 .fqa-footnote { font-size: var(--fqa-body-size, 3.2rem); }\r\n\r\n.fqa-footnote-title {\r\n	margin-bottom: 0.6em;\r\n	font-size: 0.85em;\r\n	font-weight: 600;\r\n	color: var(--web-gray_40, #8a8a8a);\r\n	text-indent: 0;\r\n}\r\n\r\n.fqa-footnote-list {\r\n	margin: 0;\r\n	padding-left: 1.6em;\r\n	font-size: 0.85em;\r\n	line-height: 1.7;\r\n	color: var(--web-gray_40, #8a8a8a);\r\n}\r\n\r\n.fqa-footnote-list li {\r\n	margin-bottom: 0.5em;\r\n	text-indent: 0;\r\n	transition: background-color 0.3s ease;\r\n}\r\n\r\n.fqa-footnote-list li.fqa-footnote-active {\r\n	background: var(--web-brand_light, rgba(241, 70, 70, 0.12));\r\n	border-radius: 4px;\r\n}\r\n\r\n.muye-reader-content > body {\r\n	background-color: var(--web-bg)!important;\r\n}\r\n\r\n.fqa-icon-dark {\r\n	color: #B3B3B3\r\n}\r\n\r\n/* ----------------------------- 右键菜单 / Toast ----------------------------- */\r\n\r\n/*\r\n * 书架与搜索共用。两者都把菜单 Teleport 到 body，\r\n * 拿不到各自根节点上的变量，所以在这里声明一份全局色板。\r\n */\r\n.fqa-menu {\r\n	--fqa-menu-bg: #fff;\r\n	--fqa-menu-text: #1f2329;\r\n	--fqa-menu-sub: #8f959e;\r\n	--fqa-menu-hover: rgba(31, 35, 41, 0.06);\r\n	--fqa-menu-danger: #f5222d;\r\n\r\n	position: fixed;\r\n	z-index: 2147483001;\r\n	min-width: 132px;\r\n	max-width: 240px;\r\n	padding: 4px;\r\n	box-sizing: border-box;\r\n	background: var(--fqa-menu-bg);\r\n	border: 1px solid rgba(31, 35, 41, 0.08);\r\n	border-radius: 8px;\r\n	box-shadow: 0 6px 24px rgba(31, 35, 41, 0.16);\r\n	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial,\r\n		sans-serif;\r\n	font-size: 13px;\r\n	color: var(--fqa-menu-text);\r\n	user-select: none;\r\n}\r\n\r\n/* 二级面板：分组数量多时可滚动 */\r\n.fqa-menu-sub {\r\n	max-height: 320px;\r\n	overflow-y: auto;\r\n}\r\n\r\n.fqa-menu-row {\r\n	display: flex;\r\n	align-items: center;\r\n	justify-content: space-between;\r\n	gap: 12px;\r\n	padding: 7px 10px;\r\n	border-radius: 5px;\r\n	line-height: 1.4;\r\n	cursor: pointer;\r\n	white-space: nowrap;\r\n	overflow: hidden;\r\n}\r\n\r\n.fqa-menu-row > span:first-child {\r\n	overflow: hidden;\r\n	text-overflow: ellipsis;\r\n}\r\n\r\n.fqa-menu-row:hover,\r\n.fqa-menu-row.fqa-menu-open {\r\n	background: var(--fqa-menu-hover);\r\n}\r\n\r\n.fqa-menu-arrow {\r\n	color: var(--fqa-menu-sub);\r\n	font-size: 15px;\r\n	line-height: 1;\r\n}\r\n\r\n.fqa-menu-danger {\r\n	color: var(--fqa-menu-danger);\r\n}\r\n\r\n.fqa-menu-disabled {\r\n	color: var(--fqa-menu-sub);\r\n	cursor: not-allowed;\r\n}\r\n\r\n.fqa-menu-disabled:hover {\r\n	background: transparent;\r\n}\r\n\r\n/* 操作结果提示 */\r\n.fqa-toast {\r\n	position: fixed;\r\n	left: 50%;\r\n	bottom: 48px;\r\n	transform: translateX(-50%);\r\n	z-index: 2147483002;\r\n	max-width: 80vw;\r\n	padding: 10px 18px;\r\n	box-sizing: border-box;\r\n	background: rgba(31, 35, 41, 0.88);\r\n	color: #fff;\r\n	border-radius: 8px;\r\n	font-size: 13px;\r\n	line-height: 1.4;\r\n	box-shadow: 0 6px 24px rgba(31, 35, 41, 0.24);\r\n	pointer-events: none;\r\n}\r\n\r\n/* 骨架屏微光。书架与搜索共用同一个动画名 */\r\n@keyframes fqa-shimmer {\r\n	100% {\r\n		transform: translateX(100%);\r\n	}\r\n}\r\n\r\n@media (prefers-color-scheme: dark) {\r\n	.fqa-menu {\r\n		--fqa-menu-bg: #23272e;\r\n		--fqa-menu-text: #e5e6eb;\r\n		--fqa-menu-sub: #8f959e;\r\n		--fqa-menu-hover: rgba(255, 255, 255, 0.08);\r\n		border-color: rgba(255, 255, 255, 0.1);\r\n	}\r\n}\r\n\r\n.info {\r\n	width: 100%!important;\r\n}\r\n\r\n.reader-toolbar {\r\n	user-select: none;\r\n}";
  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function cloneElement(element) {
    return element.cloneNode(true);
  }
  function concatArrayBuffers(...buffers) {
    const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      result.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }
    return result.buffer;
  }
  async function inject() {
    while (!document.body) {
      console.log("Waiting for body...");
      await sleep(200);
    }
    GM_addStyle(scriptcss);
    console.log("CSS injected successfully!");
  }
  unsafeWindow.localStorage;
  function write(key, value) {
    GM_setValue(key, JSON.stringify(value));
  }
  function read(key) {
    return JSON.parse(GM_getValue(key) || "null");
  }
  function del(key) {
    GM_deleteValue(key);
  }
  const STORE_KEY = "settings";
  const DEFAULT_SETTINGS = {
    decryptFont: true,
    blockReport: true,
    allowCopy: true,
    shelfRemoveConfirm: true,
    logoutConfirm: true,
    readerFont: "",
    customCssEnabled: false,
    customCss: "",
    // 原站书架点封面是继续阅读，保持一致
    bookshelfClickAction: "read",
    enhanceSearch: true,
    // 默认关：携带登录态属于额外的隐私暴露，交给用户显式开启
    searchPersonalized: false,
    enableDownload: true,
    downloadFormat: "epub",
    downloadCharset: "utf-8",
    // 30 是接口单请求返回正文的上限，再大也只回 30 条
    downloadBatchSize: 30,
    // 实测 750ms 能稳定拿满，更短会被限流成每次 1 条
    downloadInterval: 750,
    downloadRetries: 3,
    downloadVolumePage: false,
    downloadImages: true,
    downloadBookCss: true,
    audiobookChapterEnd: "next",
    audiobookFollow: true,
    apiPreference: "app",
    deviceId: "",
    installId: "",
    deviceType: ""
  };
  function normalize(raw) {
    const s = { ...DEFAULT_SETTINGS };
    if (!raw || typeof raw !== "object") return s;
    const o = raw;
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      const v = o[key];
      if (v === void 0 || v === null) continue;
      if (typeof DEFAULT_SETTINGS[key] === typeof v) {
        s[key] = v;
      }
    }
    if (s.apiPreference !== "app" && s.apiPreference !== "redcandle") {
      s.apiPreference = DEFAULT_SETTINGS.apiPreference;
    }
    if (s.downloadFormat !== "epub" && s.downloadFormat !== "txt") {
      s.downloadFormat = DEFAULT_SETTINGS.downloadFormat;
    }
    if (s.downloadCharset !== "utf-8" && s.downloadCharset !== "gbk") {
      s.downloadCharset = DEFAULT_SETTINGS.downloadCharset;
    }
    if (s.bookshelfClickAction !== "read" && s.bookshelfClickAction !== "detail") {
      s.bookshelfClickAction = DEFAULT_SETTINGS.bookshelfClickAction;
    }
    if (s.audiobookChapterEnd !== "next" && s.audiobookChapterEnd !== "stop") {
      s.audiobookChapterEnd = DEFAULT_SETTINGS.audiobookChapterEnd;
    }
    s.downloadBatchSize = clampInt(s.downloadBatchSize, 1, 30, DEFAULT_SETTINGS.downloadBatchSize);
    s.downloadInterval = clampInt(s.downloadInterval, 0, 1e4, DEFAULT_SETTINGS.downloadInterval);
    s.downloadRetries = clampInt(s.downloadRetries, 0, 10, DEFAULT_SETTINGS.downloadRetries);
    return s;
  }
  function clampInt(value, min, max, fallback) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }
  const settings = vue.reactive(normalize(read(STORE_KEY)));
  let saveTimer;
  vue.watch(
    settings,
    () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = void 0;
        write(STORE_KEY, { ...settings });
      }, 200);
    },
    { deep: true }
  );
  const code_ed = 58715;
  const code_st = 58344;
  const mapping = {
    "DNMrHsV173Pd4pgy": [
      "D在主特家军然表场4要只v和?6别还g现儿岁??此象月3出战工相",
      "o男直失世F都平文什VO将真T那当?会立些u是十张学气大爱两命全",
      "后东性通被1它乐接而感车山公了常以何可话先pi叫轻M士w着变尔快",
      "l个说少色里安花远7难师放t报认面道S?克地度I好机U民写把万同",
      "水新没书电吃像斯5为y白几日教看但第加候作上拉住有法r事应位利你",
      "声身国问马女他Y比父xAHNsX边美对所金活回意到z从j知又内因",
      "点Q三定8Rb正或夫向德听更?得告并本q过记L让打f人就者去原满",
      "体做经K走如孩cG给使物?最笑部?员等受k行一条果动光门头见往自",
      "解成处天能于名其发总母的死手入路进心来h时力多开已许d至由很界n",
      "小与Z想代么分生口再妈望次西风种带J?实情才这?E我神格长觉间年",
      "眼无不亲关结0友信下却重己老2音字m呢明之前高PB目太e9起稜她",
      "也W用方子英每理便四数期中C外样a海们任"
    ],
    "fKts9tCXDjS49UhH": [
      "体y十现快使话却月物水的放知爱方?表风理O老也p常克平几最主她s",
      "将法情o光a我呢J员太每望受教w利军已U人如变得要少斯门电m男没",
      "AK国时中走么何口小向问轻Td神下间车fG度D又大面远就写j给通",
      "起实E?它去S到道数吃们加P是无把事西多界?发新外活解孩只作前Y",
      "尔经?u心告父等Q民全这9果安?i母8r说任先和地C张战场g像c",
      "q你使?样总目x性处音头?应乐关能花I当名手4重字声力友然生代内",
      "里本回真入师象?0点R亲V种动英命ZhX做特边高有B为期自年马认",
      "出接至H正方感所明者棱F住学还分意更其n但比觉以由死家让失士L2",
      "I金叫身报听W再原山海白很见5直位第工个开岁好用都于可同3次四?",
      "日信与女笑满并部什不从或机此?了记三e些bN夫会才几眼两美被一公",
      "来立z长对己看k许因相色后往打结格过世气7子条在书之定v拉成进带",
      "着东上想天他妈1文而路那别德6Mt行候难"
    ],
    "_search": [
      "?s?作口在他能并B士4U克才正们字声高全尔活者动其主报多望放h",
      "w次年?中3特于十入要男同G面分方K什再教本己结1等世N?说gu",
      "期Z外美M行给9文将两许张友0英应向像此白安少何打气常定间花见孩",
      "它直风数使道第水已女山解dP的通关性叫几L妈问回神来S?四里前国",
      "些OvIA心平自无车光代是好却c得种就意先立z子过Yj表?么所接",
      "了名金受J满眼没部那m每车度可R斯经现门明V如走命y6E战很上f",
      "月西7长夫想话变海机x到W一成生信笑但父开内东马日小而后带以三几",
      "为认X死员目位之学远入音呢我q乐象重对个被别F也书棱D写还因家发",
      "时i或住德当oI比觉然吃去公a老亲情体太b方C电理?失力更拉物着",
      "原她工实色感记看出相路大你候2和?与p样新只便最不进Tr做格母总",
      "爱身师轻知往加从?天eH?听场由快边让把任8条头事至起点真手这难",
      "都界用法n处下文Q告地5kt岁有会果利民"
    ]
  };
  const NO_GLYPH = "?";
  const flatCache = /* @__PURE__ */ new Map();
  function tableOf(fontId) {
    const cached = flatCache.get(fontId);
    if (cached) return cached;
    const rows = mapping[fontId];
    if (!rows) return null;
    const flat = [...rows.join("")];
    const expected = code_ed - code_st + 1;
    if (flat.length !== expected) {
      console.error(
        `[fqa:font] 码表 ${fontId} 长度异常：${flat.length}，应为 ${expected}，已禁用该字体的解密`
      );
      flatCache.set(fontId, []);
      return [];
    }
    flatCache.set(fontId, flat);
    return flat;
  }
  const enTag = Object.keys(mapping).map((id) => `.font-${id}`).join(", ");
  function fontIdOf(element) {
    for (const cls of element.classList) {
      if (!cls.startsWith("font-")) continue;
      const id = cls.slice(5);
      if (mapping[id]) return id;
    }
    return null;
  }
  function decryptText(text, fontId) {
    if (window.location.pathname.startsWith("/search")) fontId = "_search";
    const table = tableOf(fontId);
    if (!table || table.length === 0) return text;
    let result = "";
    let changed = false;
    for (const char of text) {
      const codePoint = char.codePointAt(0);
      if (typeof codePoint !== "number") {
        return text;
      }
      if (codePoint < code_st || codePoint > code_ed) {
        result += char;
        continue;
      }
      const mapped = table[codePoint - code_st];
      if (mapped && mapped !== NO_GLYPH) {
        result += mapped;
        changed = true;
      } else {
        result += char;
      }
    }
    return changed ? result : text;
  }
  function decryptElement(element) {
    if (!settings.decryptFont) return;
    const fontId = fontIdOf(element);
    if (!fontId) return;
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        // 后代里可能嵌着另一套字体的节点，那部分要用它自己的码表，
        // 交给针对它的 decryptElement 处理，这里跳过整棵子树
        acceptNode(node) {
          var _a;
          const owner = (_a = node.parentElement) == null ? void 0 : _a.closest(enTag);
          return owner && owner !== element ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    let textNode;
    while (textNode = walker.nextNode()) {
      const oldText = textNode.nodeValue;
      if (!oldText) {
        continue;
      }
      const newText = decryptText(oldText, fontId);
      if (newText !== oldText) {
        textNode.nodeValue = newText;
      }
    }
  }
  function decryptPage(root) {
    if (root instanceof Element && root.matches(enTag)) {
      decryptElement(root);
    }
    root.querySelectorAll(enTag).forEach(decryptElement);
  }
  function initFontDecrypt() {
    const observer = new MutationObserver((mutations) => {
      var _a, _b;
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          const encryptedElement = (_a = mutation.target.parentElement) == null ? void 0 : _a.closest(
            enTag
          );
          if (encryptedElement) {
            decryptElement(encryptedElement);
          }
          continue;
        }
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            decryptPage(node);
            continue;
          }
          if (node.nodeType === Node.TEXT_NODE) {
            const encryptedElement = (_b = node.parentElement) == null ? void 0 : _b.closest(
              enTag
            );
            if (encryptedElement) {
              decryptElement(encryptedElement);
            }
          }
        }
      }
    });
    observer.observe(document, {
      subtree: true,
      childList: true,
      characterData: true
    });
    decryptPage(document);
    vue.watch(
      () => settings.decryptFont,
      (on) => {
        if (on) decryptPage(document);
      }
    );
  }
  const STYLE_ID$2 = "fqa-user-style";
  const READER_SCOPE = "#fqa-reader-content, .muye-reader-content";
  function buildCss() {
    const parts = [];
    const font = settings.readerFont.trim();
    if (font) {
      const family = /^["']|,/.test(font) ? font : `"${font}"`;
      parts.push(`${READER_SCOPE}, ${READER_SCOPE} p { font-family: ${family}, inherit !important; }`);
    }
    if (settings.customCssEnabled && settings.customCss.trim()) {
      parts.push(settings.customCss);
    }
    return parts.join("\n");
  }
  function apply() {
    const css = buildCss();
    let el = document.getElementById(STYLE_ID$2);
    if (!css) {
      el == null ? void 0 : el.remove();
      return;
    }
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID$2;
      document.head.appendChild(el);
    }
    el.textContent = css;
  }
  function initUserStyle() {
    apply();
    vue.watch(
      () => [settings.readerFont, settings.customCssEnabled, settings.customCss],
      apply
    );
  }
  class EmptyResponseError extends Error {
    constructor(status) {
      super(`服务端返回了空响应体(HTTP ${status})`);
      __publicField(this, "status");
      this.name = "EmptyResponseError";
      this.status = status;
    }
  }
  function isEmptyResponse(res) {
    const text = res.responseText;
    return typeof text !== "string" || text === "";
  }
  const supportedMethods = /* @__PURE__ */ new Set([
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "DELETE"
  ]);
  function apiFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const { signal } = options;
      if (signal == null ? void 0 : signal.aborted) {
        reject(signal.reason ?? new DOMException("The operation was aborted", "AbortError"));
        return;
      }
      const headers = normalizeHeaders$1(options.headers);
      const data = normalizeBody(options.body);
      const method = options.method ?? (data ? "POST" : "GET");
      if (!supportedMethods.has(method)) {
        reject(new TypeError(`Unsupported request method: ${method}`));
        return;
      }
      let request;
      const abort = () => request == null ? void 0 : request.abort();
      function cleanup() {
        signal == null ? void 0 : signal.removeEventListener("abort", abort);
      }
      request = GM_xmlhttpRequest({
        url,
        method,
        headers,
        data,
        anonymous: options.credentials === "omit",
        redirect: options.redirect === "error" ? "error" : "follow",
        onload(response) {
          cleanup();
          resolve(Object.assign(response, {
            json() {
              if (isEmptyResponse(this)) {
                throw new EmptyResponseError(this.status);
              }
              return JSON.parse(this.responseText);
            }
          }));
        },
        onerror(response) {
          cleanup();
          reject(createRequestError("Network request failed", response));
        },
        ontimeout() {
          cleanup();
          reject(createRequestError("Network request timed out", {
            status: 0,
            statusText: "Timeout",
            url
          }));
        },
        onabort() {
          cleanup();
          reject(
            (signal == null ? void 0 : signal.reason) ?? new DOMException("The operation was aborted", "AbortError")
          );
        }
      });
      signal == null ? void 0 : signal.addEventListener("abort", abort, { once: true });
    });
  }
  function fetchArrayBuffer(url) {
    return fetch$1(url, { referrerPolicy: "no-referrer" }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    }).catch((err) => {
      console.debug("[fqa:img] 页面 fetch 失败，改用 GM_xmlhttpRequest:", url, err);
      return gmArrayBuffer(url);
    });
  }
  function gmArrayBuffer(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        url,
        method: "GET",
        responseType: "arraybuffer",
        onload(response) {
          const buf = response.response;
          if (response.status >= 200 && response.status < 300 && (buf == null ? void 0 : buf.byteLength)) {
            resolve(buf);
          } else {
            reject(new Error(`GM 请求失败(${response.status})`));
          }
        },
        onerror() {
          reject(new Error(`GM 请求出错，检查 @connect 是否覆盖该域名: ${url}`));
        },
        ontimeout: () => reject(new Error("GM 请求超时"))
      });
    });
  }
  function normalizeHeaders$1(headers) {
    if (!headers) {
      return void 0;
    }
    return Object.fromEntries(new Headers(headers).entries());
  }
  function normalizeBody(body) {
    if (body == null) {
      return void 0;
    }
    if (body instanceof URLSearchParams) {
      return body.toString();
    }
    if (typeof body === "string" || body instanceof Blob || body instanceof ArrayBuffer || body instanceof FormData) {
      return body;
    }
    if (ArrayBuffer.isView(body)) {
      return body.buffer.slice(
        body.byteOffset,
        body.byteOffset + body.byteLength
      );
    }
    throw new TypeError(
      "GM_xmlhttpRequest does not support ReadableStream request bodies"
    );
  }
  function createRequestError(message, response) {
    const error2 = new TypeError(message);
    Object.defineProperty(error2, "response", {
      configurable: true,
      enumerable: false,
      value: response
    });
    return error2;
  }
  function rotateLeft(value, shiftBits) {
    return value << shiftBits | value >>> 32 - shiftBits;
  }
  function addUnsigned(left, right) {
    return left + right >>> 0;
  }
  function f(x, y, z) {
    return x & y | ~x & z;
  }
  function g(x, y, z) {
    return x & z | y & ~z;
  }
  function h(x, y, z) {
    return x ^ y ^ z;
  }
  function i(x, y, z) {
    return y ^ (x | ~z);
  }
  function ff(a, b, c, d, x, s, ac) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac)), s), b);
  }
  function gg(a, b, c, d, x, s, ac) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac)), s), b);
  }
  function hh(a, b, c, d, x, s, ac) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac)), s), b);
  }
  function ii(a, b, c, d, x, s, ac) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac)), s), b);
  }
  function convertToWordArray(bytes) {
    const wordCount = Math.ceil((bytes.length + 9) / 64) * 16;
    const words = new Array(wordCount).fill(0);
    for (let byteIndex = 0; byteIndex < bytes.length; byteIndex++) {
      const wordIndex = Math.floor(byteIndex / 4);
      const bytePosition = byteIndex % 4 * 8;
      words[wordIndex] = words[wordIndex] | bytes[byteIndex] << bytePosition;
    }
    const paddingWordIndex = Math.floor(bytes.length / 4);
    const paddingBytePosition = bytes.length % 4 * 8;
    words[paddingWordIndex] = words[paddingWordIndex] | 128 << paddingBytePosition;
    words[wordCount - 2] = bytes.length << 3;
    words[wordCount - 1] = bytes.length >>> 29;
    return words;
  }
  function wordToHex(value) {
    let hex2 = "";
    for (let byteIndex = 0; byteIndex < 4; byteIndex++) {
      const byte = value >>> byteIndex * 8 & 255;
      hex2 += byte.toString(16).padStart(2, "0");
    }
    return hex2;
  }
  function md5(input) {
    const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
    const words = convertToWordArray(bytes);
    let a = 1732584193;
    let b = 4023233417;
    let c = 2562383102;
    let d = 271733878;
    for (let k = 0; k < words.length; k += 16) {
      const aa = a;
      const bb = b;
      const cc = c;
      const dd = d;
      a = ff(a, b, c, d, words[k], 7, 3614090360);
      d = ff(d, a, b, c, words[k + 1], 12, 3905402710);
      c = ff(c, d, a, b, words[k + 2], 17, 606105819);
      b = ff(b, c, d, a, words[k + 3], 22, 3250441966);
      a = ff(a, b, c, d, words[k + 4], 7, 4118548399);
      d = ff(d, a, b, c, words[k + 5], 12, 1200080426);
      c = ff(c, d, a, b, words[k + 6], 17, 2821735955);
      b = ff(b, c, d, a, words[k + 7], 22, 4249261313);
      a = ff(a, b, c, d, words[k + 8], 7, 1770035416);
      d = ff(d, a, b, c, words[k + 9], 12, 2336552879);
      c = ff(c, d, a, b, words[k + 10], 17, 4294925233);
      b = ff(b, c, d, a, words[k + 11], 22, 2304563134);
      a = ff(a, b, c, d, words[k + 12], 7, 1804603682);
      d = ff(d, a, b, c, words[k + 13], 12, 4254626195);
      c = ff(c, d, a, b, words[k + 14], 17, 2792965006);
      b = ff(b, c, d, a, words[k + 15], 22, 1236535329);
      a = gg(a, b, c, d, words[k + 1], 5, 4129170786);
      d = gg(d, a, b, c, words[k + 6], 9, 3225465664);
      c = gg(c, d, a, b, words[k + 11], 14, 643717713);
      b = gg(b, c, d, a, words[k], 20, 3921069994);
      a = gg(a, b, c, d, words[k + 5], 5, 3593408605);
      d = gg(d, a, b, c, words[k + 10], 9, 38016083);
      c = gg(c, d, a, b, words[k + 15], 14, 3634488961);
      b = gg(b, c, d, a, words[k + 4], 20, 3889429448);
      a = gg(a, b, c, d, words[k + 9], 5, 568446438);
      d = gg(d, a, b, c, words[k + 14], 9, 3275163606);
      c = gg(c, d, a, b, words[k + 3], 14, 4107603335);
      b = gg(b, c, d, a, words[k + 8], 20, 1163531501);
      a = gg(a, b, c, d, words[k + 13], 5, 2850285829);
      d = gg(d, a, b, c, words[k + 2], 9, 4243563512);
      c = gg(c, d, a, b, words[k + 7], 14, 1735328473);
      b = gg(b, c, d, a, words[k + 12], 20, 2368359562);
      a = hh(a, b, c, d, words[k + 5], 4, 4294588738);
      d = hh(d, a, b, c, words[k + 8], 11, 2272392833);
      c = hh(c, d, a, b, words[k + 11], 16, 1839030562);
      b = hh(b, c, d, a, words[k + 14], 23, 4259657740);
      a = hh(a, b, c, d, words[k + 1], 4, 2763975236);
      d = hh(d, a, b, c, words[k + 4], 11, 1272893353);
      c = hh(c, d, a, b, words[k + 7], 16, 4139469664);
      b = hh(b, c, d, a, words[k + 10], 23, 3200236656);
      a = hh(a, b, c, d, words[k + 13], 4, 681279174);
      d = hh(d, a, b, c, words[k], 11, 3936430074);
      c = hh(c, d, a, b, words[k + 3], 16, 3572445317);
      b = hh(b, c, d, a, words[k + 6], 23, 76029189);
      a = hh(a, b, c, d, words[k + 9], 4, 3654602809);
      d = hh(d, a, b, c, words[k + 12], 11, 3873151461);
      c = hh(c, d, a, b, words[k + 15], 16, 530742520);
      b = hh(b, c, d, a, words[k + 2], 23, 3299628645);
      a = ii(a, b, c, d, words[k], 6, 4096336452);
      d = ii(d, a, b, c, words[k + 7], 10, 1126891415);
      c = ii(c, d, a, b, words[k + 14], 15, 2878612391);
      b = ii(b, c, d, a, words[k + 5], 21, 4237533241);
      a = ii(a, b, c, d, words[k + 12], 6, 1700485571);
      d = ii(d, a, b, c, words[k + 3], 10, 2399980690);
      c = ii(c, d, a, b, words[k + 10], 15, 4293915773);
      b = ii(b, c, d, a, words[k + 1], 21, 2240044497);
      a = ii(a, b, c, d, words[k + 8], 6, 1873313359);
      d = ii(d, a, b, c, words[k + 15], 10, 4264355552);
      c = ii(c, d, a, b, words[k + 6], 15, 2734768916);
      b = ii(b, c, d, a, words[k + 13], 21, 1309151649);
      a = ii(a, b, c, d, words[k + 4], 6, 4149444226);
      d = ii(d, a, b, c, words[k + 11], 10, 3174756917);
      c = ii(c, d, a, b, words[k + 2], 15, 718787259);
      b = ii(b, c, d, a, words[k + 9], 21, 3951481745);
      a = addUnsigned(a, aa);
      b = addUnsigned(b, bb);
      c = addUnsigned(c, cc);
      d = addUnsigned(d, dd);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
  }
  function rotl(value, shift) {
    const normalizedShift = shift & 31;
    return value << normalizedShift | value >>> 32 - normalizedShift;
  }
  function p0(value) {
    return value ^ rotl(value, 9) ^ rotl(value, 17);
  }
  function p1(value) {
    return value ^ rotl(value, 15) ^ rotl(value, 23);
  }
  function sm3(input) {
    const inputLength = input.length;
    const paddedLength = Math.ceil((inputLength + 9) / 64) * 64;
    const message = new Uint8Array(paddedLength);
    message.set(input);
    message[inputLength] = 128;
    const bitLength = BigInt(inputLength) * 8n;
    for (let i2 = 0; i2 < 8; i2++) {
      message[paddedLength - 1 - i2] = Number(bitLength >> BigInt(i2 * 8) & 0xffn);
    }
    const dataView = new DataView(message.buffer);
    const state2 = new Uint32Array([
      1937774191,
      1226093241,
      388252375,
      3666478592,
      2842636476,
      372324522,
      3817729613,
      2969243214
    ]);
    const words = new Uint32Array(68);
    const expandedWords = new Uint32Array(64);
    for (let block = 0; block < message.length / 64; block++) {
      const start = block * 64;
      for (let i2 = 0; i2 < 16; i2++) {
        words[i2] = dataView.getUint32(start + i2 * 4, false);
      }
      for (let i2 = 16; i2 < 68; i2++) {
        words[i2] = p1(words[i2 - 16] ^ words[i2 - 9] ^ rotl(words[i2 - 3], 15)) ^ rotl(words[i2 - 13], 7) ^ words[i2 - 6];
      }
      for (let i2 = 0; i2 < 64; i2++) {
        expandedWords[i2] = words[i2] ^ words[i2 + 4];
      }
      let a = state2[0];
      let b = state2[1];
      let c = state2[2];
      let d = state2[3];
      let e = state2[4];
      let f2 = state2[5];
      let g2 = state2[6];
      let h2 = state2[7];
      for (let i2 = 0; i2 < 64; i2++) {
        const t = i2 <= 15 ? 2043430169 : 2055708042;
        const ss1 = rotl(rotl(a, 12) + e + rotl(t, i2), 7);
        const ss2 = ss1 ^ rotl(a, 12);
        const tt1 = (i2 <= 15 ? a ^ b ^ c : a & b | a & c | b & c) + d + ss2 + expandedWords[i2];
        const tt2 = (i2 <= 15 ? e ^ f2 ^ g2 : e & f2 | ~e & g2) + h2 + ss1 + words[i2];
        d = c;
        c = rotl(b, 9);
        b = a;
        a = tt1;
        h2 = g2;
        g2 = rotl(f2, 19);
        f2 = e;
        e = p0(tt2);
      }
      state2[0] = state2[0] ^ a;
      state2[1] = state2[1] ^ b;
      state2[2] = state2[2] ^ c;
      state2[3] = state2[3] ^ d;
      state2[4] = state2[4] ^ e;
      state2[5] = state2[5] ^ f2;
      state2[6] = state2[6] ^ g2;
      state2[7] = state2[7] ^ h2;
    }
    const result = new Uint8Array(32);
    for (let i2 = 0; i2 < state2.length; i2++) {
      const word = state2[i2];
      result[i2 * 4] = word >>> 24;
      result[i2 * 4 + 1] = word >>> 16;
      result[i2 * 4 + 2] = word >>> 8;
      result[i2 * 4 + 3] = word;
    }
    return result;
  }
  function getCrypto() {
    const c = globalThis.crypto ?? unsafeWindow.crypto;
    if (!(c == null ? void 0 : c.subtle)) {
      throw new Error("Crypto API不可用，请检查浏览器版本是否支持该API");
    }
    return c;
  }
  function getSubtle() {
    return getCrypto().subtle;
  }
  function b64decode(b64) {
    const binaryString = atob(b64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i2 = 0; i2 < len; i2++) {
      bytes[i2] = binaryString.charCodeAt(i2);
    }
    return bytes.buffer;
  }
  function b64encode(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 32768;
    const chunks = [];
    for (let i2 = 0; i2 < bytes.length; i2 += chunkSize) {
      chunks.push(
        String.fromCharCode(...bytes.subarray(i2, i2 + chunkSize))
      );
    }
    return btoa(chunks.join(""));
  }
  function unhex(hex2) {
    if (hex2.length % 2 !== 0) {
      throw new Error("Invalid hex string");
    }
    const bytes = new Uint8Array(hex2.length / 2);
    for (let i2 = 0; i2 < hex2.length; i2 += 2) {
      const byte = parseInt(hex2.slice(i2, i2 + 2), 16);
      if (Number.isNaN(byte)) {
        throw new Error("Invalid hex string");
      }
      bytes[i2 / 2] = byte;
    }
    return bytes.buffer;
  }
  function hex(buffer) {
    const bytes = new Uint8Array(buffer);
    let hexString = "";
    for (let i2 = 0; i2 < bytes.length; i2++) {
      hexString += bytes[i2].toString(16).padStart(2, "0");
    }
    return hexString;
  }
  function pkcs7Pad(data, blockSize = 16) {
    const padLength = blockSize - data.length % blockSize;
    const padded = new Uint8Array(data.length + padLength);
    padded.set(data);
    padded.fill(padLength, data.length);
    return padded;
  }
  function randomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const array = new Uint8Array(length);
    getCrypto().getRandomValues(array);
    for (let i2 = 0; i2 < length; i2++) {
      result += chars.charAt(array[i2] % chars.length);
    }
    return result;
  }
  function toBytes$1(input) {
    if (typeof input === "string") {
      return new TextEncoder().encode(input);
    }
    if (input instanceof Uint8Array) {
      return new Uint8Array(input);
    }
    return new Uint8Array(input);
  }
  const hash = {
    sha256: async (input) => {
      const subtle = getSubtle();
      const digest = await subtle.digest("SHA-256", toBytes$1(input));
      return hex(digest);
    },
    sha256bytes: async (input) => {
      const subtle = getSubtle();
      return subtle.digest("SHA-256", toBytes$1(input));
    },
    sha512: async (input) => {
      const subtle = getSubtle();
      const digest = await subtle.digest("SHA-512", toBytes$1(input));
      return hex(digest);
    },
    sha512bytes: async (input) => {
      const subtle = getSubtle();
      return subtle.digest("SHA-512", toBytes$1(input));
    },
    md5: async (input) => md5(
      typeof input === "string" ? input : toBytes$1(input).buffer
    ),
    md5bytes: async (input) => unhex(md5(
      typeof input === "string" ? input : toBytes$1(input).buffer
    )),
    sm3: async (input) => hex(sm3(toBytes$1(input)).buffer),
    sm3bytes: async (input) => sm3(toBytes$1(input)).buffer
  };
  const WIRE_VARINT = 0;
  const WIRE_BYTES = 2;
  const WIRE_FIXED32 = 5;
  class ProtobufWriter {
    constructor() {
      __publicField(this, "buf", []);
    }
    writeVarint(value) {
      let v = value >>> 0;
      while (v >= 128) {
        this.buf.push(v & 127 | 128);
        v >>>= 7;
      }
      this.buf.push(v & 127);
      return this;
    }
    writeKey(fieldNumber, wireType) {
      return this.writeVarint(fieldNumber << 3 | wireType);
    }
    varint(fieldNumber, value) {
      return this.writeKey(fieldNumber, WIRE_VARINT).writeVarint(value);
    }
    fixed32(fieldNumber, value) {
      this.writeKey(fieldNumber, WIRE_FIXED32);
      const v = value >>> 0;
      this.buf.push(v & 255, v >>> 8 & 255, v >>> 16 & 255, v >>> 24 & 255);
      return this;
    }
    bytes(fieldNumber, data) {
      this.writeKey(fieldNumber, WIRE_BYTES).writeVarint(data.length);
      for (let i2 = 0; i2 < data.length; i2++) {
        this.buf.push(data[i2] & 255);
      }
      return this;
    }
    string(fieldNumber, value) {
      return this.bytes(fieldNumber, new TextEncoder().encode(value));
    }
    message(fieldNumber, build) {
      const sub = new ProtobufWriter();
      build(sub);
      return this.bytes(fieldNumber, sub.toBytes());
    }
    toBytes() {
      return Uint8Array.from(this.buf);
    }
  }
  const ROUNDS$1 = 72;
  const MASK64$1 = 0xffffffffffffffffn;
  const Z4 = 0x3dc94c3a046d678bn;
  function getBit(value, position) {
    return value >> BigInt(position) & 1n;
  }
  function rotateLeft64(v, n) {
    return (v << n | v >> 64n - n) & MASK64$1;
  }
  function rotateRight64(v, n) {
    return (v << 64n - n | v >> n) & MASK64$1;
  }
  function keyExpansion(key) {
    const k = [key[0] & MASK64$1, key[1] & MASK64$1, key[2] & MASK64$1, key[3] & MASK64$1];
    for (let i2 = 4; i2 < ROUNDS$1; i2++) {
      let tmp = rotateRight64(k[i2 - 1], 3n);
      tmp ^= k[i2 - 3];
      tmp ^= rotateRight64(tmp, 1n);
      k.push((~k[i2 - 4] ^ tmp ^ getBit(Z4, (i2 - 4) % 62) ^ 3n) & MASK64$1);
    }
    return k;
  }
  function simonEncrypt(plaintext, key) {
    const k = keyExpansion(key);
    let x = plaintext[0] & MASK64$1;
    let y = plaintext[1] & MASK64$1;
    for (let i2 = 0; i2 < ROUNDS$1; i2++) {
      const tmp = y;
      const f2 = rotateLeft64(y, 1n) & rotateLeft64(y, 8n);
      y = (x ^ f2 ^ rotateLeft64(y, 2n) ^ k[i2]) & MASK64$1;
      x = tmp;
    }
    return [x, y];
  }
  const LOW_RAND = new Uint8Array([242, 129]);
  const HIGH_RAND = new Uint8Array([97, 111]);
  const XOR_PREFIX = new Uint8Array([242, 247, 252, 255, 242, 247, 252, 255]);
  function sm3Prefix6(data) {
    return sm3(data).slice(0, 6);
  }
  function decodeStub(xssStub) {
    const bytes = new Uint8Array(16);
    if (xssStub.length >= 32) {
      for (let i2 = 0; i2 < 16; i2++) {
        bytes[i2] = parseInt(xssStub.slice(i2 * 2, i2 * 2 + 2), 16) & 255;
      }
    }
    return bytes;
  }
  function buildProtobuf(query, xssStub, timestamp, config2) {
    const params = new URLSearchParams(query);
    const deviceId = params.get("device_id") ?? "";
    const versionName = params.get("version_name") ?? "";
    const bodyHash = sm3Prefix6(xssStub === "" ? new Uint8Array(16) : decodeStub(xssStub));
    const queryHash = sm3Prefix6(
      query === "" ? new Uint8Array(16) : new TextEncoder().encode(query)
    );
    const rand = getCrypto().getRandomValues(new Uint32Array(1))[0] % 2147483647;
    return new ProtobufWriter().varint(1, 538970409 * 2).varint(2, 2).varint(3, rand).string(4, config2.aid).string(5, deviceId).string(6, config2.licenseId).string(7, versionName).string(8, config2.sdkVersion).varint(9, config2.sdkVersionInt).bytes(10, new Uint8Array(8)).varint(11, 0).varint(12, timestamp * 2).bytes(13, bodyHash).bytes(14, queryHash).message(15, (sub) => {
      sub.varint(1, 1).varint(2, 1).varint(3, 1).varint(7, 3348294860);
    }).string(16, "").string(20, "none").varint(21, config2.callType).message(23, (sub) => {
      sub.string(1, "NX551J").varint(2, 8196).varint(4, 2162219008);
    }).varint(25, 2).toBytes();
  }
  async function getArgus(query, xssStub, timestamp, config2) {
    const { signKey } = config2;
    if (signKey.length !== 32) {
      throw new Error(`Sign key must be 32 bytes, got ${signKey.length}`);
    }
    const protobuf = pkcs7Pad(buildProtobuf(query, xssStub, timestamp, config2), 16);
    const sm3Input = new Uint8Array(signKey.length * 2 + LOW_RAND.length + HIGH_RAND.length);
    sm3Input.set(signKey, 0);
    sm3Input.set(LOW_RAND, signKey.length);
    sm3Input.set(HIGH_RAND, signKey.length + LOW_RAND.length);
    sm3Input.set(signKey, signKey.length + LOW_RAND.length + HIGH_RAND.length);
    const sm3Output = sm3(sm3Input);
    const keyView = new DataView(sm3Output.buffer, sm3Output.byteOffset, sm3Output.byteLength);
    const simonKey = [
      keyView.getBigUint64(0, true),
      keyView.getBigUint64(8, true),
      keyView.getBigUint64(16, true),
      keyView.getBigUint64(24, true)
    ];
    const encrypted = new Uint8Array(protobuf.length);
    const pbView = new DataView(protobuf.buffer, protobuf.byteOffset, protobuf.byteLength);
    const encView = new DataView(encrypted.buffer);
    for (let offset = 0; offset < protobuf.length; offset += 16) {
      const [low, high] = simonEncrypt(
        [pbView.getBigUint64(offset, true), pbView.getBigUint64(offset + 8, true)],
        simonKey
      );
      encView.setBigUint64(offset, low, true);
      encView.setBigUint64(offset + 8, high, true);
    }
    const data = new Uint8Array(XOR_PREFIX.length + encrypted.length);
    data.set(XOR_PREFIX);
    data.set(encrypted, XOR_PREFIX.length);
    for (let i2 = XOR_PREFIX.length; i2 < data.length; i2++) {
      data[i2] ^= data[i2 % 8];
    }
    data.reverse();
    const header = new Uint8Array([166, 110, 173, 159, 119, 1, 208, 12, 24]);
    const plaintext = new Uint8Array(header.length + data.length + HIGH_RAND.length);
    plaintext.set(header);
    plaintext.set(data, header.length);
    plaintext.set(HIGH_RAND, header.length + data.length);
    const subtle = getSubtle();
    const aesKey = await subtle.importKey(
      "raw",
      await hash.md5bytes(signKey.slice(0, 16)),
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );
    const iv = await hash.md5bytes(signKey.slice(16));
    const ciphertext = new Uint8Array(
      await subtle.encrypt({ name: "AES-CBC", iv }, aesKey, plaintext)
    );
    const result = new Uint8Array(LOW_RAND.length + ciphertext.length);
    result.set(LOW_RAND);
    result.set(ciphertext, LOW_RAND.length);
    return b64encode(result.buffer);
  }
  const ROUNDS = 34;
  const MASK64 = 0xffffffffffffffffn;
  const WORD_SIZE = 64n;
  const ALPHA = 8n;
  const BETA = 3n;
  function readUint64LE(view, offset) {
    return view.getBigUint64(offset, true);
  }
  function keySchedule(key) {
    const view = new DataView(key.buffer, key.byteOffset, key.byteLength);
    const ks = [readUint64LE(view, 0) & MASK64];
    const numWords = key.length * 8 / Number(WORD_SIZE);
    const ls = [];
    for (let i2 = 1; i2 < numWords; i2++) {
      ls.push(readUint64LE(view, i2 * 8) & MASK64);
    }
    for (let x = 0; x < ROUNDS - 1; x++) {
      const rsX = (ls[x] << WORD_SIZE - ALPHA) + (ls[x] >> ALPHA) & MASK64;
      const addSxy = rsX + ks[x] & MASK64;
      const newX = BigInt(x) ^ addSxy;
      const lsY = (ks[x] >> WORD_SIZE - BETA) + (ks[x] << BETA) & MASK64;
      ls.push(newX);
      ks.push(newX ^ lsY);
    }
    return ks;
  }
  function encryptBlock(ks, block, out, outOffset) {
    const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
    let y = readUint64LE(view, 0);
    let x = readUint64LE(view, 8);
    for (const k of ks) {
      const rsX = (x << WORD_SIZE - ALPHA) + (x >> ALPHA) & MASK64;
      const addSxy = rsX + y & MASK64;
      x = k ^ addSxy;
      const lsY = (y >> WORD_SIZE - BETA) + (y << BETA) & MASK64;
      y = x ^ lsY;
    }
    const outView = new DataView(out.buffer, out.byteOffset, out.byteLength);
    outView.setBigUint64(outOffset, y & MASK64, true);
    outView.setBigUint64(outOffset + 8, x & MASK64, true);
  }
  function speckEncrypt(key, plaintext) {
    if (key.length !== 32) {
      throw new Error(`Speck key must be 32 bytes, got ${key.length}`);
    }
    const padded = pkcs7Pad(plaintext, 16);
    const ks = keySchedule(key);
    const out = new Uint8Array(padded.length);
    for (let i2 = 0; i2 < padded.length; i2 += 16) {
      encryptBlock(ks, padded.subarray(i2, i2 + 16), out, i2);
    }
    return out;
  }
  async function generateLadonKey(randomBytes, aid) {
    const aidBytes = new TextEncoder().encode(aid);
    const input = new Uint8Array(randomBytes.length + aidBytes.length);
    input.set(randomBytes);
    input.set(aidBytes, randomBytes.length);
    const hex2 = await hash.md5(input);
    return new TextEncoder().encode(hex2);
  }
  async function getLadon(timestamp, config2) {
    const randomBytes = getCrypto().getRandomValues(new Uint8Array(4));
    const plaintext = new TextEncoder().encode(
      `${timestamp}-${config2.licenseId}-${config2.aid}`
    );
    const key = await generateLadonKey(randomBytes, config2.aid);
    const encrypted = speckEncrypt(key, plaintext);
    const result = new Uint8Array(randomBytes.length + encrypted.length);
    result.set(randomBytes);
    result.set(encrypted, randomBytes.length);
    return b64encode(result.buffer);
  }
  const defaultUnidbgConfig = {
    signKey: new Uint8Array(
      unhex("ac1adaae95a7af94a5114ab3b3a97dd80050aa0a39314c40528caec95256c28c")
    ),
    aid: "1967",
    licenseId: "1611921764",
    sdkVersion: "v04.04.05-ov-android",
    sdkVersionInt: 134744640,
    callType: 738
  };
  async function generateHeaders(rawQuery, xssStub = "", timestamp = Math.floor(Date.now() / 1e3), config2 = defaultUnidbgConfig) {
    const [argus, ladon] = await Promise.all([
      getArgus(rawQuery, xssStub, timestamp, config2),
      getLadon(timestamp, config2)
    ]);
    return {
      "x-argus": argus,
      "x-ladon": ladon,
      "x-khronos": String(timestamp)
    };
  }
  async function signRequest(url, body, config2 = defaultUnidbgConfig) {
    const rawQuery = new URL(url).search.replace(/^\?/, "");
    const hasBody = typeof body === "string" ? body.length > 0 : ((body == null ? void 0 : body.byteLength) ?? 0) > 0;
    const xssStub = hasBody ? await hash.md5(body) : "";
    const now = Date.now();
    const headers = await generateHeaders(
      rawQuery,
      xssStub,
      Math.floor(now / 1e3),
      config2
    );
    headers["x-ss-req-ticket"] = String(now);
    if (hasBody) {
      headers["X-SS-STUB"] = xssStub;
    }
    return headers;
  }
  async function gzip(data) {
    if (typeof data === "string") {
      data = new TextEncoder().encode(data).buffer;
    }
    const encoder = new CompressionStream("gzip");
    const stream = new Blob([data]).stream().pipeThrough(encoder);
    const compressed = new Response(stream).arrayBuffer();
    return compressed;
  }
  async function gunzip(data) {
    const decoder = new DecompressionStream("gzip");
    const stream = new Blob([data]).stream().pipeThrough(decoder);
    const decompressed = new Response(stream).arrayBuffer();
    return decompressed;
  }
  const FIXED_STRING = b64decode(
    "TdTC5rgxYgkOUrPHpnM7pByyRiuCmrWKGWs521cXdST0m69/COjWjSanLjfBqVovHwWlGJKu8pSXMrYqOKrdWA=="
  );
  async function encrypt(data) {
    const crypto = getCrypto();
    const subtle = getSubtle();
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const hashValue = await hash.sha512bytes(
      concatArrayBuffers(await hash.sha512bytes(randomBytes), FIXED_STRING)
    );
    const k = hashValue.slice(0, 16);
    const iv = hashValue.slice(16, 32);
    const compressedData = await gzip(data);
    const hashedData = concatArrayBuffers(
      await hash.sha512bytes(compressedData),
      compressedData
    );
    const key = await subtle.importKey("raw", k, { name: "AES-CBC", length: 128 }, false, ["encrypt"]);
    const encryptedData = await subtle.encrypt({ name: "AES-CBC", iv }, key, hashedData);
    return concatArrayBuffers(
      new Uint8Array([116, 99, 5, 16, 0, 0]).buffer,
      randomBytes.buffer,
      encryptedData
    );
  }
  const ANDROID_VERSIONS = [
    { version: "9", api: 29 },
    { version: "10", api: 30 },
    { version: "11", api: 31 },
    { version: "12", api: 32 },
    { version: "13", api: 33 },
    { version: "14", api: 34 }
  ];
  const DEVICE_MODELS = [
    "RMX1931",
    "MI8",
    "Honor10",
    "P30",
    "V1921A",
    "Redmi Note 7",
    "Redmi K20 Pro",
    "MI 9",
    "Mi 10 Pro",
    "SM-G9750",
    "Pixel 6",
    "HD1910",
    "M2011K2C",
    "LIO-AN00",
    "VOG-TL00",
    "PCLM10",
    "GM1900",
    "Pixel 7 Pro",
    "Pixel 6a",
    "SM-N9760",
    "POCO F1"
  ];
  const DEVICE_BRANDS = [
    "realme",
    "Xiaomi",
    "Huawei",
    "OPPO",
    "vivo",
    "samsung",
    "OnePlus",
    "google",
    "Redmi",
    "HONOR",
    "motorola",
    "POCO"
  ];
  const HEX_LOW = "0123456789abcdef";
  const deviceValue = {
    aid: "1967",
    appName: "novelapp",
    channel: "0",
    platform: "android",
    osVersion: "0",
    versionCode: {
      str: "6.3.9.32",
      val: "63932"
    }
  };
  function randomInt(max) {
    return getCrypto().getRandomValues(new Uint32Array(1))[0] % max;
  }
  function randomItem(list) {
    return list[randomInt(list.length)];
  }
  function randomHex(k) {
    if (k <= 0) return "";
    const bytes = getCrypto().getRandomValues(new Uint8Array(k));
    let result = "";
    for (let i2 = 0; i2 < k; i2++) {
      result += HEX_LOW[bytes[i2] % 16];
    }
    return result;
  }
  function uuid() {
    const c = getCrypto();
    if (typeof c.randomUUID === "function") {
      return c.randomUUID();
    }
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = b[6] & 15 | 64;
    b[8] = b[8] & 63 | 128;
    const h2 = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
    return `${h2.slice(0, 8)}-${h2.slice(8, 12)}-${h2.slice(12, 16)}-${h2.slice(16, 20)}-${h2.slice(20)}`;
  }
  function ipv6LinkLocal() {
    return "::1";
  }
  function ipv6UniqueLocal() {
    const x = randomInt(1 << 8);
    let result = `fd${HEX_LOW[x >> 4]}${HEX_LOW[x & 15]}`;
    for (let i2 = 0; i2 < 7; i2++) {
      const v = randomInt(1 << 16);
      result += ":" + HEX_LOW[v >> 12 & 15] + HEX_LOW[v >> 8 & 15] + HEX_LOW[v >> 4 & 15] + HEX_LOW[v & 15];
    }
    return result;
  }
  function generateRequestBody() {
    const osInfo = randomItem(ANDROID_VERSIONS);
    const deviceBrand = randomItem(DEVICE_BRANDS);
    const genTime = Date.now();
    const romVersion = "coloros__" + randomHex(4).toUpperCase() + "." + String(randomInt(1e6)).padStart(6, "0") + "." + String(randomInt(1e8)).padStart(8, "0") + " release-keys";
    return {
      magic_tag: "ss_app_log",
      header: {
        display_name: "番茄免费小说",
        aid: 1967,
        channel: "43536163a",
        package: "com.dragon.read",
        sdk_version: "3.7.0-rc.25-fanqie-xiaoshuo",
        sdk_target_version: 29,
        git_hash: "711d1a7",
        density_dpi: 240,
        display_density: "hdpi",
        resolution: "720x1280",
        language: "zh",
        timezone: 8,
        access: "wifi",
        not_request_sender: 0,
        carrier: "CHINA MOBILE",
        mcc_mnc: "46000",
        region: "CN",
        tz_name: "Asia/Shanghai",
        tz_offset: 28800,
        sim_region: "cn",
        sim_serial_number: [],
        oaid_may_support: false,
        device_platform: "android",
        custom: { host_bit: 32, dragon_device_type: 0 },
        pre_installed_channel: "",
        is_system_app: 0,
        sdk_flavor: "china",
        guest_mode: 0,
        // 设备硬件与系统信息
        os: "Android",
        os_version: osInfo.version,
        os_api: osInfo.api,
        device_model: randomItem(DEVICE_MODELS),
        device_brand: deviceBrand,
        device_manufacturer: deviceBrand,
        cpu_abi: "arm64-v8a",
        release_build: randomHex(7),
        cdid: uuid(),
        sig_hash: "a4a27c2633195374c15651ffc3c4a497",
        openudid: randomHex(20),
        clientudid: uuid(),
        req_id: uuid(),
        // 可选字段
        rom: randomHex(14).toUpperCase(),
        rom_version: romVersion,
        apk_first_install_time: genTime - randomInt(365) * 864e5,
        ipv6_list: [
          { type: "client_anpi", value: ipv6LinkLocal() },
          { type: "client_anpi", value: ipv6UniqueLocal() },
          { type: "client_anpi", value: ipv6UniqueLocal() }
        ]
      },
      _gen_time: genTime
    };
  }
  const REGISTER_URL = "https://i.snssdk.com/service/2/device_register/?tt_data=a";
  const READING_BASE = "https://reading.snssdk.com";
  const USER_AGENT = "com.dragon.read";
  const APP_REQUEST = { credentials: "omit" };
  function buildQuery(device, versionCode, extra) {
    return new URLSearchParams({
      device_id: device.device_id,
      iid: device.install_id,
      device_type: device.device_type,
      aid: deviceValue.aid,
      app_name: deviceValue.appName,
      channel: deviceValue.channel,
      device_platform: deviceValue.platform,
      os_version: deviceValue.osVersion,
      version_code: versionCode,
      ...extra
    });
  }
  async function registerDevice() {
    const body = generateRequestBody();
    const encrypted = await encrypt(
      new TextEncoder().encode(JSON.stringify(body)).buffer
    );
    const res = await apiFetch(REGISTER_URL, {
      ...APP_REQUEST,
      method: "POST",
      headers: {
        "User-Agent": "okhttp/4.10.0",
        "Content-Type": "application/octet-stream; tt-data=a"
      },
      body: encrypted
    });
    if (res.status !== 200) {
      throw new Error(`设备注册失败: HTTP ${res.status} ${res.statusText}`);
    }
    const json = res.json();
    if (!(json == null ? void 0 : json.device_id) || !json.device_id_str || !json.install_id_str) {
      throw new Error(`设备注册失败: device_id 无效, 响应=${res.responseText}`);
    }
    const device = {
      device_id: json.device_id_str,
      install_id: json.install_id_str,
      device_type: body.header.device_model
    };
    console.log("设备注册成功！", device);
    return device;
  }
  async function activatePremium(device) {
    var _a;
    const url = `${READING_BASE}/reading/user/privilege/add/v?` + buildQuery(device, deviceValue.versionCode.val, {
      manifest_version_code: deviceValue.versionCode.val,
      update_version_code: deviceValue.versionCode.val
    }).toString();
    const body = `{"add_count_daily":0,"amount":2592000,"privilege_id":7210376203117531962,"from":8,"unique_key":"${Date.now()}"}`;
    try {
      const headers = await signRequest(url, body);
      const res = await apiFetch(url, {
        ...APP_REQUEST,
        method: "POST",
        headers: {
          ...headers,
          "User-Agent": USER_AGENT,
          "Content-Type": "application/json; charset=utf-8"
        },
        body
      });
      const json = res.json();
      if ((json == null ? void 0 : json.code) !== 0) {
        console.warn("设备会员激活失败:", res.responseText);
        return "";
      }
      const expireTime = ((_a = json.data) == null ? void 0 : _a.expire_time) ?? "";
      console.log("设备会员已成功激活！过期时间:", expireTime);
      return expireTime;
    } catch (e) {
      console.warn("设备会员激活失败:", e);
      return "";
    }
  }
  async function registerKey(device) {
    var _a, _b;
    const url = `${READING_BASE}/reading/crypt/registerkey?` + buildQuery(device, deviceValue.versionCode.str).toString();
    const idBytes = new Uint8Array(16);
    let id = BigInt(device.device_id);
    for (let i2 = 15; i2 >= 0; i2--) {
      idBytes[i2] = Number(id & 0xffn);
      id >>= 8n;
    }
    idBytes.reverse();
    const subtle = getSubtle();
    const iv = getCrypto().getRandomValues(new Uint8Array(16));
    const key = await subtle.importKey("raw", shared_key, { name: "AES-CBC" }, false, ["encrypt"]);
    const encrypted = new Uint8Array(
      await subtle.encrypt({ name: "AES-CBC", iv }, key, idBytes)
    );
    const content = new Uint8Array(iv.length + encrypted.length);
    content.set(iv);
    content.set(encrypted, iv.length);
    const plainBody = JSON.stringify({ content: b64encode(content.buffer) });
    const gzipped = await gzip(plainBody);
    const headers = await signRequest(url, gzipped);
    const res = await apiFetch(url, {
      ...APP_REQUEST,
      method: "POST",
      headers: {
        ...headers,
        "User-Agent": USER_AGENT,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Encoding": "gzip"
      },
      body: gzipped
    });
    if (res.status !== 200) {
      throw new Error(`密钥注册失败: HTTP ${res.status} ${res.statusText}`);
    }
    const json = res.json();
    const encryptedKey = (_a = json == null ? void 0 : json.data) == null ? void 0 : _a.key;
    if (!encryptedKey) {
      throw new Error(`密钥注册失败: 响应缺少 key, 响应=${res.responseText}`);
    }
    const buf = b64decode(encryptedKey);
    const decryptKey = await subtle.importKey(
      "raw",
      shared_key,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    const finalKey = await subtle.decrypt(
      { name: "AES-CBC", iv: buf.slice(0, 16) },
      decryptKey,
      buf.slice(16)
    );
    const keyInfo = { key: finalKey, keyver: (_b = json.data) == null ? void 0 : _b.keyver };
    console.log("密钥获取成功，版本:", keyInfo.keyver, "key:", hex(finalKey));
    return keyInfo;
  }
  const STORAGE_KEY = "fqa.diagnostic_log";
  const MAX_ENTRIES = 200;
  const PERSIST_DEBOUNCE_MS = 500;
  let ringBuffer = [];
  const listeners$1 = /* @__PURE__ */ new Set();
  let persistTimer = null;
  let initialized = false;
  function load() {
    try {
      const raw = GM_getValue(STORAGE_KEY, "[]");
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.slice(-MAX_ENTRIES);
    } catch {
      return [];
    }
  }
  function persist() {
    try {
      GM_setValue(STORAGE_KEY, JSON.stringify(ringBuffer));
    } catch (e) {
      console.warn("[fqa:logger] persist failed:", e);
    }
  }
  function schedulePersist() {
    if (persistTimer) return;
    persistTimer = setTimeout(() => {
      persistTimer = null;
      persist();
    }, PERSIST_DEBOUNCE_MS);
  }
  function notify$1() {
    listeners$1.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn("[fqa:logger] listener error:", e);
      }
    });
  }
  function initLogger() {
    if (initialized) return;
    ringBuffer = load();
    initialized = true;
    info("logger", `日志系统就绪（历史 ${ringBuffer.length} 条）`);
  }
  function log(level, category, message, meta) {
    const entry = meta ? { ts: Date.now(), level, category, message, meta } : { ts: Date.now(), level, category, message };
    ringBuffer.push(entry);
    if (ringBuffer.length > MAX_ENTRIES) {
      ringBuffer = ringBuffer.slice(-MAX_ENTRIES);
    }
    const tag = `[fqa:${category}]`;
    switch (level) {
      case "error":
        console.error(tag, message, meta ?? "");
        break;
      case "warn":
        console.warn(tag, message, meta ?? "");
        break;
      case "info":
        console.info(tag, message, meta ?? "");
        break;
      default:
        console.debug(tag, message, meta ?? "");
    }
    notify$1();
    schedulePersist();
  }
  const debug = (category, message, meta) => log("debug", category, message, meta);
  const info = (category, message, meta) => log("info", category, message, meta);
  const warn = (category, message, meta) => log("warn", category, message, meta);
  const error = (category, message, meta) => log("error", category, message, meta);
  function getLog() {
    return ringBuffer.slice();
  }
  function clearLog() {
    ringBuffer = [];
    persist();
    notify$1();
    info("logger", "诊断日志已清空");
  }
  function subscribe$1(fn) {
    listeners$1.add(fn);
    return () => {
      listeners$1.delete(fn);
    };
  }
  function exportLogText() {
    const lines = [];
    for (const e of ringBuffer) {
      const t = new Date(e.ts).toISOString().slice(11, 23);
      const tag = e.level.toUpperCase().padEnd(5);
      lines.push(`${t} [${tag}] [${e.category}] ${e.message}`);
      if (e.meta) {
        for (const [k, v] of Object.entries(e.meta)) {
          lines.push(`         ${k} = ${typeof v === "string" ? v : JSON.stringify(v)}`);
        }
      }
    }
    return lines.join("\n");
  }
  const POOL_STORAGE_KEY = "fqa.device_pool.v1";
  const POOL_SIZE = 3;
  const FAILURE_THRESHOLD = 2;
  const REFILL_COOLDOWN_MS = 24 * 60 * 60 * 1e3;
  const STAGGER_REGISTER_MS = [0, 1e4, 3e4];
  const EMPTY_POOL = {
    slots: [],
    activeIndex: 0
  };
  const listeners = /* @__PURE__ */ new Set();
  function loadPool() {
    const raw = read(POOL_STORAGE_KEY);
    if (!raw || !Array.isArray(raw.slots)) return structuredClone(EMPTY_POOL);
    return raw;
  }
  function savePool(p) {
    write(POOL_STORAGE_KEY, p);
  }
  function notify() {
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn("[fqa:pool] listener error:", e);
      }
    });
  }
  async function initPool() {
    var _a;
    const { deviceId, installId } = settings;
    if (deviceId.trim() && installId.trim()) {
      info("pool", "手填设备模式，跳过池子初始化");
      await ensureSingleDeviceFromSettings();
      return;
    }
    let pool = loadPool();
    if (pool.slots.length === 0) {
      info("pool", "池子为空，开始首次注册…");
      const slot0 = await provisionSingleSlot();
      if (!slot0) {
        warn("pool", "首槽注册失败，回退到内置匿名设备");
        _config.currentConfig = defaultConfig;
        return;
      }
      pool = {
        slots: [slot0],
        activeIndex: 0
      };
      savePool(pool);
      scheduleBackgroundFills();
    } else {
      info("pool", `复用池子（${pool.slots.length} 个槽位）`, {
        activeIndex: pool.activeIndex,
        healthy: pool.slots.filter((s) => s.health === "healthy").length
      });
    }
    pushActiveToConfig(pool);
    if (((_a = getActiveSlot(pool)) == null ? void 0 : _a.health) === "dead") {
      const next = findHealthySlotIndex(pool, pool.activeIndex);
      if (next !== -1) {
        info("pool", `当前槽位 dead，自动切换到槽 ${next}`);
        pool.activeIndex = next;
        savePool(pool);
        pushActiveToConfig(pool);
      } else {
        warn("pool", "当前槽位 dead 且无备用槽位，请手动补员");
      }
    }
    notify();
  }
  async function ensureSingleDeviceFromSettings() {
    const cached = read("device");
    if (cached) {
      _config.currentConfig = cached;
      return;
    }
    try {
      const dev = await registerDevice();
      const vip = await activatePremium(dev);
      const keyInfo = await registerKey(dev);
      const c = {
        device_id: dev.device_id,
        install_id: dev.install_id,
        device_type: dev.device_type,
        key_info: keyInfo
      };
      _config.currentConfig = c;
      write("device", c);
      write("keyinfo", { key: b64encode(keyInfo.key), keyver: keyInfo.keyver });
      info("pool", "手填模式注册新设备完成", { device_id: c.device_id });
      if (vip) debug("pool", `VIP 到期 ${vip}`);
    } catch (e) {
      warn("pool", "手填模式注册失败", { error: String(e) });
      _config.currentConfig = defaultConfig;
    }
  }
  function scheduleBackgroundFills(_pool) {
    for (let i2 = 1; i2 < POOL_SIZE; i2++) {
      const delay = STAGGER_REGISTER_MS[i2] ?? i2 * 3e4;
      setTimeout(() => {
        void fillSlotIfEmpty(i2);
      }, delay);
    }
  }
  async function fillSlotIfEmpty(index) {
    const pool = loadPool();
    if (pool.slots.length > index && pool.slots[index]) {
      debug("pool", `槽 ${index} 已有设备，跳过`);
      return;
    }
    info("pool", `开始填充槽 ${index}…`);
    const slot = await provisionSingleSlot();
    if (!slot) {
      warn("pool", `槽 ${index} 注册失败`);
      return;
    }
    const newPool = {
      slots: [...pool.slots],
      activeIndex: pool.activeIndex
    };
    while (newPool.slots.length <= index) {
      newPool.slots.push(slot);
    }
    newPool.slots[index] = slot;
    savePool(newPool);
    notify();
    info("pool", `槽 ${index} 已填充`, { device_id: slot.device_id });
  }
  async function provisionSingleSlot() {
    try {
      const dev = await registerDevice();
      const vip = await activatePremium(dev);
      const keyInfo = await registerKey(dev);
      return {
        index: 0,
        // 后续会被填到正确位置
        device_id: dev.device_id,
        install_id: dev.install_id,
        device_type: dev.device_type,
        key_info: keyInfo,
        vip_expire_time: vip || void 0,
        health: "healthy",
        failureStreak: 0,
        lastFailureAt: 0,
        registeredAt: Date.now(),
        lastSuccessAt: 0,
        refillCooldownUntil: 0
      };
    } catch (e) {
      error("pool", "provisionSingleSlot 失败", { error: String(e) });
      return null;
    }
  }
  function pushActiveToConfig(pool) {
    const slot = getActiveSlot(pool);
    if (!slot) return;
    _config.currentConfig = {
      device_id: slot.device_id,
      install_id: slot.install_id,
      device_type: slot.device_type,
      key_info: slot.key_info
    };
    if (slot.key_info) {
      write("keyinfo", { key: b64encode(slot.key_info.key), keyver: slot.key_info.keyver });
    }
  }
  function getActiveSlot(pool) {
    return pool.slots[pool.activeIndex];
  }
  function findHealthySlotIndex(pool, fromIndex) {
    var _a;
    if (pool.slots.length === 0) return -1;
    for (let offset = 1; offset <= pool.slots.length; offset++) {
      const idx = (fromIndex + offset) % pool.slots.length;
      if (((_a = pool.slots[idx]) == null ? void 0 : _a.health) === "healthy") return idx;
    }
    return -1;
  }
  function recordSuccess() {
    const pool = loadPool();
    const slot = getActiveSlot(pool);
    if (!slot) return;
    if (slot.failureStreak !== 0 || slot.lastSuccessAt === 0) {
      slot.failureStreak = 0;
      slot.lastSuccessAt = Date.now();
      savePool(pool);
      notify();
    }
  }
  function recordFailure() {
    const pool = loadPool();
    const slot = getActiveSlot(pool);
    if (!slot) return { switched: false, reason: "no active slot" };
    slot.failureStreak += 1;
    slot.lastFailureAt = Date.now();
    if (slot.failureStreak < FAILURE_THRESHOLD) {
      savePool(pool);
      notify();
      return {
        switched: false,
        reason: `失败 ${slot.failureStreak}/${FAILURE_THRESHOLD}，未触发切换`
      };
    }
    slot.health = "dead";
    slot.refillCooldownUntil = Date.now() + REFILL_COOLDOWN_MS;
    info("pool", `槽 ${pool.activeIndex} 已标记 dead`, {
      device_id: slot.device_id,
      failureStreak: slot.failureStreak
    });
    const next = findHealthySlotIndex(pool, pool.activeIndex);
    if (next === -1) {
      savePool(pool);
      notify();
      warn("pool", "无可用 healthy 槽位，池子空了");
      return { switched: false, reason: "no healthy slot available" };
    }
    pool.activeIndex = next;
    savePool(pool);
    pushActiveToConfig(pool);
    notify();
    const nextSlot = pool.slots[next];
    info("pool", `已切换到槽 ${next}`, { device_id: (nextSlot == null ? void 0 : nextSlot.device_id) ?? "unknown" });
    return { switched: true, reason: `auto-switched to slot ${next}` };
  }
  function manualSwitch(toIndex) {
    const pool = loadPool();
    if (toIndex < 0 || toIndex >= pool.slots.length) {
      return { ok: false, reason: `槽 ${toIndex} 不存在` };
    }
    const target = pool.slots[toIndex];
    if (!target) return { ok: false, reason: `槽 ${toIndex} 为空` };
    if (target.health === "dead") {
      return { ok: false, reason: `槽 ${toIndex} 已 dead，请先补员` };
    }
    pool.activeIndex = toIndex;
    target.failureStreak = 0;
    savePool(pool);
    pushActiveToConfig(pool);
    notify();
    info("pool", `手动切换到槽 ${toIndex}`, { device_id: target.device_id });
    return { ok: true };
  }
  async function manualRefill(index) {
    const pool = loadPool();
    if (index < 0 || index >= POOL_SIZE) {
      return { ok: false, reason: `槽 ${index} 不存在（池容量 ${POOL_SIZE}）` };
    }
    if (index >= pool.slots.length) {
      return { ok: false, reason: `槽 ${index} 尚未注册，无法补员` };
    }
    const slot = pool.slots[index];
    if (!slot) return { ok: false, reason: `槽 ${index} 为空` };
    if (slot.health === "healthy") {
      return { ok: false, reason: `槽 ${index} 健康，不需要补员` };
    }
    if (slot.refillCooldownUntil > Date.now()) {
      const remain = Math.ceil((slot.refillCooldownUntil - Date.now()) / 1e3 / 60);
      return { ok: false, reason: `槽 ${index} 补员冷却中，还剩 ${remain} 分钟` };
    }
    info("pool", `开始手动补员槽 ${index}…`);
    const newSlot = await provisionSingleSlot();
    if (!newSlot) {
      return { ok: false, reason: "新设备注册失败，请查看诊断" };
    }
    newSlot.index = index;
    pool.slots[index] = newSlot;
    if (pool.activeIndex === index) {
      pushActiveToConfig(pool);
    }
    savePool(pool);
    notify();
    info("pool", `槽 ${index} 补员完成`, { device_id: newSlot.device_id });
    return { ok: true };
  }
  function getPoolState() {
    return loadPool();
  }
  async function resetPool() {
    info("pool", "正在重置整个设备池…");
    del(POOL_STORAGE_KEY);
    del("device");
    del("keyinfo");
    _config.currentConfig = defaultConfig;
    notify();
    await initPool();
  }
  function subscribe(fn) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }
  const DEFAULT_CONFIG$1 = {
    enabled: true,
    minMs: 5e3,
    maxMs: 25e3,
    longPauseChance: 0.03,
    longPauseMinMs: 3e4,
    longPauseMaxMs: 9e4
  };
  let config$1 = { ...DEFAULT_CONFIG$1 };
  let lastReleaseTime = 0;
  function uniformInRange(min, max) {
    return Math.floor(min + Math.random() * (max - min));
  }
  function normalDelay(mean, stddev, min, max) {
    const u1 = Math.random() || 1e-9;
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const v = mean + z * stddev;
    return Math.max(min, Math.min(max, Math.floor(v)));
  }
  function computeDelay() {
    if (Math.random() < config$1.longPauseChance) {
      const long = uniformInRange(config$1.longPauseMinMs, config$1.longPauseMaxMs);
      debug("throttle", `L4 长停顿触发`, { ms: long });
      return long;
    }
    const mean = (config$1.minMs + config$1.maxMs) * 0.45;
    const stddev = (config$1.maxMs - config$1.minMs) * 0.25;
    return normalDelay(mean, stddev, config$1.minMs, config$1.maxMs);
  }
  async function waitForThrottle() {
    if (!config$1.enabled) return;
    const now = Date.now();
    if (lastReleaseTime === 0) {
      lastReleaseTime = now;
      debug("throttle", "节流器首次放行");
      return;
    }
    const desiredDelay = computeDelay();
    const elapsed = now - lastReleaseTime;
    const wait = desiredDelay - elapsed;
    if (wait <= 0) {
      lastReleaseTime = now;
      return;
    }
    debug("throttle", `节流等待 ${Math.ceil(wait / 1e3)}s`, {
      elapsedMs: elapsed,
      targetMs: desiredDelay
    });
    await new Promise((resolve) => setTimeout(resolve, wait));
    lastReleaseTime = Date.now();
  }
  function getCountdownSeconds() {
    if (!config$1.enabled) return 0;
    if (lastReleaseTime === 0) return 0;
    const elapsed = Date.now() - lastReleaseTime;
    const earliestWait = config$1.minMs - elapsed;
    return earliestWait > 0 ? Math.ceil(earliestWait / 1e3) : 0;
  }
  function resetThrottle() {
    lastReleaseTime = 0;
    info("throttle", "节流器已重置");
  }
  function getThrottleConfig() {
    return { ...config$1 };
  }
  function setThrottleConfig(patch) {
    config$1 = { ...config$1, ...patch };
    info("throttle", "配置已更新", { ...config$1 });
  }
  const MODAL_ID = "fqa-recovery-modal";
  let currentContext = null;
  let mounted$1 = false;
  function mountRecoveryUI() {
    if (mounted$1) return;
    mounted$1 = true;
    subscribe(handlePoolChange);
    info("recovery", "恢复弹窗模块已挂载");
  }
  function handlePoolChange() {
    const state2 = getPoolState();
    if (state2.slots.length === 0) return;
    const active = state2.slots[state2.activeIndex];
    if (!active) return;
    if (active.health === "dead") {
      const healthyCount = state2.slots.filter((s) => s.health === "healthy").length;
      if (healthyCount === 0) {
        showModal({
          reason: { kind: "all_dead" },
          shownAt: Date.now()
        });
      }
    }
  }
  function notifyFailure(switchedFrom, switchedTo) {
    if (typeof switchedFrom === "number" && typeof switchedTo === "number") {
      showModal({
        reason: { kind: "auto_switched", fromIndex: switchedFrom, toIndex: switchedTo },
        shownAt: Date.now()
      });
    } else {
      const state2 = getPoolState();
      const healthyCount = state2.slots.filter((s) => s.health === "healthy").length;
      showModal({
        reason: healthyCount === 0 ? { kind: "all_dead" } : { kind: "pool_empty" },
        shownAt: Date.now()
      });
    }
  }
  function showModal(ctx) {
    if (currentContext && contextsEqual(currentContext.reason, ctx.reason)) return;
    currentContext = ctx;
    removeModal();
    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "fqa-recovery-modal";
    modal.innerHTML = renderModalHTML(ctx);
    document.body.appendChild(modal);
    bindActions$1(modal);
    info("recovery", "弹出失败恢复提示", { reason: ctx.reason });
  }
  function removeModal() {
    const old = document.getElementById(MODAL_ID);
    if (old) old.remove();
  }
  function contextsEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  function renderModalHTML(ctx) {
    const reasonText = renderReason(ctx.reason);
    return `
        <div class="fqa-recovery-backdrop">
            <div class="fqa-recovery-dialog" role="dialog" aria-modal="true">
                <div class="fqa-recovery-header">
                    <span class="fqa-recovery-icon">⚠️</span>
                    <span class="fqa-recovery-title">阅读遇到问题</span>
                </div>
                <div class="fqa-recovery-body">
                    <p class="fqa-recovery-reason">${reasonText}</p>
                    <div class="fqa-recovery-actions">
                        <button data-action="retry_now" class="fqa-recovery-btn primary">立即重试</button>
                        <button data-action="manual_switch" class="fqa-recovery-btn">切换设备</button>
                        <div class="fqa-recovery-backoff">
                            <button data-action="backoff" data-seconds="10" class="fqa-recovery-btn small">10s 后重试</button>
                            <button data-action="backoff" data-seconds="30" class="fqa-recovery-btn small">30s 后重试</button>
                            <button data-action="backoff" data-seconds="60" class="fqa-recovery-btn small">60s 后重试</button>
                            <button data-action="backoff" data-seconds="120" class="fqa-recovery-btn small">120s 后重试</button>
                        </div>
                        <button data-action="diagnostic" class="fqa-recovery-btn">查看诊断 ▼</button>
                        <button data-action="giveup" class="fqa-recovery-btn warn">放弃本次</button>
                    </div>
                    <details class="fqa-recovery-diag" id="fqa-recovery-diag">
                        <summary style="display:none">诊断日志</summary>
                        <pre class="fqa-recovery-log">${escapeHtml$1(exportLogText() || "（暂无日志）")}</pre>
                        <div class="fqa-recovery-diag-actions">
                            <button data-action="copy_log" class="fqa-recovery-btn small">复制日志</button>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    `;
  }
  function renderReason(r) {
    switch (r.kind) {
      case "auto_switched":
        return `当前设备失效，已自动切换到槽 ${r.toIndex}。继续阅读前可手动确认或重试。`;
      case "pool_empty":
        return `设备池为空，所有槽位都不可用。请检查诊断或稍后重试。`;
      case "all_dead":
        return `所有 ${getPoolState().slots.length} 个设备都已 dead，无法继续阅读。请在控制面板手动补员。`;
    }
  }
  function bindActions$1(modal) {
    modal.addEventListener("click", (ev) => {
      const target = ev.target;
      if (!target.dataset.action) {
        return;
      }
      const action = target.dataset.action;
      switch (action) {
        case "retry_now":
          handleRetryNow();
          break;
        case "manual_switch":
          handleManualSwitch$1();
          break;
        case "backoff":
          handleBackoff(parseInt(target.dataset.seconds ?? "30", 10));
          break;
        case "diagnostic":
          toggleDiagnostic(modal);
          break;
        case "copy_log":
          copyLogToClipboard$1();
          break;
        case "giveup":
          handleGiveup();
          break;
      }
    });
    requestAnimationFrame(() => toggleDiagnostic(modal));
  }
  function handleRetryNow() {
    info("recovery", "用户选择立即重试");
    removeModal();
    currentContext = null;
    location.reload();
  }
  function handleManualSwitch$1() {
    var _a;
    info("recovery", "用户选择手动切换设备");
    const state2 = getPoolState();
    const fromIndex = state2.activeIndex;
    for (let offset = 1; offset <= state2.slots.length; offset++) {
      const idx = (fromIndex + offset) % state2.slots.length;
      if (((_a = state2.slots[idx]) == null ? void 0 : _a.health) === "healthy") {
        const r = manualSwitch(idx);
        if (r.ok) {
          removeModal();
          currentContext = null;
          location.reload();
          return;
        }
      }
    }
    warn("recovery", "手动切换失败：无 healthy 槽位");
  }
  function handleBackoff(seconds) {
    info("recovery", `用户选择 ${seconds}s 后自动重试`);
    removeModal();
    currentContext = null;
    setTimeout(() => {
      location.reload();
    }, seconds * 1e3);
  }
  function toggleDiagnostic(modal) {
    const details = modal.querySelector("#fqa-recovery-diag");
    if (!details) return;
    details.open = !details.open;
    if (details.open) {
      const pre = details.querySelector("pre");
      if (pre) pre.scrollTop = pre.scrollHeight;
    }
  }
  function copyLogToClipboard$1() {
    var _a;
    const text = exportLogText();
    if ((_a = navigator.clipboard) == null ? void 0 : _a.writeText) {
      navigator.clipboard.writeText(text).then(
        () => info("recovery", "诊断日志已复制到剪贴板"),
        (e) => warn("recovery", "复制失败", { error: String(e) })
      );
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      info("recovery", "诊断日志已复制（execCommand 兜底）");
    } catch (e) {
      warn("recovery", "复制失败", { error: String(e) });
    }
    ta.remove();
  }
  function handleGiveup() {
    info("recovery", "用户选择放弃本次");
    removeModal();
    currentContext = null;
  }
  function escapeHtml$1(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  const appBaseUrl = "https://reading.snssdk.com/reading";
  const redcandleBaseUrl = "https://api5-sinfonlinec.jxbhmy.com/reading";
  const appUserAgent = "com.dragon.read";
  function buildAppQuery(extra) {
    const c = _config.currentConfig;
    return new URLSearchParams({
      iid: c.install_id,
      device_id: c.device_id,
      ac: "wifi",
      channel: "43536163a",
      aid: "1967",
      app_name: "novelapp",
      version_code: "70132",
      version_name: "7.0.1.32",
      device_platform: "android",
      os: "android",
      ssmix: "a",
      os_version: "10",
      device_type: c.device_type || "P30",
      device_brand: c.device_brand || "realme",
      update_version_code: "70132",
      manifest_version_code: "70132",
      pv_player: "70132",
      ...extra
    });
  }
  function isUsable(res) {
    if (!res || res.status !== 200) return false;
    try {
      const j = res.json();
      return !j || j.code === void 0 || j.code === 0;
    } catch {
      return false;
    }
  }
  async function requestApp(path, query, headers) {
    const url = `${appBaseUrl}${path}?${buildAppQuery(query).toString()}`;
    const signed = await signRequest(url);
    return apiFetch(url, {
      method: "GET",
      headers: { ...signed, "User-Agent": appUserAgent, ...headers }
    });
  }
  async function requestRedcandle(path, query, headers) {
    const url = `${redcandleBaseUrl}${path}?${buildAppQuery(query).toString()}`;
    return apiFetch(url, {
      method: "GET",
      headers: { "User-Agent": appUserAgent, ...headers }
    });
  }
  async function requestAppWithRecovery(path, query, headers) {
    await waitForThrottle();
    const res = await requestApp(path, query, headers);
    if (!isEmptyResponse(res)) {
      recordSuccess();
      return res;
    }
    console.warn(`[fqa:api] ${path} 返回空响应体，上报池子失败`);
    const failureResult = recordFailure();
    if (failureResult.switched) {
      const state2 = getPoolState();
      notifyFailure(state2.activeIndex - 1 < 0 ? 0 : state2.activeIndex - 1, state2.activeIndex);
    }
    const retry = await requestApp(path, query, headers);
    if (!isEmptyResponse(retry)) {
      recordSuccess();
      return retry;
    }
    return retry;
  }
  async function appGet(path, query, headers) {
    if (settings.apiPreference === "redcandle") {
      try {
        const res = await requestRedcandle(path, query, headers);
        if (isUsable(res)) return res;
        console.warn(`[fqa:api] 红烛接口数据不全，回落到番茄 APP: ${path}`);
      } catch (e) {
        console.warn(`[fqa:api] 红烛接口请求失败，回落到番茄 APP: ${path}`, e);
      }
    }
    return requestAppWithRecovery(path, query, headers);
  }
  async function appPost(path, body, query, headers) {
    return postSigned(appBaseUrl + path, body, query, headers);
  }
  async function postSigned(base, body, query, headers) {
    const url = `${base}?${buildAppQuery(query).toString()}`;
    const signed = await signRequest(url, body);
    console.log("---start--- APP POST ", url);
    const res = await apiFetch(url, {
      method: "POST",
      headers: {
        ...signed,
        "User-Agent": appUserAgent,
        "Content-Type": "application/json; charset=utf-8",
        ...headers
      },
      body
    });
    console.log("---complete--- APP POST ", url, res);
    return res;
  }
  async function decryptChapter(encrypted, rawData, config2 = defaultConfig) {
    var _a;
    if (!encrypted) {
      throw new Error("Invalid encrypted chapter");
    }
    const buf = b64decode(encrypted);
    const iv = buf.slice(0, 16);
    const data = buf.slice(16);
    const key = (_a = config2.key_info) == null ? void 0 : _a.key;
    if (!key) {
      throw new Error("Missing decrypt key");
    }
    const subtle = getSubtle();
    const cryptoKey = await subtle.importKey(
      "raw",
      key,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    return subtle.decrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      data
    ).then(async (decrypted) => {
      if (rawData && (rawData == null ? void 0 : rawData.compress_status) === 1) {
        decrypted = await gunzip(decrypted);
      }
      const decoder = new TextDecoder();
      const plain = decoder.decode(decrypted);
      if (plain.trim().startsWith("<")) {
        return plain;
      }
      try {
        return JSON.parse(plain);
      } catch (e) {
        console.warn("Invalid chapter content: ", plain, e);
        return void 0;
      }
    });
  }
  async function decryptComicImage(image, key) {
    const subtle = getSubtle();
    const cryptoKey = await subtle.importKey(
      "raw",
      unhex(key),
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    const iv = image.slice(0, 12);
    const data = image.slice(12);
    return await subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      data
    );
  }
  function reverseHex(value) {
    const be = BigInt(value).toString(16).padStart(32, "0");
    let result = "";
    for (let i2 = be.length; i2 > 0; i2 -= 2) result += be.slice(i2 - 2, i2);
    return result;
  }
  async function encryptKeyinfoBody(config2) {
    const deviceId = config2.device_id;
    const iv = new TextEncoder().encode(randomString(16));
    const data = new Uint8Array(unhex(reverseHex(deviceId))).slice(0, 8);
    console.log(data);
    const subtle = getSubtle();
    const k = await subtle.importKey(
      "raw",
      shared_key,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );
    const encrypted = await subtle.encrypt(
      { name: "AES-CBC", iv },
      k,
      data
    );
    const final = new Uint8Array(iv.length + encrypted.byteLength);
    console.log(final);
    final.set(iv, 0);
    final.set(new Uint8Array(encrypted), iv.length);
    return JSON.stringify({
      content: b64encode(final.buffer)
    });
  }
  async function decryptKeyinfoResponse(encrypted) {
    const buf = b64decode(encrypted);
    const iv = buf.slice(0, 16);
    const data = buf.slice(16);
    const subtle = getSubtle();
    const k = await subtle.importKey(
      "raw",
      shared_key,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    return subtle.decrypt(
      { name: "AES-CBC", iv },
      k,
      data
    );
  }
  async function refreshKeyinfo() {
    var _a, _b, _c;
    const b = await encryptKeyinfoBody(_config.currentConfig);
    const res = await appPost("/crypt/registerkey", b);
    const j = res.json();
    const ek = (_a = j == null ? void 0 : j.data) == null ? void 0 : _a.key;
    if (!ek) {
      throw new Error(`Failed to get key info: ${res.responseText}`);
    }
    const key = await decryptKeyinfoResponse(ek);
    const keyinfo = {
      key,
      keyver: (_b = j == null ? void 0 : j.data) == null ? void 0 : _b.keyver
    };
    console.log("Refreshed key info:", keyinfo);
    _config.currentConfig.key_info = keyinfo;
    write("keyinfo", {
      key: b64encode(key),
      keyver: (_c = j == null ? void 0 : j.data) == null ? void 0 : _c.keyver
    });
  }
  let refreshInflight = null;
  function refreshKey() {
    if (!refreshInflight) {
      refreshInflight = refreshKeyinfo().finally(() => {
        refreshInflight = null;
      });
    }
    return refreshInflight;
  }
  async function ensureKeyinfo(expectedKeyVersion) {
    const keyinfo = _config.currentConfig.key_info;
    const cachedKeyInfo = read("keyinfo");
    console.log("cached key info: ", cachedKeyInfo);
    if (cachedKeyInfo) {
      const cki = {
        key: b64decode(cachedKeyInfo.key),
        keyver: cachedKeyInfo.keyver
      };
      if (typeof expectedKeyVersion === "undefined" || cki.keyver === expectedKeyVersion) {
        _config.currentConfig.key_info = cki;
        return;
      }
    }
    if (!keyinfo) {
      return await refreshKey();
    }
    if ((keyinfo == null ? void 0 : keyinfo.keyver) !== expectedKeyVersion) {
      return await refreshKey();
    }
  }
  async function getChapter(itemId2, _retry) {
    var _a, _b;
    if (typeof _retry === "undefined") _retry = 0;
    if (_retry > 5) {
      throw new Error(`Failed to get chapter: ${itemId2}`);
    }
    if (!_config.currentConfig.key_info) {
      await ensureKeyinfo();
    }
    const res = await appGet("/reader/full/v", { item_id: itemId2, req_type: "1" });
    const j = (_a = res.json()) == null ? void 0 : _a.data;
    if (!j) {
      console.warn("Failed to get chapter: ", itemId2, ", response: ", res.responseText);
      return await getChapter(itemId2, _retry + 1);
    }
    if ((j == null ? void 0 : j.content) === "Invalid" || (j == null ? void 0 : j.key_version) !== ((_b = _config.currentConfig.key_info) == null ? void 0 : _b.keyver)) {
      console.warn("Key reg expired, regster again and retrying...");
      if ((j == null ? void 0 : j.content) === "Invalid") {
        await refreshKey();
      } else {
        await ensureKeyinfo(parseInt(j == null ? void 0 : j.key_version));
      }
      return await getChapter(itemId2, _retry + 1);
    }
    j.content = await decryptChapter(j == null ? void 0 : j.content, j, _config.currentConfig);
    return j;
  }
  async function getCatalogRaw(bookId2) {
    var _a;
    const response = await appGet("/bookapi/directory/all_items/v", { book_id: bookId2 });
    const j = response.json();
    const items = (_a = j == null ? void 0 : j.data) == null ? void 0 : _a.item_data_list;
    if ((j == null ? void 0 : j.code) !== 0 || !Array.isArray(items) || items.length === 0) {
      return [null, null];
    }
    return [items, items.map((it) => String(it.item_id))];
  }
  async function webCatalog(bookId2) {
    const url = `https://fanqienovel.com/api/reader/directory/detail?bookId=${bookId2}`;
    const response = await apiFetch(url);
    const rj = response.json();
    const d = rj.data;
    const allItems = d.allItemIds;
    const cs = [];
    const vname = d.volumeNameList;
    for (let i2 = 0; i2 < vname.length; i2++) {
      const volumeName = vname[i2];
      if (volumeName !== void 0) {
        cs.push(...d.chapterListWithVolume[i2]);
      }
    }
    return [cs, allItems];
  }
  async function getCatalog(bookId2) {
    const r = await getCatalogRaw(bookId2);
    let catalogRaw = r[0];
    let allItemIds = r[1];
    console.log("catalogRaw", catalogRaw, "allItemIds", allItemIds);
    if (!catalogRaw || !allItemIds) {
      const rw = await webCatalog(bookId2);
      catalogRaw = rw[0];
      allItemIds = rw[1];
      console.log("webCatalog", catalogRaw, "allItemIds", allItemIds);
    }
    const vmap = {};
    const chapters = [];
    catalogRaw.forEach((item) => {
      const volumeName = item.volume_name ?? "";
      const chapterItem = {
        item_id: String(item.item_id || item.itemId),
        title: item.title,
        // YYYY-MM-DD HH:mm:ss
        update_time: moment((item.first_pass_time || item.firstPassTime) * 1e3).format("YYYY-MM-DD HH:mm:ss"),
        char_count: item.chapter_word_number || 0,
        volume_title: volumeName
      };
      chapters.push(chapterItem);
      if (!vmap[volumeName]) {
        vmap[volumeName] = {
          title: volumeName,
          book_id: bookId2,
          chapter_list: []
        };
      }
      vmap[volumeName].chapter_list.push(chapterItem);
    });
    return {
      book_id: bookId2,
      volume_list: Object.values(vmap),
      chapter_list: chapters,
      all_item_ids: allItemIds
    };
  }
  function mappingCreationStatus(status) {
    switch (status) {
      case "0":
        return "完结";
      case "1":
        return "连载";
      case "4":
        return "断更";
      default:
        return "未知";
    }
  }
  async function getBookInfoRaw(bookId2) {
    const response = await appGet("/bookapi/detail/v", { book_id: bookId2 });
    const j = response.json();
    console.log("Book Info:", j);
    return j.data;
  }
  async function getBookInfo(bookId2) {
    const bookInfo = await getBookInfoRaw(bookId2);
    if (!bookInfo) {
      throw new Error("Book not found");
    }
    return {
      book_id: bookInfo.book_id,
      title: bookInfo.book_name || bookInfo.original_book_name,
      author: bookInfo.author,
      cover_url: bookInfo.thumb_url,
      summary: bookInfo.abstract,
      // volume_list: bookInfo.volume_list,
      update_time: moment(bookInfo.last_chapter_first_pass_time * 1e3).format("YYYY-MM-DD HH:mm:ss"),
      status: mappingCreationStatus(bookInfo.creation_status)
      // chapter_count: bookInfo.chapter_count,
    };
  }
  async function getBookInfoAndCatalog(book) {
    if (typeof book !== "string") {
      book = book.book_id;
    }
    const bookInfo = await getBookInfo(book);
    if (!bookInfo) {
      throw new Error("Book not found");
    }
    const catalog = await getCatalog(bookInfo.book_id);
    console.log("Catalog:", catalog);
    bookInfo.volume_list = catalog.volume_list;
    bookInfo.chapter_list = catalog.chapter_list;
    return bookInfo;
  }
  const CDN_PREFIX = "https://p3-novel.byteimg.com/origin/";
  const cssCache = /* @__PURE__ */ new Map();
  function stripComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, "");
  }
  function scopeSelector(selector, scope) {
    const s = selector.trim();
    if (!s) return "";
    const where = `:where(${scope})`;
    if (/^(body|html|:root)$/i.test(s)) return where;
    const m = s.match(/^(body|html)\b([\s\S]*)$/i);
    if (m) return `${where}${m[2]}`;
    return `${where} ${s}`;
  }
  function stripRootDecls(body) {
    return body.split(";").filter((decl) => !/^\s*(color|background|background-color|font-size)\s*:/i.test(decl)).join(";");
  }
  function scopeCss(css, scope) {
    const src = stripComments(css);
    let out = "";
    let buf = "";
    let i2 = 0;
    while (i2 < src.length) {
      const ch = src[i2];
      if (ch === "{") {
        const prelude = buf.trim();
        buf = "";
        i2++;
        if (prelude.startsWith("@")) {
          if (/^@(media|supports|document)\b/i.test(prelude)) {
            const inner2 = readBlock(src, i2);
            out += `${prelude}{${scopeCss(inner2.text, scope)}}`;
            i2 = inner2.end;
          } else {
            const inner2 = readBlock(src, i2);
            out += `${prelude}{${inner2.text}}`;
            i2 = inner2.end;
          }
          continue;
        }
        const inner = readBlock(src, i2);
        const selectors = prelude.split(",").map((s) => scopeSelector(s, scope)).filter(Boolean);
        const isRoot = selectors.length === 1 && selectors[0] === `:where(${scope})`;
        const declarations = isRoot ? stripRootDecls(inner.text) : inner.text;
        if (selectors.length && declarations.trim()) {
          out += `${selectors.join(",")}{${declarations}}`;
        }
        i2 = inner.end;
        continue;
      }
      if (ch === ";" && buf.trim().startsWith("@")) {
        buf = "";
        i2++;
        continue;
      }
      buf += ch;
      i2++;
    }
    return out;
  }
  function readBlock(src, start) {
    let depth = 1;
    let i2 = start;
    while (i2 < src.length && depth > 0) {
      const c = src[i2];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      if (depth === 0) break;
      i2++;
    }
    return { text: src.slice(start, i2), end: Math.min(i2 + 1, src.length) };
  }
  function parseCssMap(cssMap) {
    if (!cssMap || typeof cssMap !== "string") return {};
    try {
      const parsed = JSON.parse(cssMap);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  async function fetchCss(uri) {
    const cached = cssCache.get(uri);
    if (cached !== void 0) return cached;
    try {
      const res = await fetch(CDN_PREFIX + uri);
      const text = res.ok ? await res.text() : "";
      cssCache.set(uri, text);
      return text;
    } catch (e) {
      console.warn("获取书籍样式表失败:", uri, e);
      cssCache.set(uri, "");
      return "";
    }
  }
  async function getScopedBookCss(cssMap, scope) {
    const map = parseCssMap(cssMap);
    const uris = Object.values(map).filter(Boolean);
    if (uris.length === 0) return "";
    const sheets = await Promise.all(uris.map(fetchCss));
    return sheets.filter(Boolean).map((css) => scopeCss(css, scope)).join("\n");
  }
  async function applyBookCss(cssMap, scope, styleId = "fqa-book-style") {
    const css = await getScopedBookCss(cssMap, scope);
    let el = document.getElementById(styleId);
    if (!css) {
      el == null ? void 0 : el.remove();
      return false;
    }
    if (!el) {
      el = document.createElement("style");
      el.id = styleId;
      document.head.appendChild(el);
    }
    el.textContent = css;
    return true;
  }
  const FOOTNOTE_CLASS = "fqa-footnote";
  const FOOTNOTE_REF_CLASS = "fqa-footnote-ref";
  const FOOTNOTE_LIST_CLASS = "fqa-footnote-list";
  function byAttr(root, tag, attr, value) {
    return [...root.querySelectorAll(tag)].filter((el) => {
      const v = el.getAttribute(attr);
      if (v === null) return false;
      return value === void 0 || v === value;
    });
  }
  function processFootnotes(root) {
    const notes = /* @__PURE__ */ new Map();
    const sections = byAttr(root, "section", "epub:type", "footnotes");
    for (const section of sections) {
      for (const aside of section.querySelectorAll("aside")) {
        const id = aside.getAttribute("id");
        if (id) notes.set(id, aside.innerHTML.trim());
      }
    }
    if (notes.size === 0) {
      for (const aside of byAttr(root, "aside", "epub:type", "footnote")) {
        const id = aside.getAttribute("id");
        if (id) notes.set(id, aside.innerHTML.trim());
      }
    }
    const collectRefs = (scope) => {
      const set = new Set(byAttr(scope, "a", "epub:type", "noteref"));
      for (const img of scope.querySelectorAll("img.bdFootnote")) {
        const a = img.closest('a[href^="#"]');
        if (a && scope.contains(a)) set.add(a);
      }
      return [...scope.querySelectorAll("a")].filter((a) => set.has(a));
    };
    const inSection = (el) => sections.some((s) => s.contains(el));
    const refs = collectRefs(root).filter((a) => !inSection(a));
    if (refs.length === 0 && notes.size === 0) return 0;
    const ordered = [];
    const numberOf = /* @__PURE__ */ new Map();
    let counter = 0;
    const makeSup = (num, text) => {
      const sup = document.createElement("sup");
      sup.className = FOOTNOTE_REF_CLASS;
      sup.textContent = String(num);
      sup.setAttribute("role", "button");
      sup.setAttribute("tabindex", "0");
      sup.title = stripTags(text);
      return sup;
    };
    refs.forEach((ref) => {
      const href = ref.getAttribute("href") ?? "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      const text = notes.get(id);
      if (text === void 0) return;
      counter += 1;
      numberOf.set(id, counter);
      ordered.push({ num: counter, text });
      ref.replaceWith(makeSup(counter, text));
    });
    for (const [id, text] of notes) {
      if (numberOf.has(id)) continue;
      counter += 1;
      numberOf.set(id, counter);
      ordered.push({ num: counter, text });
    }
    for (const section of sections) section.remove();
    if (ordered.length > 0) {
      const list = document.createElement("ol");
      list.className = FOOTNOTE_LIST_CLASS;
      for (const { num, text } of ordered) {
        const li = document.createElement("li");
        li.id = `fqa-fn-${num}`;
        li.innerHTML = text;
        for (const inner of collectRefs(li)) {
          const innerId = (inner.getAttribute("href") ?? "").replace(/^#/, "");
          const innerNum = numberOf.get(innerId);
          const innerText = notes.get(innerId);
          if (innerNum && innerText !== void 0) {
            inner.replaceWith(makeSup(innerNum, innerText));
          } else {
            inner.remove();
          }
        }
        list.appendChild(li);
      }
      const wrapper = document.createElement("section");
      wrapper.className = FOOTNOTE_CLASS;
      const heading = document.createElement("div");
      heading.className = "fqa-footnote-title";
      heading.textContent = "注释";
      wrapper.appendChild(heading);
      wrapper.appendChild(list);
      root.appendChild(wrapper);
    }
    for (const img of root.querySelectorAll("img.bdFootnote")) img.remove();
    return ordered.length;
  }
  function stripTags(html) {
    const el = document.createElement("div");
    el.innerHTML = html;
    return (el.textContent ?? "").replace(/\s+/g, " ").trim();
  }
  const KNOWN_TIERS = /muye-reader-content-(16|20|24|28|32)\b/;
  function syncFootnoteFontSize(container2) {
    const box = container2.closest('[class*="muye-reader-content-"]');
    const apply2 = () => {
      container2.style.removeProperty("--fqa-body-size");
      if (!box || KNOWN_TIERS.test(box.className)) return;
      const p = container2.querySelector("p");
      if (!p) return;
      const size = getComputedStyle(p).fontSize;
      if (size) container2.style.setProperty("--fqa-body-size", size);
    };
    apply2();
    if (!box) return;
    const holder = container2;
    if (holder.fqaFontObserver) return;
    const observer = new MutationObserver(apply2);
    observer.observe(box, { attributes: true, attributeFilter: ["class"] });
    holder.fqaFontObserver = observer;
  }
  function bindFootnoteInteraction(container2) {
    syncFootnoteFontSize(container2);
    if (container2.dataset.fqaFootnoteBound === "1") return;
    container2.dataset.fqaFootnoteBound = "1";
    const activate = (sup) => {
      var _a;
      const num = (_a = sup.textContent) == null ? void 0 : _a.trim();
      if (!num) return;
      const target = container2.querySelector(`#fqa-fn-${num}`);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("fqa-footnote-active");
      setTimeout(() => target.classList.remove("fqa-footnote-active"), 1600);
    };
    container2.addEventListener("click", (e) => {
      var _a, _b;
      const sup = (_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, `.${FOOTNOTE_REF_CLASS}`);
      if (sup) {
        e.preventDefault();
        activate(sup);
      }
    });
    container2.addEventListener("keydown", (e) => {
      var _a, _b;
      const ke = e;
      if (ke.key !== "Enter" && ke.key !== " ") return;
      const sup = (_b = (_a = ke.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, `.${FOOTNOTE_REF_CLASS}`);
      if (sup) {
        ke.preventDefault();
        activate(sup);
      }
    });
  }
  const leftIcon = '<?xml version="1.0" ?><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><title/><g data-name="1" id="_1"><path fill="currentColor" d="M353,450a15,15,0,0,1-10.61-4.39L157.5,260.71a15,15,0,0,1,0-21.21L342.39,54.6a15,15,0,1,1,21.22,21.21L189.32,250.1,363.61,424.39A15,15,0,0,1,353,450Z"/></g></svg>';
  const playingIcon = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\r\n\r\n<svg\r\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\r\n   xmlns:cc="http://creativecommons.org/ns#"\r\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\r\n   xmlns:svg="http://www.w3.org/2000/svg"\r\n   xmlns="http://www.w3.org/2000/svg"\r\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\r\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\r\n   width="22"\r\n   height="22"\r\n   viewBox="0 0 5.8208332 5.8208335"\r\n   version="1.1"\r\n   id="svg8"\r\n   inkscape:version="0.92.2 (5c3e80d, 2017-08-06)"\r\n   sodipodi:docname="stock_media-pause.svg">\r\n  <defs\r\n     id="defs2" />\r\n  <sodipodi:namedview\r\n     id="base"\r\n     pagecolor="#ffffff"\r\n     bordercolor="#666666"\r\n     borderopacity="1.0"\r\n     inkscape:pageopacity="0.0"\r\n     inkscape:pageshadow="2"\r\n     inkscape:zoom="7.9999996"\r\n     inkscape:cx="7.3825825"\r\n     inkscape:cy="8.7516629"\r\n     inkscape:document-units="mm"\r\n     inkscape:current-layer="layer1"\r\n     showgrid="true"\r\n     units="px"\r\n     inkscape:window-width="1360"\r\n     inkscape:window-height="718"\r\n     inkscape:window-x="0"\r\n     inkscape:window-y="24"\r\n     inkscape:window-maximized="1">\r\n    <inkscape:grid\r\n       type="xygrid"\r\n       id="grid10"\r\n       spacingx="0.52916667"\r\n       spacingy="0.52916667" />\r\n  </sodipodi:namedview>\r\n  <metadata\r\n     id="metadata5">\r\n    <rdf:RDF>\r\n      <cc:Work\r\n         rdf:about="">\r\n        <dc:format>image/svg+xml</dc:format>\r\n        <dc:type\r\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\r\n        <dc:title></dc:title>\r\n      </cc:Work>\r\n    </rdf:RDF>\r\n  </metadata>\r\n  <g\r\n     inkscape:label="Capa 1"\r\n     inkscape:groupmode="layer"\r\n     id="layer1"\r\n     transform="translate(0,-291.17915)">\r\n    <path\r\n       style="fill:currentColor;fill-opacity:1;stroke:currentColor;stroke-width:1.29999995;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"\r\n       d="m 1.5875,292.23748 v 4.23334"\r\n       id="path892"\r\n       inkscape:connector-curvature="0" />\r\n    <path\r\n       inkscape:connector-curvature="0"\r\n       id="path894"\r\n       d="m 3.7041667,292.23748 v 4.23334"\r\n       style="fill:currentColor;fill-opacity:1;stroke:currentColor;stroke-width:1.29999995;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />\r\n  </g>\r\n</svg>\r\n';
  const pausedIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\r\n    <g>\r\n        <path fill="none" d="M0 0h24v24H0z"/>\r\n        <path d="M16.394 12L10 7.737v8.526L16.394 12zm2.982.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z" fill="currentColor"/>\r\n    </g>\r\n</svg>\r\n';
  function decodeBase36(c) {
    if (c >= 48 && c <= 57) return c - 48;
    if (c >= 97 && c <= 122) return c - 97 + 10;
    return 255;
  }
  function bitCount(n) {
    n = n - (n >> 1 & 1431655765);
    n = (n & 858993459) + (n >> 2 & 858993459);
    return (n + (n >> 4) & 252645135) * 16843009 >> 24;
  }
  function decryptSpadeInner(spadeKey) {
    const result = new Uint8Array(spadeKey);
    const buff = new Uint8Array(2 + spadeKey.length);
    buff.set([250, 85], 0);
    buff.set(spadeKey, 2);
    for (let i2 = 0; i2 < result.length; i2++) {
      let v = (spadeKey[i2] ^ buff[i2]) - bitCount(i2) - 21;
      while (v < 0) {
        v += 255;
      }
      result[i2] = v;
    }
    return result;
  }
  function decryptSpade(spadeKeyBytes) {
    const spadeKeyLen = spadeKeyBytes.length;
    if (spadeKeyLen < 3) return "";
    const paddingLen = (spadeKeyBytes[0] ^ spadeKeyBytes[1] ^ spadeKeyBytes[2]) - 48;
    if (spadeKeyLen < paddingLen + 2) return "";
    const innerInput = spadeKeyBytes.slice(1, spadeKeyLen - paddingLen);
    const tmpBuff = decryptSpadeInner(innerInput);
    if (tmpBuff.length === 0) return "";
    const skipBytes = decodeBase36(tmpBuff[0]);
    const decodedMessageLen = spadeKeyLen - paddingLen - 2;
    const endIndex = 1 + decodedMessageLen - skipBytes;
    if (endIndex > tmpBuff.length) return "";
    const finalBytes = tmpBuff.slice(1, endIndex);
    return new TextDecoder("utf-8").decode(finalBytes);
  }
  function decryptSpadeA(spadeAStr) {
    try {
      const bytes = new Uint8Array(b64decode(spadeAStr));
      return decryptSpade(bytes);
    } catch (e) {
      console.error("Spade parsing error", e);
      return "";
    }
  }
  async function getPlayInfo(item_id, tone_id) {
    const item_ids = Array.isArray(item_id) ? item_id.join(",") : item_id;
    const resp = await appGet("/reader/audio/playinfo/", {
      item_ids,
      tone_id: tone_id.toString()
    });
    const j = resp.json();
    const results = [];
    if (Array.isArray(j.data)) {
      for (let i2 of j.data) {
        results.push({
          urls: [i2.main_url, i2.backup_url].filter(Boolean),
          vid: i2.vid,
          key: i2.is_encrypt ? decryptSpadeA(i2.encryption_key) : "",
          item_id: i2.item_id
        });
      }
    }
    return results;
  }
  async function getBookAvailableTones(book_id) {
    var _a;
    const resp = await appGet("/bookapi/audio/toneinfo/", { book_id });
    const j = resp.json();
    const results = [];
    if (Array.isArray((_a = j == null ? void 0 : j.data) == null ? void 0 : _a.tts_tones)) {
      for (let i2 of j.data.tts_tones) {
        results.push({
          id: i2.id,
          name: i2.title,
          gender: i2.tone_gender,
          icon: i2.icon_url,
          description: i2.description
        });
      }
    }
    return results;
  }
  async function getChapterParagraphTimeTag(item_id, tone_id) {
    var _a;
    const resp = await appGet("/reader/audio/timepoint/", {
      item_id,
      tone_id: tone_id.toString(),
      req_type: "1"
    });
    const j = resp.json();
    const results = [];
    if (Array.isArray((_a = j == null ? void 0 : j.data) == null ? void 0 : _a.time_points)) {
      for (let i2 of j.data.time_points) {
        results.push({
          startms: i2.start_time,
          endms: i2.end_time,
          startidx: i2.start_para,
          endidx: i2.end_para,
          is_title: i2.start_para === 1e4
        });
      }
    }
    return results;
  }
  function asBytes(value) {
    if (value instanceof Uint8Array) {
      return new Uint8Array(value);
    }
    return new Uint8Array(value);
  }
  function concatBytes(...arrays) {
    const length = arrays.reduce((sum, array) => sum + array.byteLength, 0);
    const result = new Uint8Array(length);
    let offset = 0;
    for (const array of arrays) {
      result.set(array, offset);
      offset += array.byteLength;
    }
    return result;
  }
  function ascii(text) {
    const result = new Uint8Array(text.length);
    for (let i2 = 0; i2 < text.length; i2++) {
      result[i2] = text.charCodeAt(i2) & 255;
    }
    return result;
  }
  function hexToBytes(text) {
    const hex2 = text.replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]*$/.test(hex2) || hex2.length % 2 !== 0) {
      throw new Error("无效的十六进制数据");
    }
    const result = new Uint8Array(hex2.length / 2);
    for (let i2 = 0; i2 < result.length; i2++) {
      result[i2] = parseInt(hex2.slice(i2 * 2, i2 * 2 + 2), 16);
    }
    return result;
  }
  function uintBytes(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`无效的无符号整数: ${value}`);
    }
    if (value === 0) return new Uint8Array([0]);
    const result = [];
    let current = value;
    while (current > 0) {
      result.unshift(current & 255);
      current = Math.floor(current / 256);
    }
    return new Uint8Array(result);
  }
  function be16(value) {
    const result = new Uint8Array(2);
    new DataView(result.buffer).setUint16(0, value);
    return result;
  }
  function be32(value) {
    const result = new Uint8Array(4);
    new DataView(result.buffer).setUint32(0, value >>> 0);
    return result;
  }
  function be64(value) {
    const result = new Uint8Array(8);
    new DataView(result.buffer).setBigUint64(0, BigInt(value));
    return result;
  }
  function findBytes(buffer, fourcc, from = 0, to = buffer.length - 4) {
    if (fourcc.length !== 4) throw new Error(`fourcc 必须是 4 个字符: ${fourcc}`);
    const c0 = fourcc.charCodeAt(0);
    const c1 = fourcc.charCodeAt(1);
    const c2 = fourcc.charCodeAt(2);
    const c3 = fourcc.charCodeAt(3);
    for (let i2 = from; i2 <= to; i2++) {
      if (buffer[i2] === c0 && buffer[i2 + 1] === c1 && buffer[i2 + 2] === c2 && buffer[i2 + 3] === c3) return i2;
    }
    return -1;
  }
  function strBytes(text) {
    return new TextEncoder().encode(text);
  }
  function readFourcc(buffer, offset) {
    return String.fromCharCode(
      buffer[offset] ?? 0,
      buffer[offset + 1] ?? 0,
      buffer[offset + 2] ?? 0,
      buffer[offset + 3] ?? 0
    );
  }
  const CONTAINERS = /* @__PURE__ */ new Set([
    "moov",
    "trak",
    "mdia",
    "minf",
    "stbl",
    "edts",
    "dinf",
    "udta",
    "mvex",
    "meta"
  ]);
  function readBox(buffer, offset, limit) {
    if (offset + 8 > limit) return null;
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const size32 = view.getUint32(offset);
    const type = readFourcc(buffer, offset + 4);
    let headerSize = 8;
    let size;
    if (size32 === 1) {
      if (offset + 16 > limit) return null;
      const extended = view.getBigUint64(offset + 8);
      if (extended > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error(`MP4 box 过大: ${type}`);
      }
      size = Number(extended);
      headerSize = 16;
    } else if (size32 === 0) {
      size = limit - offset;
    } else {
      size = size32;
    }
    if (size < headerSize || offset + size > limit) return null;
    return { type, offset, size, headerSize, end: offset + size };
  }
  function walkBoxes(buffer, start, end, visit, depth = 0) {
    if (depth > 16) return;
    let offset = start;
    while (offset + 8 <= end) {
      const box = readBox(buffer, offset, end);
      if (!box) return;
      visit(box);
      if (CONTAINERS.has(box.type)) {
        const childStart = box.offset + box.headerSize + (box.type === "meta" ? 4 : 0);
        if (childStart < box.end) walkBoxes(buffer, childStart, box.end, visit, depth + 1);
      }
      offset = box.end;
    }
  }
  function findBox(boxes, type) {
    return boxes.find((box) => box.type === type);
  }
  function findMdatStart(buffer) {
    let offset = 0;
    while (offset + 8 <= buffer.length) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const size32 = view.getUint32(offset);
      const type = readFourcc(buffer, offset + 4);
      const headerSize = size32 === 1 ? 16 : 8;
      if (type === "mdat") return offset + headerSize;
      if (size32 === 0) return -1;
      if (size32 === 1) {
        if (offset + 16 > buffer.length) return -1;
        const size = view.getBigUint64(offset + 8);
        if (size > BigInt(Number.MAX_SAFE_INTEGER)) return -1;
        offset += Number(size);
      } else {
        offset += size32;
      }
    }
    return -1;
  }
  function parseSampleSizes(box, view) {
    if (box.offset + 20 > box.end) throw new Error("stsz box 不完整");
    const sampleSize = view.getUint32(box.offset + 12);
    const count = view.getUint32(box.offset + 16);
    const sizes = new Uint32Array(count);
    if (sampleSize !== 0) {
      sizes.fill(sampleSize);
      return sizes;
    }
    if (box.offset + 20 + count * 4 > box.end) throw new Error("stsz 采样表不完整");
    for (let i2 = 0; i2 < count; i2++) sizes[i2] = view.getUint32(box.offset + 20 + i2 * 4);
    return sizes;
  }
  function parseDurations(box, sampleCount, view) {
    if (box.offset + 16 > box.end) throw new Error("stts box 不完整");
    const entryCount = view.getUint32(box.offset + 12);
    const durations = new Uint32Array(sampleCount);
    let index = 0;
    for (let i2 = 0; i2 < entryCount; i2++) {
      const offset = box.offset + 16 + i2 * 8;
      if (offset + 8 > box.end) throw new Error("stts 采样表不完整");
      const count = view.getUint32(offset);
      const duration = view.getUint32(offset + 4);
      for (let j = 0; j < count && index < sampleCount; j++) durations[index++] = duration;
    }
    if (index !== sampleCount) throw new Error(`stts 采样数不一致: ${index}/${sampleCount}`);
    return durations;
  }
  function parseIvs(box, sampleCount, view) {
    if (box.offset + 16 > box.end) throw new Error("senc box 不完整");
    const flags = view.getUint32(box.offset + 8) & 16777215;
    if ((flags & 2) !== 0) throw new Error("暂不支持带 subsample encryption 的音频");
    const count = view.getUint32(box.offset + 12);
    if (count !== sampleCount) throw new Error(`senc 采样数不一致: ${count}/${sampleCount}`);
    const dataStart = box.offset + 16;
    const dataLength = box.end - dataStart;
    if (count === 0 || dataLength % count !== 0) throw new Error("senc IV 表不完整");
    const ivLength = dataLength / count;
    if (ivLength !== 8 && ivLength !== 16) throw new Error(`不支持的 CENC IV 长度: ${ivLength}`);
    return asBytes(new Uint8Array(view.buffer, view.byteOffset + dataStart, dataLength));
  }
  function parseTimescale(box, view) {
    if (box.offset + 24 > box.end) throw new Error("mdhd box 不完整");
    const version2 = view.getUint8(box.offset + 8);
    const offset = version2 === 1 ? box.offset + 28 : box.offset + 20;
    if (offset + 4 > box.end) throw new Error("mdhd timescale 缺失");
    const timescale = view.getUint32(offset);
    if (timescale === 0) throw new Error("MP4 timescale 为 0");
    return timescale;
  }
  function parseCodec(buffer, mdatStart) {
    const end = Math.max(0, Math.min(mdatStart - 1, buffer.length - 4));
    const dOps = findBytes(buffer, "dOps", 0, end);
    if (dOps >= 0) {
      const channels2 = buffer[dOps + 5] ?? 1;
      const preSkip = (buffer[dOps + 6] ?? 0) << 8 | (buffer[dOps + 7] ?? 0);
      return { codec: "opus", channels: channels2, preSkip };
    }
    const encodedEntry = findBytes(buffer, "enca", 0, end);
    const plainEntry = findBytes(buffer, "mp4a", 0, end);
    const entryType = encodedEntry >= 0 ? encodedEntry : plainEntry;
    const channels = entryType >= 0 && entryType + 22 <= buffer.length ? new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength).getUint16(entryType + 20) : 1;
    if (findBytes(buffer, "dfLa", 0, end) >= 0) {
      return { codec: "flac", channels: channels || 1, preSkip: 0 };
    }
    if (entryType >= 0) {
      return { codec: "aac", channels: channels || 1, preSkip: 0 };
    }
    throw new Error("未识别的音频编码（需要 Opus、AAC 或 FLAC）");
  }
  function parseCencMetadata(head) {
    const mdatStart = findMdatStart(head);
    if (mdatStart < 0) throw new Error("未找到 mdat，MP4 头可能尚未拉完整");
    const boxes = [];
    walkBoxes(head, 0, Math.min(mdatStart - 8, head.length), (box) => boxes.push(box));
    const stsz = findBox(boxes, "stsz");
    const stts = findBox(boxes, "stts");
    const senc = findBox(boxes, "senc");
    const mdhd = findBox(boxes, "mdhd");
    if (!stsz || !stts || !senc || !mdhd) {
      throw new Error("CENC MP4 头缺少 stsz/stts/senc/mdhd");
    }
    const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
    const sizes = parseSampleSizes(stsz, view);
    const durations = parseDurations(stts, sizes.length, view);
    const ivs = parseIvs(senc, sizes.length, view);
    const timescale = parseTimescale(mdhd, view);
    const codec = parseCodec(head, mdatStart);
    const offsets = new Float64Array(sizes.length + 1);
    for (let i2 = 0; i2 < sizes.length; i2++) {
      offsets[i2 + 1] = offsets[i2] + sizes[i2];
      if (!Number.isSafeInteger(offsets[i2 + 1])) throw new Error("音频采样数据超过 JavaScript 安全整数范围");
    }
    let totalTicks = 0;
    for (const duration of durations) {
      totalTicks += duration;
      if (!Number.isSafeInteger(totalTicks)) throw new Error("音频总时长超过 JavaScript 安全整数范围");
    }
    return {
      ...codec,
      sampleCount: sizes.length,
      sizes,
      ivs,
      durations,
      timescale,
      mdatStart,
      offsets,
      totalTicks
    };
  }
  function cencIvSize(meta) {
    return meta.ivs.length / meta.sampleCount;
  }
  function normalizeCencKey(value) {
    if (typeof value === "string") {
      const bytes2 = hexToBytes(value);
      if (bytes2.length !== 16) throw new Error("AES-128 key 必须是 32 位 hex");
      return bytes2;
    }
    const bytes = asBytes(value);
    if (bytes.length !== 16) throw new Error("AES-128 key 必须是 16 字节");
    return bytes.slice();
  }
  async function importCencKey(value) {
    return getSubtle().importKey(
      "raw",
      normalizeCencKey(value),
      { name: "AES-CTR" },
      false,
      ["decrypt"]
    );
  }
  function makeCencCounter(iv, counterStart) {
    if (iv.length !== 8 && iv.length !== 16) throw new Error(`无效的 CENC IV 长度: ${iv.length}`);
    const counter = new Uint8Array(16);
    counter.set(iv);
    if (counterStart === 1) counter[15] = 1;
    return counter;
  }
  async function decryptCencSample(key, iv, ciphertext, counterStart) {
    const data = asBytes(ciphertext);
    const plain = await getSubtle().decrypt(
      { name: "AES-CTR", counter: makeCencCounter(iv, counterStart), length: 64 },
      key,
      data
    );
    return new Uint8Array(plain);
  }
  function ebmlVint(value, length) {
    if (!Number.isSafeInteger(value) || value < 0 || length < 1 || length > 8) {
      throw new Error(`无效的 EBML VINT: ${value}`);
    }
    const result = new Uint8Array(length);
    result[0] = 128 >> length - 1;
    let current = value;
    for (let i2 = length - 1; i2 > 0; i2--) {
      result[i2] = current & 255;
      current = Math.floor(current / 256);
    }
    const max = Math.pow(2, 7 * length);
    if (current >= max) throw new Error(`EBML VINT 溢出: ${value}`);
    result[0] |= current;
    return result;
  }
  function ebmlSize(value) {
    for (let length = 1; length <= 8; length++) {
      if (value < Math.pow(2, 7 * length) - 1) return ebmlVint(value, length);
    }
    throw new Error(`EBML size 过大: ${value}`);
  }
  function ebmlElement(id, payload) {
    return concatBytes(hexToBytes(id), ebmlSize(payload.length), payload);
  }
  function mp4Box(type, payload) {
    return concatBytes(be32(8 + payload.length), ascii(type), payload);
  }
  function matrixIdentity() {
    const matrix = new Uint8Array(36);
    const view = new DataView(matrix.buffer);
    view.setUint32(0, 65536);
    view.setUint32(16, 65536);
    view.setUint32(32, 1073741824);
    return matrix;
  }
  function signedBe16(value) {
    const result = new Uint8Array(2);
    new DataView(result.buffer).setInt16(0, value);
    return result;
  }
  function buildWebmInit(channels, preSkip, durationSeconds) {
    const ebml = ebmlElement("1A45DFA3", concatBytes(
      ebmlElement("4286", hexToBytes("01")),
      ebmlElement("42F7", hexToBytes("01")),
      ebmlElement("42F2", hexToBytes("04")),
      ebmlElement("42F3", hexToBytes("08")),
      ebmlElement("4282", strBytes("webm")),
      ebmlElement("4287", hexToBytes("04")),
      ebmlElement("4285", hexToBytes("02"))
    ));
    const codecDelayNs = Math.round(preSkip * 1e9 / 48e3);
    const duration = new Uint8Array(8);
    new DataView(duration.buffer).setFloat64(0, durationSeconds, false);
    const info2 = ebmlElement("1549A966", concatBytes(
      ebmlElement("2AD7B1", uintBytes(1e6)),
      ebmlElement("4489", duration),
      ebmlElement("4D80", strBytes("clearKeyStreamer")),
      ebmlElement("5741", strBytes("clearKeyStreamer"))
    ));
    const sampleRate = new Uint8Array(4);
    new DataView(sampleRate.buffer).setFloat32(0, 48e3, false);
    const audio2 = ebmlElement("E1", concatBytes(
      ebmlElement("B5", sampleRate),
      ebmlElement("9F", uintBytes(channels))
    ));
    const track = ebmlElement("AE", concatBytes(
      ebmlElement("D7", hexToBytes("01")),
      ebmlElement("73C5", uintBytes(1)),
      ebmlElement("83", hexToBytes("02")),
      ebmlElement("86", strBytes("A_OPUS")),
      ebmlElement("63A2", buildOpusHead(channels, preSkip)),
      ebmlElement("56AA", uintBytes(codecDelayNs)),
      ebmlElement("56BB", uintBytes(8e7)),
      audio2
    ));
    const tracks = ebmlElement("1654AE6B", track);
    return concatBytes(ebml, hexToBytes("18538067"), hexToBytes("01FFFFFFFFFFFFFF"), info2, tracks);
  }
  function buildOpusHead(channels, preSkip) {
    const head = new Uint8Array(19);
    head.set([79, 112, 117, 115, 72, 101, 97, 100], 0);
    const view = new DataView(head.buffer);
    head[8] = 1;
    head[9] = channels;
    view.setUint16(10, preSkip, true);
    view.setUint32(12, 48e3, true);
    view.setInt16(16, 0, true);
    head[18] = 0;
    return head;
  }
  function buildWebmCluster(baseMs, relativeMs, packets) {
    if (relativeMs.length !== packets.length) throw new Error("WebM 时间戳和采样数不一致");
    const blocks = [];
    for (let i2 = 0; i2 < packets.length; i2++) {
      const relative = relativeMs[i2];
      if (relative === void 0 || relative < -32768 || relative > 32767) {
        throw new Error(`WebM 相对时间戳超出 Int16: ${relative}`);
      }
      const trackAndFlags = new Uint8Array([129, 128]);
      blocks.push(ebmlElement("A3", concatBytes(
        trackAndFlags.slice(0, 1),
        signedBe16(relative),
        trackAndFlags.slice(1),
        packets[i2]
      )));
    }
    return ebmlElement("1F43B675", concatBytes(
      ebmlElement("E7", uintBytes(baseMs)),
      concatBytes(...blocks)
    ));
  }
  function replaceFourcc(buffer, offset, type) {
    buffer.set(ascii(type), offset);
  }
  function extractSampleEntry(head, mdatStart) {
    const encoded = findBytes(head, "enca", 0, mdatStart - 1);
    const plain = findBytes(head, "mp4a", 0, mdatStart - 1);
    const typeOffset = encoded >= 0 ? encoded : plain;
    if (typeOffset < 4) throw new Error("未找到 AAC 音频采样入口");
    const entryOffset = typeOffset - 4;
    const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
    const size = view.getUint32(entryOffset);
    if (size < 8 || entryOffset + size > head.length) throw new Error("AAC 采样入口不完整");
    const entry = new Uint8Array(head.slice(entryOffset, entryOffset + size));
    const enca = findBytes(entry, "enca", 0);
    if (enca >= 0) replaceFourcc(entry, enca, "mp4a");
    const sinf = findBytes(entry, "sinf", 8);
    if (sinf >= 0) replaceFourcc(entry, sinf, "free");
    return entry;
  }
  function extractFlacEntry(head, mdatStart) {
    const encoded = findBytes(head, "enca", 0, mdatStart - 1);
    if (encoded < 4) throw new Error("未找到 FLAC 加密采样入口");
    const entryOffset = encoded - 4;
    const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
    const size = view.getUint32(entryOffset);
    if (size < 8 || entryOffset + size > head.length) throw new Error("FLAC 采样入口不完整");
    const entry = new Uint8Array(head.slice(entryOffset, entryOffset + size));
    replaceFourcc(entry, encoded - entryOffset, "fLaC");
    const sinf = findBytes(entry, "sinf", 8);
    if (sinf >= 0) replaceFourcc(entry, sinf, "free");
    return entry;
  }
  function buildMp4Init(sampleEntry, timescale, totalTicks) {
    const totalSeconds = totalTicks / timescale;
    const matrix = matrixIdentity();
    const mvhd = mp4Box("mvhd", concatBytes(
      be32(0),
      be32(0),
      be32(0),
      be32(1e3),
      be32(Math.round(totalSeconds * 1e3)),
      be32(65536),
      be16(256),
      be16(0),
      new Uint8Array(8),
      matrix,
      new Uint8Array(24),
      be32(2)
    ));
    const tkhd = mp4Box("tkhd", concatBytes(
      be32(7),
      be32(0),
      be32(0),
      be32(1),
      be32(0),
      be32(0),
      new Uint8Array(8),
      be16(0),
      be16(0),
      be16(256),
      be16(0),
      matrix,
      be32(0),
      be32(0)
    ));
    const mdhd = mp4Box("mdhd", concatBytes(
      be32(0),
      be32(0),
      be32(0),
      be32(timescale),
      be32(totalTicks),
      be16(21956),
      be16(0)
    ));
    const hdlr = mp4Box("hdlr", concatBytes(
      be32(0),
      be32(0),
      ascii("soun"),
      new Uint8Array(12)
    ));
    const smhd = mp4Box("smhd", concatBytes(be32(0), be16(0), be16(0)));
    const url = mp4Box("url ", be32(1));
    const dref = mp4Box("dref", concatBytes(be32(0), be32(1), url));
    const dinf = mp4Box("dinf", dref);
    const stsd = mp4Box("stsd", concatBytes(be32(0), be32(1), sampleEntry));
    const stts = mp4Box("stts", concatBytes(be32(0), be32(0)));
    const stsc = mp4Box("stsc", concatBytes(be32(0), be32(0)));
    const stsz = mp4Box("stsz", concatBytes(be32(0), be32(0), be32(0)));
    const stco = mp4Box("stco", concatBytes(be32(0), be32(0)));
    const stbl = mp4Box("stbl", concatBytes(stsd, stts, stsc, stsz, stco));
    const minf = mp4Box("minf", concatBytes(smhd, dinf, stbl));
    const mdia = mp4Box("mdia", concatBytes(mdhd, hdlr, minf));
    const trak = mp4Box("trak", concatBytes(tkhd, mdia));
    const trex = mp4Box("trex", concatBytes(be32(0), be32(1), be32(1), be32(0), be32(0), be32(0)));
    const mvex = mp4Box("mvex", trex);
    const moov = mp4Box("moov", concatBytes(mvhd, trak, mvex));
    const ftyp = mp4Box("ftyp", concatBytes(ascii("isom"), be32(512), ascii("isomiso2mp41dash")));
    return concatBytes(ftyp, moov);
  }
  function buildMp4Segment(baseDecodeTick, samples, sequence) {
    if (samples.length === 0) throw new Error("MP4 segment 不能没有采样");
    const sampleTable = samples.flatMap((sample) => [be32(sample.duration), be32(sample.data.length)]);
    const mfhd = mp4Box("mfhd", concatBytes(be32(0), be32(sequence)));
    const tfhd = mp4Box("tfhd", concatBytes(be32(131072), be32(1)));
    const tfdt = mp4Box("tfdt", concatBytes(be32(16777216), be64(baseDecodeTick)));
    const makeTrun = (offset) => mp4Box("trun", concatBytes(
      be32(769),
      be32(samples.length),
      be32(offset),
      concatBytes(...sampleTable)
    ));
    const makeMoof = (offset) => mp4Box("moof", concatBytes(
      mfhd,
      mp4Box("traf", concatBytes(tfhd, tfdt, makeTrun(offset)))
    ));
    const mediaPayload = concatBytes(...samples.map((sample) => sample.data));
    const dataOffset = makeMoof(0).length + 8;
    return concatBytes(makeMoof(dataOffset), mp4Box("mdat", mediaPayload));
  }
  function codecMime(codec) {
    if (codec === "opus") return 'audio/webm;codecs="opus"';
    if (codec === "flac") return 'audio/mp4; codecs="fLaC"';
    return 'audio/mp4; codecs="mp4a.40.2"';
  }
  function initSegment(meta, sampleEntry) {
    if (meta.codec === "opus") {
      const playableTicks = Math.max(0, meta.totalTicks - meta.preSkip);
      return buildWebmInit(meta.channels, meta.preSkip, playableTicks / meta.timescale);
    }
    if (!sampleEntry) throw new Error("MP4 编码缺少 sample entry");
    return buildMp4Init(sampleEntry, meta.timescale, meta.totalTicks);
  }
  const DEFAULT_HEAD_BYTES = 512 * 1024;
  const DEFAULT_MAX_HEAD_BYTES = 8 * 1024 * 1024;
  const DEFAULT_SEGMENT_SECONDS = 15;
  const MAX_WEBM_SEGMENT_SECONDS = 30;
  const DEFAULT_MAX_BUFFER_AHEAD = 40;
  const DEFAULT_KEEP_BEHIND = 10;
  const DEFAULT_DECRYPT_CONCURRENCY = 24;
  function asError(value) {
    return value instanceof Error ? value : new Error(String(value));
  }
  function abortError$1() {
    return new DOMException("播放器会话已取消", "AbortError");
  }
  function isAbort(value) {
    return value instanceof DOMException && value.name === "AbortError";
  }
  function waitForSourceBufferIdle(sourceBuffer, signal) {
    if (!sourceBuffer.updating) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => {
        sourceBuffer.removeEventListener("updateend", done);
        sourceBuffer.removeEventListener("abort", done);
        sourceBuffer.removeEventListener("error", done);
        signal.removeEventListener("abort", done);
        resolve();
      };
      sourceBuffer.addEventListener("updateend", done);
      sourceBuffer.addEventListener("abort", done);
      sourceBuffer.addEventListener("error", done);
      signal.addEventListener("abort", done, { once: true });
    });
  }
  function describeMediaError(audio2) {
    const error2 = audio2.error;
    if (!error2) return "";
    const names = {
      1: "MEDIA_ERR_ABORTED",
      2: "MEDIA_ERR_NETWORK",
      3: "MEDIA_ERR_DECODE（数据不是合法音频，多半在传输中被破坏）",
      4: "MEDIA_ERR_SRC_NOT_SUPPORTED"
    };
    const name2 = names[error2.code] ?? `code ${error2.code}`;
    return `：${name2}${error2.message ? ` - ${error2.message}` : ""}`;
  }
  function validatePositive(value, fallback, name2) {
    const result = value ?? fallback;
    if (!Number.isFinite(result) || result <= 0) throw new Error(`${name2} 必须是正数`);
    return result;
  }
  async function mapLimit(items, limit, worker) {
    const results = new Array(items.length);
    let next = 0;
    async function consume() {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index]);
      }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => consume()));
    return results;
  }
  class SequentialByteStream {
    constructor(initial = new Uint8Array(), reader = null, openReader = null) {
      __publicField(this, "chunks", []);
      __publicField(this, "chunkOffset", 0);
      __publicField(this, "available", 0);
      __publicField(this, "reader");
      __publicField(this, "openReader");
      __publicField(this, "eof", false);
      if (initial.length > 0) {
        const copy = new Uint8Array(initial);
        this.chunks.push(copy);
        this.available = copy.length;
      }
      this.reader = reader;
      this.openReader = openReader;
    }
    /** 至少缓存 length 字节；流先结束时返回 false。 */
    async bufferAtLeast(length) {
      while (this.available < length && !this.eof) await this.pull();
      return this.available >= length;
    }
    /** 复制当前全部未消费数据，不移动读取位置。 */
    snapshot() {
      const result = new Uint8Array(this.available);
      let output = 0;
      for (let i2 = 0; i2 < this.chunks.length; i2++) {
        const chunk = this.chunks[i2];
        const start = i2 === 0 ? this.chunkOffset : 0;
        result.set(chunk.subarray(start), output);
        output += chunk.length - start;
      }
      return result;
    }
    async skip(length) {
      await this.readExactly(length);
    }
    async readExactly(length) {
      if (!Number.isSafeInteger(length) || length < 0) {
        throw new Error(`无效的流读取长度: ${length}`);
      }
      if (length === 0) return new Uint8Array();
      if (!await this.bufferAtLeast(length)) {
        throw new Error(`音频流提前结束（还需 ${length - this.available} 字节）`);
      }
      const result = new Uint8Array(length);
      let output = 0;
      while (output < length) {
        const chunk = this.chunks[0];
        const take = Math.min(length - output, chunk.length - this.chunkOffset);
        result.set(chunk.subarray(this.chunkOffset, this.chunkOffset + take), output);
        output += take;
        this.chunkOffset += take;
        this.available -= take;
        if (this.chunkOffset === chunk.length) {
          this.chunks.shift();
          this.chunkOffset = 0;
        }
      }
      return result;
    }
    async cancel() {
      var _a;
      this.eof = true;
      try {
        await ((_a = this.reader) == null ? void 0 : _a.cancel());
      } catch {
      }
      this.reader = null;
    }
    async pull() {
      if (!this.reader && this.openReader) this.reader = await this.openReader();
      if (!this.reader) {
        this.eof = true;
        return;
      }
      const { value, done } = await this.reader.read();
      if (done) {
        this.eof = true;
        return;
      }
      if (value == null ? void 0 : value.length) {
        const copy = new Uint8Array(value);
        this.chunks.push(copy);
        this.available += copy.length;
      }
    }
  }
  class CencAudioPlayer {
    constructor(audio2, options = {}) {
      __publicField(this, "audio");
      __publicField(this, "options");
      __publicField(this, "state", "idle");
      __publicField(this, "session", 0);
      __publicField(this, "streamToken", 0);
      __publicField(this, "seekToken", 0);
      __publicField(this, "sessionController", null);
      __publicField(this, "streamController", null);
      __publicField(this, "sourceBuffer", null);
      __publicField(this, "mediaSource", null);
      __publicField(this, "objectUrl", null);
      __publicField(this, "sourceBufferChain", Promise.resolve());
      __publicField(this, "context", null);
      __publicField(this, "info", null);
      __publicField(this, "autoplay", false);
      __publicField(this, "segmentSequence", 0);
      __publicField(this, "onSeeking", () => {
        const context = this.context;
        if (!context || this.state === "destroyed" || this.session === 0) return;
        if (this.audio.error) return;
        const target = this.audio.currentTime;
        if (!Number.isFinite(target) || this.isTimeBuffered(target)) return;
        const wasPlaying = !this.audio.paused;
        void this.restartAt(target, wasPlaying);
      });
      __publicField(this, "onPlay", () => {
        if (this.context && this.state !== "destroyed") this.emitState("playing");
      });
      __publicField(this, "onPause", () => {
        if (this.context && this.state === "playing" && !this.audio.ended) this.emitState("paused");
      });
      __publicField(this, "onEnded", () => {
        if (this.context && this.state !== "destroyed") this.emitState("ended");
      });
      this.audio = audio2;
      const fetcher = (options.fetch ?? fetch$1).bind(unsafeWindow);
      this.options = {
        headBytes: validatePositive(options.headBytes, DEFAULT_HEAD_BYTES, "headBytes"),
        maxHeadBytes: validatePositive(options.maxHeadBytes, DEFAULT_MAX_HEAD_BYTES, "maxHeadBytes"),
        segmentSeconds: validatePositive(options.segmentSeconds, DEFAULT_SEGMENT_SECONDS, "segmentSeconds"),
        maxBufferAheadSeconds: validatePositive(options.maxBufferAheadSeconds, DEFAULT_MAX_BUFFER_AHEAD, "maxBufferAheadSeconds"),
        keepBehindSeconds: validatePositive(options.keepBehindSeconds, DEFAULT_KEEP_BEHIND, "keepBehindSeconds"),
        decryptConcurrency: Math.max(1, Math.floor(validatePositive(options.decryptConcurrency, DEFAULT_DECRYPT_CONCURRENCY, "decryptConcurrency"))),
        onStateChange: options.onStateChange,
        onProgress: options.onProgress,
        onMessage: options.onMessage,
        // config.fetch 保存的是页面 fetch 的原始引用，避免被字节 SDK 改写。
        fetch: fetcher
      };
      this.audio.addEventListener("seeking", this.onSeeking);
      this.audio.addEventListener("play", this.onPlay);
      this.audio.addEventListener("pause", this.onPause);
      this.audio.addEventListener("ended", this.onEnded);
    }
    get currentState() {
      return this.state;
    }
    get mediaInfo() {
      return this.info;
    }
    get element() {
      return this.audio;
    }
    /** 加载并开始后台缓冲；autoplay 只表示首次缓冲后尝试调用 audio.play。 */
    async load(source, autoplay = false) {
      this.ensureAlive();
      const session = this.beginSession();
      this.autoplay = autoplay;
      this.emitState("loading");
      let initialStream = null;
      try {
        const url = this.validateUrl(source.url);
        this.streamController = new AbortController();
        initialStream = this.createNetworkStream(url, 0, this.streamController.signal);
        let { head, meta } = await this.parseHeadFromStream(initialStream, session);
        this.assertSession(session);
        const key = await importCencKey(source.key);
        this.assertSession(session);
        let counterStart = 0;
        if (meta.codec === "opus") {
          const probeEnd = meta.mdatStart + meta.offsets[Math.min(6, meta.sampleCount)];
          if (head.length < probeEnd) {
            await initialStream.bufferAtLeast(probeEnd);
            head = initialStream.snapshot();
          }
          counterStart = await this.detectCounterStart(meta, head, key);
        }
        this.assertSession(session);
        const sampleEntry = meta.codec === "aac" ? extractSampleEntry(head, meta.mdatStart) : meta.codec === "flac" ? extractFlacEntry(head, meta.mdatStart) : void 0;
        const mime = codecMime(meta.codec);
        const ctor = this.mediaSourceConstructor();
        if (!ctor.isTypeSupported(mime)) throw new Error(`浏览器不支持 MSE 音频格式: ${mime}`);
        const mediaSource = new ctor();
        this.mediaSource = mediaSource;
        this.objectUrl = unsafeWindow.URL.createObjectURL(mediaSource);
        const opened = this.waitForSourceOpen(mediaSource, session);
        this.audio.src = this.objectUrl;
        await opened;
        this.assertSession(session);
        this.sourceBuffer = mediaSource.addSourceBuffer(mime);
        this.segmentSequence = 0;
        const init = initSegment(meta, sampleEntry);
        this.emitMessage(`追加 init 段 ${init.byteLength} 字节 (${mime})`, "info");
        await this.enqueueSourceBuffer(session, (sourceBuffer) => {
          sourceBuffer.appendBuffer(this.toPageBuffer(init));
        });
        this.assertSession(session);
        const ticks = new Float64Array(meta.sampleCount + 1);
        for (let i2 = 0; i2 < meta.sampleCount; i2++) {
          ticks[i2 + 1] = ticks[i2] + meta.durations[i2];
        }
        const durationSeconds = meta.totalTicks / meta.timescale;
        const samplesPerSecond = meta.sampleCount / durationSeconds;
        const segmentSeconds = meta.codec === "opus" ? Math.min(this.options.segmentSeconds, MAX_WEBM_SEGMENT_SECONDS) : this.options.segmentSeconds;
        this.context = {
          url,
          head,
          meta,
          key,
          counterStart,
          ticks,
          samplesPerSecond,
          samplesPerSegment: Math.max(1, Math.round(samplesPerSecond * segmentSeconds))
        };
        this.info = {
          codec: meta.codec,
          sampleCount: meta.sampleCount,
          durationSeconds,
          timescale: meta.timescale,
          channels: meta.channels,
          encryptedBytes: meta.offsets[meta.sampleCount]
        };
        await initialStream.skip(meta.mdatStart);
        this.assertSession(session);
        this.emitState("ready");
        this.startStream(0, initialStream);
        initialStream = null;
        return this.info;
      } catch (error2) {
        void (initialStream == null ? void 0 : initialStream.cancel());
        if (this.isCurrent(session) && !isAbort(error2)) {
          this.emitMessage(asError(error2).message, "error");
          void this.reportAppendFailure();
          this.emitState("error");
        }
        throw error2;
      }
    }
    /** load(..., true) 的便捷形式。 */
    start(source) {
      return this.load(source, true);
    }
    play() {
      this.ensureAlive();
      return this.audio.play().then(() => void 0);
    }
    pause() {
      this.audio.pause();
    }
    /** 停止当前流并释放 MSE URL，但保留播放器实例以便再次 load。 */
    stop() {
      if (this.state === "destroyed") return;
      this.beginSession();
      this.emitState("idle");
    }
    destroy() {
      if (this.state === "destroyed") return;
      this.beginSession();
      this.audio.removeEventListener("seeking", this.onSeeking);
      this.audio.removeEventListener("play", this.onPlay);
      this.audio.removeEventListener("pause", this.onPause);
      this.audio.removeEventListener("ended", this.onEnded);
      this.emitState("destroyed");
    }
    ensureAlive() {
      if (this.state === "destroyed") throw new Error("播放器已销毁");
    }
    beginSession() {
      var _a, _b;
      this.session++;
      this.streamToken++;
      this.seekToken++;
      (_a = this.sessionController) == null ? void 0 : _a.abort();
      (_b = this.streamController) == null ? void 0 : _b.abort();
      this.sessionController = new AbortController();
      this.streamController = null;
      this.context = null;
      this.info = null;
      this.autoplay = false;
      this.sourceBuffer = null;
      this.mediaSource = null;
      this.sourceBufferChain = Promise.resolve();
      this.audio.pause();
      if (this.audio.src) {
        this.audio.removeAttribute("src");
        this.audio.load();
      }
      if (this.objectUrl) {
        unsafeWindow.URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = null;
      }
      return this.session;
    }
    validateUrl(raw) {
      const url = raw.trim();
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("音频 URL 必须是 HTTP(S) 地址");
      }
      return parsed.toString();
    }
    mediaSourceConstructor() {
      const win2 = unsafeWindow;
      const ctor = win2.MediaSource ?? globalThis.MediaSource;
      if (!ctor) throw new Error("当前浏览器没有 MediaSource 支持");
      return ctor;
    }
    /**
     * 把字节搬到页面 realm，再交给 appendBuffer。
     *
     * MediaSource 取自 unsafeWindow（页面 realm），而我们构造的 Uint8Array
     * 属于用户脚本沙箱 realm。跨 realm 的 ArrayBuffer 传进 appendBuffer 会被拒，
     * 表现是 SourceBuffer 立刻抛 error 事件、而 <audio>.error 仍是 null
     * —— 只看报错完全看不出是 realm 问题。
     *
     * 页面 realm 没暴露 Uint8Array 时（少见）就原样返回，交给浏览器自己判断。
     */
    toPageBuffer(bytes) {
      const win2 = unsafeWindow;
      const PageUint8Array = win2.Uint8Array;
      if (!PageUint8Array || PageUint8Array === Uint8Array) return bytes;
      const copy = new PageUint8Array(bytes.byteLength);
      copy.set(bytes);
      return copy;
    }
    async parseHeadFromStream(stream, session) {
      let size = Math.min(this.options.headBytes, this.options.maxHeadBytes);
      let lastError = null;
      while (size <= this.options.maxHeadBytes) {
        const complete = await stream.bufferAtLeast(size);
        this.assertSession(session);
        const head = stream.snapshot();
        try {
          return { head, meta: parseCencMetadata(head) };
        } catch (error2) {
          lastError = error2;
          const message = asError(error2).message;
          const incomplete = /未找到|不完整|缺少/.test(message);
          if (!incomplete || !complete || size === this.options.maxHeadBytes) throw error2;
          size = Math.min(this.options.maxHeadBytes, size * 2);
        }
      }
      throw lastError instanceof Error ? lastError : new Error("无法解析音频 MP4 头");
    }
    createNetworkStream(url, start, signal, initial = new Uint8Array()) {
      return new SequentialByteStream(
        initial,
        null,
        () => this.openAudioReader(url, start, signal)
      );
    }
    /**
     * 打开一条从指定字节一直到文件末尾的流。
     * 所有 CDN 请求都明确禁止 Referer、Cookie；顺序播放期间只会打开一次。
     */
    async openAudioReader(url, start, signal) {
      this.emitMessage(`打开音频流：bytes=${start}-`, "info");
      const response = await this.options.fetch(url, {
        method: "GET",
        headers: { Range: `bytes=${start}-` },
        credentials: "omit",
        // 两项都设：policy 禁止浏览器生成 Referer，空 referrer 防止调用方 Request 继承。
        referrer: "",
        referrerPolicy: "no-referrer",
        signal
      });
      if (!response.ok && response.status !== 206) {
        throw new Error(`音频 CDN 请求失败(HTTP ${response.status})`);
      }
      if (start > 0 && response.status !== 206) {
        throw new Error("音频 CDN 忽略了 Range，无法从拖动位置续流");
      }
      if (response.body) return response.body.getReader();
      const bytes = await response.arrayBuffer();
      const fallback = new Response(bytes).body;
      if (!fallback) throw new Error("浏览器不支持流式读取 Response");
      return fallback.getReader();
    }
    sessionSignal(session) {
      this.assertSession(session);
      return this.sessionController.signal;
    }
    assertSession(session) {
      if (!this.isCurrent(session)) throw abortError$1();
    }
    isCurrent(session) {
      var _a;
      return this.session === session && !((_a = this.sessionController) == null ? void 0 : _a.signal.aborted);
    }
    async waitForSourceOpen(mediaSource, session) {
      const signal = this.sessionSignal(session);
      await new Promise((resolve, reject) => {
        if (mediaSource.readyState === "open") {
          resolve();
          return;
        }
        const onOpen = () => {
          cleanup();
          resolve();
        };
        const onError = () => {
          cleanup();
          reject(new Error("MediaSource 打开失败"));
        };
        const onAbort = () => {
          cleanup();
          reject(abortError$1());
        };
        const cleanup = () => {
          mediaSource.removeEventListener("sourceopen", onOpen);
          mediaSource.removeEventListener("error", onError);
          signal.removeEventListener("abort", onAbort);
        };
        mediaSource.addEventListener("sourceopen", onOpen, { once: true });
        mediaSource.addEventListener("error", onError, { once: true });
        signal.addEventListener("abort", onAbort, { once: true });
      });
    }
    enqueueSourceBuffer(session, operation) {
      const sourceBuffer = this.sourceBuffer;
      if (!sourceBuffer) return Promise.reject(new Error("SourceBuffer 尚未创建"));
      const signal = this.sessionSignal(session);
      const run = async () => {
        if (signal.aborted) throw abortError$1();
        await waitForSourceBufferIdle(sourceBuffer, signal);
        if (signal.aborted) throw abortError$1();
        return new Promise((resolve, reject) => {
          let settled = false;
          const finish = (error2) => {
            if (settled) return;
            settled = true;
            sourceBuffer.removeEventListener("updateend", onUpdateEnd);
            sourceBuffer.removeEventListener("error", onError);
            signal.removeEventListener("abort", onAbort);
            if (error2) reject(error2);
            else resolve();
          };
          const onUpdateEnd = () => finish();
          const onError = () => finish(new Error("SourceBuffer 更新失败"));
          const onAbort = () => finish(abortError$1());
          sourceBuffer.addEventListener("updateend", onUpdateEnd);
          sourceBuffer.addEventListener("error", onError);
          signal.addEventListener("abort", onAbort, { once: true });
          try {
            operation(sourceBuffer);
          } catch (error2) {
            finish(asError(error2));
          }
        });
      };
      const next = this.sourceBufferChain.catch(() => void 0).then(run);
      this.sourceBufferChain = next;
      return next;
    }
    startStream(startSample, existingStream) {
      var _a;
      const context = this.context;
      if (!context || this.state === "destroyed") return;
      if (!existingStream) {
        (_a = this.streamController) == null ? void 0 : _a.abort();
        this.streamController = new AbortController();
      }
      const controller = this.streamController;
      if (!controller) return;
      const token = ++this.streamToken;
      void this.runStream(
        context,
        this.session,
        token,
        startSample,
        controller.signal,
        existingStream
      );
    }
    async runStream(context, session, token, startSample, signal, existingStream) {
      var _a;
      let sample = startSample;
      let first = true;
      let stream = existingStream ?? null;
      try {
        stream ?? (stream = this.createSampleStream(context, startSample, signal));
        while (this.isStreamCurrent(session, token, signal) && sample < context.meta.sampleCount) {
          await this.waitForRoom(session, token, signal);
          if (!this.isStreamCurrent(session, token, signal)) return;
          const endSample = Math.min(context.meta.sampleCount, sample + context.samplesPerSegment);
          const byteLength = context.meta.offsets[endSample] - context.meta.offsets[sample];
          const encrypted = await stream.readExactly(byteLength);
          if (!this.isStreamCurrent(session, token, signal)) return;
          const plain = await this.decryptRange(context, encrypted, sample, endSample);
          if (!this.isStreamCurrent(session, token, signal)) return;
          const segment = context.meta.codec === "opus" ? buildWebmCluster(
            Math.round(context.ticks[sample] * 1e3 / context.meta.timescale),
            plain.map((_, index) => Math.round(
              context.ticks[sample + index] * 1e3 / context.meta.timescale
            ) - Math.round(context.ticks[sample] * 1e3 / context.meta.timescale)),
            plain
          ) : buildMp4Segment(
            context.ticks[sample],
            plain.map((data, index) => ({
              data,
              duration: context.meta.durations[sample + index]
            })),
            ++this.segmentSequence
          );
          await this.enqueueSourceBuffer(session, (sourceBuffer) => {
            sourceBuffer.appendBuffer(this.toPageBuffer(segment));
          });
          if (first) {
            const toc = (_a = plain[0]) == null ? void 0 : _a[0];
            this.emitMessage(
              `首段 samples=${sample}..${endSample} 密文${encrypted.byteLength}B 段长${segment.byteLength}B TOC=0x${(toc ?? 0).toString(16)}`,
              "info"
            );
          }
          if (!this.isStreamCurrent(session, token, signal)) return;
          await this.evictBehind(session);
          sample = endSample;
          this.emitProgress({
            processedSamples: sample,
            totalSamples: context.meta.sampleCount,
            percent: Math.round(sample / context.meta.sampleCount * 100),
            bufferedAhead: this.bufferedAhead(),
            durationSeconds: context.meta.totalTicks / context.meta.timescale
          });
          if (first && this.autoplay) {
            first = false;
            void this.audio.play().catch(() => {
              this.emitMessage("自动播放被浏览器拦截，请点击音频控件播放", "warn");
            });
          } else {
            first = false;
          }
        }
        if (this.isStreamCurrent(session, token, signal)) {
          await this.finishStream(session, sample);
          this.emitMessage("音频已缓冲到结尾", "info");
        }
      } catch (error2) {
        if (this.isStreamCurrent(session, token, signal) && !isAbort(error2)) {
          this.emitMessage(asError(error2).message, "error");
          void this.reportAppendFailure();
          this.emitState("error");
        }
      } finally {
        void (stream == null ? void 0 : stream.cancel());
      }
    }
    /**
     * 补报媒体元素的错误码。
     *
     * SourceBuffer 的 error 事件先于媒体元素错误传播，同步读 audio.error
     * 大概率是 null。让出一轮事件循环再读，才能拿到真正的 MediaError。
     */
    async reportAppendFailure() {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const detail = describeMediaError(this.audio);
      if (detail) this.emitMessage(`媒体元素错误${detail}`, "error");
    }
    isStreamCurrent(session, token, signal) {
      return this.isCurrent(session) && this.streamToken === token && !signal.aborted;
    }
    /**
     * 全部样本都送进 SourceBuffer 后收口 MediaSource。
     *
     * 只有真的跑到最后一个样本才收口。seek 之后的流也会走到循环末尾，
     * 但那时前面还有没缓冲的区间，提前 endOfStream 会把 duration 定在错的位置。
     */
    async finishStream(session, lastSample) {
      const context = this.context;
      const mediaSource = this.mediaSource;
      if (!context || !mediaSource) return;
      if (lastSample < context.meta.sampleCount) return;
      if (mediaSource.readyState !== "open") return;
      await this.sourceBufferChain.catch(() => void 0);
      if (!this.isCurrent(session)) return;
      if (this.sourceBuffer) {
        await waitForSourceBufferIdle(this.sourceBuffer, this.sessionSignal(session));
      }
      if (!this.isCurrent(session) || mediaSource.readyState !== "open") return;
      try {
        mediaSource.endOfStream();
      } catch (error2) {
        this.emitMessage(`标记音频结尾失败: ${asError(error2).message}`, "warn");
      }
    }
    async waitForRoom(session, token, signal) {
      while (this.isStreamCurrent(session, token, signal) && this.bufferedAhead() >= this.options.maxBufferAheadSeconds) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      if (!this.isStreamCurrent(session, token, signal)) throw abortError$1();
    }
    /**
     * seek 后的新流。目标仍在已保存的 MP4 头内时先复用内存字节，读完再从
     * head.length 开一条网络流；否则直接从目标 sample 的绝对偏移续传。
     */
    createSampleStream(context, startSample, signal) {
      const start = context.meta.mdatStart + context.meta.offsets[startSample];
      if (start < context.head.length) {
        return this.createNetworkStream(
          context.url,
          context.head.length,
          signal,
          context.head.slice(start)
        );
      }
      return this.createNetworkStream(context.url, start, signal);
    }
    async decryptRange(context, encrypted, startSample, endSample) {
      const ivSize = cencIvSize(context.meta);
      const jobs = [];
      for (let i2 = startSample; i2 < endSample; i2++) {
        const relative = context.meta.offsets[i2] - context.meta.offsets[startSample];
        const size = context.meta.sizes[i2];
        jobs.push({
          iv: context.meta.ivs.slice(i2 * ivSize, (i2 + 1) * ivSize),
          ciphertext: encrypted.slice(relative, relative + size)
        });
      }
      return mapLimit(jobs, this.options.decryptConcurrency, (job) => decryptCencSample(
        context.key,
        job.iv,
        job.ciphertext,
        context.counterStart
      ));
    }
    async detectCounterStart(meta, head, key) {
      const count = Math.min(6, meta.sampleCount);
      if (count === 0) return 0;
      const start = meta.mdatStart + meta.offsets[0];
      const end = meta.mdatStart + meta.offsets[count] - 1;
      if (end >= head.length) throw new Error("Opus counter 探测数据不完整");
      const encrypted = head.slice(start, end + 1);
      const ivSize = cencIvSize(meta);
      for (const candidate of [0, 1]) {
        const firstBytes = /* @__PURE__ */ new Set();
        for (let i2 = 0; i2 < count; i2++) {
          const relative = meta.offsets[i2];
          const ciphertext = encrypted.slice(relative, relative + meta.sizes[i2]);
          const plain = await decryptCencSample(
            key,
            meta.ivs.slice(i2 * ivSize, (i2 + 1) * ivSize),
            ciphertext,
            candidate
          );
          if (plain.length > 0) firstBytes.add(plain[0]);
        }
        if (firstBytes.size === 1) {
          this.emitMessage(`CENC counter 低位起始=${candidate}`, "info");
          return candidate;
        }
      }
      this.emitMessage("CENC counter 未收敛，按 0 继续", "warn");
      return 0;
    }
    async evictBehind(session) {
      const sourceBuffer = this.sourceBuffer;
      if (!sourceBuffer || !sourceBuffer.buffered.length) return;
      const current = this.audio.currentTime;
      if (current <= this.options.keepBehindSeconds + 5) return;
      const start = sourceBuffer.buffered.start(0);
      const end = current - this.options.keepBehindSeconds;
      if (start < end) {
        try {
          await this.enqueueSourceBuffer(session, (buffer) => buffer.remove(start, end));
        } catch {
        }
      }
    }
    async restartAt(target, wasPlaying) {
      var _a, _b;
      const context = this.context;
      if (!context) return;
      if (this.audio.error) {
        this.emitMessage("播放元素已进入错误态，无法跳转，请重新开始听书", "warn");
        return;
      }
      const session = this.session;
      const seek = ++this.seekToken;
      this.streamToken++;
      (_a = this.streamController) == null ? void 0 : _a.abort();
      let low = 0;
      let high = context.meta.sampleCount - 1;
      let index = 0;
      const targetTicks = target * context.meta.timescale;
      while (low <= high) {
        const middle = low + high >> 1;
        if (context.ticks[middle] <= targetTicks) {
          index = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      const preSamples = Math.max(1, Math.round(context.samplesPerSecond * 2));
      const startSample = Math.max(0, index - preSamples);
      this.emitMessage(`跳转到 ${target.toFixed(1)} 秒`, "info");
      await this.sourceBufferChain.catch(() => void 0);
      if (seek !== this.seekToken || !this.isCurrent(session)) return;
      const bufferedEnd = ((_b = this.sourceBuffer) == null ? void 0 : _b.buffered.length) ? this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1) : 0;
      if (bufferedEnd > 0) {
        try {
          await this.enqueueSourceBuffer(session, (sourceBuffer) => sourceBuffer.remove(0, bufferedEnd + 0.5));
        } catch {
        }
      }
      if (seek !== this.seekToken || !this.isCurrent(session)) return;
      if (this.mediaSource && this.mediaSource.readyState === "closed") {
        this.emitMessage("媒体源已关闭，无法跳转", "warn");
        return;
      }
      this.startStream(startSample);
      if (wasPlaying) void this.audio.play().catch(() => void 0);
    }
    isTimeBuffered(time) {
      var _a;
      const ranges = (_a = this.sourceBuffer) == null ? void 0 : _a.buffered;
      if (!ranges) return false;
      for (let i2 = 0; i2 < ranges.length; i2++) {
        if (time >= ranges.start(i2) - 0.05 && time <= ranges.end(i2) + 0.05) return true;
      }
      return false;
    }
    bufferedAhead() {
      var _a;
      const ranges = (_a = this.sourceBuffer) == null ? void 0 : _a.buffered;
      if (!ranges || !ranges.length) return 0;
      const current = this.audio.currentTime;
      for (let i2 = 0; i2 < ranges.length; i2++) {
        if (current >= ranges.start(i2) - 0.05 && current <= ranges.end(i2) + 0.05) {
          return Math.max(0, ranges.end(i2) - current);
        }
      }
      return Math.max(0, ranges.end(ranges.length - 1) - current);
    }
    emitState(state2) {
      var _a, _b;
      this.state = state2;
      (_b = (_a = this.options).onStateChange) == null ? void 0 : _b.call(_a, state2);
    }
    emitProgress(progress) {
      var _a, _b;
      (_b = (_a = this.options).onProgress) == null ? void 0 : _b.call(_a, progress);
    }
    emitMessage(message, level) {
      var _a, _b;
      (_b = (_a = this.options).onMessage) == null ? void 0 : _b.call(_a, message, level);
    }
  }
  function gmAudioFetch(input, init = {}) {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const headers = normalizeHeaders(init.headers);
    const signal = init.signal ?? null;
    return new Promise((resolve, reject) => {
      if (signal == null ? void 0 : signal.aborted) {
        reject(abortError());
        return;
      }
      let settled = false;
      let request;
      const onAbort = () => {
        try {
          request == null ? void 0 : request.abort();
        } catch {
        }
        if (settled) return;
        settled = true;
        reject(abortError());
      };
      signal == null ? void 0 : signal.addEventListener("abort", onAbort, { once: true });
      const cleanup = () => {
        signal == null ? void 0 : signal.removeEventListener("abort", onAbort);
      };
      const succeed = (res, body) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(makeResponse(res, body));
      };
      const fail = (error2) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error2);
      };
      request = GM_xmlhttpRequest({
        method: "GET",
        url,
        headers,
        responseType: "stream",
        // GM 请求不带页面 Referer；anonymous 同时也不带 Cookie
        anonymous: true,
        onreadystatechange(res) {
          if (settled || res.readyState < 3) return;
          const stream = res.response;
          if (stream instanceof ReadableStream) succeed(res, stream);
        },
        onload(res) {
          if (settled) return;
          const stream = res.response;
          if (stream instanceof ReadableStream) {
            succeed(res, stream);
            return;
          }
          const bytes = toBytes(res);
          if (!bytes) {
            fail(new Error(
              "GM_xmlhttpRequest 未返回二进制音频数据（请确认 Tampermonkey 版本支持 responseType）"
            ));
            return;
          }
          if (bytes.byteLength === 0 && res.status !== 204 && res.status !== 304) {
            fail(new Error("音频响应为空"));
            return;
          }
          succeed(res, bytes);
        },
        onerror(res) {
          fail(new Error(`音频 CDN 请求失败：${describe(res)}`));
        },
        ontimeout() {
          fail(new Error("音频 CDN 请求超时"));
        }
      });
    });
  }
  function abortError() {
    return new DOMException("音频请求已取消", "AbortError");
  }
  function parseHeaders(raw) {
    const headers = new Headers();
    if (!raw) return headers;
    for (const line of raw.split(/\r?\n/)) {
      const colon = line.indexOf(":");
      if (colon <= 0) continue;
      const name2 = line.slice(0, colon).trim();
      const value = line.slice(colon + 1).trim();
      if (!name2) continue;
      try {
        headers.append(name2, value);
      } catch {
      }
    }
    return headers;
  }
  function makeResponse(res, body) {
    return new Response(body ?? new Uint8Array(), {
      status: res.status || 200,
      statusText: res.statusText || "",
      headers: parseHeaders(res.responseHeaders)
    });
  }
  function toBytes(res) {
    const raw = res.response;
    if (raw instanceof ArrayBuffer) return new Uint8Array(raw);
    if (raw instanceof Uint8Array) return raw;
    return null;
  }
  function normalizeHeaders(init) {
    const out = {};
    if (!init) return out;
    if (init instanceof Headers) {
      init.forEach((value, key) => {
        out[key] = value;
      });
      return out;
    }
    if (Array.isArray(init)) {
      for (const [key, value] of init) {
        if (key !== void 0 && value !== void 0) out[key] = value;
      }
      return out;
    }
    return { ...init };
  }
  function describe(res) {
    if ("error" in res && res.error) return String(res.error);
    const status = res.status;
    return status ? `HTTP ${status}` : "网络错误";
  }
  const CONTENT_SELECTOR = "#fqa-reader-content";
  const TITLE_SELECTOR = "h1.muye-reader-title";
  const ACTIVE_CLASS = "fqa-audio-active";
  function collectParagraphs() {
    const map = /* @__PURE__ */ new Map();
    const container2 = document.querySelector(CONTENT_SELECTOR);
    if (!container2) return map;
    for (const node of container2.querySelectorAll("p[idx]")) {
      const idx = Number(node.getAttribute("idx"));
      if (!Number.isFinite(idx)) continue;
      const list = map.get(idx);
      if (list) list.push(node);
      else map.set(idx, [node]);
    }
    return map;
  }
  function titleTarget(tags) {
    const titles = tags.filter((t) => t.is_title);
    if (titles.length !== 1) return null;
    return document.querySelector(TITLE_SELECTOR);
  }
  function tagIndexAt(tags, timeMs) {
    let low = 0;
    let high = tags.length - 1;
    let found = -1;
    while (low <= high) {
      const middle = low + high >> 1;
      if (tags[middle].startms <= timeMs) {
        found = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    if (found < 0) return -1;
    return found;
  }
  class ParagraphHighlighter {
    constructor() {
      __publicField(this, "paragraphs", /* @__PURE__ */ new Map());
      __publicField(this, "tags", []);
      __publicField(this, "active", []);
      __publicField(this, "activeTagIndex", -1);
    }
    /** 换章或正文重新插入后调用，重建索引 */
    reset(tags) {
      this.clear();
      this.tags = tags;
      this.paragraphs = collectParagraphs();
      this.activeTagIndex = -1;
    }
    /** 正文 DOM 被替换过（切音色不会换 DOM，但切章会），重新抓一遍段落 */
    refresh() {
      this.paragraphs = collectParagraphs();
      this.activeTagIndex = -1;
    }
    get timeTags() {
      return this.tags;
    }
    /** 当前高亮对应的时间点下标，用于切音色时保持段落 */
    get currentTagIndex() {
      return this.activeTagIndex;
    }
    clear() {
      for (const node of this.active) node.classList.remove(ACTIVE_CLASS);
      this.active = [];
    }
    /**
     * 按播放时间更新高亮。
     *
     * @param scroll 是否把高亮段落滚进视口
     * @returns 当前时间点下标，没有变化时返回原值
     */
    update(timeMs, scroll) {
      if (this.tags.length === 0) return -1;
      const index = tagIndexAt(this.tags, timeMs);
      if (index < 0 || index === this.activeTagIndex) return this.activeTagIndex;
      this.activeTagIndex = index;
      this.applyTag(index, scroll);
      return index;
    }
    /** 直接高亮第 index 个时间点，供切音色后恢复位置用 */
    applyTag(index, scroll) {
      const tag = this.tags[index];
      if (!tag) return;
      this.clear();
      const targets = tag.is_title ? [titleTarget(this.tags)].filter((n) => n !== null) : this.rangeTargets(tag.startidx, tag.endidx);
      for (const node of targets) node.classList.add(ACTIVE_CLASS);
      this.active = targets;
      if (scroll && targets[0]) {
        targets[0].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    rangeTargets(startidx, endidx) {
      const targets = [];
      for (let idx = startidx; idx <= endidx; idx++) {
        const nodes = this.paragraphs.get(idx);
        if (nodes) targets.push(...nodes);
      }
      return targets;
    }
    /**
     * 点段落跳转用：找出这个节点属于哪个时间点。
     *
     * 从点击目标往上找最近的 <p[idx]>（点到 blk 或行内标签上也能命中），
     * 再拿 idx 去时间点表里查覆盖它的那一段。
     */
    tagIndexOfNode(node) {
      var _a;
      const paragraph = nearestParagraph(node);
      if (paragraph) {
        const idx = Number(paragraph.getAttribute("idx"));
        if (Number.isFinite(idx)) return this.tagIndexOfIdx(idx);
      }
      if (node instanceof Node && ((_a = titleTarget(this.tags)) == null ? void 0 : _a.contains(node))) {
        return this.tags.findIndex((t) => t.is_title);
      }
      return -1;
    }
    /** idx 落在哪个时间点区间。时间点可能跨多段，所以按区间判断 */
    tagIndexOfIdx(idx) {
      return this.tags.findIndex((t) => !t.is_title && idx >= t.startidx && idx <= t.endidx);
    }
    /** 第 index 个时间点的起始秒数，供 seek 用 */
    startSecondsOf(index) {
      const tag = this.tags[index];
      return tag ? tag.startms / 1e3 : null;
    }
  }
  function nearestParagraph(node) {
    let current = node;
    while (current) {
      if (current instanceof HTMLElement && current.matches("p[idx]")) return current;
      if (current instanceof HTMLElement && current.id === "fqa-reader-content") return null;
      current = current.parentNode;
    }
    return null;
  }
  const TONE_STORE_KEY = "audiobook_tone";
  const state = vue.reactive({
    open: false,
    collapsed: false,
    tonePickerOpen: false,
    loading: false,
    playing: false,
    spinning: false,
    tones: [],
    toneId: null,
    toneName: "",
    cover: "",
    title: "",
    error: ""
  });
  const highlighter = new ParagraphHighlighter();
  let audio = null;
  let player = null;
  let itemId = "";
  let bookId = "";
  let trackTimer = null;
  let pendingTagIndex = -1;
  let playToken = 0;
  let paragraphClickBound = false;
  const onParagraphClick = (event) => {
    if (!state.open || state.toneId === null) return;
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("a, button, sup")) return;
    const index = highlighter.tagIndexOfNode(target);
    if (index < 0) return;
    const seconds = highlighter.startSecondsOf(index);
    if (seconds === null || !audio) return;
    audio.currentTime = seconds;
    highlighter.applyTag(index, false);
    if (!state.playing) void togglePlay();
  };
  function bindParagraphClick() {
    if (paragraphClickBound) return;
    document.addEventListener("click", onParagraphClick);
    paragraphClickBound = true;
  }
  function unbindParagraphClick() {
    if (!paragraphClickBound) return;
    document.removeEventListener("click", onParagraphClick);
    paragraphClickBound = false;
  }
  function ensurePlayer() {
    if (player) return player;
    audio = document.createElement("audio");
    audio.preload = "none";
    audio.style.display = "none";
    document.body.appendChild(audio);
    player = new CencAudioPlayer(audio, {
      // 音频 CDN 不在页面 CSP 的 connect-src 里，页面 fetch 会被 report-only
      // 策略上报到 mon.zijieapi.com。走 GM 通道绕开上报，详见 gmFetch
      fetch: gmAudioFetch,
      onStateChange: onPlayerState,
      onMessage: (message, level) => {
        if (level === "error") {
          console.error("[fqa:audio]", message);
          state.error = message;
        } else {
          console.log("[fqa:audio]", message);
        }
      }
    });
    return player;
  }
  function onPlayerState(playerState) {
    state.playing = playerState === "playing";
    state.spinning = playerState === "playing" || playerState === "loading";
    if (playerState === "playing") state.error = "";
    if (playerState === "playing") startTracking();
    else stopTracking();
    if (playerState === "ended") {
      highlighter.clear();
      onChapterEnd();
    }
  }
  const NEXT_CHAPTER_SELECTOR = "div.chapter-btn.next";
  function onChapterEnd() {
    var _a;
    if (settings.audiobookChapterEnd !== "next") {
      state.spinning = false;
      return;
    }
    const next = (_a = document.querySelector(NEXT_CHAPTER_SELECTOR)) == null ? void 0 : _a.firstChild;
    if (typeof (next == null ? void 0 : next.click) !== "function") {
      state.spinning = false;
      state.error = "已经是最后一章";
      return;
    }
    state.spinning = true;
    const before = itemId;
    next.click();
    unsafeWindow.setTimeout(() => {
      var _a2;
      if (!state.open || itemId !== before) return;
      const current = ((_a2 = window.location.pathname.split("/").pop()) == null ? void 0 : _a2.substring(0, 19)) || "";
      if (current && current !== before) {
        void switchChapter(current, { cover: state.cover, title: state.title });
      } else {
        state.spinning = false;
        state.error = "自动切章失败";
      }
    }, 3e3);
  }
  function startTracking() {
    if (trackTimer !== null) return;
    trackTimer = unsafeWindow.setInterval(() => {
      if (!audio) return;
      highlighter.update(audio.currentTime * 1e3, settings.audiobookFollow);
    }, 120);
  }
  function stopTracking() {
    if (trackTimer === null) return;
    unsafeWindow.clearInterval(trackTimer);
    trackTimer = null;
  }
  function storedToneId() {
    const raw = read(TONE_STORE_KEY);
    return typeof raw === "number" ? raw : null;
  }
  async function openAudiobook(chapter, book, meta) {
    itemId = chapter;
    bookId = book;
    state.cover = meta.cover;
    state.title = meta.title;
    state.error = "";
    state.open = true;
    state.collapsed = false;
    if (state.tones.length === 0) {
      try {
        state.tones = await getBookAvailableTones(bookId);
      } catch (e) {
        state.error = "取音色列表失败";
        console.error("[fqa:audio] 取音色列表失败:", e);
        return;
      }
    }
    if (state.tones.length === 0) {
      state.error = "这本书没有可用音色";
      return;
    }
    const remembered = storedToneId();
    if (remembered !== null && state.tones.some((t) => t.id === remembered)) {
      await selectTone(remembered);
      return;
    }
    state.tonePickerOpen = true;
  }
  async function selectTone(toneId) {
    state.tonePickerOpen = false;
    const tone = state.tones.find((t) => t.id === toneId);
    state.toneId = toneId;
    state.toneName = (tone == null ? void 0 : tone.name) ?? "";
    write(TONE_STORE_KEY, toneId);
    await playCurrent();
  }
  function openTonePicker() {
    state.tonePickerOpen = true;
  }
  function closeTonePicker() {
    state.tonePickerOpen = false;
    if (state.toneId === null) closeAudiobook();
  }
  async function changeTone(toneId) {
    if (toneId === state.toneId) {
      state.tonePickerOpen = false;
      return;
    }
    pendingTagIndex = highlighter.currentTagIndex;
    await selectTone(toneId);
  }
  async function playCurrent() {
    const toneId = state.toneId;
    if (toneId === null || !itemId) return;
    const token = ++playToken;
    const chapter = itemId;
    state.loading = true;
    state.spinning = true;
    state.error = "";
    try {
      const [contexts, tags] = await Promise.all([
        getPlayInfo(chapter, toneId),
        getChapterParagraphTimeTag(chapter, toneId)
      ]);
      if (token !== playToken) return;
      const context = contexts.find((c) => c.item_id === chapter) ?? contexts[0];
      const url = context == null ? void 0 : context.urls[0];
      if (!context || !url) {
        state.error = "这一章没有音频";
        return;
      }
      highlighter.reset(tags);
      bindParagraphClick();
      const instance = ensurePlayer();
      await instance.start({ url, key: context.key });
      if (token !== playToken) return;
      if (pendingTagIndex >= 0) {
        const tag = tags[pendingTagIndex];
        if (tag && audio) {
          audio.currentTime = tag.startms / 1e3;
          highlighter.applyTag(pendingTagIndex, true);
        }
        pendingTagIndex = -1;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      state.error = message;
      console.error("[fqa:audio] 播放失败:", e);
    } finally {
      state.loading = false;
      if (!state.playing) state.spinning = false;
    }
  }
  async function togglePlay() {
    if (!player) return;
    if (state.playing) {
      player.pause();
      return;
    }
    if (player.currentState === "ended" && audio) audio.currentTime = 0;
    try {
      await player.play();
    } catch (e) {
      console.warn("[fqa:audio] play() 被拒:", e);
    }
  }
  function toggleCollapsed() {
    state.collapsed = !state.collapsed;
  }
  async function switchChapter(chapter, meta) {
    if (!state.open || state.toneId === null) return;
    itemId = chapter;
    state.cover = meta.cover;
    state.title = meta.title;
    pendingTagIndex = -1;
    await playCurrent();
  }
  function refreshParagraphs() {
    if (state.open) highlighter.refresh();
  }
  function closeAudiobook() {
    stopTracking();
    unbindParagraphClick();
    playToken++;
    highlighter.clear();
    player == null ? void 0 : player.stop();
    state.open = false;
    state.collapsed = false;
    state.tonePickerOpen = false;
    state.playing = false;
    state.spinning = false;
    state.loading = false;
    state.error = "";
  }
  const _hoisted_1$1 = {
    class: "fqa-tone-box",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "选择音色"
  };
  const _hoisted_2$1 = { class: "fqa-tone-title" };
  const _hoisted_3$1 = { class: "fqa-tone-list" };
  const _hoisted_4$1 = ["onClick"];
  const _hoisted_5$1 = ["src", "alt"];
  const _hoisted_6$1 = {
    key: 1,
    class: "fqa-tone-icon fqa-tone-icon-empty"
  };
  const _hoisted_7$1 = { class: "fqa-tone-text" };
  const _hoisted_8$1 = { class: "fqa-tone-name" };
  const _hoisted_9$1 = {
    key: 0,
    class: "fqa-tone-gender"
  };
  const _hoisted_10$1 = {
    key: 0,
    class: "fqa-tone-desc"
  };
  const _hoisted_11 = { class: "fqa-tone-actions" };
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "TonePicker",
    props: {
      tones: {},
      current: {}
    },
    emits: ["select", "close"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      function genderLabel(gender) {
        if (gender === 1) return "男声";
        if (gender === 2) return "女声";
        return "";
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", {
          class: "fqa-tone-mask",
          onClick: _cache[1] || (_cache[1] = vue.withModifiers(($event) => emit("close"), ["self"]))
        }, [
          vue.createElementVNode("div", _hoisted_1$1, [
            vue.createElementVNode("h3", _hoisted_2$1, vue.toDisplayString(props.current === null ? "选择音色" : "切换音色"), 1),
            _cache[2] || (_cache[2] = vue.createElementVNode("p", { class: "fqa-tone-sub" }, "切换后会从当前段落开头继续", -1)),
            vue.createElementVNode("div", _hoisted_3$1, [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.tones, (tone) => {
                return vue.openBlock(), vue.createElementBlock("button", {
                  key: tone.id,
                  type: "button",
                  class: vue.normalizeClass(["fqa-tone-item", { "fqa-tone-item-active": tone.id === props.current }]),
                  onClick: ($event) => emit("select", tone.id)
                }, [
                  tone.icon ? (vue.openBlock(), vue.createElementBlock("img", {
                    key: 0,
                    class: "fqa-tone-icon",
                    src: tone.icon,
                    alt: tone.name
                  }, null, 8, _hoisted_5$1)) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_6$1, vue.toDisplayString(tone.name.slice(0, 1)), 1)),
                  vue.createElementVNode("span", _hoisted_7$1, [
                    vue.createElementVNode("span", _hoisted_8$1, [
                      vue.createTextVNode(vue.toDisplayString(tone.name) + " ", 1),
                      genderLabel(tone.gender) ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_9$1, vue.toDisplayString(genderLabel(tone.gender)), 1)) : vue.createCommentVNode("", true)
                    ]),
                    tone.description ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_10$1, vue.toDisplayString(tone.description), 1)) : vue.createCommentVNode("", true)
                  ])
                ], 10, _hoisted_4$1);
              }), 128))
            ]),
            vue.createElementVNode("div", _hoisted_11, [
              vue.createElementVNode("button", {
                type: "button",
                class: "fqa-tone-btn",
                onClick: _cache[0] || (_cache[0] = ($event) => emit("close"))
              }, "取消")
            ])
          ])
        ]);
      };
    }
  });
  const _hoisted_1 = ["innerHTML"];
  const _hoisted_2 = {
    key: 1,
    class: "fqa-audio-bar"
  };
  const _hoisted_3 = ["title", "aria-label"];
  const _hoisted_4 = ["src"];
  const _hoisted_5 = {
    key: 1,
    class: "fqa-audio-cover-empty"
  };
  const _hoisted_6 = ["innerHTML"];
  const _hoisted_7 = { class: "fqa-audio-meta" };
  const _hoisted_8 = { class: "fqa-audio-title" };
  const _hoisted_9 = { class: "fqa-audio-sub" };
  const _hoisted_10 = ["innerHTML"];
  const _sfc_main = /* @__PURE__ */ vue.defineComponent({
    __name: "AudioBar",
    setup(__props) {
      function onSelect(id) {
        if (state.toneId === null) void selectTone(id);
        else void changeTone(id);
      }
      return (_ctx, _cache) => {
        return vue.unref(state).open ? (vue.openBlock(), vue.createElementBlock("div", {
          key: 0,
          class: vue.normalizeClass(["fqa-audio-root", { "fqa-audio-collapsed": vue.unref(state).collapsed }])
        }, [
          vue.unref(state).collapsed ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "fqa-audio-expand",
            title: "展开听书栏",
            "aria-label": "展开听书栏",
            onClick: _cache[0] || (_cache[0] = //@ts-ignore
            (...args) => vue.unref(toggleCollapsed) && vue.unref(toggleCollapsed)(...args))
          }, [
            vue.createElementVNode("span", {
              class: "fqa-audio-icon fqa-audio-icon-flip",
              innerHTML: vue.unref(leftIcon)
            }, null, 8, _hoisted_1)
          ])) : (vue.openBlock(), vue.createElementBlock("div", _hoisted_2, [
            vue.createElementVNode("button", {
              type: "button",
              class: "fqa-audio-cover",
              title: vue.unref(state).playing ? "暂停" : "播放",
              "aria-label": vue.unref(state).playing ? "暂停" : "播放",
              onClick: _cache[1] || (_cache[1] = //@ts-ignore
              (...args) => vue.unref(togglePlay) && vue.unref(togglePlay)(...args))
            }, [
              vue.createElementVNode("span", {
                class: vue.normalizeClass(["fqa-audio-disc", { "fqa-audio-spin": vue.unref(state).spinning }])
              }, [
                vue.unref(state).cover ? (vue.openBlock(), vue.createElementBlock("img", {
                  key: 0,
                  src: vue.unref(state).cover,
                  alt: ""
                }, null, 8, _hoisted_4)) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_5, "听"))
              ], 2),
              vue.createElementVNode("span", {
                class: "fqa-audio-state",
                innerHTML: vue.unref(state).playing ? vue.unref(playingIcon) : vue.unref(pausedIcon)
              }, null, 8, _hoisted_6)
            ], 8, _hoisted_3),
            vue.createElementVNode("div", _hoisted_7, [
              vue.createElementVNode("span", _hoisted_8, vue.toDisplayString(vue.unref(state).title), 1),
              vue.createElementVNode("span", _hoisted_9, vue.toDisplayString(vue.unref(state).error || (vue.unref(state).loading ? "缓冲中…" : vue.unref(state).toneName)), 1)
            ]),
            vue.createElementVNode("button", {
              type: "button",
              class: "fqa-audio-btn",
              title: "切换音色",
              "aria-label": "切换音色",
              onClick: _cache[2] || (_cache[2] = //@ts-ignore
              (...args) => vue.unref(openTonePicker) && vue.unref(openTonePicker)(...args))
            }, [..._cache[5] || (_cache[5] = [
              vue.createElementVNode("span", { class: "fqa-audio-dots" }, null, -1)
            ])]),
            vue.createElementVNode("button", {
              type: "button",
              class: "fqa-audio-btn",
              title: "收起",
              "aria-label": "收起听书栏",
              onClick: _cache[3] || (_cache[3] = //@ts-ignore
              (...args) => vue.unref(toggleCollapsed) && vue.unref(toggleCollapsed)(...args))
            }, [
              vue.createElementVNode("span", {
                class: "fqa-audio-icon",
                innerHTML: vue.unref(leftIcon)
              }, null, 8, _hoisted_10)
            ]),
            vue.createElementVNode("button", {
              type: "button",
              class: "fqa-audio-btn fqa-audio-close",
              title: "关闭听书",
              "aria-label": "关闭听书",
              onClick: _cache[4] || (_cache[4] = //@ts-ignore
              (...args) => vue.unref(closeAudiobook) && vue.unref(closeAudiobook)(...args))
            }, " × ")
          ])),
          vue.unref(state).tonePickerOpen ? (vue.openBlock(), vue.createBlock(_sfc_main$1, {
            key: 2,
            tones: vue.unref(state).tones,
            current: vue.unref(state).toneId,
            onSelect,
            onClose: vue.unref(closeTonePicker)
          }, null, 8, ["tones", "current", "onClose"])) : vue.createCommentVNode("", true)
        ], 2)) : vue.createCommentVNode("", true);
      };
    }
  });
  const audiobookcss = `/* 听书悬浮栏与音色弹窗。\r
 * 暗色跟随页面的 div.muye-reader-dark（与 userHook 的判定一致）。 */\r
\r
.fqa-audio-root {\r
	--fqa-audio-bg: #fff;\r
	--fqa-audio-text: #1f2329;\r
	--fqa-audio-sub: #8f959e;\r
	--fqa-audio-hover: rgba(31, 35, 41, 0.06);\r
	--fqa-audio-border: rgba(31, 35, 41, 0.1);\r
	--fqa-audio-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);\r
\r
	position: fixed;\r
	left: 20px;\r
	bottom: 20px;\r
	z-index: 2147483000;\r
	font-size: 14px;\r
	color: var(--fqa-audio-text);\r
}\r
\r
/*\r
 * 暗色反色。悬浮栏挂在 body 下，够不到 .muye-reader-dark 的后代选择器，\r
 * 所以 audioPanel 在 #fqa-audio-root 容器上打 .fqa-audio-dark 类；\r
 * 真正的 .fqa-audio-root（Vue 根）是容器的子节点，用后代选择器作用到它。\r
 */\r
.fqa-audio-dark .fqa-audio-root {\r
	--fqa-audio-bg: #2b2b2b;\r
	--fqa-audio-text: #b3b3b3;\r
	--fqa-audio-sub: #7a7a7a;\r
	--fqa-audio-hover: rgba(255, 255, 255, 0.08);\r
	--fqa-audio-border: rgba(255, 255, 255, 0.12);\r
	--fqa-audio-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);\r
}\r
\r
.fqa-audio-bar {\r
	display: flex;\r
	align-items: center;\r
	gap: 10px;\r
	padding: 8px 10px 8px 8px;\r
	border-radius: 999px;\r
	background: var(--fqa-audio-bg);\r
	box-shadow: var(--fqa-audio-shadow);\r
}\r
\r
/* ------------------------------- 旋转封面 ------------------------------- */\r
\r
.fqa-audio-cover {\r
	position: relative;\r
	flex: 0 0 auto;\r
	width: 44px;\r
	height: 44px;\r
	padding: 0;\r
	border: none;\r
	border-radius: 50%;\r
	background: var(--fqa-audio-hover);\r
	cursor: pointer;\r
}\r
\r
/*\r
 * 只有这一层转。状态图标是 .fqa-audio-state，放在旋转层外面，\r
 * 否则会跟着封面一起转，反而更看不清。\r
 * 播放/缓冲时转，暂停时停在当前角度（animation-play-state 比移除动画更平滑）\r
 */\r
.fqa-audio-disc {\r
	position: absolute;\r
	inset: 0;\r
	border-radius: 50%;\r
	overflow: hidden;\r
	animation: fqa-audio-rotate 8s linear infinite;\r
	animation-play-state: paused;\r
}\r
\r
.fqa-audio-disc.fqa-audio-spin {\r
	animation-play-state: running;\r
}\r
\r
.fqa-audio-disc img {\r
	display: block;\r
	width: 100%;\r
	height: 100%;\r
	object-fit: cover;\r
}\r
\r
.fqa-audio-cover-empty {\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	width: 100%;\r
	height: 100%;\r
	color: var(--fqa-audio-sub);\r
	font-size: 18px;\r
}\r
\r
/* 播放/暂停状态。压一层遮罩，浅色封面上也看得清 */\r
.fqa-audio-state {\r
	position: absolute;\r
	inset: 0;\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	border-radius: 50%;\r
	background: rgba(0, 0, 0, 0.38);\r
	color: #fff;\r
	transition: background 0.2s ease;\r
}\r
\r
.fqa-audio-cover:hover .fqa-audio-state {\r
	background: rgba(0, 0, 0, 0.55);\r
}\r
\r
/*\r
 * 只给尺寸，不写 fill：paused.svg 里那块透明点击区是 fill="none"，\r
 * CSS 的 fill 优先级高于表现属性，会把它填成一个白方块盖住图标。\r
 * 两个 svg 自身已经用 currentColor，跟着上面的 color 走。\r
 */\r
.fqa-audio-state svg {\r
	width: 18px;\r
	height: 18px;\r
}\r
\r
@keyframes fqa-audio-rotate {\r
	from { transform: rotate(0deg); }\r
	to { transform: rotate(360deg); }\r
}\r
\r
@media (prefers-reduced-motion: reduce) {\r
	.fqa-audio-disc { animation: none; }\r
}\r
\r
/* -------------------------------- 文字区 -------------------------------- */\r
\r
.fqa-audio-meta {\r
	display: flex;\r
	flex-direction: column;\r
	justify-content: center;\r
	min-width: 0;\r
	max-width: 180px;\r
	line-height: 1.35;\r
}\r
\r
.fqa-audio-title,\r
.fqa-audio-sub {\r
	overflow: hidden;\r
	white-space: nowrap;\r
	text-overflow: ellipsis;\r
}\r
\r
.fqa-audio-sub {\r
	color: var(--fqa-audio-sub);\r
	font-size: 12px;\r
}\r
\r
/* -------------------------------- 按钮 -------------------------------- */\r
\r
.fqa-audio-btn,\r
.fqa-audio-expand {\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	flex: 0 0 auto;\r
	width: 32px;\r
	height: 32px;\r
	padding: 0;\r
	border: none;\r
	border-radius: 50%;\r
	background: transparent;\r
	color: var(--fqa-audio-text);\r
	cursor: pointer;\r
}\r
\r
.fqa-audio-btn:hover,\r
.fqa-audio-expand:hover {\r
	background: var(--fqa-audio-hover);\r
}\r
\r
.fqa-audio-close {\r
	font-size: 20px;\r
	line-height: 1;\r
}\r
\r
/* svg 用 currentColor，跟着按钮的 color 走 */\r
.fqa-audio-icon {\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	width: 16px;\r
	height: 16px;\r
}\r
\r
.fqa-audio-icon svg {\r
	width: 100%;\r
	height: 100%;\r
	fill: currentColor;\r
}\r
\r
/* 收起后箭头水平翻转朝右 */\r
.fqa-audio-icon-flip {\r
	transform: scaleX(-1);\r
}\r
\r
.fqa-audio-expand {\r
	background: var(--fqa-audio-bg);\r
	box-shadow: var(--fqa-audio-shadow);\r
	width: 36px;\r
	height: 36px;\r
}\r
\r
/* 三个点 */\r
.fqa-audio-dots,\r
.fqa-audio-dots::before,\r
.fqa-audio-dots::after {\r
	width: 4px;\r
	height: 4px;\r
	border-radius: 50%;\r
	background: currentColor;\r
}\r
\r
.fqa-audio-dots {\r
	position: relative;\r
}\r
\r
.fqa-audio-dots::before,\r
.fqa-audio-dots::after {\r
	content: '';\r
	position: absolute;\r
	top: 0;\r
}\r
\r
.fqa-audio-dots::before { left: -7px; }\r
.fqa-audio-dots::after { left: 7px; }\r
\r
/* ----------------------------- 段落高亮 ----------------------------- */\r
\r
.fqa-audio-active {\r
	background: var(--web-brand_light, rgba(241, 70, 70, 0.12));\r
	border-radius: 4px;\r
	transition: background 0.2s ease;\r
}\r
\r
/* ----------------------------- 音色弹窗 ----------------------------- */\r
\r
.fqa-tone-mask {\r
	position: fixed;\r
	inset: 0;\r
	z-index: 2147483002;\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	background: rgba(0, 0, 0, 0.45);\r
}\r
\r
.fqa-tone-box {\r
	width: min(420px, calc(100vw - 32px));\r
	max-height: min(560px, calc(100vh - 64px));\r
	display: flex;\r
	flex-direction: column;\r
	padding: 20px;\r
	border-radius: 12px;\r
	background: var(--fqa-audio-bg, #fff);\r
	color: var(--fqa-audio-text, #1f2329);\r
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.24);\r
}\r
\r
.fqa-tone-title {\r
	margin: 0 0 4px;\r
	font-size: 17px;\r
	font-weight: 600;\r
}\r
\r
.fqa-tone-sub {\r
	margin: 0 0 14px;\r
	color: var(--fqa-audio-sub, #8f959e);\r
	font-size: 12px;\r
}\r
\r
.fqa-tone-list {\r
	flex: 1 1 auto;\r
	overflow-y: auto;\r
	display: flex;\r
	flex-direction: column;\r
	gap: 6px;\r
}\r
\r
.fqa-tone-item {\r
	display: flex;\r
	align-items: center;\r
	gap: 10px;\r
	padding: 8px 10px;\r
	border: 1px solid transparent;\r
	border-radius: 8px;\r
	background: transparent;\r
	color: inherit;\r
	text-align: left;\r
	cursor: pointer;\r
}\r
\r
.fqa-tone-item:hover {\r
	background: var(--fqa-audio-hover, rgba(31, 35, 41, 0.06));\r
}\r
\r
.fqa-tone-item-active {\r
	border-color: var(--web-brand, #f14646);\r
}\r
\r
.fqa-tone-icon {\r
	flex: 0 0 auto;\r
	width: 36px;\r
	height: 36px;\r
	border-radius: 50%;\r
	object-fit: cover;\r
}\r
\r
.fqa-tone-icon-empty {\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	background: var(--fqa-audio-hover, rgba(31, 35, 41, 0.06));\r
	color: var(--fqa-audio-sub, #8f959e);\r
}\r
\r
.fqa-tone-text {\r
	display: flex;\r
	flex-direction: column;\r
	min-width: 0;\r
}\r
\r
.fqa-tone-name {\r
	display: flex;\r
	align-items: center;\r
	gap: 6px;\r
	font-size: 14px;\r
}\r
\r
.fqa-tone-gender {\r
	color: var(--fqa-audio-sub, #8f959e);\r
	font-size: 11px;\r
}\r
\r
.fqa-tone-desc {\r
	overflow: hidden;\r
	color: var(--fqa-audio-sub, #8f959e);\r
	font-size: 12px;\r
	white-space: nowrap;\r
	text-overflow: ellipsis;\r
}\r
\r
.fqa-tone-actions {\r
	display: flex;\r
	justify-content: flex-end;\r
	margin-top: 14px;\r
}\r
\r
.fqa-tone-btn {\r
	padding: 6px 16px;\r
	border: 1px solid var(--fqa-audio-border, rgba(31, 35, 41, 0.1));\r
	border-radius: 6px;\r
	background: transparent;\r
	color: inherit;\r
	cursor: pointer;\r
}\r
\r
.fqa-tone-btn:hover {\r
	background: var(--fqa-audio-hover, rgba(31, 35, 41, 0.06));\r
}\r
`;
  const CONTAINER_ID = "fqa-audio-root";
  const STYLE_ID$1 = "fqa-audio-style";
  let app = null;
  let container = null;
  let themeObserver = null;
  function injectStyle() {
    if (document.getElementById(STYLE_ID$1)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID$1;
    style.textContent = audiobookcss;
    document.head.appendChild(style);
  }
  function syncTheme() {
    if (!container) return;
    const dark = document.querySelector("div.muye-reader-dark") !== null;
    container.classList.toggle("fqa-audio-dark", dark);
  }
  function watchTheme() {
    if (themeObserver) return;
    themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  }
  function initAudioPanel() {
    if (app) return;
    injectStyle();
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
    syncTheme();
    watchTheme();
    app = vue.createApp({ render: () => vue.h(_sfc_main) });
    app.config.errorHandler = (err, _instance, info2) => {
      console.error(`[fqa:audio] Vue error (${info2}):`, err);
    };
    app.mount(container);
  }
  const SHELF_BASE = "https://fanqienovel.com/reading/bookapi/bookshelf";
  function identify(bookId2, modifyTime = 0) {
    return {
      asterisked: false,
      book_id: bookId2,
      book_type: 0,
      modify_time: modifyTime
    };
  }
  async function shelfPost(path, body) {
    const res = await fetch$1(`${SHELF_BASE}${path}/v?aid=1967`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || json && json.code !== 0 && json.code !== void 0) {
      throw new Error(`书架操作失败(${path}): ${(json == null ? void 0 : json.message) ?? res.status}`);
    }
    return json;
  }
  async function addToBookshelf(bookId2) {
    await shelfPost("/add", {
      add_book_source: 0,
      identify_data: [identify(bookId2)]
    });
  }
  async function removeFromBookshelf(bookId2) {
    await shelfPost("/delete", {
      identify_data: [identify(bookId2, Date.now())]
    });
  }
  async function isInBookshelf(book_id) {
    const response = await fetch$1(`https://fanqienovel.com/reading/bookapi/bookshelf/check/v:version/?aid=1967&iid=0&version_code=57700&update_version_code=57700&book_id=${book_id}`);
    const data = await response.json();
    return Boolean(data.data);
  }
  function addResponseModifier(modifier) {
    modifiers.push(modifier);
    return () => {
      const i2 = modifiers.indexOf(modifier);
      if (i2 >= 0) modifiers.splice(i2, 1);
    };
  }
  const modifiers = [];
  const blackList = [
    "mcs.zijieapi.com",
    "vcs.zijieapi.com/vc/setting",
    "mon.zijieapi.com",
    "mssdk.bytedance.com/web/common",
    "hm.baidu.com"
  ];
  const BLOCKED_BODY = JSON.stringify({
    e: 0,
    sc: 10,
    tc: 10
  });
  function checkBlack(url) {
    if (!settings.blockReport) return false;
    return blackList.some((black) => url.includes(black));
  }
  function toLocalArrayBuffer(buf) {
    const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    const out = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(out).set(bytes);
    return out;
  }
  function textToBody(text) {
    return toLocalArrayBuffer(new TextEncoder().encode(text));
  }
  function bodyToText(body) {
    if (typeof body === "string") return body;
    return new TextDecoder().decode(body);
  }
  function bodyToBuffer(body) {
    if (typeof body === "string") return textToBody(body);
    return body;
  }
  function resolveSimple(simple) {
    return { ...simple, responseBody: bodyToBuffer(simple.responseBody) };
  }
  function matchingModifiers(url) {
    return modifiers.filter((m) => m.matcher(url));
  }
  function applyModifiers(url, matched, simple) {
    let current = simple;
    for (const m of matched) {
      if (m.modify_response) current = m.modify_response(url, current);
    }
    return current;
  }
  function responseAllowsBody(status) {
    return status !== 204 && status !== 205 && status !== 304;
  }
  function simpleToResponse(simple) {
    return new Response(responseAllowsBody(simple.statusCode) ? simple.responseBody : null, {
      status: simple.statusCode,
      headers: simple.responseHeaders
    });
  }
  async function responseToSimple(res) {
    const body = toLocalArrayBuffer(await res.arrayBuffer());
    const headers = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { responseBody: body, statusCode: res.status, responseHeaders: headers };
  }
  const originalFetch = unsafeWindow.fetch.bind(unsafeWindow);
  unsafeWindow.fetch = async function fetch2(input, init) {
    let url;
    if (input instanceof Request) {
      url = input.url;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = input;
    }
    if (checkBlack(url)) {
      console.log("blocked request: " + url);
      return new Response(BLOCKED_BODY, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const matched = matchingModifiers(url);
    if (matched.length === 0) return originalFetch(input, init);
    const breaker = matched.find((m) => m.should_break(url));
    if (breaker == null ? void 0 : breaker.make_response) {
      return simpleToResponse(breaker.make_response(url));
    }
    if (!matched.some((m) => m.modify_response)) return originalFetch(input, init);
    const res = await originalFetch(input, init);
    try {
      const simple = await responseToSimple(res.clone());
      return simpleToResponse(applyModifiers(url, matched, simple));
    } catch (error2) {
      console.error("[fqa:fetch] 修改响应失败，回退原始响应:", error2);
      return res;
    }
  };
  const originalXMLHttpRequest = unsafeWindow.XMLHttpRequest;
  const XHR_PROTO = originalXMLHttpRequest.prototype;
  const XHR_DESC = {
    status: Object.getOwnPropertyDescriptor(XHR_PROTO, "status"),
    responseText: Object.getOwnPropertyDescriptor(XHR_PROTO, "responseText"),
    response: Object.getOwnPropertyDescriptor(XHR_PROTO, "response")
  };
  const XHR_GETALL = XHR_PROTO.getAllResponseHeaders;
  const XHR_GETONE = XHR_PROTO.getResponseHeader;
  function readXhrHeaders(self) {
    const headers = {};
    const all = XHR_GETALL.call(self);
    if (!all) return headers;
    for (const line of all.trim().split(/[\r\n]+/)) {
      const idx = line.indexOf(":");
      if (idx > 0) {
        headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
    }
    return headers;
  }
  function readXhrBody(self) {
    const type = self.responseType;
    if (type === "arraybuffer") {
      return toLocalArrayBuffer(XHR_DESC.response.get.call(self));
    }
    if (type === "json") {
      const parsed = XHR_DESC.response.get.call(self);
      return textToBody(JSON.stringify(parsed));
    }
    return textToBody(XHR_DESC.responseText.get.call(self));
  }
  unsafeWindow.XMLHttpRequest = class XMLHttpRequest extends originalXMLHttpRequest {
    constructor() {
      super(...arguments);
      __publicField(this, "_blockedUrl");
      __publicField(this, "_fxaUrl", "");
      __publicField(this, "_fxaMatched", null);
      __publicField(this, "_fxaBreaker", null);
      __publicField(this, "_fxaApplied", false);
      __publicField(this, "_fxaSimple", null);
    }
    open(method, url, async = true, user, password) {
      this._fxaUrl = url;
      this._fxaMatched = null;
      this._fxaBreaker = null;
      this._fxaApplied = false;
      this._fxaSimple = null;
      if (checkBlack(url)) {
        console.log("blocked request: " + url);
        this._blockedUrl = url;
        return;
      }
      this._blockedUrl = void 0;
      const matched = matchingModifiers(url);
      const breaker = matched.find((m) => m.should_break(url));
      if (breaker == null ? void 0 : breaker.make_response) {
        this._fxaBreaker = breaker;
        this._fxaMatched = matched;
      } else if (matched.some((m) => m.modify_response)) {
        this._fxaMatched = matched;
      }
      super.open(method, url, async, user, password);
    }
    setRequestHeader(name2, value) {
      if (this._blockedUrl !== void 0) return;
      super.setRequestHeader(name2, value);
    }
    send(body) {
      var _a, _b;
      if (this._blockedUrl !== void 0) {
        this._synthesizeFromSimple({
          responseBody: textToBody(BLOCKED_BODY),
          statusCode: 200,
          responseHeaders: { "content-type": "application/json" }
        });
        return;
      }
      if ((_a = this._fxaBreaker) == null ? void 0 : _a.make_response) {
        this._synthesizeFromSimple(this._fxaBreaker.make_response(this._fxaUrl));
        return;
      }
      if ((_b = this._fxaMatched) == null ? void 0 : _b.length) this._armTransform();
      super.send(body);
    }
    abort() {
      if (this._blockedUrl !== void 0) return;
      super.abort();
    }
    getAllResponseHeaders() {
      if (this._blockedUrl !== void 0) return "content-type: application/json\r\n";
      return super.getAllResponseHeaders();
    }
    getResponseHeader(name2) {
      if (this._blockedUrl !== void 0) {
        return name2.toLowerCase() === "content-type" ? "application/json" : null;
      }
      return super.getResponseHeader(name2);
    }
    /**
     * 中断请求后合成一个假响应并手动派发完成事件。
     * 与 fetch 的 make_response 对齐，也复用了黑名单那条原本的 setTimeout 派发逻辑。
     */
    _synthesizeFromSimple(raw) {
      const url = this._blockedUrl ?? this._fxaUrl;
      const simple = resolveSimple(raw);
      const headers = simple.responseHeaders;
      const shadow = (prop, value) => Object.defineProperty(this, prop, { configurable: true, get: () => value });
      setTimeout(() => {
        const text = bodyToText(simple.responseBody);
        shadow("readyState", 4);
        shadow("status", simple.statusCode);
        shadow("statusText", "OK");
        shadow("responseURL", url);
        const type = this.responseType;
        shadow("responseText", type === "" || type === "text" ? text : "");
        let value;
        if (type === "json") {
          try {
            value = JSON.parse(text);
          } catch {
            value = text;
          }
        } else if (type === "arraybuffer") {
          value = simple.responseBody;
        } else if (type === "blob") {
          value = new Blob([simple.responseBody]);
        } else {
          value = text;
        }
        shadow("response", value);
        shadow(
          "getAllResponseHeaders",
          () => Object.entries(headers).map(([k, v]) => `${k}: ${v}\r
`).join("")
        );
        shadow("getResponseHeader", (name2) => {
          const lower = name2.toLowerCase();
          const key = Object.keys(headers).find((k) => k.toLowerCase() === lower);
          return key ? headers[key] : null;
        });
        this.dispatchEvent(new Event("readystatechange"));
        this.dispatchEvent(new ProgressEvent("load"));
        this.dispatchEvent(new ProgressEvent("loadend"));
      }, 0);
    }
    /**
     * 在实例上挂影子属性：等真实响应就绪（readyState=4），
     * 页面第一次读取时才同步套用 modify_response 并缓存结果。
     * 这样不用跟页面的 onload / onreadystatechange 争先后顺序。
     */
    _armTransform() {
      const type = this.responseType;
      if (type === "blob" || type === "document") return;
      const self = this;
      const matched = this._fxaMatched;
      const url = this._fxaUrl;
      const ensure = () => {
        if (self._fxaApplied || self.readyState !== 4) return;
        self._fxaSimple = resolveSimple(applyModifiers(url, matched, {
          responseBody: readXhrBody(self),
          statusCode: XHR_DESC.status.get.call(self),
          responseHeaders: readXhrHeaders(self)
        }));
        self._fxaApplied = true;
      };
      Object.defineProperty(this, "status", {
        configurable: true,
        get() {
          ensure();
          if (self._fxaApplied) return self._fxaSimple.statusCode;
          return XHR_DESC.status.get.call(self);
        }
      });
      Object.defineProperty(this, "responseText", {
        configurable: true,
        get() {
          ensure();
          const t = self.responseType;
          if (!self._fxaApplied || t !== "" && t !== "text") {
            return XHR_DESC.responseText.get.call(self);
          }
          return bodyToText(self._fxaSimple.responseBody);
        }
      });
      Object.defineProperty(this, "response", {
        configurable: true,
        get() {
          ensure();
          if (!self._fxaApplied) return XHR_DESC.response.get.call(self);
          const body = self._fxaSimple.responseBody;
          switch (self.responseType) {
            case "":
            case "text":
              return bodyToText(body);
            case "json":
              return JSON.parse(bodyToText(body));
            case "arraybuffer":
              return body;
            default:
              return XHR_DESC.response.get.call(self);
          }
        }
      });
      this.getAllResponseHeaders = function getAllResponseHeaders() {
        ensure();
        if (!self._fxaApplied) return XHR_GETALL.call(self);
        return Object.entries(self._fxaSimple.responseHeaders).map(([k, v]) => `${k}: ${v}\r
`).join("");
      };
      this.getResponseHeader = function getResponseHeader(name2) {
        ensure();
        if (!self._fxaApplied) return XHR_GETONE.call(self, name2);
        const lower = name2.toLowerCase();
        const key = Object.keys(self._fxaSimple.responseHeaders).find((k) => k.toLowerCase() === lower);
        return key ? self._fxaSimple.responseHeaders[key] : null;
      };
    }
  };
  const _exports$1 = [];
  let userState = {
    isLogin: false,
    userInfo: null
  };
  if (read("userState")) {
    userState = read("userState");
  }
  console.log("userState:", userState);
  const DB_NAME = "fqa-cache";
  const DB_VERSION = 1;
  const STORE_CHAPTERS = "chapters";
  const STORE_PINS = "pinnedBooks";
  const DEFAULT_PIN_BOOK_LIMIT = 50;
  const DEFAULT_PIN_CHAPTER_LIMIT = 5e3;
  const DEFAULT_CONFIG = {
    pinBookLimit: DEFAULT_PIN_BOOK_LIMIT,
    pinChapterLimit: DEFAULT_PIN_CHAPTER_LIMIT
  };
  let db = null;
  let config = { ...DEFAULT_CONFIG };
  let openingPromise = null;
  function openDb() {
    if (db) return Promise.resolve(db);
    if (openingPromise) return openingPromise;
    openingPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(STORE_CHAPTERS)) {
          const store = d.createObjectStore(STORE_CHAPTERS, { keyPath: "id" });
          store.createIndex("bookId", "bookId", { unique: false });
          store.createIndex("scope", "scope", { unique: false });
        }
        if (!d.objectStoreNames.contains(STORE_PINS)) {
          d.createObjectStore(STORE_PINS, { keyPath: "id" });
        }
      };
      req.onsuccess = () => {
        db = req.result;
        resolve(db);
      };
      req.onerror = () => {
        openingPromise = null;
        reject(req.error ?? new Error("IDB open failed"));
      };
      req.onblocked = () => {
        warn("cache", "IndexedDB 升级被阻塞，旧版本页面未关闭？");
      };
    });
    return openingPromise;
  }
  function reqToPromise(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function initCache() {
    await openDb();
    await clearSessionScope();
    info("cache", `缓存系统就绪（DB: ${DB_NAME} v${DB_VERSION}）`);
  }
  async function cacheChapter(bookId2, bookName, itemId2, content) {
    const id = makeId(bookId2, itemId2);
    const d = await openDb();
    const t = d.transaction(STORE_CHAPTERS, "readwrite");
    const store = t.objectStore(STORE_CHAPTERS);
    const existing = await reqToPromise(
      store.get(id)
    );
    if (existing) {
      store.put({ ...existing, lastReadAt: Date.now() });
    } else {
      const entry = {
        id,
        bookId: bookId2,
        bookName,
        itemId: itemId2,
        content,
        createdAt: Date.now(),
        lastReadAt: Date.now(),
        scope: "session"
      };
      store.add(entry);
    }
    await txDone(t);
    debug("cache", `已缓存章节 ${id}`, { scope: "session" });
  }
  async function getCachedChapter(bookId2, itemId2) {
    const id = makeId(bookId2, itemId2);
    const d = await openDb();
    const t = d.transaction(STORE_CHAPTERS, "readonly");
    const store = t.objectStore(STORE_CHAPTERS);
    const entry = await reqToPromise(
      store.get(id)
    );
    if (!entry) return null;
    const t2 = d.transaction(STORE_CHAPTERS, "readwrite");
    t2.objectStore(STORE_CHAPTERS).put({ ...entry, lastReadAt: Date.now() });
    await txDone(t2);
    return entry;
  }
  async function pinBook(bookId2, bookName) {
    const d = await openDb();
    const t0 = d.transaction(STORE_PINS, "readonly");
    const existing = await reqToPromise(
      t0.objectStore(STORE_PINS).get(bookId2)
    );
    if (existing) {
      debug("cache", `书已被 pin，跳过`, { bookId: bookId2 });
      return { ok: true };
    }
    const tCount = d.transaction(STORE_PINS, "readonly");
    const count = await reqToPromise(tCount.objectStore(STORE_PINS).count());
    if (count >= config.pinBookLimit) {
      return { ok: false, reason: `已 pin ${count} 本，达到上限 ${config.pinBookLimit}，请先 unpin 其他书` };
    }
    const t = d.transaction([STORE_CHAPTERS, STORE_PINS], "readwrite");
    const chapterStore = t.objectStore(STORE_CHAPTERS);
    const idx = chapterStore.index("bookId");
    const cursorReq = idx.openCursor(IDBKeyRange.only(bookId2));
    let chapterCount = 0;
    let totalBytes = 0;
    let firstChapterId = null;
    let lastReadItemId = null;
    let lastReadAt = 0;
    await new Promise((resolve, reject) => {
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) {
          resolve();
          return;
        }
        const ch = cursor.value;
        cursor.update({ ...ch, scope: "pin" });
        chapterCount++;
        totalBytes += ch.content.length;
        if (firstChapterId === null) firstChapterId = ch.itemId;
        if (ch.lastReadAt > lastReadAt) {
          lastReadAt = ch.lastReadAt;
          lastReadItemId = ch.itemId;
        }
        cursor.continue();
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
    const meta = {
      id: bookId2,
      bookName,
      pinnedAt: Date.now(),
      chapterCount,
      totalBytes,
      lastReadItemId,
      lastReadIndex: 0
    };
    t.objectStore(STORE_PINS).put(meta);
    await txDone(t);
    info("cache", `已 pin 书`, { bookId: bookId2, bookName, chapterCount, totalBytes });
    return { ok: true };
  }
  async function unpinBook(bookId2) {
    const d = await openDb();
    const t = d.transaction([STORE_CHAPTERS, STORE_PINS], "readwrite");
    const chapterStore = t.objectStore(STORE_CHAPTERS);
    const idx = chapterStore.index("bookId");
    const cursorReq = idx.openCursor(IDBKeyRange.only(bookId2));
    await new Promise((resolve, reject) => {
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) {
          resolve();
          return;
        }
        const ch = cursor.value;
        if (ch.scope === "pin") cursor.delete();
        cursor.continue();
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
    await reqToPromise(t.objectStore(STORE_PINS).delete(bookId2));
    await txDone(t);
    info("cache", `已 unpin 书`, { bookId: bookId2 });
  }
  async function listPinnedBooks() {
    const d = await openDb();
    const t = d.transaction(STORE_PINS, "readonly");
    const all = await reqToPromise(
      t.objectStore(STORE_PINS).getAll()
    );
    return all.sort((a, b) => b.pinnedAt - a.pinnedAt);
  }
  async function isPinned(bookId2) {
    const d = await openDb();
    const t = d.transaction(STORE_PINS, "readonly");
    const m = await reqToPromise(
      t.objectStore(STORE_PINS).get(bookId2)
    );
    return Boolean(m);
  }
  async function updateReadingProgress(bookId2, itemId2, index) {
    const d = await openDb();
    const t = d.transaction(STORE_PINS, "readwrite");
    const store = t.objectStore(STORE_PINS);
    const m = await reqToPromise(
      store.get(bookId2)
    );
    if (!m) return;
    await reqToPromise(store.put({
      ...m,
      lastReadItemId: itemId2,
      lastReadIndex: index
    }));
    await txDone(t);
  }
  async function clearSessionScope() {
    const d = await openDb();
    const t = d.transaction(STORE_CHAPTERS, "readwrite");
    const store = t.objectStore(STORE_CHAPTERS);
    const idx = store.index("scope");
    const cursorReq = idx.openCursor(IDBKeyRange.only("session"));
    let cleared = 0;
    await new Promise((resolve, reject) => {
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) {
          resolve();
          return;
        }
        cursor.delete();
        cleared++;
        cursor.continue();
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
    await txDone(t);
    if (cleared > 0) info("cache", `已清理 ${cleared} 条 session 缓存`);
  }
  function makeId(bookId2, itemId2) {
    return `${bookId2}:${itemId2}`;
  }
  function txDone(t) {
    return new Promise((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error("tx aborted"));
    });
  }
  let currentBook = null;
  let latestItemId = null;
  let currentChapterWithContent = null;
  const SCRIPT_CONTAINER_ID = "fqa-reader-content";
  let comicObserver = null;
  addResponseModifier({
    matcher: (url) => url.indexOf("/reading/bookapi/bookshelf/check/") !== -1 && location.pathname.startsWith("/reader"),
    should_break: () => true,
    make_response: () => {
      const body = JSON.stringify({
        code: 0,
        message: "SUCCESS",
        data: 0
      });
      return {
        responseBody: body,
        statusCode: 200,
        responseHeaders: {
          "content-type": "application/json; charset=utf-8",
          "content-length": String(new TextEncoder().encode(body).length)
        }
      };
    }
  });
  function ensureScriptContainer(readerContainer, comic) {
    let scriptContainer = document.getElementById(SCRIPT_CONTAINER_ID);
    if (!scriptContainer) {
      scriptContainer = cloneElement(readerContainer);
      scriptContainer.id = SCRIPT_CONTAINER_ID;
      scriptContainer.classList.add("fqa");
      readerContainer.insertAdjacentElement("beforebegin", scriptContainer);
    }
    scriptContainer.classList.toggle("fqa-comic-reader", comic);
    if (settings.allowCopy) scriptContainer.classList.remove("noselect");
    comicObserver == null ? void 0 : comicObserver.disconnect();
    comicObserver = null;
    scriptContainer.innerHTML = "";
    readerContainer.classList.add("fqa-hide");
    return scriptContainer;
  }
  function injectPinButton(bookId2, bookName) {
    var _a;
    if (!bookId2) return;
    const existing = document.getElementById("fqa-pin-btn");
    if (existing) existing.remove();
    const muyeReaderSubtitle = document.querySelector(".muye-reader-subtitle, .reader-subtitle, .chapter-info");
    const anchor = muyeReaderSubtitle ?? ((_a = document.getElementById("fqa-current-chapter-volume")) == null ? void 0 : _a.parentElement) ?? document.body;
    const btn = document.createElement("button");
    btn.id = "fqa-pin-btn";
    btn.className = "fqa-pin-topbar-btn";
    btn.style.cssText = "margin-left:8px;padding:2px 10px;border:1px solid #ff9d5c;background:transparent;color:#ff9d5c;border-radius:4px;cursor:pointer;font-size:12px;";
    isPinned(bookId2).then((pinned) => {
      btn.textContent = pinned ? "📌 已 Pin（点击取消）" : "📌 Pin 此书";
      btn.dataset.pinned = pinned ? "1" : "0";
    });
    btn.addEventListener("click", async () => {
      const isCurrentlyPinned = btn.dataset.pinned === "1";
      if (isCurrentlyPinned) {
        if (!confirm(`确认取消 Pin "${bookName}"？
（这会删除该书的所有本地缓存）`)) return;
        btn.disabled = true;
        btn.textContent = "处理中…";
        await unpinBook(bookId2);
        info("reader", `已 unpin ${bookName}`, { bookId: bookId2 });
        btn.textContent = "📌 Pin 此书";
        btn.dataset.pinned = "0";
        btn.disabled = false;
      } else {
        btn.disabled = true;
        btn.textContent = "Pin 中…";
        const r = await pinBook(bookId2, bookName || `书 ${bookId2.slice(-6)}`);
        if (!r.ok) {
          alert(`Pin 失败: ${r.reason}`);
          btn.textContent = "📌 Pin 此书";
          btn.disabled = false;
          return;
        }
        info("reader", `已 pin ${bookName}`, { bookId: bookId2 });
        btn.textContent = "📌 已 Pin（点击取消）";
        btn.dataset.pinned = "1";
        btn.disabled = false;
      }
    });
    anchor.appendChild(btn);
  }
  async function insertContent() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    const itemId2 = ((_a = window.location.pathname.split("/").pop()) == null ? void 0 : _a.substring(0, 19)) || "";
    if (!itemId2) {
      console.warn("No item_id found in URL");
      return;
    }
    latestItemId = itemId2;
    let chapter = null;
    if (currentBook == null ? void 0 : currentBook.book_id) {
      const cached = await getCachedChapter(currentBook.book_id, itemId2);
      if (cached) {
        debug("reader", `缓存命中 ${currentBook.book_id}:${itemId2}`, {
          scope: cached.scope,
          ageMs: Date.now() - cached.createdAt
        });
        chapter = {
          content: cached.content,
          novel_data: {
            book_id: cached.bookId,
            item_id: cached.itemId,
            title: ""
          }
        };
      }
    }
    if (!chapter) {
      chapter = await getChapter(itemId2);
    }
    if (!chapter) {
      console.warn("No chapter found for item_id:", itemId2);
      return;
    }
    if (((_b = chapter.novel_data) == null ? void 0 : _b.book_id) && typeof chapter.content === "string") {
      void cacheChapter(
        chapter.novel_data.book_id,
        (currentBook == null ? void 0 : currentBook.title) ?? "",
        itemId2,
        chapter.content
      ).catch((e) => warn("reader", "cacheChapter failed", { error: String(e) }));
      if (currentBook == null ? void 0 : currentBook.chapter_list) {
        const idx = currentBook.chapter_list.findIndex((c) => c.item_id === itemId2);
        if (idx >= 0) {
          void updateReadingProgress(chapter.novel_data.book_id, itemId2, idx);
        }
      }
      void injectPinButton(chapter.novel_data.book_id, (currentBook == null ? void 0 : currentBook.title) ?? "");
    }
    if (latestItemId !== itemId2) {
      console.debug("Stale chapter response discarded:", itemId2);
      return;
    }
    console.log("Chapter:", chapter);
    currentChapterWithContent = chapter;
    const pageState = unsafeWindow.__INITIAL_STATE__;
    const chapterTitle = ((_c = chapter.novel_data) == null ? void 0 : _c.title) || ((_e = (_d = pageState == null ? void 0 : pageState.reader) == null ? void 0 : _d.chapterData) == null ? void 0 : _e.title);
    if (typeof chapter.content === "string") {
      void applyBookCss((_f = chapter.novel_data) == null ? void 0 : _f.css_map, "#fqa-reader-content");
      const dp = new DOMParser();
      const doc = dp.parseFromString(chapter.content, "text/html");
      const body = doc.body;
      body.querySelectorAll('link[rel="stylesheet"]').forEach((el) => el.remove());
      let article = body.querySelector("article");
      let toProcess = article || body;
      processFootnotes(toProcess);
      for (let i2 = 0; i2 < toProcess.childNodes.length; i2++) {
        if (i2 < 2 && ((_h = (_g = toProcess.childNodes[i2]) == null ? void 0 : _g.innerHTML) == null ? void 0 : _h.includes(chapterTitle))) {
          toProcess.removeChild(toProcess.childNodes[i2]);
          break;
        }
      }
      if (!article) {
        article = document.createElement("article");
        article.innerHTML = toProcess.innerHTML;
        toProcess = article;
      }
      const readerContainer = document.querySelector("div.muye-reader-content:not(.fqa)");
      if (readerContainer) {
        const scriptContainer = ensureScriptContainer(readerContainer, false);
        scriptContainer.appendChild(toProcess);
        bindFootnoteInteraction(scriptContainer);
      }
    } else if (chapter.content.picInfos) {
      if (chapter.content.encrypt) {
        const imgs = [];
        for (let i2 = 0; i2 < chapter.content.picInfos.length; i2++) {
          const picInfo = chapter.content.picInfos[i2];
          const img = document.createElement("img");
          img.className = "fqa-comic-img fqa-comic-encrypted";
          img.alt = `第${i2 + 1}页`;
          img.dataset.encryptedUrl = picInfo.picUrl;
          img.dataset.encryptKey = chapter.content.encrypt_key;
          img.dataset.pageIndex = i2.toString();
          img.style.minHeight = "500px";
          img.style.backgroundColor = "#f0f0f0";
          imgs.push(img);
        }
        const readerContainer = document.querySelector("div.muye-reader-content:not(.fqa)");
        if (readerContainer) {
          const scriptContainer = ensureScriptContainer(readerContainer, true);
          imgs.forEach((img) => scriptContainer.appendChild(img));
          const observer = new IntersectionObserver(
            async (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) {
                  const img = entry.target;
                  if (img.dataset.encryptedUrl && img.dataset.encryptKey && !img.src) {
                    observer.unobserve(img);
                    try {
                      const encryptedBuffer = await fetchArrayBuffer(
                        img.dataset.encryptedUrl
                      );
                      const decryptedBuffer = await decryptComicImage(
                        encryptedBuffer,
                        img.dataset.encryptKey
                      );
                      const blob = new Blob([decryptedBuffer], { type: "image/jpeg" });
                      const blobUrl = URL.createObjectURL(blob);
                      img.src = blobUrl;
                      img.style.minHeight = "";
                      img.style.backgroundColor = "";
                      img.onload = () => {
                        URL.revokeObjectURL(blobUrl);
                      };
                    } catch (error2) {
                      console.error(`解密图片失败 (页 ${img.dataset.pageIndex}):`, error2);
                      img.alt = `第${Number(img.dataset.pageIndex) + 1}页 - 解密失败`;
                      img.style.backgroundColor = "#ffebee";
                    }
                  }
                }
              }
            },
            {
              rootMargin: "200px"
            }
          );
          comicObserver = observer;
          imgs.forEach((img) => observer.observe(img));
        }
      } else {
        const imgs = [];
        for (let i2 = 0; i2 < chapter.content.picInfos.length; i2++) {
          const picInfo = chapter.content.picInfos[i2];
          const img = document.createElement("img");
          img.className = "fqa-comic-img";
          img.alt = `第${i2 + 1}页`;
          img.src = picInfo.picUrl;
          imgs.push(img);
        }
        const readerContainer = document.querySelector("div.muye-reader-content:not(.fqa)");
        if (readerContainer) {
          const scriptContainer = ensureScriptContainer(readerContainer, true);
          imgs.forEach((img) => scriptContainer.appendChild(img));
        }
      }
    }
    const muyeReaderTitle = document.querySelector("h1.muye-reader-title");
    let muyeReaderSubtitle = document.querySelector("div.muye-reader-subtitle");
    (_i = document.querySelector("#fqa-subtitle")) == null ? void 0 : _i.remove();
    if (muyeReaderSubtitle) {
      let _cloned = cloneElement(muyeReaderSubtitle);
      muyeReaderSubtitle.classList.add("fqa-hide");
      _cloned.id = "fqa-subtitle";
      muyeReaderSubtitle.insertAdjacentElement("afterend", _cloned);
      muyeReaderSubtitle = _cloned;
      _cloned.classList.remove("fqa-hide");
      console.log("clone subtitle: ", _cloned);
    }
    if (muyeReaderTitle) {
      muyeReaderTitle.textContent = chapterTitle;
    }
    console.log("Current book:", currentBook);
    if (!currentBook || currentBook == null || currentBook.book_id !== ((_j = chapter.novel_data) == null ? void 0 : _j.book_id)) {
      currentBook = await getBookInfoAndCatalog((_k = chapter.novel_data) == null ? void 0 : _k.book_id);
      console.log("Current book:", currentBook);
    }
    if (currentBook && currentBook.chapter_list) {
      const currentChapterItem = currentBook.chapter_list.find((c) => c.item_id === itemId2);
      if (currentChapterItem) {
        console.log("Current chapter:", currentChapterItem);
        document.title = currentChapterItem.title + " - " + currentBook.title + " - 番茄小说";
        if (document.getElementById("fqa-current-chapter-volume")) {
          const c = document.getElementById("fqa-current-chapter-volume");
          if (c) {
            c.textContent = currentChapterItem.volume_title;
          }
        } else {
          const volSpan = document.createElement("span");
          volSpan.className = "desc-item";
          volSpan.id = "fqa-current-chapter-volume";
          volSpan.textContent = currentChapterItem.volume_title;
          const c = muyeReaderSubtitle == null ? void 0 : muyeReaderSubtitle.firstChild;
          if (c) {
            c.insertAdjacentElement("beforebegin", volSpan);
          }
        }
        let updateTimeSpans = (muyeReaderSubtitle == null ? void 0 : muyeReaderSubtitle.querySelectorAll("span.desc-item")) || [];
        console.log("spans len", updateTimeSpans.length, "assertIsOffshelf", updateTimeSpans.length < 3);
        if (updateTimeSpans.length >= 3) {
          console.log("if");
          let updateTimeSpan = updateTimeSpans[updateTimeSpans.length - 1];
          let uttspan = updateTimeSpan.firstChild;
          uttspan == null ? void 0 : uttspan.remove();
          updateTimeSpan.innerHTML = "更新时间：" + currentChapterItem.update_time;
        } else {
          console.log("else");
          (_l = updateTimeSpans[updateTimeSpans.length - 1]) == null ? void 0 : _l.remove();
          const updateTimeSpan = document.createElement("span");
          updateTimeSpan.className = "desc-item";
          updateTimeSpan.textContent = `更新时间：${currentChapterItem.update_time}`;
          console.log("assert equal", currentChapterItem.item_id === ((_m = currentChapterWithContent == null ? void 0 : currentChapterWithContent.novel_data) == null ? void 0 : _m.item_id));
          console.log("wordcnt", (_n = currentChapterWithContent == null ? void 0 : currentChapterWithContent.novel_data) == null ? void 0 : _n.chapter_word_number);
          const c = document.getElementById("fqa-current-chapter-volume");
          let b = null;
          if (currentChapterItem.item_id === ((_o = currentChapterWithContent == null ? void 0 : currentChapterWithContent.novel_data) == null ? void 0 : _o.item_id)) {
            const wordCntSpan = document.createElement("span");
            wordCntSpan.className = "desc-item";
            wordCntSpan.textContent = `本章字数：${(_p = currentChapterWithContent == null ? void 0 : currentChapterWithContent.novel_data) == null ? void 0 : _p.chapter_word_number}字`;
            console.log(wordCntSpan);
            if (c) {
              console.log("insert wordcnt");
              c.insertAdjacentElement("afterend", wordCntSpan);
            }
            b = wordCntSpan;
          }
          console.log("insert update time");
          (_q = b || c) == null ? void 0 : _q.insertAdjacentElement("afterend", updateTimeSpan);
        }
      }
    }
    if (state.open) {
      await switchChapter(itemId2, {
        cover: (currentBook == null ? void 0 : currentBook.cover_url) ?? "",
        title: (currentBook == null ? void 0 : currentBook.title) ?? document.title
      });
    } else {
      refreshParagraphs();
    }
  }
  async function startAudioPlay() {
    var _a;
    if (state.open) {
      closeAudiobook();
      return;
    }
    const itemId2 = ((_a = window.location.pathname.split("/").pop()) == null ? void 0 : _a.substring(0, 19)) || "";
    if (!itemId2) return;
    initAudioPanel();
    await openAudiobook(itemId2, (currentBook == null ? void 0 : currentBook.book_id) ?? "", {
      cover: (currentBook == null ? void 0 : currentBook.cover_url) ?? "",
      title: (currentBook == null ? void 0 : currentBook.title) ?? document.title
    });
  }
  async function onUrlChange$1(_previous) {
    await insertContent();
  }
  async function onHashChange$1(_previous) {
  }
  async function onLoad$1() {
    var _a;
    async function fetchBookInfo() {
      var _a2, _b;
      const pageState = unsafeWindow.__INITIAL_STATE__;
      const bid = (_b = (_a2 = pageState == null ? void 0 : pageState.reader) == null ? void 0 : _a2.chapterData) == null ? void 0 : _b.bookId;
      currentBook = await getBookInfoAndCatalog(bid);
    }
    void fetchBookInfo();
    const toolbar = document.querySelector("div.reader-toolbar > div");
    const toolbarButton = document.querySelector("div.reader-toolbar > div > div:nth-child(3)");
    if (toolbarButton && toolbar) {
      const c = cloneElement(toolbarButton);
      c.id = "fqa-toggle-audiobook";
      const listenIcon = document.createElement("span");
      listenIcon.textContent = "听";
      listenIcon.style.width = "24px";
      listenIcon.style.height = "24px";
      listenIcon.style.fontSize = "24px";
      listenIcon.style.lineHeight = "24px";
      listenIcon.classList.add("muyeicon-icon");
      listenIcon.classList.add("reader-toolbar-item-icon");
      (_a = c.firstChild) == null ? void 0 : _a.replaceWith(listenIcon);
      const l = c.lastChild;
      if (l) {
        l.textContent = "听书";
      }
      c.addEventListener("click", () => void startAudioPlay());
      toolbar.appendChild(c);
    }
    const bookshelfButton = document.querySelector("div.reader-toolbar-item");
    if (userState.isLogin && bookshelfButton && bookshelfButton.innerHTML.includes("书架")) {
      const shelf = cloneElement(bookshelfButton);
      bookshelfButton.replaceWith(shelf);
      let inShelf = false;
      let ready = false;
      let busy = false;
      async function ensureBookshelfState() {
        while (!currentBook) {
          await sleep(50);
        }
        inShelf = await isInBookshelf(currentBook.book_id);
        shelf.classList.toggle("reader-toolbar-item-disabled", inShelf);
        const label = shelf.lastChild;
        if (label) label.textContent = inShelf ? "已在书架" : "加入书架";
        ready = true;
      }
      void ensureBookshelfState();
      shelf.addEventListener("click", async () => {
        const book = currentBook;
        if (!ready || busy || !book) return;
        busy = true;
        try {
          if (inShelf) {
            if (settings.shelfRemoveConfirm) {
              if (!unsafeWindow.confirm(`确定要把《${book.title ?? "这本书"}》从书架移出吗？`)) return;
            }
            await removeFromBookshelf(book.book_id);
          } else {
            await addToBookshelf(book.book_id);
          }
          await ensureBookshelfState();
        } catch (error2) {
          console.error("[fqa:reader] 书架操作失败:", error2);
          unsafeWindow.alert(error2 instanceof Error ? error2.message : "书架操作失败");
        } finally {
          busy = false;
        }
      });
    }
    document.querySelector("div.muye-reader-btns");
    await insertContent();
  }
  function readerFilter(path, _query, _hash) {
    return path.startsWith("/reader") || path.startsWith("reader");
  }
  const _exports = [
    {
      id: "readerHook_load",
      event: "load",
      handler: onLoad$1,
      filter: readerFilter
    },
    {
      id: "readerHook_urlChange",
      event: "onUrlChange",
      handler: onUrlChange$1,
      filter: readerFilter
    },
    {
      id: "readerHook_hashChange",
      event: "onHashChange",
      handler: onHashChange$1,
      filter: readerFilter
    }
  ];
  const hooks = [
    ..._exports,
    ..._exports$1
  ];
  async function onEvent(event, previous) {
    const path = window.location.pathname;
    const hash2 = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const tasks = [];
    for (const hook of hooks) {
      if (hook.event === event && hook.filter(path, params, hash2)) {
        tasks.push(async () => {
          try {
            await hook.handler(previous);
          } catch (err) {
            console.error(`[hook:${hook.id}] handler failed:`, err);
          }
        });
      }
    }
    if (tasks.length > 0) {
      await Promise.allSettled(tasks.map((task) => task()));
    }
  }
  async function onUrlChange(previous) {
    return await onEvent("onUrlChange", previous);
  }
  async function onHashChange(previous) {
    return await onEvent("onHashChange", previous);
  }
  async function onLoad() {
    return await onEvent("load");
  }
  async function onEnter() {
    return await onEvent("enter");
  }
  const name = "fanqie-assistant";
  const version = "0.1.0";
  const PANEL_ID = "fqa-control-panel";
  const POPOVER_ID = "fqa-control-popover";
  const SIDEBAR_ID = "fqa-control-sidebar";
  const STYLE_ID = "fqa-control-styles";
  let mode = GM_getValue("fqa.panel.mode", "popover");
  let mounted = false;
  let countdownTimer = null;
  let refreshTimer = null;
  const unsubs = [];
  function mountPanel() {
    if (mounted) return;
    mounted = true;
    injectStyles();
    const button = document.createElement("button");
    button.id = PANEL_ID;
    button.className = "fqa-control-trigger";
    button.title = "番茄助手控制面板";
    button.textContent = "⚙️";
    button.addEventListener("click", toggleMode);
    document.body.appendChild(button);
    unsubs.push(subscribe(scheduleRefresh));
    unsubs.push(subscribe$1(scheduleRefresh));
    info("panel", `控制面板已挂载（模式: ${mode}）`);
  }
  function toggleMode() {
    var _a, _b;
    if (mode === "popover") {
      const existing = document.getElementById(POPOVER_ID);
      if (existing) {
        existing.remove();
        stopCountdown();
        return;
      }
      (_a = document.getElementById(SIDEBAR_ID)) == null ? void 0 : _a.remove();
      renderPopover();
      startCountdown();
      mode = "popover";
    } else {
      mode = "popover";
      GM_setValue("fqa.panel.mode", mode);
      (_b = document.getElementById(SIDEBAR_ID)) == null ? void 0 : _b.remove();
      renderPopover();
      startCountdown();
    }
  }
  function switchToSidebar() {
    var _a;
    mode = "sidebar";
    GM_setValue("fqa.panel.mode", mode);
    (_a = document.getElementById(POPOVER_ID)) == null ? void 0 : _a.remove();
    stopCountdown();
    renderSidebar();
  }
  function renderPopover() {
    const pop = document.createElement("div");
    pop.id = POPOVER_ID;
    pop.className = "fqa-control-popover";
    pop.innerHTML = buildHTML(true);
    document.body.appendChild(pop);
    bindActions(pop);
    setTimeout(() => {
      document.addEventListener("click", onDocClickClosePopover);
    }, 0);
  }
  function renderSidebar() {
    const sb = document.createElement("div");
    sb.id = SIDEBAR_ID;
    sb.className = "fqa-control-sidebar";
    sb.innerHTML = buildHTML(false);
    document.body.appendChild(sb);
    bindActions(sb);
  }
  function onDocClickClosePopover(ev) {
    var _a;
    const pop = document.getElementById(POPOVER_ID);
    if (!pop) {
      document.removeEventListener("click", onDocClickClosePopover);
      return;
    }
    const target = ev.target;
    if (pop.contains(target)) return;
    if (((_a = ev.target) == null ? void 0 : _a.id) === PANEL_ID) return;
    pop.remove();
    stopCountdown();
    document.removeEventListener("click", onDocClickClosePopover);
  }
  function startCountdown() {
    if (countdownTimer) return;
    countdownTimer = setInterval(() => {
      const el = document.querySelector(".fqa-throttle-countdown");
      if (el) {
        const s = getCountdownSeconds();
        el.textContent = s > 0 ? `${s}s` : "就绪";
      }
    }, 1e3);
  }
  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }
  function scheduleRefresh() {
    if (refreshTimer) return;
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      refreshContent();
    }, 100);
  }
  function refreshContent() {
    const pop = document.getElementById(POPOVER_ID);
    const sb = document.getElementById(SIDEBAR_ID);
    if (!pop && !sb) return;
    const target = pop ?? sb;
    if (!target) return;
    const newHTML = buildHTML(Boolean(pop));
    target.innerHTML = newHTML;
    bindActions(target);
  }
  function buildHTML(isPopover) {
    var _a, _b;
    const poolState = getPoolState();
    const throttleCfg = getThrottleConfig();
    const countdown = getCountdownSeconds();
    const logs = getLog().slice(-30).reverse();
    return `
        <div class="fqa-panel-header">
            <span class="fqa-panel-title">🍅 番茄助手 控制面板</span>
            <div class="fqa-panel-mode-switch">
                ${isPopover ? '<button data-act="to_sidebar" title="固定为侧栏">⮮</button>' : '<button data-act="to_popover" title="切回浮窗">⮯</button>'}
                <button data-act="help" title="帮助">?</button>
            </div>
        </div>

        <section class="fqa-panel-section">
            <h3>📊 状态</h3>
            <div class="fqa-panel-grid">
                <div>当前设备</div>
                <div class="fqa-mono">${((_b = (_a = poolState.slots[poolState.activeIndex]) == null ? void 0 : _a.device_id) == null ? void 0 : _b.slice(-6)) ?? "—"}</div>
                <div>节流倒计时</div>
                <div><span class="fqa-throttle-countdown fqa-mono">${countdown > 0 ? `${countdown}s` : "就绪"}</span></div>
                <div>池子容量</div>
                <div>${poolState.slots.length} / 3 槽</div>
                <div>健康</div>
                <div>${poolState.slots.filter((s) => s.health === "healthy").length} 健康</div>
            </div>
        </section>

        <section class="fqa-panel-section">
            <h3>📱 设备池</h3>
            <div class="fqa-pool-list">
                ${renderPoolList(poolState)}
            </div>
            <div class="fqa-panel-actions">
                <button data-act="reset_pool" class="fqa-danger-btn">⚠ 重置整个池子</button>
            </div>
        </section>

        <section class="fqa-panel-section">
            <h3>📌 已 Pin 的书</h3>
            <div class="fqa-pin-list" id="fqa-pin-list">
                <div class="fqa-pin-loading">加载中…</div>
            </div>
        </section>

        <section class="fqa-panel-section">
            <h3>⏱ 节流</h3>
            <label><input type="checkbox" data-cfg="throttle.enabled" ${throttleCfg.enabled ? "checked" : ""}> 启用</label>
            <div class="fqa-panel-grid">
                <div>最小 (秒)</div>
                <input type="number" min="0" max="60" data-cfg="throttle.minSec" value="${Math.floor(throttleCfg.minMs / 1e3)}">
                <div>最大 (秒)</div>
                <input type="number" min="5" max="180" data-cfg="throttle.maxSec" value="${Math.floor(throttleCfg.maxMs / 1e3)}">
            </div>
            <button data-act="reset_throttle" class="fqa-small-btn">重置节流计时</button>
        </section>

        <section class="fqa-panel-section">
            <h3>📋 诊断日志 <span class="fqa-panel-sub">(${getLog().length}/200)</span></h3>
            <div class="fqa-log-list">
                ${renderLogs(logs)}
            </div>
            <div class="fqa-panel-actions">
                <button data-act="copy_log" class="fqa-small-btn">复制全部日志</button>
                <button data-act="clear_log" class="fqa-small-btn">清空日志</button>
            </div>
        </section>
    `;
  }
  function renderPoolList(state2) {
    if (state2.slots.length === 0) {
      return '<div class="fqa-pool-empty">池子为空。请刷新页面重新注册。</div>';
    }
    return state2.slots.map((slot) => {
      var _a;
      const isActive = state2.slots.indexOf(slot) === state2.activeIndex;
      const healthBadge = slot.health === "healthy" ? '<span class="fqa-badge healthy">健康</span>' : '<span class="fqa-badge dead">已封</span>';
      const activeBadge = isActive ? '<span class="fqa-badge active">当前</span>' : "";
      const cooldownRemain = slot.refillCooldownUntil > Date.now() ? `<div class="fqa-pool-cooldown">冷却 ${Math.ceil((slot.refillCooldownUntil - Date.now()) / 1e3 / 60)} 分钟</div>` : "";
      return `
            <div class="fqa-pool-item">
                <div class="fqa-pool-item-head">
                    <span class="fqa-pool-item-idx">槽 ${state2.slots.indexOf(slot)}</span>
                    ${healthBadge} ${activeBadge}
                    <span class="fqa-mono fqa-pool-item-id">...${((_a = slot.device_id) == null ? void 0 : _a.slice(-6)) ?? "—"}</span>
                </div>
                <div class="fqa-pool-item-meta">
                    注册 ${formatRelative(slot.registeredAt)} · 失败 ${slot.failureStreak} 连
                </div>
                ${cooldownRemain}
                <div class="fqa-pool-item-actions">
                    ${!isActive && slot.health === "healthy" ? `<button data-act="manual_switch" data-slot="${state2.slots.indexOf(slot)}" class="fqa-small-btn">切到此槽</button>` : ""}
                    ${slot.health === "dead" ? `<button data-act="manual_refill" data-slot="${state2.slots.indexOf(slot)}" class="fqa-small-btn">补新设备</button>` : ""}
                </div>
            </div>
        `;
    }).join("");
  }
  async function renderPinnedAsync() {
    try {
      const list = await listPinnedBooks();
      const el = document.getElementById("fqa-pin-list");
      if (!el) return;
      if (list.length === 0) {
        el.innerHTML = '<div class="fqa-pin-empty">尚未 pin 任何书。阅读时顶栏会有 pin 按钮。</div>';
        return;
      }
      el.innerHTML = list.map((b) => renderPinItem(b)).join("");
    } catch (e) {
      warn("panel", "Pin 列表加载失败", { error: String(e) });
    }
  }
  function renderPinItem(b) {
    const sizeKb = (b.totalBytes / 1024).toFixed(1);
    const progress = b.lastReadIndex > 0 ? `<div class="fqa-pin-progress">📖 读至第 ${b.lastReadIndex + 1} 章</div>` : "";
    return `
        <div class="fqa-pin-item">
            <div class="fqa-pin-item-head">
                <span class="fqa-pin-item-name">${escapeHtml(b.bookName)}</span>
                <button data-act="unpin" data-book="${b.id}" class="fqa-danger-btn">删除</button>
            </div>
            <div class="fqa-pin-item-meta">
                ${b.chapterCount} 章 · ${sizeKb} KB · pin 于 ${formatRelative(b.pinnedAt)}
            </div>
            ${progress}
        </div>
    `;
  }
  function renderLogs(logs) {
    if (logs.length === 0) {
      return '<div class="fqa-log-empty">暂无日志</div>';
    }
    return logs.map((e) => {
      const t = new Date(e.ts).toISOString().slice(11, 19);
      return `<div class="fqa-log-entry fqa-log-${e.level}">[${t}] [${e.category}] ${escapeHtml(e.message)}</div>`;
    }).join("");
  }
  function bindActions(root) {
    root.addEventListener("click", (ev) => {
      const target = ev.target;
      const act = target.dataset.act;
      if (!act) return;
      ev.stopPropagation();
      switch (act) {
        case "to_sidebar":
          switchToSidebar();
          break;
        case "to_popover":
          toggleMode();
          break;
        case "help":
          showHelp();
          break;
        case "manual_switch":
          handleManualSwitch(parseInt(target.dataset.slot ?? "-1", 10));
          break;
        case "manual_refill":
          handleManualRefill(parseInt(target.dataset.slot ?? "-1", 10));
          break;
        case "reset_pool":
          handleResetPool();
          break;
        case "reset_throttle":
          resetThrottle();
          scheduleRefresh();
          break;
        case "copy_log":
          copyLogToClipboard();
          break;
        case "clear_log":
          if (confirm("确认清空所有诊断日志？")) {
            clearLog();
            scheduleRefresh();
          }
          break;
        case "unpin":
          handleUnpin(target.dataset.book ?? "");
          break;
      }
    });
    root.querySelectorAll("[data-cfg]").forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.dataset.cfg ?? "";
        if (key === "throttle.enabled") {
          setThrottleConfig({ enabled: input.checked });
        } else if (key === "throttle.minSec") {
          setThrottleConfig({ minMs: Math.max(0, parseInt(input.value, 10)) * 1e3 });
        } else if (key === "throttle.maxSec") {
          setThrottleConfig({ maxMs: Math.max(5, parseInt(input.value, 10)) * 1e3 });
        }
      });
    });
    void renderPinnedAsync();
  }
  function handleManualSwitch(slotIdx) {
    if (slotIdx < 0) return;
    const r = manualSwitch(slotIdx);
    if (!r.ok) {
      alert(`切换失败: ${r.reason}`);
      return;
    }
    scheduleRefresh();
  }
  async function handleManualRefill(slotIdx) {
    if (slotIdx < 0) return;
    const btn = document.querySelector(
      `button[data-act="manual_refill"][data-slot="${slotIdx}"]`
    );
    if (btn) {
      btn.disabled = true;
      btn.textContent = "注册中…";
    }
    const r = await manualRefill(slotIdx);
    if (!r.ok) {
      alert(`补员失败: ${r.reason}`);
      if (btn) {
        btn.disabled = false;
        btn.textContent = "补新设备";
      }
      return;
    }
    scheduleRefresh();
  }
  async function handleResetPool() {
    if (!confirm("重置整个池子会清空所有 3 个设备 ID 并重新注册。继续？")) return;
    info("panel", "用户触发：重置整个池子");
    await resetPool();
    scheduleRefresh();
  }
  async function handleUnpin(bookId2) {
    if (!bookId2) return;
    if (!confirm("确认删除这本书的缓存？")) return;
    await unpinBook(bookId2);
    scheduleRefresh();
  }
  function copyLogToClipboard() {
    var _a;
    const text = exportLogText();
    if ((_a = navigator.clipboard) == null ? void 0 : _a.writeText) {
      navigator.clipboard.writeText(text).then(
        () => info("panel", "日志已复制"),
        (e) => warn("panel", "复制失败", { error: String(e) })
      );
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
      }
      ta.remove();
    }
  }
  function showHelp() {
    alert(`🍅 番茄助手 控制面板 帮助

【设备池】
- 默认 3 个槽位，注册后会同时持有
- 某个被服务端封禁时，自动切换到下一个
- "补新设备"按钮手动注册替换 dead 槽（24h 冷却）

【节流】
- 5-25 秒随机间隔，避免请求模式被识别
- 偶发 30-90 秒长停顿，模拟真人阅读节奏

【Pin】
- 阅读器顶栏会有 📌 按钮
- 持久化保存整本书，可离线翻阅
- 最多 50 本 / 本最多 5000 章

【诊断日志】
- 最近 200 条（环形缓冲）
- 失败时会自动展开
- 可复制粘贴到工单/issue
`);
  }
  function formatRelative(ts) {
    if (!ts) return "—";
    const diff = Date.now() - ts;
    if (diff < 6e4) return "刚刚";
    if (diff < 36e5) return `${Math.floor(diff / 6e4)} 分钟前`;
    if (diff < 864e5) return `${Math.floor(diff / 36e5)} 小时前`;
    return `${Math.floor(diff / 864e5)} 天前`;
  }
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        #${PANEL_ID} {
            position: fixed; bottom: 20px; right: 20px; z-index: 999998;
            width: 40px; height: 40px; border-radius: 50%;
            background: #ff6b35; color: #fff; border: none; cursor: pointer;
            font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform .2s;
        }
        #${PANEL_ID}:hover { transform: scale(1.1); }
        .fqa-control-popover {
            position: fixed; bottom: 70px; right: 20px; z-index: 999999;
            width: 380px; max-height: 80vh; overflow-y: auto;
            background: #1f1f1f; color: #eee; border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4); padding: 0;
            font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 13px; line-height: 1.5;
        }
        .fqa-control-sidebar {
            position: fixed; top: 0; right: 0; bottom: 0; width: 320px; z-index: 999999;
            background: #1f1f1f; color: #eee;
            box-shadow: -4px 0 16px rgba(0,0,0,0.3);
            overflow-y: auto; padding: 16px;
            font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 13px; line-height: 1.5;
        }
        .fqa-panel-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 16px; border-bottom: 1px solid #333;
        }
        .fqa-panel-title { font-weight: 600; font-size: 14px; }
        .fqa-panel-mode-switch button {
            background: transparent; color: #aaa; border: 1px solid #444;
            padding: 2px 8px; border-radius: 4px; margin-left: 4px; cursor: pointer;
        }
        .fqa-panel-mode-switch button:hover { background: #333; }
        .fqa-panel-section {
            padding: 12px 16px; border-bottom: 1px solid #2a2a2a;
        }
        .fqa-panel-section h3 { margin: 0 0 8px; font-size: 13px; color: #ff9d5c; }
        .fqa-panel-sub { color: #888; font-size: 11px; font-weight: normal; }
        .fqa-panel-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px;
        }
        .fqa-panel-grid > div:nth-child(odd) { color: #aaa; }
        .fqa-mono { font-family: "SF Mono", Consolas, monospace; }
        .fqa-pool-item {
            background: #2a2a2a; border-radius: 6px; padding: 8px 10px;
            margin-bottom: 6px;
        }
        .fqa-pool-item-head {
            display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
        }
        .fqa-pool-item-idx { color: #ff9d5c; font-weight: 600; }
        .fqa-badge {
            font-size: 10px; padding: 1px 6px; border-radius: 3px; font-weight: 600;
        }
        .fqa-badge.healthy { background: #2d6a4f; color: #d8f3dc; }
        .fqa-badge.dead { background: #9d0208; color: #ffcdd2; }
        .fqa-badge.active { background: #ff6b35; color: #fff; }
        .fqa-pool-item-id { color: #888; font-size: 11px; margin-left: auto; }
        .fqa-pool-item-meta { color: #888; font-size: 11px; margin: 2px 0; }
        .fqa-pool-cooldown { color: #f4a261; font-size: 11px; }
        .fqa-pool-item-actions { margin-top: 6px; display: flex; gap: 4px; }
        .fqa-small-btn, .fqa-danger-btn {
            background: #444; color: #fff; border: none; padding: 4px 10px;
            border-radius: 4px; cursor: pointer; font-size: 12px;
        }
        .fqa-small-btn:hover { background: #555; }
        .fqa-danger-btn { background: #6a040f; }
        .fqa-danger-btn:hover { background: #9d0208; }
        .fqa-pin-item {
            background: #2a2a2a; border-radius: 6px; padding: 8px 10px; margin-bottom: 6px;
        }
        .fqa-pin-item-head {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;
        }
        .fqa-pin-item-name { font-weight: 600; }
        .fqa-pin-item-meta { color: #888; font-size: 11px; }
        .fqa-pin-progress { color: #ff9d5c; font-size: 11px; margin-top: 4px; }
        .fqa-pin-empty, .fqa-pin-loading, .fqa-pool-empty, .fqa-log-empty {
            color: #888; font-size: 12px; font-style: italic; padding: 8px 0;
        }
        .fqa-log-list {
            max-height: 200px; overflow-y: auto;
            background: #0d0d0d; border-radius: 4px; padding: 6px 8px;
        }
        .fqa-log-entry {
            font-family: "SF Mono", Consolas, monospace; font-size: 11px;
            padding: 2px 0; border-bottom: 1px solid #1a1a1a;
            word-break: break-word;
        }
        .fqa-log-entry:last-child { border-bottom: none; }
        .fqa-log-error { color: #ff6b6b; }
        .fqa-log-warn { color: #f4a261; }
        .fqa-log-info { color: #87ceeb; }
        .fqa-log-debug { color: #888; }
        .fqa-panel-actions { margin-top: 8px; display: flex; gap: 6px; }
        .fqa-throttle-countdown { color: #5eead4; font-weight: 600; }
        input[type="checkbox"] { margin-right: 4px; }
        input[type="number"] {
            background: #2a2a2a; color: #fff; border: 1px solid #444;
            padding: 2px 6px; border-radius: 3px; width: 100%; box-sizing: border-box;
        }
    `;
    document.head.appendChild(style);
  }
  if (document.body) {
    mountPanel();
  } else {
    document.addEventListener("DOMContentLoaded", mountPanel, { once: true });
  }
  const win = unsafeWindow;
  let previousUrl = win.location.href;
  let previousHash = win.location.hash;
  function installNavigationHooks() {
    for (const method of ["pushState", "replaceState"]) {
      const original = win.history[method];
      win.history[method] = function(...args) {
        const result = original.apply(this, args);
        void onUrlChange(previousUrl);
        previousUrl = win.location.href;
        return result;
      };
    }
    win.addEventListener("popstate", () => {
      void onUrlChange(previousUrl);
      previousUrl = win.location.href;
    });
    win.addEventListener("hashchange", () => {
      void onHashChange(previousHash);
      previousHash = win.location.hash;
    });
  }
  async function mainInit() {
    initLogger();
    console.log(`================================================`);
    console.log(`==  ${name} - ${version}                       ==`);
    console.log(`==  L1-L6 反封禁 + 设备池 + Pin              ==`);
    console.log(`================================================`);
    info("main", `${name} ${version} 启动`);
    installNavigationHooks();
    void onEnter();
    initFontDecrypt();
    void inject();
    initUserStyle();
    mountPanel();
    mountRecoveryUI();
    await Promise.allSettled([
      initCache().catch((e) => console.error("[fqa:main] initCache failed:", e)),
      initPool().catch((e) => console.error("[fqa:main] initPool failed:", e))
    ]);
    void onLoad();
    info("main", "主流程初始化完成");
  }
  mainInit();

})(Vue, moment);