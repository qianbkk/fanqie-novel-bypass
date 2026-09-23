# v0.1.4 Edge 升级 + 长期稳定性验收手册

> **背景**：v0.1.2 在你的真实 Edge 跑了之后报 `Failed to execute 'importKey' on 'SubtleCrypto': Key data must be a BufferSource for non-JWK formats`，导致章节解密失败、章节字数=0。v0.1.3 漏修了 4 处 importKey 调用点，v0.1.4 完整修复 7 处。Chrome 沙箱 e2e 端到端测试通过 (`bodyTextLen=1296` + `"天象宫..."` 章节正文)。
>
> **目标**：在真实 Edge 完成端到端验收，确认 Goal 完成。

---

## 一、Edge 升级步骤（5 分钟）

### 1.1 下载 v0.1.4 release 文件

- 直接 URL：https://github.com/qianbkk/fanqie-novel-bypass/releases/download/v0.1.4/fanqie-assistant-v0.1.4.user.js
- 或访问 release 页：https://github.com/qianbkk/fanqie-novel-bypass/releases/tag/v0.1.4
- 或用本地文件：`D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\release\fanqie-assistant-v0.1.4.user.js`
- 文件大小：278,679 字节
- SHA256：`CE7511A81BD16E138659EF2EE8B3DA9FA517F4CB53FE227E665D198C8E514026`（可对比验证）

### 1.2 在 TM 里替换脚本

1. 打开 Edge → 地址栏 `edge://extensions/`
2. 找到 "Tampermonkey" → 点 "详细信息"
3. 找到 "fanqie-assistant" 用户脚本 → 点 "编辑" 按钮
4. **全选**（Ctrl+A）→ **删除**所有内容
5. 打开下载的 `fanqie-assistant-v0.1.4.user.js` → 全选复制
6. 粘贴到 TM 编辑器 → Ctrl+S 保存
7. 编辑器顶部应该显示 `fanqie-assistant 0.1.4`

### 1.3 强制刷新

- 跳到任意章节页：`https://fanqienovel.com/reader/<item_id>`
- 按 Ctrl+F5 强制刷新（绕过缓存）
- 控制台日志（按 F12 → Console）应看到：
  ```
  [fqa:main] fanqie-assistant 0.1.4 启动
  [fqa:pool] 池子为空，开始首次注册
  ```

---

## 二、验证流程

### 2.1 重置设备池

v0.1.4 默认会**自动检测全 dead 并触发 5 分钟恢复**，但首次升级建议手动重置让新设备注册：

1. **右下角**找到 ⚙️ 浮动按钮 → 点击
3. 浮动 popover 出现「设备池」section → 看到当前设备状态（应该是 dead 红色）
4. 点击红色 **「⚠ 重置整个池子」** 按钮
5. Edge 原生 confirm() 弹出 → **按 Enter**
6. 页面自动 reload
7. 等 5-10 秒看 3 个新设备是否注册成功

### 2.2 跳章节验证（核心 Goal）

按顺序访问以下章节 URL（**bookId = 7415383954984815641**）：

| 章节 | URL |
|------|-----|
| 第 100 章 | `https://fanqienovel.com/reader/7431911046148801086` |
| 第 190 章 | `https://fanqienovel.com/reader/7445246192578986520` |
| 第 500 章 | `https://fanqienovel.com/reader/7503749943413195288` |
| 第 981 章 | `https://fanqienovel.com/reader/7593942749645111832` |

**每章验证清单**：
- [ ] 页面正文显示 **≥1500 字**（页面下拉到中下部查看）
- [ ] 右下角控制面板「健康」指示为绿色
- [ ] F12 Console **无 BufferSource 错误**
- [ ] 章节连续点击下一章/上一章正常工作

### 2.3 长期稳定性观察（Goal 验证关键）

完成 2.1+2.2 后，**保持 Edge 不关闭**：

- 连续阅读 1-2 小时
- 每 5 分钟跳一个章节验证
- 观察设备池健康度：右下角 ⚙️ → 看「设备池」section 是否所有槽位都是 healthy

**预期**：v0.1.4 修复了 BufferSource，设备池不会再因为 BufferSource 卡死。如果 snssdk 因 IP 风控自动切设备，会走 v0.1.1 的"不自残"逻辑 + v0.1.2 的 5min auto-recovery。

---

## 三、出问题怎么办

### 3.1 BufferSource 错误还在？

```
Failed to execute 'importKey' on 'SubtleCrypto':
Key data must be a BufferSource for non-JWK formats
```

**诊断**：
1. F12 → Console → 找 `[fqa:crypto]` / `[fqa:api]` 日志，确认出错函数
2. 截图发我看

**原因**：v0.1.4 应该完整修复，如果还有说明有未覆盖的 importKey 调用路径。

### 3.2 章节字数仍为 0 / "加载失败"

**诊断**：
1. 右下角 ⚙️ → 浮动 popover → 设备池健康度
2. 看诊断日志（点 popover 底部「📋 诊断日志」）
3. 看是否有 `Failed to get key info` / `Failed to decrypt chapter` 等
4. 截图发我看

### 3.3 设备池全 dead 反复出现

v0.1.2 的 5min auto-recovery 会触发，等 5 分钟自动 reset。如果一天内触发 ≥2 次，说明：
- 同 IP/fingerprint 被 snssdk 风控
- 建议：换 IP（重启路由器/换 WiFi） 或改 user-agent

---

## 四、卸载 fallback

如果 v0.1.4 在真实 Edge 仍然跑不通：
1. `edge://extensions/` → TM → 编辑 fanqie-assistant
2. 替换为 [v0.1.0 release](https://github.com/qianbkk/fanqie-novel-bypass/releases/tag/v0.1.0) 的内容（不带 v0.1.2/v0.1.3/v0.1.4 的修复，应该能跑但 BufferSource 会报错）
3. 或用 [v0.0.6 上游原版](https://github.com/naiyQAQ/fanqie-assistant) — 完整功能兜底

---

## 五、验证产物

- `verification/V014-FULLCHAPTER-EVIDENCE.md` — 沙箱端到端证据
- `verification/chrome-cdp-v014-fullchapter.py` — 沙箱测试脚本
- `verification/auto-inject-v014.js` — 沙箱 init script
- `verification/v014-release-notes.md` — v0.1.4 release notes

Goal 完成的最后一关：你在真实 Edge 跑完本手册 §2，截图发我看 ≥1500 字正文 + 健康度截图。