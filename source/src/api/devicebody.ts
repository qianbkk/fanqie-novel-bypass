// 设备注册请求体构造。
// 移植自 fq-go-api/fanqie/device/register.go 的 generateFullRequestBody

import { getCrypto } from "../crypto";

/** Android 版本与 API 级别 */
const ANDROID_VERSIONS: ReadonlyArray<{ version: string; api: number }> = [
    { version: "9", api: 29 },
    { version: "10", api: 30 },
    { version: "11", api: 31 },
    { version: "12", api: 32 },
    { version: "13", api: 33 },
    { version: "14", api: 34 },
];

const DEVICE_MODELS = [
    "RMX1931", "MI8", "Honor10", "P30", "V1921A",
    "Redmi Note 7", "Redmi K20 Pro", "MI 9", "Mi 10 Pro",
    "SM-G9750", "Pixel 6", "HD1910", "M2011K2C",
    "LIO-AN00", "VOG-TL00", "PCLM10", "GM1900",
    "Pixel 7 Pro", "Pixel 6a", "SM-N9760", "POCO F1",
] as const;

const DEVICE_BRANDS = [
    "realme", "Xiaomi", "Huawei", "OPPO", "vivo",
    "samsung", "OnePlus", "google", "Redmi", "HONOR", "motorola", "POCO",
] as const;

const HEX_LOW = "0123456789abcdef";

/** 默认请求参数值，对应 Go 的 device.Value */
export const deviceValue = {
    aid: "1967",
    appName: "novelapp",
    channel: "0",
    platform: "android",
    osVersion: "0",
    versionCode: {
        str: "6.3.9.32",
        val: "63932",
    },
} as const;

/** [0, max) 区间的随机整数 */
function randomInt(max: number): number {
    return getCrypto().getRandomValues(new Uint32Array(1))[0]! % max;
}

function randomItem<T>(list: readonly T[]): T {
    return list[randomInt(list.length)]!;
}

/** 长度为 k 的随机小写十六进制字符串 */
export function randomHex(k: number): string {
    if (k <= 0) return "";
    const bytes = getCrypto().getRandomValues(new Uint8Array(k));
    let result = "";
    for (let i = 0; i < k; i++) {
        result += HEX_LOW[bytes[i]! % 16];
    }
    return result;
}

/** 生成 UUID v4 */
function uuid(): string {
    const c = getCrypto();
    if (typeof c.randomUUID === "function") {
        return c.randomUUID();
    }
    // 兜底：手工组装 v4
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = (b[6]! & 0x0f) | 0x40;
    b[8] = (b[8]! & 0x3f) | 0x80;
    const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** 链路本地 IPv6 地址。浏览器拿不到网卡地址，与 Go 的失败分支一致返回 ::1 */
function ipv6LinkLocal(): string {
    return "::1";
}

/** 唯一本地 IPv6 地址 fdxx:xxxx:... */
function ipv6UniqueLocal(): string {
    const x = randomInt(1 << 8);
    let result = `fd${HEX_LOW[x >> 4]}${HEX_LOW[x & 0x0f]}`;
    for (let i = 0; i < 7; i++) {
        const v = randomInt(1 << 16);
        result += ":"
            + HEX_LOW[(v >> 12) & 0x0f]
            + HEX_LOW[(v >> 8) & 0x0f]
            + HEX_LOW[(v >> 4) & 0x0f]
            + HEX_LOW[v & 0x0f];
    }
    return result;
}

export interface RegisterRequestBody {
    magic_tag: string;
    header: Record<string, unknown> & { device_model: string };
    _gen_time: number;
}

/**
 * 构造设备注册请求体。
 *
 * Go 的 config.RequestBody 内嵌了 Header 且带 `json:"header"` 标签，
 * 序列化后 header 各字段是嵌套在 "header" 对象里的（已用 Go 实测确认）。
 */
export function generateRequestBody(): RegisterRequestBody {
    const osInfo = randomItem(ANDROID_VERSIONS);
    const deviceBrand = randomItem(DEVICE_BRANDS);
    const genTime = Date.now();

    const romVersion = "coloros__"
        + randomHex(4).toUpperCase()
        + "." + String(randomInt(1_000_000)).padStart(6, "0")
        + "." + String(randomInt(100_000_000)).padStart(8, "0")
        + " release-keys";

    return {
        magic_tag: "ss_app_log",
        header: {
            display_name: "番茄免费小说",
            aid: 1967,
            channel: "43536163a",
            package: "com.dragon.read",
            sdk_version: "3.7.0-rc.25-fanqie-xiaoshuo",
            sdk_target_version: 29,
            git_hash: "711d1a7",
            density_dpi: 240,
            display_density: "hdpi",
            resolution: "720x1280",
            language: "zh",
            timezone: 8,
            access: "wifi",
            not_request_sender: 0,
            carrier: "CHINA MOBILE",
            mcc_mnc: "46000",
            region: "CN",
            tz_name: "Asia/Shanghai",
            tz_offset: 28800,
            sim_region: "cn",
            sim_serial_number: [],
            oaid_may_support: false,
            device_platform: "android",
            custom: { host_bit: 32, dragon_device_type: 0 },
            pre_installed_channel: "",
            is_system_app: 0,
            sdk_flavor: "china",
            guest_mode: 0,

            // 设备硬件与系统信息
            os: "Android",
            os_version: osInfo.version,
            os_api: osInfo.api,
            device_model: randomItem(DEVICE_MODELS),
            device_brand: deviceBrand,
            device_manufacturer: deviceBrand,
            cpu_abi: "arm64-v8a",
            release_build: randomHex(7),
            cdid: uuid(),
            sig_hash: "a4a27c2633195374c15651ffc3c4a497",
            openudid: randomHex(20),
            clientudid: uuid(),
            req_id: uuid(),

            // 可选字段
            rom: randomHex(14).toUpperCase(),
            rom_version: romVersion,
            apk_first_install_time: genTime - randomInt(365) * 86_400_000,

            ipv6_list: [
                { type: "client_anpi", value: ipv6LinkLocal() },
                { type: "client_anpi", value: ipv6UniqueLocal() },
                { type: "client_anpi", value: ipv6UniqueLocal() },
            ],
        },
        _gen_time: genTime,
    };
}
