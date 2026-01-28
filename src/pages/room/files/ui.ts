import type { FileInfo } from "~/webrtc";

export type FileDirection = "send" | "receive";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function createFileItem(
  info: FileInfo,
  direction: FileDirection,
): HTMLElement {
  const item = document.createElement("div");
  item.dataset.file = info.id;
  item.dataset.direction = direction;
  item.className =
    "group flex items-center gap-3 p-3 border border-border bg-card transition-all";

  const arrow = direction === "send" ? "↑" : "↓";
  const arrowColor = direction === "send" ? "text-primary" : "text-accent";
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

export function createPendingFileItem(file: File): HTMLElement {
  const item = document.createElement("div");
  item.dataset.pendingFile = "true";
  item.className =
    "group flex items-center gap-3 p-3 border border-border bg-card transition-all";

  item.innerHTML = `
    <span class="font-mono text-lg text-muted-foreground" data-icon>⏳</span>
    <div class="flex-1 min-w-0">
      <p class="font-mono text-sm text-foreground truncate">${file.name}</p>
      <p class="font-mono text-xs text-muted-foreground">${formatBytes(file.size)}</p>
    </div>
    <div class="flex items-center gap-3">
      <span data-status class="font-mono text-xs text-muted-foreground w-20 text-right">Waiting...</span>
    </div>
  `;

  return item;
}

export function updateFileComplete(
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
      icon.classList.add(
        "text-green-500",
        "group-hover:scale-110",
        "transition-transform",
      );
    }
    if (status) {
      status.textContent = "Download";
      status.classList.add("text-green-500");
    }
    item.classList.add(
      "cursor-pointer",
      "hover:border-green-500/50",
      "hover:bg-green-500/5",
    );

    item.addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      link.click();
      URL.revokeObjectURL(link.href);
      if (status) status.textContent = "Downloaded";
      item.classList.add("opacity-60");
      item.classList.remove(
        "cursor-pointer",
        "hover:border-green-500/50",
        "hover:bg-green-500/5",
      );
    });
  }
}
