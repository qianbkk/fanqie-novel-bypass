import { getSubtle, b64decode, hash, getCrypto } from '.'
import { concatArrayBuffers } from '../utils'
import { gzip } from '../utils/compress'

export const FIXED_STRING = b64decode(
    "TdTC5rgxYgkOUrPHpnM7pByyRiuCmrWKGWs521cXdST0m69/COjWjSanLjfBqVovHwWlGJKu8pSXMrYqOKrdWA=="
)

export async function encrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    const crypto = getCrypto()
    const subtle = getSubtle()
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const hashValue = await hash.sha512bytes(
        concatArrayBuffers(await hash.sha512bytes(randomBytes), FIXED_STRING)
    )
    const k = hashValue.slice(0, 16)
    const iv = hashValue.slice(16, 32)
    const compressedData = await gzip(data)
    const hashedData = concatArrayBuffers(
        await hash.sha512bytes(compressedData),
        compressedData
    )
    const key = await subtle.importKey("raw", k, { name: "AES-CBC", length: 128 }, false, ["encrypt"])
    const encryptedData = await subtle.encrypt({ name: "AES-CBC", iv }, key, hashedData)
    return concatArrayBuffers(
        new Uint8Array([116, 99, 5, 16, 0, 0]).buffer,
        randomBytes.buffer,
        encryptedData
    )
}

