import { connectionStateBus, joinRoom } from "~/webrtc";
import { setupFileTransfer } from "./files";
import { updateStatus } from "./status";
import { setupTextSync } from "./text";

function getRoomCodeFromUrl(): string {
  return window.location.pathname.split("/").pop() || "";
}

function updateRoomCodeDisplay(roomCode: string) {
  document.title = `Room ${roomCode} - glisse`;
  const codeElement = document.querySelector("[data-room-code]");
  if (codeElement) {
    codeElement.textContent = roomCode;
  }
}

async function initRoom() {
  const roomCode = getRoomCodeFromUrl();
  updateRoomCodeDisplay(roomCode);

  updateStatus("connecting");

  const fileTransferController = setupFileTransfer(null);

  connectionStateBus.subscribe((state) => {
    updateStatus(state);
  });
  try {
    const session = await joinRoom(roomCode);
    setupTextSync(session);
    fileTransferController?.connectSession(session);

    return session;
  } catch {
    updateStatus("failed");
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initRoom();
});
