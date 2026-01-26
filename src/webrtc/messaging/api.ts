import { dataChannelMessage } from "./schema"

export function createMessageSender(dc: RTCDataChannel) {
  return {
    sendMessage(text: string) {
      dc.send(dataChannelMessage({ type: "text", text }))
    },
  }
}

export type MessageSender = ReturnType<typeof createMessageSender>
