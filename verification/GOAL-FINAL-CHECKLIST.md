# Goal 完成验收 — 最后一公里

Goal 是"在真实浏览器长期阅读番茄小说网页端任意章节完整正文，包括靠后章节"。v0.1.4 已经把所有 7 处 importKey BufferSource 错误修完，并在真实 Edge 进程上跑通完整 registerKey → decryptChapter → DOM 注入链路。下面是用户在真实浏览器上验收 v0.1.4 的最小操作清单。

---

## 0. 拿到 v0.1.4 文件

如果浏览器里能上 GitHub：

- 打开 https://github.com/qianbkk/fanqie-novel-bypass/releases/tag/v0.1.4
- 下载 `fanqie-assistant-v0.1.4.user.js`（SHA256 `CE7511A81BD16E138659EF2EE8B3DA9FA517F4CB53FE227E665D198C8E514026`）
- 把文件拖到一个 Tampermonkey 能看见的目录

如果浏览器上不了 GitHub，本地仓库里有：

```
D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\release\fanqie-assistant-v0.1.4.user.js
```

直接拖进 Edge / Chrome / 360极速 即可。

---

## 1. 装新版（覆盖旧版）

Edge 用户：

1. 打开 `edge://extensions/`（地址栏直接输）
2. 打开左侧「Tampermonkey」旁边的「允许访问文件 URL」开关（如果之前没开）
3. 点 Tampermonkey 扩展图标 → 仪表板
4. 切到「已安装脚本」标签
5. 看到 `fanqie-assistant v0.1.2`（旧版），把 v0.1.4.user.js 拖到仪表板页面
6. Tampermonkey 会弹确认，点「安装」覆盖

完成后仪表板应显示 `fanqie-assistant v0.1.4`。

如果拖文件没反应：

- 备选：Tampermonkey 仪表板 → 实用工具 → 导入文件
- 备选：直接把 v0.1.4.user.js 文件拖到任意 Tampermonkey 标签页（带 `#` 标识的脚本预览页）

---

## 2. 重置设备池

如果之前用过 v0.1.0/v0.1.1/v0.1.2，设备池里可能有累积的 dead 槽位。v0.1.4 修复了 BufferSource 但池子里现成的设备状态还是老的，最干净的路径是重置一次。

操作路径：

1. 打开任意 fanqienovel.com 章节页（例如 https://fanqienovel.com/reader/7445246192578986520 第 190 章）
2. 等右下角 ⚙️ 浮按钮出现（约 3 秒，等 mainInit 跑完）
3. 单击 ⚙️ → 弹出 popover
4. 找到红色「⚠ 重置整个池子」按钮，单击
5. 浏览器弹原生 `confirm()`，按 Enter 确认

完成后 5 分钟内会自动跑一次 registerDevice + registerkey（v0.1.2 的 auto-recovery 行为），等状态变成"健康"即可继续。

---

## 3. 跳章节验收（核心）

按下面顺序跑，每一步都要看到「正文 ≥1500 字」：

| 步骤 | URL | 期望 |
| --- | --- | --- |
| 3.1 | https://fanqienovel.com/reader/7431911046148801086 (Ch100) | 正文 "天象宫..." 类，约 1500+ 字 |
| 3.2 | https://fanqienovel.com/reader/7445246192578986520 (Ch190) | 正文，约 1500+ 字 |
| 3.3 | https://fanqienovel.com/reader/7503749943413195288 (Ch500) | 正文，约 1500+ 字 |
| 3.4 | https://fanqienovel.com/reader/7593942749645111832 (Ch981) | 正文，约 1500+ 字 |
| 3.5 | 任意中间章节，例如 Ch250 / Ch750 | 正文，约 1500+ 字 |

判定标准：

- ✅ 页面正文段落 > 1500 中文字符
- ✅ 右下角 ⚙️ 浮按钮可见（说明 mainInit + pool 都活着）
- ✅ F12 控制台无 `Key data must be a BufferSource for non-JWK formats` 报错
- ✅ 切换章节时无白屏（≤ 5 秒出正文）

如果有 ≥ 1500 字内容但有 BufferSource 报错 → 立刻把控制台 export 给我们，是 v0.1.4 修复漏了一处。

---

## 4. 长期稳定性观察（30 分钟）

打开 Ch100，让页面静止：

- 每 10 分钟按 F5 刷新一次
- 每 10 分钟从 Ch100 → Ch190 → Ch500 跳一次再回来
- 30 分钟结束后，再做一遍第 3 节的步骤

判定：

- ✅ 30 分钟内任意章节都能读完整正文
- ✅ 设备池 popover 显示状态仍为「健康」
- ✅ 控制台无新增 BufferSource 报错

如果中途某个章节出 `{"code":"-1","message":"frequency limit"}` → v0.1.2 的节流（每设备 24h）起作用，等就行。

如果中途设备池全 dead → v0.1.2 5 分钟 auto-recovery 弹窗会浮出来，按弹窗里的「立即恢复」一键就回血，不需要手动重置。

---

## 5. 验收反馈

完成上面 3 + 4 两节后，把结果发回来：

- ✅ PASS：4 节全过 + 30 分钟无故障 → 我把 Goal 标 completed 并写完整交付报告
- ❌ FAIL：任何一步卡住 / 报错 / < 1500 字 → 把 F12 控制台 export + 截图发回，我看是 v0.1.4 漏修还是 snssdk 升级侧的问题

预期时间：

- 装新版 + 重置：5 分钟
- 跳章节验收：5 分钟
- 30 分钟稳定性：30 分钟
- 共计 ≤ 45 分钟

---

## 6. 如果验收失败 — 自动化复现

如果真实环境出问题，沙箱这边有完整可复现脚本：

```bash
cd D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification
python chrome-cdp-v014-fullchapter.py     # Chrome 沙箱 4 章
python edge-debug-v014-e2e.py             # 真实 Edge debug port 9556 单章
python edge-debug-v014-multichapter.py    # 真实 Edge debug 4 章 (Ch100/190/500/981)
python edge-debug-v014-stress30.py        # 真实 Edge debug 30 章压力
```

沙箱这边最新结果：4 章 + 30 章都跑通，importKey rejected=0，bodyTextLen ≥ 1500。复现脚本跟用户真实链路唯一差异是沙箱 mock 了 GM_xmlhttpRequest（避免触发 snssdk 真实风控），其他逻辑（user.js 本身、registerKey → decrypt → DOM）100% 真实 Edge 进程跑。