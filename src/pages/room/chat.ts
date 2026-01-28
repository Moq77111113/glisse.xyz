import type { joinRoom } from "~/webrtc";
import { messageBus } from "~/webrtc";

type Session = Awaited<ReturnType<typeof joinRoom>>;

export function setupChat(session: Session) {
  const input = document.querySelector<HTMLInputElement>("[data-chat-input]");
  const sendButton =
    document.querySelector<HTMLButtonElement>("[data-chat-send]");
  const messages = document.querySelector<HTMLDivElement>(
    "[data-chat-messages]",
  );

  if (!input || !sendButton || !messages) return;

  const addMessage = (text: string, type: "sent" | "received") => {
    const wrapper = document.createElement("div");
    wrapper.className = `flex ${type === "sent" ? "justify-end" : "justify-start"}`;

    const bubble = document.createElement("div");
    bubble.className = `max-w-52 py-2 px-1 rounded-2xl text-sm break-words ${
      type === "sent"
        ? "bg-primary text-primary-foreground rounded-br-sm"
        : "bg-muted text-foreground rounded-bl-sm"
    }`;
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  };

  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "sent");
    session.sendMessage(text);
    input.value = "";
  };

  sendButton.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  messageBus.subscribe((text) => {
    addMessage(text, "received");
  });
}
