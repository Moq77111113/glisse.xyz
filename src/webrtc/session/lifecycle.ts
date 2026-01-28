import { clearAllListeners } from "./events";

export function setupPageLifecycle(onCleanup: () => void) {
  const cleanup = () => {
    onCleanup();
    clearAllListeners();
  };

  window.addEventListener("beforeunload", cleanup);
  window.addEventListener("pagehide", cleanup);

  return () => {
    window.removeEventListener("beforeunload", cleanup);
    window.removeEventListener("pagehide", cleanup);
  };
}
