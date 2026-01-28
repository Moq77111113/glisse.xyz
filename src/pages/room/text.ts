import { messageBus } from "~/webrtc";
import type { joinRoom } from "~/webrtc";

type Session = Awaited<ReturnType<typeof joinRoom>>;

export function setupTextSync(session: Session) {
  const textarea = document.querySelector<HTMLTextAreaElement>("[data-text-area]");
  if (!textarea) return;

  let timeout: number | null = null;
  let lastSentValue = "";
  let lastReceivedValue = "";

  textarea.addEventListener("input", () => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      const value = textarea.value;
      if (value !== lastSentValue && value !== lastReceivedValue) {
        lastSentValue = value;
        session.sendMessage(value);
      }
    }, 300);
  });

  messageBus.subscribe((text) => {
    lastReceivedValue = text;

    if (text === lastSentValue) return;

    const isTyping = document.activeElement === textarea;

    if (!isTyping) {
      textarea.value = text;
    }
  });
}
