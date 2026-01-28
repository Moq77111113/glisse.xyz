import { connectionStateBus } from "./events";

type ReconnectState = "idle" | "reconnecting" | "failed";

export function setupReconnectStrategy(onReconnect: () => Promise<void>) {
  let state: ReconnectState = "idle";
  let attempts = 0;
  const MAX_ATTEMPTS = 5;

  const getBackoff = (attempt: number) =>
    Math.min(1000 * Math.pow(2, attempt), 16000);

  const attemptReconnection = async () => {
    if (attempts >= MAX_ATTEMPTS) {
      state = "failed";
      connectionStateBus.emit("failed");
      return;
    }

    state = "reconnecting";
    connectionStateBus.emit("connecting");
    attempts++;

    const delay = getBackoff(attempts - 1);
    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      await onReconnect();
      attempts = 0;
      state = "idle";
    } catch {
      attemptReconnection();
    }
  };

  const onPeerDisconnected = () => {
    if (state === "reconnecting") return;
    attemptReconnection();
  };

  const reset = () => {
    attempts = 0;
    state = "idle";
  };

  const getState = () => state;

  return { onPeerDisconnected, reset, getState };
}
