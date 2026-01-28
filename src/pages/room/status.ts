type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "peer-to-peer";

export function updateStatus(state: ConnectionState) {
  const indicator = document.querySelector("[data-status-indicator]");
  const statusText = document.querySelector("[data-status-text]");

  if (!indicator || !statusText) return;

  switch (state) {
    case "connecting":
      indicator.className =
        "size-2 rounded-full bg-muted-foreground/30 animate-pulse";
      statusText.textContent = "Connecting...";
      break;
    case "connected":
      indicator.className = "size-2 rounded-full bg-primary animate-pulse";
      statusText.textContent = "Connected";
      break;
    case "peer-to-peer":
      indicator.className = "size-2 rounded-full bg-accent animate-pulse";
      statusText.textContent = "Peer-to-peer";
      break;
    case "disconnected":
      indicator.className =
        "size-2 rounded-full bg-muted-foreground/50 animate-pulse";
      statusText.textContent = "Disconnected";
      break;
    case "failed":
      indicator.className = "size-2 rounded-full bg-destructive animate-pulse";
      statusText.textContent = "Failed";
      break;
  }
}
