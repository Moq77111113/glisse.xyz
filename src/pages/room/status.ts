import type { ConnectionState } from "~/components/status-badge/status-badge";

export function updateStatus(state: ConnectionState): void {
  const badge = document.querySelector<HTMLElement>("glisse-status-badge");
  if (!badge) return;

  badge.setAttribute("state", state);
}
