# Edge 5 分钟验收手册（v0.1.2 自动恢复）

**目标**：在真实 Edge 浏览器跑一次 v0.1.2 端到端，验证设备池全 dead 时 5min 自动恢复 + 完整正文 ≥1500 字

---

## Step 1：装 v0.1.2（30 秒）

1. Edge Tampermonkey 仪表盘删除旧 `fanqie-assistant-v0.1.1.user.js`
2. 浏览器打开 https://github.com/qianbkk/fanqie-novel-bypass/releases/tag/v0.1.2
3. 下载 `fanqie-assistant-v0.1.2.user.js`（277.99 KB）
4. 拖到 TM 仪表盘 → 弹出安装页 → 点 **安装**（替换 v0.1.1）

**验收标准**：
- TM 仪表盘显示 v0.1.2 已装
- 文件大小 277.99 KB
- SHA256 = `5C30D92247BCA029D37A52ACC5C4423EB526819CCF016819A42B99900C991414`

---

## Step 2：打开章节页（10 秒）

Edge 地址栏输入：

```
https://fanqienovel.com/reader/7445246192578986520
```

（第 190 章「天象！」，实测 3401 字）

**预期页面状态**（设备池全 dead）：
- 顶部：「⚠ 阅读遇到问题 / 所有 1 个设备都已 dead」
- 弹窗顶部蓝色「🤖 自动恢复已启用」区块
- 倒计时秒数（从 300 开始 -1 倒数）
- 「取消自动重置」按钮
- 「立即重试 / 切换设备 / 10s/30s/60s/120s 后重试 / 查看诊断 / ⚠ 重置整个池子 / 放弃本次」按钮
- 底部诊断日志展开（自动展开，能看到 `[pool] 槽 0 已标记 dead device_id=...`）

**验收标准**：
- 弹窗可见
- 倒计时秒数每秒 -1
- 蓝色「🤖 自动恢复已启用」标题可见

---

## Step 3：DevTools Console 验证（10 秒）

按 **F12** 打开 DevTools，切到 **Console**。

在 console 粘贴这一行（一次性全选复制）：

```js
(async()=>{const t0=performance.now();const d=await fetch('https://i.snssdk.com/service/2/device_register/?tt_data=a',{method:'POST',credentials:'omit'});const j=await d.json();console.log('[test] device_register HTTP='+d.status+' in '+(performance.now()-t0).toFixed(0)+'ms',j);return j;})()
```

**注意**：此调用通过 Edge DevTools Console 走 page-world fetch，会触发 CORS preflight 而失败（snssdk 不响应 preflight）。**这是预期的**——user.js 走 TM 的 GM_xmlhttpRequest 才能绕过 CORS。

实际验证脚本：在 console eval user.js 已加载的关键 API：

```js
(()=>{
  const checks = {
    'fqa-recovery-modal': !!document.getElementById('fqa-recovery-modal'),
    'fqa-recovery-auto-reset': !!document.getElementById('fqa-recovery-auto-reset'),
    'fqa-auto-reset-countdown': !!document.getElementById('fqa-auto-reset-countdown'),
    'fqa-control-panel': !!document.getElementById('fqa-control-panel'),
    'auto-recovery 计划': !!GM_getValue('fqa.auto_reset_plan.v1'),
    'last auto-reset': GM_getValue('fqa.last_auto_reset.v1') ?? '从未自动 reset',
  };
  console.table(checks);
  return checks;
})()
```

**验收标准**：
- `fqa-recovery-modal`: True（弹窗已挂载）
- `fqa-recovery-auto-reset`: True（自动恢复区块已渲染）
- `fqa-auto-reset-countdown`: True（倒计时元素存在）
- `fqa-control-panel`: True（⚙️ 按钮已挂载）
- `auto-recovery 计划`: True（5min 倒计时已调度）
- `last auto-reset`: "从未自动 reset" 或 24h 之前的时间戳

---

## Step 4：等 5 分钟（5 分钟）

什么都不做。等 5 分钟。

