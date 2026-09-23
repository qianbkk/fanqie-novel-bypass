# 用户在真 Edge 自测 v0.1.1 全文阅读指南

**目标**：在你的真实 Edge 浏览器 + 真 Tampermonkey 上，验证装回 `fanqie-assistant-v0.1.1.user.js` 后能读到任意章节完整正文。

预计耗时：**3 分钟**。

---

## 前置条件

1. **Edge 浏览器**（你日常用的）
2. **Tampermonkey 扩展已装**（之前已装，扩展 ID `iikmkjmpaadaobahmlepeloendndfphd` v5.5.0）
3. **未登录态**（不要登录番茄小说账号，避免 fanqienovel.com 自带登录态直接渲染完整正文干扰判断）

---

## Step 1：装回 v0.1.1.user.js（30 秒）

打开这个 URL（Edge 会触发 TM 自动安装弹窗）：
https://github.com/qianbkk/fanqie-novel-bypass/releases/download/v0.1.0/fanqie-assistant-v0.1.1.user.js

TM 弹窗里直接点 **"安装"**。

> **如果 TM 没自动弹出**：Edge 地址栏输入 `edge://extensions`，确认 Tampermonkey 已启用。然后把上面 user.js URL 拖到 Edge 窗口里，会弹出 TM 安装对话框。

## Step 2：确认脚本生效（10 秒）

打开任意番茄小说**章节页**，例如：
https://fanqienovel.com/reader/7445246192578986520

**右下角应该看到 ⚙️ 橙色圆形按钮**。鼠标悬停 → 弹出浮动控制面板。

如果没看到 ⚙️ 按钮 → 按 F12 打开 DevTools → Console → 看有没有红色错误，把错误截图给我。

## Step 3：验证完整正文已注入（10 秒）

页面打开几秒后（约 5-10s，user.js 在调 snssdk 老接口解密），正文容器会从 151 字试读段变成 **完整正文**（通常 1500-5000 字）。

**怎么确认是真完整正文不是试读**：

方法 A：**看正文长度**。把鼠标移到正文末尾，按 Ctrl+End 跳到底。如果章节最后一段有完整结尾（例如"……抉择之地，李青山缓缓睁开双眼……"），就是完整正文。

方法 B：**对比"本章字数"**。页面顶上显示"本章字数：3401字"，正文容器字数应该接近这个数。

方法 C：**手动算字**。F12 → Console → 输入：
```js
document.querySelector('div.muye-reader-content:not(.fqa)').innerText.length
```
回车 → 输出数字。**≥1500 说明完整正文已注入**。

## Step 4：翻到靠后章节，重复 Step 2-3（2 分钟）

随便点章节列表里的**第 100 章 / 第 200 章 / 第 500 章**，每章都按 Step 3 方法 C 验证 ≥1500 字。

如果每章都 ≥1500 字 → **v0.1.1 装回后能长期读番茄小说任意章节完整正文，Goal 达成**。

---

## 如果失败怎么办

1. **页面没显示 ⚙️ 按钮** → TM 没装回。回到 Step 1 重装。
2. **⚙️ 按钮有但正文还是 151 字试读** → F12 Console 看错误，截图给我。常见问题：
   - `[fqa:pool] 首槽注册失败` → snssdk 服务器暂时不可用，等 1 分钟刷新
   - `net::ERR_FAILED` → 网络问题
3. **正文注入后乱码** → font-face 自定义字符集不生效，但 innerText.length 还是 ≥1500（乱码不影响字数）

---

## v0.1.1 工作机制（你不需要懂，背景）

```
用户打开 fanqienovel.com/reader/<id>
  ↓
user.js @run-at document-start 注入 GM_xmlhttpRequest 等 API
  ↓
mainInit() 调 initPool() → registerDevice (snssdk 老接口)
  ↓ 拿到 device_id + AES-128 session key
mainInit() 调 initCache() + onLoad() → insertContent() → getChapter(itemId)
  ↓ getChapter 调 signRequest (SM3 签名) → fetch /reader/full/v (snssdk 老 API)
  ↓ 拿到加密响应 → AES-CBC 解密 → 完整正文 HTML
  ↓ DOM 注入: querySelector('div.muye-reader-content:not(.fqa)').appendChild(完整正文)
  ↓ 151 字试读段 → 3401 字完整正文
```

整条链路**已在 headless Chrome 真实 snssdk 服务器验证通过**：3401 字解密成功（详见 `E2E-SNSSDK-VERIFICATION.md`）。

---

## 我已经做完的（你不需要做）

1. ✅ HEAD `896073b` = v0.1.1 源码（撤回了 v0.2.x 错误 commit `3998f6a` + `201586a`）
2. ✅ `release/fanqie-assistant-v0.1.1.user.js` 已构建并发布到 GitHub Release v0.1.0
3. ✅ SHA256 一致性：release 二进制 = HEAD build
4. ✅ user.js v0.1.1 完整 API 链路（registerDevice → registerKey → signRequest → fetch → decryptChapter → 3401 字）在真实 snssdk 服务器端到端验证通过

**剩下唯一手动步骤**：把 `fanqie-assistant-v0.1.1.user.js` 装回 TM。这个步骤需要用户在 Edge 浏览器里点一次"安装"，无法 100% 自动化（Edge + TM 没暴露脚本注册 API）。