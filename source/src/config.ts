export type HookEvent = 'load' | 'click' | 'onUrlChange' | 'onHashChange' | 'enter' | 'keyup' | 'keydown'

export interface KeyInfo {
    key?: ArrayBuffer;
    keyver?: number;
}

export interface DeviceConfig {
    install_id: string; // iid
    device_id: string;
    device_type?: string;
    device_brand?: string;
    key_info?: KeyInfo;
}

export interface HookConfig {
  id: string;
  event: HookEvent;
  filter: (
    path: string,
    query: URLSearchParams,
    hash: string
  ) => boolean;
  handler: (previous?: string) => Promise<void>;
}

/*
export interface EncryptionContext {
    iv: ArrayBuffer;
    encrypted?: ArrayBuffer;
    plaintext?: ArrayBuffer;
}
*/

// b64decode("rCXGfd2POMGzeiNIgo4iLg==") = 172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46
export const shared_key: ArrayBuffer = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]).buffer;
// 字节的上报SDK会覆写fetch，所以这里先留一份
export const fetch = unsafeWindow.fetch;
export const XMLHttpRequest = unsafeWindow.XMLHttpRequest;

// 示例匿名设备。之后允许用户自己输入
export const defaultConfig: DeviceConfig = {
    install_id: "2187355326270644",
    device_id: "2187355326004404",
    device_type: "P30",
};

export default {
    currentConfig: defaultConfig,
}