**5 分钟内观察**：
- 倒计时秒数每秒 -1，到 0 后页面自动 reload
- reload 后页面顶部 flash 一次（new device registration）
- reload 后页面正文区域应该是完整的章节正文（≥1500 字）

**注意**：reload 期间页面会短暂空白（user.js 重新初始化），大约 5-15 秒后恢复正常。

---

## Step 5：验收（30 秒）

页面恢复正常后做 3 项检查：

### 检查 A：当前章节正文长度

DevTools Console 粘贴：

```js
(()=>{
  const reader = document.querySelector('.muye-reader-content') || document.querySelector('#fqa-reader-content') || document.body;
  const text = reader.innerText || reader.textContent;
  console.log('['+'当前章节'+'] 字数:', text.length);
  console.log('['+'前 100 字'+']:', text.substring(0, 100));
  console.log('['+'后 100 字'+']:', text.substring(text.length-100));
  return text.length;
})()
```

**验收标准**：
- 字数 ≥ 1500
- 前 100 字是中文（不是 font-face 字符）
- 后 100 字是中文（章节末段）

### 检查 B：设备池状态

DevTools Console 粘贴：

```js
(()=>{
  const pool = JSON.parse(GM_getValue('fqa.device_pool.v1') || '{}');
  console.table(pool);
  return pool;
})()
```

**验收标准**：
- `slots.length === 3`
- 至少 1 个 `health === 'healthy'`
- `activeIndex === 0`

### 检查 C：跳到靠后章节

Edge 地址栏输入：

```
https://fanqienovel.com/reader/7503749943413195288
```

（第 500 章）

```js
(()=>{
  const reader = document.querySelector('.muye-reader-content') || document.querySelector('#fqa-reader-content') || document.body;
  const text = reader.innerText || reader.textContent;
  console.log('[第 500 章] 字数:', text.length);
  return text.length;
})()
```

**验收标准**：
- 字数 ≥ 1500（跟 190 章一样的完整正文）

### 检查 D：跳到大结局

Edge 地址栏输入：

```
https://fanqienovel.com/reader/7593942749645111832
```

（第 981 章「大结局」）

**验收标准**：
- 字数 ≥ 1500

---

## 🎉 验收通过 = Goal 完成

如果 Step 5 全部 4 项检查通过：
- Goal 已达成：真实 Edge 浏览器 + 任意章节 + 完整正文
- 长期稳定：v0.1.2 auto-recovery 5min 兜底 + 24h 节流防风控
- v0.0.6 上游 fallback 备胎以防万一

---

## ❌ 验收失败的 troubleshoot

### 5min 倒计时没出现

- 检查 TM 是否真装了 v0.1.2（不是 v0.1.1）
- DevTools Console: `GM_getValue('fqa.auto_reset_plan.v1')` — 应该有值
- 如果 null：检查 `fqa.device_pool.v1` 里所有 slot `health === 'dead'`？

```js
JSON.parse(GM_getValue('fqa.device_pool.v1') || '{}').slots?.map(s => ({ idx: s.index ?? s.device_id, health: s.health, failStreak: s.failureStreak }))
```

### 5min 后没 reload

- DevTools Console: 检查 `[pool]` 日志
- 看 `fqa.last_auto_reset.v1` 时间戳 — 如果没变说明 reset 没触发

### reload 后还是 135 字

- Network 标签页 filter `i.snssdk.com` 看是否有 device_register 200 响应
- 如果没有 → user.js 可能没生效 → 重装 TM
- 如果有但还是 135 字 → 新设备也被风控 → 等下一次 5min reset

### 验证 24h 节流

如果第二次触发 auto-recovery 没工作：

```js
GM_getValue('fqa.last_auto_reset.v1')
```

显示时间戳。如果距离现在 < 24h，说明节流生效（这是正常的，避免 snssdk 风控）。

---

## 📊 完成后反馈给我

如果验收通过，告诉我「v0.1.2 验收通过」，我会 update_goal "complete" 并归档本 Goal。

如果有问题，把 DevTools Console 截图 + 错误日志发给我，我继续 troubleshoot。