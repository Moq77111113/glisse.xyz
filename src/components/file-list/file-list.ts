export class GlisseFileList extends HTMLElement {
  connectedCallback(): void {
    this.style.display = "flex";
    this.style.flexDirection = "column";
    this.style.gap = "0.5rem";
  }

  addItem(element: HTMLElement): void {
    this.prepend(element);
  }
}

customElements.define("glisse-file-list", GlisseFileList);
