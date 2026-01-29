export class GlisseMessageList extends HTMLElement {
  connectedCallback(): void {
    this.style.display = "flex";
    this.style.flexDirection = "column";
    this.style.gap = "0.75rem";
  }

  addMessage(element: HTMLElement): void {
    this.appendChild(element);
    this.scrollTop = this.scrollHeight;
  }
}

customElements.define("glisse-message-list", GlisseMessageList);
