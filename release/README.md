# release/

> **安装 / 调试 / 故障排查请看 [INSTALL.md](INSTALL.md)。**

本目录是给用户直接安装的用户脚本产物：

| 文件 | 大小 | 用途 |
|------|------|------|
| `fanqie-assistant-v0.2.0.user.js` | **271 KB** | **推荐** —— v0.2.0 章节获取路径切到 fanqienovel.com 同源主路径，能拿到完整字体验密正文（不再是试读段）|
| `fanqie-assistant-v0.1.1.user.js` | 267 KB | v0.1.1 控制面板挂载修复版，但 snssdk 路径只回试读段 |
| `fanqie-assistant-v0.1.0.user.js` | 267 KB | ⚠️ 已知 bug：不挂 ⚙️（document-start 时 body 不存在）。**不要装**。 |
| `fanqie-assistant-v0.0.6.user.js` | 490 KB | 上游 v0.0.6 原始全功能版（**仅**作为应急 fallback）|
| `INSTALL.md` | — | 安装 / 控制面板 / 调试 / 已知限制 / 故障排查 |

源码在 [`../source/`](../source/)。
