export type MessageType = "sent" | "received";

export class GlisseMessage extends HTMLElement {
  private wrapper: HTMLDivElement | null = null;
  private bubble: HTMLDivElement | null = null;

  static get observedAttributes(): string[] {
    return ["type", "text"];
  }

  connectedCallback(): void {
    this.render();
    this.update();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue !== newValue) {
      this.update();
    }
  }

  private render(): void {
    this.wrapper = document.createElement("div");
    this.bubble = document.createElement("div");

    this.wrapper.appendChild(this.bubble);
    this.appendChild(this.wrapper);
  }

  private update(): void {
    if (!this.wrapper || !this.bubble) return;

    const type = this.getAttribute("type") as MessageType | null;
    const text = this.getAttribute("text") || "";

    if (!type) return;

    this.wrapper.className = `flex ${type === "sent" ? "justify-end" : "justify-start"}`;

    this.bubble.className = `max-w-52 py-2 px-1 rounded-2xl text-sm break-words ${
      type === "sent"
        ? "bg-primary text-primary-foreground rounded-br-sm"
        : "bg-muted text-foreground rounded-bl-sm"
    }`;

    this.bubble.textContent = text;
  }
}

customElements.define("glisse-message", GlisseMessage);
