import type { joinRoom } from "~/webrtc";
import { messageBus } from "~/webrtc";
import { createMessage } from "~/components/factories";
import type { MessageType } from "~/components/message/message";

type Session = Awaited<ReturnType<typeof joinRoom>>;

export function setupChat(session: Session) {
  const chatInput = document.querySelector<HTMLElement>("glisse-chat-input");
  const messages = document.querySelector<HTMLDivElement>(
    "[data-chat-messages]",
  );

  if (!chatInput || !messages) return;

  const addMessage = (text: string, type: MessageType) => {
    const message = createMessage(type, text);
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  };

  chatInput.addEventListener("glisse-message-send", (e: Event) => {
    const event = e as CustomEvent<{ text: string }>;
    const text = event.detail.text;

    addMessage(text, "sent");
    session.sendMessage(text);
  });

  messageBus.subscribe((text) => {
    addMessage(text, "received");
  });
}
