export async function gzip(data: ArrayBuffer | string): Promise<ArrayBuffer> {
  if (typeof data === 'string') {
    data = new TextEncoder().encode(data).buffer;
  }
  const encoder = new CompressionStream('gzip');
  const stream = new Blob([data]).stream().pipeThrough(encoder);
  const compressed = new Response(stream).arrayBuffer();
  return compressed;
}

export async function gunzip(data: ArrayBuffer): Promise<ArrayBuffer> {
    const decoder = new DecompressionStream('gzip');
    const stream = new Blob([data]).stream().pipeThrough(decoder);
    const decompressed = new Response(stream).arrayBuffer();
    return decompressed;
}