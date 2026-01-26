import { messageBus } from "~/webrtc";
import type { joinRoom } from "~/webrtc";

type Session = Awaited<ReturnType<typeof joinRoom>>;

export function setupTextSync(session: Session) {
  const textarea = document.querySelector<HTMLTextAreaElement>("[data-text-area]");
  if (!textarea) return;

  let timeout: number | null = null;

  textarea.addEventListener("input", () => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => session.sendMessage(textarea.value), 300);
  });

  messageBus.subscribe((text) => {
    if (document.activeElement !== textarea) {
      textarea.value = text;
    }
  });
}
