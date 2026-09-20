import { b64encode, getCrypto, getSubtle, hash, pkcs7Pad } from ".";
import { ProtobufWriter } from "./protobuf";
import { simonEncrypt } from "./simon";
import { sm3 } from "./sm3";
import type { UnidbgConfig } from "./unidbgconfig";

const LOW_RAND = new Uint8Array([0xf2, 0x81]);
const HIGH_RAND = new Uint8Array([0x61, 0x6f]); // 'a', 'o'
const XOR_PREFIX = new Uint8Array([0xf2, 0xf7, 0xfc, 0xff, 0xf2, 0xf7, 0xfc, 0xff]);

function sm3Prefix6(data: Uint8Array): Uint8Array<ArrayBuffer> {
    return sm3(data).slice(0, 6);
}

function decodeStub(xssStub: string): Uint8Array<ArrayBuffer> {
    const bytes = new Uint8Array(16);
    if (xssStub.length >= 32) {
        for (let i = 0; i < 16; i++) {
            bytes[i] = parseInt(xssStub.slice(i * 2, i * 2 + 2), 16) & 0xff;
        }
    }
    return bytes;
}

function buildProtobuf(
    query: string,
    xssStub: string,
    timestamp: number,
    config: UnidbgConfig,
): Uint8Array<ArrayBuffer> {
    const params = new URLSearchParams(query);
    const deviceId = params.get("device_id") ?? "";
    const versionName = params.get("version_name") ?? "";

    // 空 stub / 空 query 时都对 16 字节全零求 SM3
    const bodyHash = sm3Prefix6(xssStub === "" ? new Uint8Array(16) : decodeStub(xssStub));
    const queryHash = sm3Prefix6(
        query === "" ? new Uint8Array(16) : new TextEncoder().encode(query),
    );

    const rand = getCrypto().getRandomValues(new Uint32Array(1))[0]! % 0x7fffffff;

    return new ProtobufWriter()
        .varint(1, 0x20200929 * 2) // magic
        .varint(2, 2) // version
        .varint(3, rand)
        .string(4, config.aid)
        .string(5, deviceId)
        .string(6, config.licenseId)
        .string(7, versionName)
        .string(8, config.sdkVersion)
        .varint(9, config.sdkVersionInt)
        .bytes(10, new Uint8Array(8)) // envcode
        .varint(11, 0) // platform
        .varint(12, timestamp * 2) // createTime
        .bytes(13, bodyHash)
        .bytes(14, queryHash)
        .message(15, (sub) => {
            sub.varint(1, 1).varint(2, 1).varint(3, 1).varint(7, 3348294860);
        })
        .string(16, "") // sec_device_id
        .string(20, "none") // pskVersion
        .varint(21, config.callType)
        .message(23, (sub) => {
            sub.string(1, "NX551J").varint(2, 8196).varint(4, 2162219008);
        })
        .varint(25, 2)
        .toBytes();
}


export async function getArgus(
    query: string,
    xssStub: string,
    timestamp: number,
    config: UnidbgConfig,
): Promise<string> {
    const { signKey } = config;
    if (signKey.length !== 32) {
        throw new Error(`Sign key must be 32 bytes, got ${signKey.length}`);
    }

    const protobuf = pkcs7Pad(buildProtobuf(query, xssStub, timestamp, config), 16);

    const sm3Input = new Uint8Array(signKey.length * 2 + LOW_RAND.length + HIGH_RAND.length);
    sm3Input.set(signKey, 0);
    sm3Input.set(LOW_RAND, signKey.length);
    sm3Input.set(HIGH_RAND, signKey.length + LOW_RAND.length);
    sm3Input.set(signKey, signKey.length + LOW_RAND.length + HIGH_RAND.length);

    const sm3Output = sm3(sm3Input);
    const keyView = new DataView(sm3Output.buffer, sm3Output.byteOffset, sm3Output.byteLength);
    const simonKey: [bigint, bigint, bigint, bigint] = [
        keyView.getBigUint64(0, true),
        keyView.getBigUint64(8, true),
        keyView.getBigUint64(16, true),
        keyView.getBigUint64(24, true),
    ];

    const encrypted = new Uint8Array(protobuf.length);
    const pbView = new DataView(protobuf.buffer, protobuf.byteOffset, protobuf.byteLength);
    const encView = new DataView(encrypted.buffer);
    for (let offset = 0; offset < protobuf.length; offset += 16) {
        const [low, high] = simonEncrypt(
            [pbView.getBigUint64(offset, true), pbView.getBigUint64(offset + 8, true)],
            simonKey,
        );
        encView.setBigUint64(offset, low, true);
        encView.setBigUint64(offset + 8, high, true);
    }

    const data = new Uint8Array(XOR_PREFIX.length + encrypted.length);
    data.set(XOR_PREFIX);
    data.set(encrypted, XOR_PREFIX.length);
    for (let i = XOR_PREFIX.length; i < data.length; i++) {
        data[i]! ^= data[i % 8]!;
    }
    data.reverse();

    const header = new Uint8Array([0xa6, 0x6e, 0xad, 0x9f, 0x77, 0x01, 0xd0, 0x0c, 0x18]);
    const plaintext = new Uint8Array(header.length + data.length + HIGH_RAND.length);
    plaintext.set(header);
    plaintext.set(data, header.length);
    plaintext.set(HIGH_RAND, header.length + data.length);

    const subtle = getSubtle();
    const aesKey = await subtle.importKey(
        "raw",
        await hash.md5bytes(signKey.slice(0, 16)),
        { name: "AES-CBC" },
        false,
        ["encrypt"],
    );
    const iv = await hash.md5bytes(signKey.slice(16));
    const ciphertext = new Uint8Array(
        await subtle.encrypt({ name: "AES-CBC", iv }, aesKey, plaintext),
    );

    const result = new Uint8Array(LOW_RAND.length + ciphertext.length);
    result.set(LOW_RAND);
    result.set(ciphertext, LOW_RAND.length);
    return b64encode(result.buffer);
}
