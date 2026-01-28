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
  console.log("Joining room:", roomCode);
  try {
    const session = await joinRoom(roomCode);
    console.log("Joined room successfully");
    setupTextSync(session);
    console.log("Text sync setup complete");
    fileTransferController?.connectSession(session);

    return session;
  } catch {
    console.log("Failed to join room");
    updateStatus("failed");
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initRoom();
});
