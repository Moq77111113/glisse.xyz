import { createDispatcher } from "./dispatcher"
import { createFileSender } from "../file/api"
import { FileReceiver } from "../file/file-receiver"
import { createMessageSender } from "../messaging/api"
import { createSignallingApi } from "../signalling"
import { clearAllListeners } from "./events"

export async function joinRoom(roomCode: string) {
  const signalling = await createSignallingApi(roomCode)
  const dc = signalling.dataChannel

  if (!dc) {
    throw new Error("DataChannel not available")
  }

  const fileReceiver = FileReceiver()
  createDispatcher(dc, fileReceiver)

  const messaging = createMessageSender(dc)
  const fileSender = createFileSender(dc)

  const close = () => {
    clearAllListeners()
    signalling.close()
  }

  return {
    sendMessage: messaging.sendMessage,
    sendFile: fileSender.sendFile,
    close,
  }
}

export type Session = Awaited<ReturnType<typeof joinRoom>>
