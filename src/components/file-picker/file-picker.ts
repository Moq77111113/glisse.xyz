import { dispatchCustomEvent } from "../base";

function detectMobile(): boolean {
  return (
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints ?? 0) > 1
  );
}

export class GlisseFilePicker extends HTMLElement {
  private isMobile: boolean = false;
  private placeholder: HTMLParagraphElement | null = null;

  connectedCallback(): void {
    this.isMobile = detectMobile();
    this.render();
    this.setupListeners();
  }

  private render(): void {
    this.placeholder = document.createElement("p");
    this.placeholder.className = "text-muted-foreground";
    this.placeholder.textContent = this.isMobile
      ? "Tap to select files"
      : "Drop files or click to select";

    this.appendChild(this.placeholder);
  }

  private openFilePicker(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => {
      if (input.files) {
        dispatchCustomEvent(this, "glisse-files-selected", {
          files: input.files,
        });
      }
    };
    input.click();
  }

  private setupListeners(): void {
    this.addEventListener("click", () => this.openFilePicker());

    this.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.openFilePicker();
    });

    if (!this.isMobile) {
      this.addEventListener("dragover", (e) => {
        e.preventDefault();
        this.classList.add("border-primary", "bg-primary/5");
      });

      this.addEventListener("dragleave", () => {
        this.classList.remove("border-primary", "bg-primary/5");
      });

      this.addEventListener("drop", (e) => {
        e.preventDefault();
        this.classList.remove("border-primary", "bg-primary/5");
        const dt = e as DragEvent;
        if (dt.dataTransfer?.files) {
          dispatchCustomEvent(this, "glisse-files-selected", {
            files: dt.dataTransfer.files,
          });
        }
      });
    }
  }
}

customElements.define("glisse-file-picker", GlisseFilePicker);
