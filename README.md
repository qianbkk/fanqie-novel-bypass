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
2. 打开 [`release/fanqie-assistant-v0.1.0.user.js`](release/fanqie-assistant-v0.1.0.user.js)，脚本管理器会自动弹出安装页。
3. 点 **安装**。
4. 访问任意 `https://fanqienovel.com/reader/<item_id>` 章节页。

**首次启动**：脚本会自动注册 3 个设备，间隔 0 s / 10 s / 30 s（避免"批量注册"风控），同时激活 30 天 SVIP。详情见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 的 L5 / L6。

## 文档目录

| 文档 | 内容 |
|------|------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 6 层反封禁防线详解 + 各模块源码位置 |
| [docs/DESIGN.md](docs/DESIGN.md) | 设计原则（不自残 / 不存签名凭据 / 不上报）+ 取舍记录 |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | v0.1.0 vs v0.0.6 的差异、Lite 版历史 |
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
    ├── fanqie-assistant-v0.1.0.user.js   # 本版本（推荐）
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

构建产物会再被手工复制到 `release/fanqie-assistant-v0.1.0.user.js`。修改 `vite.config.ts` 调整 `@name` / `@description` / `@author`，修改 `package.json` 调整版本号。

## 许可

[GPL-3.0](LICENSE)（沿用上游 license）。

本项目是 [naiyQAQ/fanqie-assistant](https://github.com/naiyQAQ/fanqie-assistant) v0.0.6 的修改版本，按 GPL-条款保留上游版权声明并显著标注修改。

## 免责声明

本项目仅供学习与个人研究。请遵守番茄小说用户协议，不要用于商业用途或内容再分发。
本项目不保证功能永远可用 —— 服务端风控持续升级，绕法会失效。