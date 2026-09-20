import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import vue from '@vitejs/plugin-vue';
import { version } from './package.json';
import { readFileSync } from 'node:fs';

const tocdn = (
  exportVarName: string,
  pathname: string,
): [string, (version: string, name: string) => string] => [
  exportVarName,
  (version, name) => `https://registry.npmmirror.com/${name}/${version}/files/${pathname}`,
];

const icon = readFileSync('./src/assets/fanqie.svg', 'utf-8');
const iconUrl = `data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}`;

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '番茄小说助手',
        namespace: 'https://github.com/naiyQAQ/fanqie-assistant',
        license: 'GPLv3',
        version,
        description: '番茄小说网页版助手：章节解锁 + L1-L6 反封禁（设备池+节流+缓存+行为模拟）+ 浮动控制面板。fork 自 fanqie-assistant v0.0.6。',
        icon: iconUrl,
        author: 'naiyQAQ / lite fork (L1-L6 + pool + pin)',
        'run-at': 'document-start',
        match: ['*://*.fanqienovel.com/*'],
        grant: ['GM_addStyle', 'GM_getValue', 'GM_setValue', 'GM_deleteValue', 'GM_xmlhttpRequest', 'unsafeWindow'],
        connect: [
          'fanqienovel.com',  // 主站同源 APP 接口 + 反代
          'snssdk.com',       // 字节通用 API(设备注册 + APP 后端)
          'jxbhmy.com',       // 红烛小说 API (备用)
        ],
      },
      build: {
        fileName: 'fanqie-assistant-lite.user.js',
        externalGlobals: {
          vue: tocdn('Vue', 'dist/vue.global.prod.js'),
          moment: tocdn('moment', 'min/moment.min.js'),
          jszip: tocdn('JSZip', 'dist/jszip.min.js'),
        },
      },
    }),
  ],
});