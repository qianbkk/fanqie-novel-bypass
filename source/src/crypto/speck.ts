import { hash, pkcs7Pad } from ".";

const ROUNDS = 34;
const MASK64 = 0xffffffffffffffffn;
const WORD_SIZE = 64n;
const ALPHA = 8n;
const BETA = 3n;

function readUint64LE(view: DataView, offset: number): bigint {
    return view.getBigUint64(offset, true);
}

function keySchedule(key: Uint8Array): bigint[] {
    const view = new DataView(key.buffer, key.byteOffset, key.byteLength);

    const ks: bigint[] = [readUint64LE(view, 0) & MASK64];
    const numWords = (key.length * 8) / Number(WORD_SIZE);
    const ls: bigint[] = [];
    for (let i = 1; i < numWords; i++) {
        ls.push(readUint64LE(view, i * 8) & MASK64);
    }

    for (let x = 0; x < ROUNDS - 1; x++) {
        const rsX = (((ls[x]! << (WORD_SIZE - ALPHA)) + (ls[x]! >> ALPHA)) & MASK64);
        const addSxy = (rsX + ks[x]!) & MASK64;
        const newX = BigInt(x) ^ addSxy;
        const lsY = (((ks[x]! >> (WORD_SIZE - BETA)) + (ks[x]! << BETA)) & MASK64);
        ls.push(newX);
        ks.push(newX ^ lsY);
    }

    return ks;
}


function encryptBlock(ks: readonly bigint[], block: Uint8Array, out: Uint8Array, outOffset: number): void {
    const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
    let y = readUint64LE(view, 0);
    let x = readUint64LE(view, 8);

    for (const k of ks) {
        const rsX = (((x << (WORD_SIZE - ALPHA)) + (x >> ALPHA)) & MASK64);
        const addSxy = (rsX + y) & MASK64;
        x = k ^ addSxy;
        const lsY = (((y >> (WORD_SIZE - BETA)) + (y << BETA)) & MASK64);
        y = x ^ lsY;
    }

    const outView = new DataView(out.buffer, out.byteOffset, out.byteLength);
    outView.setBigUint64(outOffset, y & MASK64, true);
    outView.setBigUint64(outOffset + 8, x & MASK64, true);
}


export function speckEncrypt(key: Uint8Array, plaintext: Uint8Array): Uint8Array<ArrayBuffer> {
    if (key.length !== 32) {
        throw new Error(`Speck key must be 32 bytes, got ${key.length}`);
    }

    const padded = pkcs7Pad(plaintext, 16);
    const ks = keySchedule(key);

    const out = new Uint8Array(padded.length);
    for (let i = 0; i < padded.length; i += 16) {
        encryptBlock(ks, padded.subarray(i, i + 16), out, i);
    }
    return out;
}


export async function generateLadonKey(randomBytes: Uint8Array, aid: string): Promise<Uint8Array<ArrayBuffer>> {
    const aidBytes = new TextEncoder().encode(aid);
    const input = new Uint8Array(randomBytes.length + aidBytes.length);
    input.set(randomBytes);
    input.set(aidBytes, randomBytes.length);

    const hex = await hash.md5(input);
    return new TextEncoder().encode(hex);
}
