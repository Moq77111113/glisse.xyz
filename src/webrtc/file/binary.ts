import type { FileChunkFrame } from "./types";


export function encodeFileChunk(fileId: string, payload: ArrayBuffer): ArrayBuffer {
  const idBytes = new TextEncoder().encode(fileId);
  const frame = new Uint8Array(4 + idBytes.length + payload.byteLength);

  new DataView(frame.buffer).setUint32(0, idBytes.length);
  frame.set(idBytes, 4);
  frame.set(new Uint8Array(payload), 4 + idBytes.length);

  return frame.buffer;
}

export function decodeFileChunk(buffer: ArrayBuffer): FileChunkFrame {
  const view = new DataView(buffer);
  const idLength = view.getUint32(0);
  const fileId = new TextDecoder().decode(new Uint8Array(buffer, 4, idLength));
  const payload = new Uint8Array(buffer, 4 + idLength);

  return { fileId, payload };
}
