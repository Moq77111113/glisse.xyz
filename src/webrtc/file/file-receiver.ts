export type FileChunk = {
  chunks: Uint8Array<ArrayBuffer>[]
  name: string
  size: number
  receivedBytes: number
}

export function FileReceiver() {
  const files = new Map<string, FileChunk>()

  const start = (id: string, name: string, size: number) => {
    files.set(id, { name, size, chunks: [], receivedBytes: 0 })
  }

  const addChunk = (id: string, chunk: Uint8Array): number | null => {
    const file = files.get(id)
    if (!file) return null
    file.chunks.push(new Uint8Array(chunk))
    file.receivedBytes += chunk.byteLength
    return Math.min(100, Math.round((file.receivedBytes / file.size) * 100))
  }

  const complete = (id: string) => {
    const file = files.get(id);
    if (!file) return null;

    const blob = new Blob(file.chunks);
    files.delete(id);

    return { id, name: file.name, size: file.size, blob };
  };

  return { start, addChunk, complete };
}

export type FileReceiver = ReturnType<typeof FileReceiver>;
