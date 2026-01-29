import type { joinRoom } from "~/webrtc";
import {
  fileProgressBus,
  fileReceiveStartBus,
  fileReceivedBus,
  fileSendCompleteBus,
  fileSendStartBus,
} from "~/webrtc";
import {
  createPendingFileItem,
  createActiveFileItem,
} from "~/components/factories";
import type { GlisseFileItem } from "~/components/file-item/file-item";

type Session = Awaited<ReturnType<typeof joinRoom>>;

export function setupFileTransfer(session: Session | null) {
  const filePicker = document.querySelector<HTMLElement>("glisse-file-picker");
  const list = document.querySelector("[data-file-list]");
  if (!filePicker || !list) return;

  const pendingFiles: File[] = [];
  const pendingItems = new Map<File, GlisseFileItem>();

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

  filePicker.addEventListener("glisse-files-selected", (e: Event) => {
    const event = e as CustomEvent<{ files: FileList }>;
    handleFiles(event.detail.files);
  });

  const setupEventListeners = () => {
    fileSendStartBus.subscribe((info) => {
      const item = createActiveFileItem(info, "send");
      list.prepend(item);
    });

    fileSendCompleteBus.subscribe((fileId) => {
      const item = list.querySelector<GlisseFileItem>(
        `glisse-file-item[file-id="${fileId}"]`
      );
      if (item) {
        item.setAttribute("state", "complete");
      }
    });

    fileReceiveStartBus.subscribe((info) => {
      const item = createActiveFileItem(info, "receive");
      list.prepend(item);
    });

    fileProgressBus.subscribe((fileId, percent) => {
      const item = list.querySelector<GlisseFileItem>(
        `glisse-file-item[file-id="${fileId}"]`
      );
      if (item) {
        item.setAttribute("progress", percent.toString());
      }
    });

    fileReceivedBus.subscribe((meta) => {
      const item = list.querySelector<GlisseFileItem>(
        `glisse-file-item[file-id="${meta.id}"]`
      );
      if (item) {
        const blobUrl = URL.createObjectURL(meta.blob);
        item.setAttribute("blob-url", blobUrl);
        item.setAttribute("state", "complete");
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
