import type { HookConfig, HookEvent } from "../config";
import readerHook from "./readerHook";
import fetchHook from "./fetchHook";
import { ensurePanelButton } from "../panel";

// 精简版: 仅保留阅读页解锁 + 屏蔽埋点
// 删除: bookshelfHook(书架), searchHook(搜索), userHook(用户菜单), downloadHook(下载)
const hooks: HookConfig[] = [
    ...readerHook,
    ...fetchHook,
];

async function onEvent(event: HookEvent, previous?: string) {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const tasks = []
    for (const hook of hooks) {
        if (hook.event === event && hook.filter(path, params, hash)) {
            tasks.push(async () => {
                try {
                    await hook.handler(previous);
                } catch (err) {
                    console.error(`[hook:${hook.id}] handler failed:`, err);
                }
            })
        }
    }
    if (tasks.length > 0) {
        await Promise.allSettled(tasks.map(task => task()));
    }
}

export async function onUrlChange(previous: string) {
    // SPA 路由切换可能清掉 ⚙️ 按钮，先确保面板在 DOM 里
    ensurePanelButton()
    return await onEvent('onUrlChange', previous);
}

export async function onHashChange(previous: string) {
    ensurePanelButton()
    return await onEvent('onHashChange', previous);
}

export async function onLoad() {
    ensurePanelButton()
    return await onEvent('load');
}

export async function onEnter() {
    return await onEvent('enter');
}