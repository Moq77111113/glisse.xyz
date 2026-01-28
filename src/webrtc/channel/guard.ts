export class ChannelNotOpenError extends Error {
  constructor(state: RTCDataChannelState) {
    super(`DataChannel is ${state}, expected open`);
    this.name = "ChannelNotOpenError";
  }
}

export class MessageTooLargeError extends Error {
  constructor(size: number, max: number) {
    super(`Message ${size} bytes exceeds limit ${max}`);
    this.name = "MessageTooLargeError";
  }
}

export function ensureChannelOpen(dc: RTCDataChannel): void {
  if (dc.readyState !== "open") {
    throw new ChannelNotOpenError(dc.readyState);
  }
}

export function validateMessageSize(
  size: number,
  dc: RTCDataChannel,
): void {
  const max = dc.maxMessageSize;
  if (max && size > max) {
    throw new MessageTooLargeError(size, max);
  }
}
