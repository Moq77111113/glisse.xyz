import { escapeHtml, parseNumberAttr } from "../base";

export type FileItemState = "pending" | "active" | "complete";
export type FileDirection = "send" | "receive";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export class GlisseFileItem extends HTMLElement {
  private icon: HTMLSpanElement | null = null;
  private nameEl: HTMLParagraphElement | null = null;
  private sizeEl: HTMLParagraphElement | null = null;
  private progressBar: HTMLDivElement | null = null;
  private progressContainer: HTMLDivElement | null = null;
  private statusEl: HTMLSpanElement | null = null;
  private blobUrl: string | null = null;

  static get observedAttributes(): string[] {
    return ["state", "direction", "progress", "file-id", "name", "size", "blob-url"];
  }

  connectedCallback(): void {
    this.render();
    this.update();
  }

  disconnectedCallback(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (name === "blob-url" && oldValue && oldValue !== newValue) {
      URL.revokeObjectURL(oldValue);
    }
    if (oldValue !== newValue) {
      this.update();
    }
  }

  private render(): void {
    this.className =
      "group flex items-center gap-3 p-3 border border-border bg-card transition-all";

    this.icon = document.createElement("span");
    this.icon.className = "font-mono text-lg";

    const infoContainer = document.createElement("div");
    infoContainer.className = "flex-1 min-w-0";

    this.nameEl = document.createElement("p");
    this.nameEl.className = "font-mono text-sm text-foreground truncate";

    this.sizeEl = document.createElement("p");
    this.sizeEl.className = "font-mono text-xs text-muted-foreground";

    infoContainer.appendChild(this.nameEl);
    infoContainer.appendChild(this.sizeEl);

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "flex items-center gap-3";

    this.progressContainer = document.createElement("div");
    this.progressContainer.className =
      "w-16 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden";

    this.progressBar = document.createElement("div");
    this.progressBar.className =
      "h-full bg-primary transition-all duration-150 rounded-full";
    this.progressBar.style.width = "0%";

    this.progressContainer.appendChild(this.progressBar);

    this.statusEl = document.createElement("span");
    this.statusEl.className =
      "font-mono text-xs text-muted-foreground w-20 text-right";

    actionsContainer.appendChild(this.progressContainer);
    actionsContainer.appendChild(this.statusEl);

    this.appendChild(this.icon);
    this.appendChild(infoContainer);
    this.appendChild(actionsContainer);
  }

  private update(): void {
    if (!this.icon || !this.nameEl || !this.sizeEl || !this.progressBar || !this.statusEl || !this.progressContainer) {
      return;
    }

    const state = this.getAttribute("state") as FileItemState | null;
    const direction = this.getAttribute("direction") as FileDirection | null;
    const progress = parseNumberAttr(this, "progress", 0);
    const name = this.getAttribute("name") || "";
    const size = parseNumberAttr(this, "size", 0);
    const blobUrl = this.getAttribute("blob-url");

    this.nameEl.textContent = name;
    this.sizeEl.textContent = formatBytes(size);

    if (state === "pending") {
      this.updatePending();
    } else if (state === "active" && direction) {
      this.updateActive(direction, progress);
    } else if (state === "complete" && direction) {
      this.updateComplete(direction, blobUrl, name);
    }
  }

  private updatePending(): void {
    if (!this.icon || !this.statusEl || !this.progressContainer) return;

    this.icon.textContent = "⏳";
    this.icon.className = "font-mono text-lg text-muted-foreground";
    this.statusEl.textContent = "Waiting...";
    this.progressContainer.style.display = "none";

    this.classList.remove(
      "cursor-pointer",
      "hover:border-accent/50",
      "hover:bg-accent/5",
      "opacity-60"
    );
    this.onclick = null;
  }

  private updateActive(direction: FileDirection, progress: number): void {
    if (!this.icon || !this.statusEl || !this.progressBar || !this.progressContainer) return;

    this.progressContainer.style.display = "block";
    this.progressBar.style.width = `${progress}%`;

    if (direction === "send") {
      this.icon.textContent = "↑";
      this.icon.className = "font-mono text-lg text-primary";
      this.statusEl.textContent = "Sending...";
    } else {
      this.icon.textContent = "↓";
      this.icon.className = "font-mono text-lg text-accent";
      this.statusEl.textContent = "Receiving...";
    }

    this.classList.remove(
      "cursor-pointer",
      "hover:border-accent/50",
      "hover:bg-accent/5",
      "opacity-60"
    );
    this.onclick = null;
  }

  private updateComplete(direction: FileDirection, blobUrl: string | null, fileName: string): void {
    if (!this.icon || !this.statusEl || !this.progressBar) return;

    this.progressBar.style.width = "100%";

    if (direction === "send") {
      this.icon.textContent = "✓";
      this.icon.className = "font-mono text-lg text-accent";
      this.statusEl.textContent = "Sent";
      this.classList.add("opacity-60");
      this.classList.remove(
        "cursor-pointer",
        "hover:border-accent/50",
        "hover:bg-accent/5"
      );
      this.onclick = null;
    } else if (blobUrl && fileName) {
      this.blobUrl = blobUrl;
      this.icon.textContent = "↓";
      this.icon.className =
        "font-mono text-lg text-accent group-hover:scale-110 transition-transform";
      this.statusEl.textContent = "Download";
      this.statusEl.className =
        "font-mono text-xs text-accent w-20 text-right";
      this.classList.add(
        "cursor-pointer",
        "hover:border-accent/50",
        "hover:bg-accent/5"
      );
      this.classList.remove("opacity-60");

      this.onclick = () => {
        if (!this.blobUrl || !this.statusEl) return;

        const link = document.createElement("a");
        link.href = this.blobUrl;
        link.download = fileName;
        link.click();

        this.statusEl.textContent = "Downloaded";
        this.statusEl.className =
          "font-mono text-xs text-muted-foreground w-20 text-right";
        this.classList.add("opacity-60");
        this.classList.remove(
          "cursor-pointer",
          "hover:border-accent/50",
          "hover:bg-accent/5"
        );
        this.onclick = null;
      };
    }
  }
}

customElements.define("glisse-file-item", GlisseFileItem);
