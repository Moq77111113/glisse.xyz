import { drain } from "../channel/drain";
import { ensureChannelOpen } from "../channel/guard";
import { dataChannelMessage } from "../messaging/schema";
import {
  fileProgressBus,
  fileSendCompleteBus,
  fileSendStartBus,
} from "../session/events";
import { createTaskQueue } from "./queue";
import { encodeFileChunk } from "./binary";
import { chunkFile } from "./chunk";
import { getSafeChunkSize } from "./chunk-size";

export function createFileSender(dc: RTCDataChannel, pc: RTCPeerConnection) {
  const queue = createTaskQueue();
  const chunkSize = getSafeChunkSize(pc);

  const sendFileInternal = async (file: File): Promise<string> => {
    const fileId = crypto.randomUUID();
    let sentBytes = 0;

    fileSendStartBus.emit({ id: fileId, name: file.name, size: file.size });

    ensureChannelOpen(dc);
    dc.send(
      dataChannelMessage({
        type: "file-start",
        id: fileId,
        name: file.name,
        size: file.size,
      }),
    );

    for await (const buffer of chunkFile(file, chunkSize)) {
      ensureChannelOpen(dc);
      dc.send(encodeFileChunk(fileId, buffer));
      sentBytes += buffer.byteLength;
      fileProgressBus.emit(
        fileId,
        Math.min(100, Math.round((sentBytes / file.size) * 100)),
      );
      await drain(dc);
    }

    ensureChannelOpen(dc);
    dc.send(dataChannelMessage({ type: "file-end", id: fileId }));
    fileSendCompleteBus.emit(fileId);
    return fileId;
  };

  return {
    sendFile: (file: File) => queue.enqueue(() => sendFileInternal(file)),
  };
}

export type FileSender = ReturnType<typeof createFileSender>;
