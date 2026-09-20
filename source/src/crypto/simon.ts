const ROUNDS = 72;
const MASK64 = 0xffffffffffffffffn;

const Z4 = 0x3dc94c3a046d678bn;

function getBit(value: bigint, position: number): bigint {
    return (value >> BigInt(position)) & 1n;
}

function rotateLeft64(v: bigint, n: bigint): bigint {
    return ((v << n) | (v >> (64n - n))) & MASK64;
}

function rotateRight64(v: bigint, n: bigint): bigint {
    return ((v << (64n - n)) | (v >> n)) & MASK64;
}

function keyExpansion(key: readonly [bigint, bigint, bigint, bigint]): bigint[] {
    const k: bigint[] = [key[0] & MASK64, key[1] & MASK64, key[2] & MASK64, key[3] & MASK64];

    for (let i = 4; i < ROUNDS; i++) {
        let tmp = rotateRight64(k[i - 1]!, 3n);
        tmp ^= k[i - 3]!;
        tmp ^= rotateRight64(tmp, 1n);
        k.push((~k[i - 4]! ^ tmp ^ getBit(Z4, (i - 4) % 62) ^ 3n) & MASK64);
    }
    return k;
}

export function simonEncrypt(
    plaintext: readonly [bigint, bigint],
    key: readonly [bigint, bigint, bigint, bigint],
): [bigint, bigint] {
    const k = keyExpansion(key);

    let x = plaintext[0] & MASK64;
    let y = plaintext[1] & MASK64;

    for (let i = 0; i < ROUNDS; i++) {
        const tmp = y;
        const f = rotateLeft64(y, 1n) & rotateLeft64(y, 8n);
        y = (x ^ f ^ rotateLeft64(y, 2n) ^ k[i]!) & MASK64;
        x = tmp;
    }

    return [x, y];
}
