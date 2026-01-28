import type { joinRoom } from "~/webrtc";
import {
  fileProgressBus,
  fileReceiveStartBus,
  fileReceivedBus,
  fileSendCompleteBus,
  fileSendStartBus,
} from "~/webrtc";
import { setupFilePicker } from "./picker";
import {
  createFileItem,
  createPendingFileItem,
  updateFileComplete,
} from "./ui";

type Session = Awaited<ReturnType<typeof joinRoom>>;

export function setupFileTransfer(session: Session | null) {
  const zone = document.querySelector("[data-drop-zone]");
  const list = document.querySelector("[data-file-list]");
  if (!zone || !list) return;

  const pendingFiles: File[] = [];
  const pendingItems = new Map<File, HTMLElement>();

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    if (session) {
      for (const file of fileArray) {
        session?.sendFile(file);
      }
    } else {
      for (const file of fileArray) {
        pendingFiles.push(file);
        const item = createPendingFileItem(file);
        pendingItems.set(file, item);
        list.prepend(item);
      }
    }
  };

  setupFilePicker(zone, handleFiles);

  const setupEventListeners = () => {
    fileSendStartBus.subscribe((info) => {
      const item = createFileItem(info, "send");
      list.prepend(item);
    });

    fileSendCompleteBus.subscribe((fileId) => {
      const item = list.querySelector<HTMLElement>(`[data-file="${fileId}"]`);
      if (item) updateFileComplete(item, "send");
    });

    fileReceiveStartBus.subscribe((info) => {
      const item = createFileItem(info, "receive");
      list.prepend(item);
    });

    fileProgressBus.subscribe((fileId, percent) => {
      const bar = list.querySelector<HTMLElement>(
        `[data-file="${fileId}"] [data-progress]`,
      );
      const status = list.querySelector<HTMLElement>(
        `[data-file="${fileId}"] [data-status]`,
      );
      if (bar) bar.style.width = `${percent}%`;
      if (status && percent < 100) status.textContent = `${percent}%`;
    });

    fileReceivedBus.subscribe((meta) => {
      const item = list.querySelector<HTMLElement>(`[data-file="${meta.id}"]`);
      if (item) {
        updateFileComplete(item, "receive", meta.blob, meta.name);
      }
    });
  };

  return {
    connectSession: (connectedSession: Session) => {
      session = connectedSession;
      setupEventListeners();
      for (const file of pendingFiles) {
        const pendingItem = pendingItems.get(file);
        if (pendingItem) {
          pendingItem.remove();
          pendingItems.delete(file);
        }
        connectedSession.sendFile(file);
      }
      pendingFiles.length = 0;
    },
  };
}
