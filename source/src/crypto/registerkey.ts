import { shared_key, type DeviceConfig } from "../config";
import { b64decode, b64encode, getSubtle, randomString, unhex } from ".";

function reverseHex(value: string): string {
    const be = BigInt(value).toString(16).padStart(32, "0");
    let result = "";
    for (let i = be.length; i > 0; i -= 2) result += be.slice(i - 2, i);
    return result;
}


export async function encryptKeyinfoBody(config: DeviceConfig): Promise<string> {
    const deviceId = config.device_id;
    const iv = new TextEncoder().encode(randomString(16));
    // 如果是i32类型（返回8字节）则啥也不用管。但是如果返回16以上（i64+），则需要取前八位，后面是0，删了
    // BigInt按i64返回，所以取前八位
    const data = new Uint8Array(unhex(reverseHex(deviceId))).slice(0, 8);
    console.log(data)
    const subtle = getSubtle();
    const k = await subtle.importKey(
        "raw",
        shared_key,
        { name: "AES-CBC" },
        false,
        ["encrypt"],
    )
    const encrypted = await subtle.encrypt(
        { name: "AES-CBC", iv },
        k,
        data
    );

    const final = new Uint8Array(iv.length + encrypted.byteLength);
    console.log(final)
    final.set(iv, 0);
    final.set(new Uint8Array(encrypted), iv.length);
    return JSON.stringify({
        content: b64encode(final.buffer),
    });
}


export async function decryptKeyinfoResponse(encrypted: string): Promise<ArrayBuffer> {
    const buf = b64decode(encrypted);
    const iv = buf.slice(0, 16);
    const data = buf.slice(16);
    const subtle = getSubtle();
    const k = await subtle.importKey(
        "raw",
        shared_key,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
    );
    return subtle.decrypt(
        { name: "AES-CBC", iv },
        k,
        data
    );
}