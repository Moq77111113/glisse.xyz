export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "peer-to-peer";

interface StateConfig {
  indicatorClass: string;
  text: string;
}

const stateConfigs: Record<ConnectionState, StateConfig> = {
  connecting: {
    indicatorClass: "size-2 rounded-full bg-muted-foreground/30 animate-pulse",
    text: "Connecting...",
  },
  connected: {
    indicatorClass: "size-2 rounded-full bg-primary animate-pulse",
    text: "Connected",
  },
  "peer-to-peer": {
    indicatorClass: "size-2 rounded-full bg-accent animate-pulse",
    text: "Peer-to-peer",
  },
  disconnected: {
    indicatorClass: "size-2 rounded-full bg-muted-foreground/50 animate-pulse",
    text: "Disconnected",
  },
  failed: {
    indicatorClass: "size-2 rounded-full bg-destructive animate-pulse",
    text: "Failed",
  },
};

export class GlisseStatusBadge extends HTMLElement {
  private indicator: HTMLDivElement | null = null;
  private statusText: HTMLSpanElement | null = null;

  static get observedAttributes(): string[] {
    return ["state"];
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
    if (name === "state" && oldValue !== newValue) {
      this.update();
    }
  }

  private render(): void {
    this.indicator = document.createElement("div");
    this.statusText = document.createElement("span");
    this.statusText.className = "text-sm text-muted-foreground";

    this.appendChild(this.indicator);
    this.appendChild(this.statusText);
  }

  private update(): void {
    if (!this.indicator || !this.statusText) return;

    const state = this.getAttribute("state") as ConnectionState | null;
    if (!state || !stateConfigs[state]) return;

    const config = stateConfigs[state];
    this.indicator.className = config.indicatorClass;
    this.statusText.textContent = config.text;
  }
}

customElements.define("glisse-status-badge", GlisseStatusBadge);
