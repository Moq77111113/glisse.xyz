import { decodeFileChunk } from "../file/binary";
import type { FileReceiver } from "../file/file-receiver";
import { parseDataChannelMessage } from "../messaging/schema";
import {
  fileProgressBus,
  fileReceiveStartBus,
  fileReceivedBus,
  messageBus,
} from "./events";

export function createDispatcher(fileReceiver: FileReceiver) {
  return (event: MessageEvent) => {
    const data = event.data;

    if (data instanceof ArrayBuffer) {
      handleBinaryChunk(data, fileReceiver);
      return;
    }

    if (typeof data === "string") {
      handleJsonMessage(data, fileReceiver);
      return;
    }
  };
}
function handleBinaryChunk(data: ArrayBuffer, receiver: FileReceiver) {
  const { fileId, payload } = decodeFileChunk(data);
  const progress = receiver.addChunk(fileId, payload);
  if (progress !== null) {
    fileProgressBus.emit(fileId, progress);
  }
}

function handleJsonMessage(data: string, receiver: FileReceiver) {
  const message = parseDataChannelMessage(data);

  switch (message.type) {
    case "text":
      messageBus.emit(message.text);
      break;

    case "file-start":
      receiver.start(message.id, message.name, message.size);
      fileReceiveStartBus.emit({
        id: message.id,
        name: message.name,
        size: message.size,
      });
      break;

    case "file-end": {
      const file = receiver.complete(message.id);
      if (file) fileReceivedBus.emit(file);
      break;
    }
  }
}
