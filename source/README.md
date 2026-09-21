# source/ — 源码构建说明

> 本目录是 [fanqie-novel-bypass](https://github.com/qianbkk/fanqie-novel-bypass)（顶层仓库）的源代码。  
> **fork 自** [naiyQAQ/fanqie-assistant](https://github.com/naiyQAQ/fanqie-assistant) v0.0.6，**主要改动**是补齐 L1–L6 反封禁防线 + 设备池 + Pin 缓存 + 浮动控制面板。  
> 详细的项目主页请看 [顶层 README](../README.md)，架构看 [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)，设计决策看 [docs/DESIGN.md](../docs/DESIGN.md)。

## 模块清单（仅列出本 fork 改动）

| 路径 | 状态 | 用途 |
|------|------|------|
| `src/utils/logger.ts` | 🆕 新增 | 诊断日志环形缓冲 |
| `src/utils/throttle.ts` | 🆕 新增 | Box-Muller 节流 + 长停顿 |
| `src/cache/index.ts` | 🆕 新增 | IndexedDB 章节缓存 |
| `src/pool/index.ts` | 🆕 新增 | 设备池管理 |
| `src/panel/index.ts` | 🆕 新增 | 浮动控制面板 |
| `src/panel/recovery.ts` | 🆕 新增 | 失败恢复弹窗 |
| `src/main.ts` | ✏️ 改写 | 串行化初始化 |
| `src/api/app.ts` | ✏️ 改写 | `requestAppWithRecovery()` 用 pool 替代 `replaceDevice` |
| `src/api/content.ts` | ✏️ v0.2.1 重写 | `getChapterViaWeb()` 走同源 `/api/reader/full` **XHR 通道**（secsdk 只 hook XHR.prototype 不 hook fetch）；从 `x-tt-zhal` 响应头拿 font-id；snssdk 作 fallback |
| `src/hooks/readerHook.ts` | ✏️ 扩展 | `insertContent()` 加缓存 + 字体验密 + `injectPinButton()` 顶栏 📌 |
| `vite.config.ts` | ✏️ 改 metadata | name / description / author |
| `package.json` | ✏️ 版本 | 0.0.6 → 0.2.1 |

其他目录（`api/`、`crypto/`、`hooks/`、`utils/` 等）保留上游原状，便于对照 diff。

## 开发

```bash
cd source
npm install
npm run build     # tsc 类型检查 + vite 打包
```

### 输出位置

构建产物写到 `source/dist/fanqie-assistant-lite.user.js`。

发布流程：构建完成后**手工复制**到顶层 `release/fanqie-assistant-v0.2.0.user.js`。  
v0.2.0 是从 v0.0.6 fork 出来的精简构建产物，跟上游 v0.0.6 的发布物同名不同源。

### 修改 metadata

`vite.config.ts` 里的 `monkeyConfig` 块控制 `@name` / `@description` / `@author` / `@version` 等脚本元数据。修改版本号：

```ts
monkeyConfig: {
  meta: {
    name: { value: '...' },
    version: { value: '0.2.1' },
    // ...
  },
}
```

### 调试

`npm run dev` 启动 vite-plugin-monkey 的开发服务器，按提示在脚本管理器里安装开发版（指向本地服务器）。日志都打在浏览器控制台，按 `fqa` 过滤。

调试时记得关掉正式版脚本，两个版本同时启用会重复注入。

### 类型 / Lint

```bash
npx tsc --noEmit          # 仅类型检查
npm run build             # 类型检查 + 打包
```

## 上游贡献 / 同步

本 fork 是个人自用版本，**不向上游提 PR**。  
如需追踪上游变更：

```bash
git remote add upstream https://github.com/naiyQAQ/fanqie-assistant.git
git fetch upstream
git log upstream/main --oneline | head -20
```

## License

[GPL-3.0](../LICENSE) — 沿用上游 license。  
本 fork 是上游 v0.0.6 的修改版本，按 GPL 条款保留上游版权声明并显著标注修改。