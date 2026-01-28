const DEFAULT_CHUNK_SIZE = 64 * 1024;
const MAX_CHUNK_SIZE = 256 * 1024;

export function calculateSafeChunkSize(
  maxMessageSize: number | null | undefined,
): number {
  if (!maxMessageSize || maxMessageSize === 0) {
    return DEFAULT_CHUNK_SIZE;
  }

  const safeSize = Math.min(maxMessageSize, MAX_CHUNK_SIZE);
  return Math.floor(safeSize * 0.95);
}

export function getSafeChunkSize(pc: RTCPeerConnection): number {
  return calculateSafeChunkSize(pc.sctp?.maxMessageSize);
}
