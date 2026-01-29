import { dispatchCustomEvent } from "../base";

export class GlisseChatInput extends HTMLElement {
  private input: HTMLInputElement | null = null;
  private button: HTMLButtonElement | null = null;

  connectedCallback(): void {
    this.render();
    this.setupListeners();
  }

  private render(): void {
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.placeholder = "Type a message...";
    this.input.className =
      "flex-1 bg-transparent border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-colors";

    this.button = document.createElement("button");
    this.button.textContent = "Send";
    this.button.className =
      "px-6 py-2 bg-primary text-primary-foreground text-sm rounded-full hover:opacity-90 transition-opacity";

    this.appendChild(this.input);
    this.appendChild(this.button);
  }

  private sendMessage(): void {
    if (!this.input) return;

    const text = this.input.value.trim();
    if (!text) return;

    dispatchCustomEvent(this, "glisse-message-send", { text });
    this.input.value = "";
  }

  private setupListeners(): void {
    if (!this.button || !this.input) return;

    this.button.addEventListener("click", () => this.sendMessage());

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }
}

customElements.define("glisse-chat-input", GlisseChatInput);
