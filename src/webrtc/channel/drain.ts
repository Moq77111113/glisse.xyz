const BUFFER_THRESHOLD = 65536;

export function drain(
  dc: RTCDataChannel,
  threshold = BUFFER_THRESHOLD,
): Promise<void> {
  if (dc.bufferedAmount <= threshold) return Promise.resolve();

  return new Promise((resolve) => {
    const onLow = () => {
      dc.removeEventListener("bufferedamountlow", onLow);
      resolve();
    };
    dc.addEventListener("bufferedamountlow", onLow);
  });
}
