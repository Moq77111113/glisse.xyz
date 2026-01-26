import { joinRoom } from "~/webrtc";
import { updateStatus } from "./status";
import { setupTextSync } from "./text";
import { setupFileTransfer } from "./files";

function getRoomCodeFromUrl(): string {
  return window.location.pathname.split("/").pop() || "";
}

async function initRoom() {
  const roomCode = getRoomCodeFromUrl();

  updateStatus("connecting");

  try {
    const session = await joinRoom(roomCode);

    updateStatus("connected");

    setupTextSync(session);
    setupFileTransfer(session);

    return session;
  } catch {
    updateStatus("failed");
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initRoom();
});
