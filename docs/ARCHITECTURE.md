# 架构：6 层反封禁防线 + 内容获取路径

> 本文档描述本 fork 在原版基础上的架构增量。完整阅读解锁 / 字体解密 / 签名栈依然沿用上游 [naiyQAQ/fanqie-assistant](https://github.com/naiyQAQ/fanqie-assistant) 的实现，本文不重复展开。

## 总览

服务端风控识别"不像真人/不像真设备"的方式大致分这几路：

1. **频率维度**：同一设备短时间内多次请求 → "像机器人"
2. **缓存维度**：同一本书反复拉相同章节 → "你为什么不下下来"
3. **协议维度**：客户端签名缺失 / UA 不对 → "你客户端是伪造的"
4. **行为维度**：章节停留 0 秒翻页 → "你阅读模式是脚本"
5. **设备维度**：注册时机 / 设备指纹异常 → "你注册不像真人"
6. **崩溃维度**：当前设备死后立刻自动重新注册 → "你在跟服务端玩消耗战"

原版 v0.0.6 防线 3 和 5 做得扎实（沿用在本 fork），其他 4 路全部欠缺。本 fork 一次性补齐。

**v0.2.0 增量**：把章节获取主路径从跨域 snssdk 设备接口（设计只返试读段）切到同源 `/api/reader/full`（浏览器自己用的真实通道，返回完整字体验密正文）。这是 v0.1.x 一直被吐槽的"前面部分"问题的真因——不是 VIP 过期也不是 v0.1.1 修坏了，是设计如此。

## L1 请求节流

| 项目 | 值 |
|------|---|
| 模块 | `source/src/utils/throttle.ts` |
| 策略 | Box-Muller 正态分布 |
| 默认区间 | 5–25 s（均值 12 s，stddev 5 s） |
| 长停顿 | 3 % 概率插入 30–90 s（覆盖 L4 行为模拟） |
| 集成点 | `source/src/api/app.ts` 的 `requestAppWithRecovery()` |

**为什么用正态不是均匀**：均匀分布看起来像"机械心跳"，正态分布更像真人（真人翻页间隔是中间多、两头少）。均值偏向 12 s 而不是 (5+25)/2=15 s，是因为短间隔侧单边截断后长期存在。

**为什么带 3 % 长停顿**：单纯 5–25 s 翻页间隔时间长了还是有点规律，插 30–90 s 偶尔卡一下更像真人走神 / 中断。

**可调**：控制面板可改最小/最大秒数 + 启用开关。

## L2 章节缓存

| 项目 | 值 |
|------|---|
| 模块 | `source/src/cache/index.ts` |
| 存储 | IndexedDB（`fqa-cache` v1，2 个 store：`chapters` + `pinnedBooks`） |
| Session 缓存 | 浏览器会话级，自动清，不占配额 |
| Pin 缓存 | 手动升级持久化，配额 ≤ 50 本 / ≤ 5000 章 |
| 集成点 | `source/src/hooks/readerHook.ts` 的 `insertContent()` |

**双层设计**：
- **session 缓存**：默认对所有章节生效，浏览器关掉自动清，零维护成本。翻页时优先查缓存减少一次请求。
- **Pin 缓存**：用户主动点章节顶栏 `📌 Pin 此书` 后，把这本书升级为持久化缓存。后续翻页写入 Pin 范围，即使重启浏览器也在。

**配额**：Pin 限制是为了防止"我把整站都 pin 了"导致 IndexedDB 爆炸 + 拉取行为被服务端识别。

## L3 签名 / UA（沿用上游）

| 项目 | 值 |
|------|---|
| 模块 | `source/src/crypto/` + `source/src/utils/request.ts` |
| 策略 | 上游完整签名栈（`x-argus` / `x-ladon` / `x-ss-stub` 等） |

本 fork **没有**自己改签名算法 —— 完全沿用上游作者维护的版本。签名算法跟服务端对得很紧，自行改容易翻车。

## L4 行为模拟

| 项目 | 值 |
|------|---|
| 模块 | `source/src/utils/throttle.ts` 的长停顿分支 |
| 策略 | 3 % 概率插入 30–90 s 停顿 |

L4 在本版本里**只做最简版**（章节停留正态 + 偶尔长停顿），不做"翻过头再翻回来"这种高级行为模拟。理由：

- 高级行为模拟的边际收益小（长停顿已经能覆盖大部分"不像脚本"的判定）
- 写复杂了反而引入新 bug 风险
- 真要更高仿真度，需要配合 IP 轮换 / 浏览器指纹轮换，那是另一个量级的工作量

## L5 注册流程（沿用上游）

| 项目 | 值 |
|------|---|
| 模块 | `source/src/api/app.ts` 的 `registerDevice()` |
| 端点 | `https://i.snssdk.com/service/2/device_register/?tt_data=a` |

本 fork **没有**改注册算法 —— 沿用上游完整签名流程。

**额外防批量注册**：本 fork 在 L6 设备池启动时**错开注册**（槽 0 立即、槽 1 延迟 10 s、槽 2 延迟 30 s），避免"3 个设备在 1 s 内同时注册"被服务端识别为脚本批量操作。

## L6 设备池 + 失败不自残

| 项目 | 值 |
|------|---|
| 模块 | `source/src/pool/index.ts` |
| 池规模 | 3 槽 |
| 失败阈值 | 连续 2 次失败标记 dead + 自动切下一槽 |
| 启动注册 | 槽 0 / 1 / 2 分别 0 s / 10 s / 30 s 错开 |
| 手动补员 | 24 h 冷却（防连点触发批量注册） |
| 持久化 | `GM_setValue('fqa.device_pool.v1', ...)` |
| 集成点 | `source/src/api/app.ts` 的 `requestAppWithRecovery()` |

**核心原则（不自残）**：
- dead 设备**永不**自动重注册
- 手动补员有 24 h 冷却（防连点触发批量注册）
- 重置整个池子是最后手段（控制面板"⚠ 重置整个池子"按钮）

**为什么不沿用上游的 `replaceDevice`**：上游的实现是"当前设备失败就立刻注册新设备替换"。这本身会触发"短时间内同一 IP 注册多个设备"的风控，进一步加速封号。本 fork 把"自动替换"换成"池内切换 + 手动补员"，把"自动批量注册"换成"启动错开注册 + 手动补员有冷却"。

## 浮动控制面板 ⚙️

| 项目 | 值 |
|------|---|
| 模块 | `source/src/panel/index.ts` |
| 触发 | 页面右下角 ⚙️ 浮动按钮 |
| 形态 | Popover（默认）+ 侧栏（点 ⮮ 切换）|
| 分区 | 状态 / 设备池 / Pin / 节流 / 日志 |

详情见 [release/INSTALL.md](../release/INSTALL.md)。

## 失败恢复弹窗

| 项目 | 值 |
|------|---|
| 模块 | `source/src/panel/recovery.ts` |
| 触发 | 设备切换 / 池子空了 |
| 选项 | 立即重试 / 切换设备 / X 秒后自动重试 / 查看诊断 / 放弃 |
| 诊断区 | `<details>` 默认展开，便于复制粘贴 |

**为什么默认展开**：用户原始诉求是"出各种问题都能查看并解决"，所以诊断日志直接可见，需要时再折叠即可。

## 集成点

| 文件 | 改动 |
|------|------|
| `source/src/main.ts` | 串行化初始化 logger → cache → pool → UI |
| `source/src/api/app.ts` | 用 `pool.recordSuccess/Failure()` + `waitForThrottle()` 替代原版 `markDeviceHealthy/replaceDevice` |
| `source/src/hooks/readerHook.ts` | `insertContent()` 加缓存查找 / 写入；`injectPinButton()` 加顶栏 📌 |
| `source/vite.config.ts` | 更新 `@name` / `@description` / `@author` |

## 数据持久化

| 键 | 用途 |
|----|------|
| `GM_setValue('fqa.device_pool.v1', ...)` | 设备池状态（3 槽 + dead/healthy + 失败计数）|
| `GM_setValue('fqa.diagnostic_log', ...)` | 诊断日志环形缓冲（200 条）|
| `GM_setValue('fqa.panel.mode', ...)` | 控制面板形态（popover / sidebar）|
| IndexedDB `fqa-cache.chapters` | session 缓存章节 |
| IndexedDB `fqa-cache.pinnedBooks` | Pin 持久化书 + 章节 |