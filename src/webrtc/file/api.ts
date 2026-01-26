import { drain } from "../channel/drain";
import { dataChannelMessage } from "../messaging/schema";
import { fileProgressBus } from "../session/events";
import { encodeFileChunk } from "./binary";
import { chunkFile } from "./chunk";

const CHUNK_SIZE = 256 * 1024;

export function createFileSender(dc: RTCDataChannel) {
  return {
    async sendFile(file: File) {
      const fileId = crypto.randomUUID();
      let sentBytes = 0;

      dc.send(
        dataChannelMessage({
          type: "file-start",
          id: fileId,
          name: file.name,
          size: file.size,
        }),
      );

      for await (const buffer of chunkFile(file, CHUNK_SIZE)) {
        dc.send(encodeFileChunk(fileId, buffer));
        sentBytes += buffer.byteLength;
        fileProgressBus.emit(
          fileId,
          Math.min(100, Math.round((sentBytes / file.size) * 100)),
        );
        await drain(dc);
      }

      dc.send(dataChannelMessage({ type: "file-end", id: fileId }));
      return fileId;
    },
  };
}

export type FileSender = ReturnType<typeof createFileSender>;
