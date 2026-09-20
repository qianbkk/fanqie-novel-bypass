import { defaultConfig, type DeviceConfig } from "../config";
import { b64decode, getSubtle, unhex } from ".";
import { gunzip } from "../utils/compress";

// 正文算法: AES/CBC/PKCS5Padding
// 返回 string(xhtml/html) | 章节 JSON 对象 | undefined(解析失败)
export async function decryptChapter(
    encrypted: string,
    rawData?: any,
    config: DeviceConfig = defaultConfig,
): Promise<string | unknown> {
    if (!encrypted) {
        throw new Error("Invalid encrypted chapter");
    };
    const buf = b64decode(encrypted);
    const iv = buf.slice(0, 16);
    const data = buf.slice(16);
    const key = config.key_info?.key;
    if (!key) {
        throw new Error("Missing decrypt key")
    }
    const subtle = getSubtle();
    const cryptoKey = await subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["decrypt"],
    );
    return subtle.decrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        data,
    ).then(async (decrypted) => {
        if (rawData && rawData?.compress_status === 1) {
            decrypted = await gunzip(decrypted);
        }
        const decoder = new TextDecoder();
        const plain = decoder.decode(decrypted);
        if (plain.trim().startsWith("<")) { // xhtml || html
            return plain;
        }
        try {
            return JSON.parse(plain); // mostly JSONObject
        } catch (e: any) {
            console.warn('Invalid chapter content: ', plain, e);
            return undefined;
        }
    });
}


export async function decryptComicImage(image: ArrayBuffer, key: string /* hex */): Promise<ArrayBuffer> {
    const subtle = getSubtle();
    // AESGCM
    const cryptoKey = await subtle.importKey(
        "raw",
        unhex(key),
        { name: "AES-GCM" },
        false,
        ["decrypt"],
    );
    const iv = image.slice(0, 12);
    const data = image.slice(12);
    return await subtle.decrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        data,
    );
}