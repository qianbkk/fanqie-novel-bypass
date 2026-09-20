const WIRE_VARINT = 0;
const WIRE_BYTES = 2;
const WIRE_FIXED32 = 5;

export class ProtobufWriter {
    private readonly buf: number[] = [];

    private writeVarint(value: number): this {
        let v = value >>> 0;
        while (v >= 0x80) {
            this.buf.push((v & 0x7f) | 0x80);
            v >>>= 7;
        }
        this.buf.push(v & 0x7f);
        return this;
    }

    private writeKey(fieldNumber: number, wireType: number): this {
        return this.writeVarint((fieldNumber << 3) | wireType);
    }

    varint(fieldNumber: number, value: number): this {
        return this.writeKey(fieldNumber, WIRE_VARINT).writeVarint(value);
    }

    fixed32(fieldNumber: number, value: number): this {
        this.writeKey(fieldNumber, WIRE_FIXED32);
        const v = value >>> 0;
        this.buf.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
        return this;
    }

    bytes(fieldNumber: number, data: ArrayLike<number>): this {
        this.writeKey(fieldNumber, WIRE_BYTES).writeVarint(data.length);
        for (let i = 0; i < data.length; i++) {
            this.buf.push(data[i]! & 0xff);
        }
        return this;
    }

    string(fieldNumber: number, value: string): this {
        return this.bytes(fieldNumber, new TextEncoder().encode(value));
    }

    message(fieldNumber: number, build: (writer: ProtobufWriter) => void): this {
        const sub = new ProtobufWriter();
        build(sub);
        return this.bytes(fieldNumber, sub.toBytes());
    }

    toBytes(): Uint8Array<ArrayBuffer> {
        return Uint8Array.from(this.buf);
    }
}
