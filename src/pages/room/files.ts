import {
  fileProgressBus,
  fileReceiveStartBus,
  fileReceivedBus,
  fileSendCompleteBus,
  fileSendStartBus,
  type FileInfo,
} from "~/webrtc";
import type { joinRoom } from "~/webrtc";

type Session = Awaited<ReturnType<typeof joinRoom>>;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

type FileDirection = "send" | "receive";

function createFileItem(
  info: FileInfo,
  direction: FileDirection,
): HTMLElement {
  const item = document.createElement("div");
  item.dataset.file = info.id;
  item.dataset.direction = direction;
  item.className =
    "group flex items-center gap-3 p-3 border border-border bg-card transition-all";

  const arrow = direction === "send" ? "↑" : "↓";
  const arrowColor =
    direction === "send" ? "text-primary" : "text-accent";
  const statusText = direction === "send" ? "Sending..." : "Receiving...";

  item.innerHTML = `
    <span class="font-mono text-lg ${arrowColor}" data-icon>${arrow}</span>
    <div class="flex-1 min-w-0">
      <p class="font-mono text-sm text-foreground truncate">${info.name}</p>
      <p class="font-mono text-xs text-muted-foreground">${formatBytes(info.size)}</p>
    </div>
    <div class="flex items-center gap-3">
      <div class="w-16 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
        <div data-progress class="h-full bg-primary transition-all duration-150 rounded-full" style="width: 0%"></div>
      </div>
      <span data-status class="font-mono text-xs text-muted-foreground w-20 text-right">${statusText}</span>
    </div>
  `;

  return item;
}

function updateFileComplete(
  item: HTMLElement,
  direction: FileDirection,
  blob?: Blob,
  name?: string,
) {
  const icon = item.querySelector<HTMLElement>("[data-icon]");
  const progress = item.querySelector<HTMLElement>("[data-progress]");
  const status = item.querySelector<HTMLElement>("[data-status]");

  if (progress) progress.style.width = "100%";

  if (direction === "send") {
    if (icon) {
      icon.textContent = "✓";
      icon.classList.remove("text-primary");
      icon.classList.add("text-green-500");
    }
    if (status) status.textContent = "Sent";
    item.classList.add("opacity-60");
  } else if (blob && name) {
    if (icon) {
      icon.textContent = "↓";
      icon.classList.remove("text-accent");
      icon.classList.add("text-green-500", "group-hover:scale-110", "transition-transform");
    }
    if (status) {
      status.textContent = "Download";
      status.classList.add("text-green-500");
    }
    item.classList.add("cursor-pointer", "hover:border-green-500/50", "hover:bg-green-500/5");

    item.addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      link.click();
      URL.revokeObjectURL(link.href);
      if (status) status.textContent = "Downloaded";
      item.classList.add("opacity-60");
      item.classList.remove("cursor-pointer", "hover:border-green-500/50", "hover:bg-green-500/5");
    });
  }
}

export function setupFileTransfer(session: Session) {
  const zone = document.querySelector("[data-drop-zone]");
  const list = document.querySelector("[data-file-list]");
  if (!zone || !list) return;

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      session.sendFile(file);
    });
  };

  zone.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => input.files && handleFiles(input.files);
    input.click();
  });

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("border-primary", "bg-primary/5");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("border-primary", "bg-primary/5");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("border-primary", "bg-primary/5");
    const dt = e as DragEvent;
    if (dt.dataTransfer?.files) handleFiles(dt.dataTransfer.files);
  });

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
}
