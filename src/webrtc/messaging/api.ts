import { ensureChannelOpen } from "../channel/guard";
import { dataChannelMessage } from "./schema";

export function createMessageSender(dc: RTCDataChannel) {
  return {
    sendMessage(text: string) {
      try {
        ensureChannelOpen(dc);
        dc.send(dataChannelMessage({ type: "text", text }));
      } catch (error) {
        console.warn("Failed to send message:", error);
      }
    },
  };
}

export type MessageSender = ReturnType<typeof createMessageSender>
