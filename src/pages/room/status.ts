type ConnectionState = "connecting" | "connected" | "failed";

export function updateStatus(state: ConnectionState) {
  const indicator = document.querySelector("[data-status-indicator]");
  const statusText = document.querySelector("[data-status-text]");

  if (!indicator || !statusText) return;

  switch (state) {
    case "connecting":
      indicator.className = "size-2 rounded-full bg-muted-foreground/30";
      statusText.textContent = "Connecting...";
      break;
    case "connected":
      indicator.className = "size-2 rounded-full bg-primary";
      statusText.textContent = "Connected";
      break;
    case "failed":
      indicator.className = "size-2 rounded-full bg-destructive";
      statusText.textContent = "Failed";
      break;
  }
}
