import {
  fileProgressBus,
  fileReceivedBus,
  joinRoom,
  messageBus,
} from "~/webrtc";

const roomCode = window.location.pathname.split("/").pop() || "";
let session: Awaited<ReturnType<typeof joinRoom>> | null = null;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function init() {
  const indicator = document.querySelector("[data-status-indicator]");
  const statusText = document.querySelector("[data-status-text]");

  try {
    session = await joinRoom(roomCode);

    if (indicator) indicator.className = "size-2 rounded-full bg-primary";
    if (statusText) statusText.textContent = "Connected";
  } catch {
    if (statusText) statusText.textContent = "Failed";
    return;
  }

  setupText();
  setupFiles();
}

function setupText() {
  const textarea =
    document.querySelector<HTMLTextAreaElement>("[data-text-area]");
  if (!textarea) return;

  let timeout: number | null = null;

  textarea.addEventListener("input", () => {
    if (!session) return;
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(
      () => session?.sendMessage(textarea.value),
      300,
    );
  });

  messageBus.subscribe((text) => {
    if (document.activeElement !== textarea) textarea.value = text;
  });
}

function setupFiles() {
  const zone = document.querySelector("[data-drop-zone]");
  const list = document.querySelector("[data-file-list]");
  if (!zone || !list) return;

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!session) return;
      const id = crypto.randomUUID();
      addFileItem(list, id, file.name, file.size, true);
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
    zone.classList.add("border-primary");
  });

  zone.addEventListener("dragleave", () =>
    zone.classList.remove("border-primary"),
  );

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("border-primary");
    const dt = e as DragEvent;
    if (dt.dataTransfer?.files) handleFiles(dt.dataTransfer.files);
  });

  fileProgressBus.subscribe((fileId, percent) => {
    const bar = list.querySelector<HTMLElement>(
      `[data-file="${fileId}"] [data-progress]`,
    );
    if (bar) bar.style.width = `${percent}%`;
  });

  fileReceivedBus.subscribe((meta) => {
    addFileItem(list, meta.id, meta.name, meta.size, false, meta.blob);
  });
}

function addFileItem(
  list: Element,
  id: string,
  name: string,
  size: number,
  sending: boolean,
  blob?: Blob,
) {
  const item = document.createElement("div");
  item.dataset.file = id;
  item.className = "flex items-center gap-3 p-3 border border-border bg-card";
  item.innerHTML = `
    <span class="font-mono text-sm text-foreground truncate flex-1">${name}</span>
    <span class="font-mono text-xs text-muted-foreground">${formatBytes(size)}</span>
    <div class="w-12 h-1 bg-muted-foreground/20 relative">
      <div data-progress class="h-full bg-primary transition-all" style="width: 0%"></div>
    </div>
    <span data-status class="font-mono text-xs text-muted-foreground/50">${sending ? "Sending" : "Receiving"}</span>
  `;

  const statusEl = item.querySelector<HTMLElement>("[data-status]");
  const progressEl = item.querySelector<HTMLElement>("[data-progress]");

  if (blob) {
    item.style.cursor = "pointer";
    if (statusEl) statusEl.textContent = "Download";
    if (progressEl) progressEl.style.width = "100%";

    item.addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  } else {
    if (!sending && statusEl) statusEl.textContent = "Receiving";
    if (sending && statusEl) statusEl.textContent = "Sending";
    if (progressEl && !sending) progressEl.style.width = "0%";
  }

  list.appendChild(item);
}

document.addEventListener("DOMContentLoaded", init);
