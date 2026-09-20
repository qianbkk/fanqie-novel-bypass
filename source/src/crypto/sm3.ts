// Thanks to https://github.com/JuneAndGreen/sm-crypto/blob/master/src/sm2/sm3.js

type Bytes = ArrayLike<number>;

/**
 * 循环左移
 */
function rotl(value: number, shift: number): number {
    const normalizedShift = shift & 31;
    return (value << normalizedShift) | (value >>> (32 - normalizedShift));
}

/**
 * 二进制异或运算
 */
function xor(left: Bytes, right: Bytes): Uint8Array {
    if (left.length !== right.length) {
        throw new Error("XOR inputs must have the same length");
    }

    const result = new Uint8Array(left.length);
    for (let i = 0; i < left.length; i++) {
        result[i] = (left[i]! ^ right[i]!) & 0xff;
    }
    return result;
}

/**
 * 压缩函数中的置换函数 P0(X) = X xor (X <<< 9) xor (X <<< 17)
 */
function p0(value: number): number {
    return (value ^ rotl(value, 9)) ^ rotl(value, 17);
}

/**
 * 消息扩展中的置换函数 P1(X) = X xor (X <<< 15) xor (X <<< 23)
 */
function p1(value: number): number {
    return (value ^ rotl(value, 15)) ^ rotl(value, 23);
}

/**
 * 计算 SM3 摘要。
 */
export function sm3(input: Bytes): Uint8Array<ArrayBuffer> {
    const inputLength = input.length;
    const paddedLength = Math.ceil((inputLength + 9) / 64) * 64;
    const message = new Uint8Array(paddedLength);
    message.set(input);
    message[inputLength] = 0x80;

    const bitLength = BigInt(inputLength) * 8n;
    for (let i = 0; i < 8; i++) {
        message[paddedLength - 1 - i] = Number((bitLength >> BigInt(i * 8)) & 0xffn);
    }

    const dataView = new DataView(message.buffer);
    const state = new Uint32Array([
        0x7380166f,
        0x4914b2b9,
        0x172442d7,
        0xda8a0600,
        0xa96f30bc,
        0x163138aa,
        0xe38dee4d,
        0xb0fb0e4e,
    ]);
    const words = new Uint32Array(68);
    const expandedWords = new Uint32Array(64);

    for (let block = 0; block < message.length / 64; block++) {
        const start = block * 64;
        for (let i = 0; i < 16; i++) {
            words[i] = dataView.getUint32(start + i * 4, false);
        }

        for (let i = 16; i < 68; i++) {
            words[i] = (p1((words[i - 16]! ^ words[i - 9]!) ^ rotl(words[i - 3]!, 15))
                ^ rotl(words[i - 13]!, 7))
                ^ words[i - 6]!;
        }

        for (let i = 0; i < 64; i++) {
            expandedWords[i] = words[i]! ^ words[i + 4]!;
        }

        let a = state[0]!;
        let b = state[1]!;
        let c = state[2]!;
        let d = state[3]!;
        let e = state[4]!;
        let f = state[5]!;
        let g = state[6]!;
        let h = state[7]!;

        for (let i = 0; i < 64; i++) {
            const t = i <= 15 ? 0x79cc4519 : 0x7a879d8a;
            const ss1 = rotl(rotl(a, 12) + e + rotl(t, i), 7);
            const ss2 = ss1 ^ rotl(a, 12);
            const tt1 = (i <= 15 ? (a ^ b) ^ c : ((a & b) | (a & c)) | (b & c))
                + d + ss2 + expandedWords[i]!;
            const tt2 = (i <= 15 ? (e ^ f) ^ g : (e & f) | (~e & g))
                + h + ss1 + words[i]!;

            d = c;
            c = rotl(b, 9);
            b = a;
            a = tt1;
            h = g;
            g = rotl(f, 19);
            f = e;
            e = p0(tt2);
        }

        state[0] = state[0]! ^ a;
        state[1] = state[1]! ^ b;
        state[2] = state[2]! ^ c;
        state[3] = state[3]! ^ d;
        state[4] = state[4]! ^ e;
        state[5] = state[5]! ^ f;
        state[6] = state[6]! ^ g;
        state[7] = state[7]! ^ h;
    }

    const result = new Uint8Array(32);
    for (let i = 0; i < state.length; i++) {
        const word = state[i]!;
        result[i * 4] = word >>> 24;
        result[i * 4 + 1] = word >>> 16;
        result[i * 4 + 2] = word >>> 8;
        result[i * 4 + 3] = word;
    }
    return result;
}

/**
 * 计算 HMAC-SM3。
 */
export function hmac(input: Bytes, key: Bytes): Uint8Array<ArrayBuffer> {
    const blockLength = 64;
    const normalizedKey = key.length > blockLength ? sm3(key) : Uint8Array.from(key);
    const paddedKey = new Uint8Array(blockLength);
    paddedKey.set(normalizedKey);

    const innerPad = new Uint8Array(blockLength).fill(0x36);
    const outerPad = new Uint8Array(blockLength).fill(0x5c);
    const innerKey = xor(paddedKey, innerPad);
    const outerKey = xor(paddedKey, outerPad);

    const innerMessage = new Uint8Array(blockLength + input.length);
    innerMessage.set(innerKey);
    innerMessage.set(input, blockLength);

    const outerMessage = new Uint8Array(blockLength + 32);
    outerMessage.set(outerKey);
    outerMessage.set(sm3(innerMessage), blockLength);
    return sm3(outerMessage);
}
