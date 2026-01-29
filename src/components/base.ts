export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function parseNumberAttr(
  element: HTMLElement,
  name: string,
  defaultValue: number
): number {
  const value = element.getAttribute(name);
  return value ? parseFloat(value) : defaultValue;
}

export function parseBooleanAttr(
  element: HTMLElement,
  name: string
): boolean {
  return element.hasAttribute(name);
}

export function dispatchCustomEvent<T>(
  element: HTMLElement,
  eventName: string,
  detail: T
): void {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    composed: true,
  });
  element.dispatchEvent(event);
}
