# fanqie-novel-bypass

> **番茄小说网页版免登录 / 免 SVIP 阅读用户脚本** —— 在 [naiyQAQ/fanqie-assistant](https://github.com/naiyQAQ/fanqie-assistant) v0.0.6 基础上的自用 fork，重点补齐 **L1–L6 反封禁防线** + **设备池** + **Pin 缓存** + **浮动控制面板**。

> ⚠️ **使用本脚本存在账号被官方封禁的风险。** 本项目仅供学习与个人研究使用，请遵守番茄小说用户协议，不要用于商业用途或内容再分发。

---

## 这是什么

番茄小说 web 端的章节解锁脚本圈子里目前最有名的就是 [`naiyQAQ/fanqie-assistant`](https://github.com/naiyQAQ/fanqie-assistant)，作者维护得很勤，签名跟得上服务端变化。本仓库是它的个人 fork：**保留核心阅读能力**，**额外补了反封禁的几道防线**，目标是让"用一段时间就被封"的常见痛点缓解——从"用 1 个月"延长到"用半年以上"。

**不是**声明"永远不被封"。服务端风控持续升级，任何客户端绕法都有失效的一天。详见 [docs/DESIGN.md](docs/DESIGN.md)。

## 与上游的关系

| 维度 | 上游原版 | 本 fork |
|------|---------|---------|
| 阅读解锁 / 字体解密 | ✅ | ✅（沿用，全部沿用）|
| 书架 / 搜索 / 听书 / 评论 / 下载 | ✅ | ❌（v0.1.0 精简策略不包含）|
| L1 请求节流 | ❌ | ✅ 5–25 s 正态分布 |
| L2 章节缓存 | ❌ | ✅ IndexedDB + Pin 升级 |
| L4 行为模拟 | ❌ | ✅ 3 % 长停顿 30–90 s |
| L6 设备池 + 失败不自残 | ⚠️ 有但会自杀 | ✅ 3 槽 + 手动补 |
| 浮动控制面板 ⚙️ | ❌ | ✅ |
| Pin 持久化 📌 | ❌ | ✅ |
| 失败恢复弹窗 | ❌ | ✅ 5 选项 + 诊断默认展开 |

上 v0.0.6 的全功能版（含书架/搜索/听书/评论/下载）作为应急 fallback 一起打包在 [`release/`](release/) 里。如果你需要那些功能，用 `fanqie-assistant-v0.0.6.user.js` 即可。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)（Chrome / Edge / Firefox）或 Violentmonkey。
2. **推荐装最新** [`release/fanqie-assistant-v0.1.4.user.js`](release/fanqie-assistant-v0.1.4.user.js)（v0.1.4 完整修复 BufferSource：7 个 importKey 调用点全部用 Uint8Array view 包裹）。
   - 备份 fallback：v0.1.2 在 GitHub Release [v0.1.2](https://github.com/qianbkk/fanqie-novel-bypass/releases/tag/v0.1.2)。
   - 完整功能兜底：v0.0.6 上游原版 [`release/fanqie-assistant-v0.0.6.user.js`](release/fanqie-assistant-v0.0.6.user.js)。
3. 点 **安装**。
4. 访问任意 `https://fanqienovel.com/reader/<item_id>` 章节页。

**首次启动**：脚本会自动注册 3 个设备，间隔 0 s / 10 s / 30 s（避免"批量注册"风控），同时激活 30 天 SVIP。详情见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 的 L5 / L6。

### v0.1.4 修复：完整 BufferSource（所有 7 个 importKey 路径）

v0.1.2/v0.1.3 在真实 Edge 跑起来后报 `Failed to execute 'importKey' on 'SubtleCrypto': Key data must be a BufferSource for non-JWK formats` —— 这是 Chrome 86+ / Edge Chromium WebCrypto 标准行为，`importKey('raw', ArrayBuffer, ...)` 会被拒。**v0.1.4** 把所有 7 个 importKey 调用点（`api/device.ts` ×2、`crypto/registerkey.ts` ×2、`crypto/argus.ts`、`crypto/ttencrypt.ts`、`crypto/content.ts`）的 ArrayBuffer 全部改用 `Uint8Array(x)` 视图包裹：

```diff
- subtle.importKey("raw", shared_key, ...)
+ subtle.importKey("raw", new Uint8Array(shared_key), ...)
```

并显式在 `mainInit` 中检测池子全 dead 时调用 `notifyFailure()`，防止 `pool.subscribe` 漏触发导致恢复弹窗不弹。

```diff
- subtle.importKey("raw", shared_key, ...)
+ subtle.importKey("raw", new Uint8Array(shared_key), ...)
```

并显式在 `mainInit` 中检测池子全 dead 时调用 `notifyFailure()`，防止 `pool.subscribe` 漏触发导致恢复弹窗不弹。

- 验证报告：[verification/V013-VERIFICATION.md](verification/V013-VERIFICATION.md)（Chrome CDP side-by-side 对比：v0.1.2 BLOCKED / v0.1.3 OK）

### v0.1.2 新增：设备池全 dead 自动恢复

如果你的设备池 3 个槽位都被 snssdk 风控了（罕见但极端），v0.1.1 会卡在"必须手动点 ⚙️ → 重置整个池子"。**v0.1.2** 加了自动恢复：

- 检测到「所有槽 dead」后自动调度 **5 分钟倒计时**重置
- 弹窗顶部蓝色「🤖 自动恢复已启用」区块 + 倒计时秒数（每秒 tick）
- 5 分钟后自动 reset + 注册 3 个新设备 + reload 页面
- **24h 节流**：同 IP/fingerprint 24h 内最多自动 reset 一次（避免 snssdk 批量注册风控）
- 用户可点「取消自动重置」主动禁用本会话的自动 reset
- 验证报告：[verification/V012-VERIFICATION.md](verification/V012-VERIFICATION.md)（含 21/21 Node.js 单元测试断言通过）

## 文档目录

| 文档 | 内容 |
|------|------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 6 层反封禁防线详解 + 各模块源码位置 |
| [docs/DESIGN.md](docs/DESIGN.md) | 设计原则（不自残 / 不存签名凭据 / 不上报）+ 取舍记录 |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | v0.1.1 vs v0.1.0 vs v0.0.6 的差异、Lite 版历史 |
| [release/INSTALL.md](release/INSTALL.md) | 安装 + 故障排查 + 已知限制 |

## 仓库结构

```
fanqie-novel-bypass/
├── README.md                # 本文件
├── LICENSE                  # GPL-3.0（沿用上游）
├── .gitignore
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   └── CHANGELOG.md
├── source/                  # 完整 fork 源码（删去了嵌套 .git）
│   ├── src/
│   │   ├── api/             # 上游接口层
│   │   ├── cache/           # 【新增】IndexedDB 章节缓存
│   │   ├── crypto/          # 上游签名栈
│   │   ├── hooks/           # 上游 hooks + 我的 readerHook 扩展
│   │   ├── panel/           # 【新增】浮动控制面板 + 失败恢复弹窗
│   │   ├── pool/            # 【新增】设备池管理
│   │   ├── utils/           # 上游 + 【新增】logger + throttle
│   │   └── ...
│   ├── package.json         # name=fanqie-assistant, version=0.1.0
│   ├── vite.config.ts
│   └── README.md            # 源码目录自己的开发说明
└── release/                 # 用户直接安装的产物
    ├── fanqie-assistant-v0.1.4.user.js   # 本版本（推荐）
    ├── fanqie-assistant-v0.0.6.user.js   # 上游原始（fallback）
    └── INSTALL.md
```

## 验证

本 fork 在 1–2 小时连续阅读场景下未触发封禁（个人体感）。**仍需 1–3 天长周期压测确认**：
- 节流体感是否过于拖沓
- 设备池被封时是否自动切 + 弹恢复弹窗
- Pin 按钮持久化（关页面再开是否还在）

测试反馈请开 [Issue](../../issues)。

## 开发

```bash
cd source
npm install
npm run build     # 类型检查 + 打包 → source/dist/fanqie-assistant-lite.user.js
```

构建产物会再被手工复制到 `release/fanqie-assistant-v0.1.1.user.js`。修改 `vite.config.ts` 调整 `@name` / `@description` / `@author`，修改 `package.json` 调整版本号。

## 许可

[GPL-3.0](LICENSE)（沿用上游 license）。

本项目是 [naiyQAQ/fanqie-assistant](https://github.com/naiyQAQ/fanqie-assistant) v0.0.6 的修改版本，按 GPL-条款保留上游版权声明并显著标注修改。

## 免责声明

本项目仅供学习与个人研究。请遵守番茄小说用户协议，不要用于商业用途或内容再分发。
本项目不保证功能永远可用 —— 服务端风控持续升级，绕法会失效。