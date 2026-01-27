import { joinRoom, connectionStateBus } from "~/webrtc";
import { updateStatus } from "./status";
import { setupTextSync } from "./text";
import { setupFileTransfer } from "./files";

function getRoomCodeFromUrl(): string {
  return window.location.pathname.split("/").pop() || "";
}

function updateRoomCodeDisplay(roomCode: string) {
  document.title = `Room ${roomCode} - oop`;
  const codeElement = document.querySelector("[data-room-code]");
  if (codeElement) {
    codeElement.textContent = roomCode;
  }
}

async function initRoom() {
  const roomCode = getRoomCodeFromUrl();
  updateRoomCodeDisplay(roomCode);

  updateStatus("connecting");

  connectionStateBus.subscribe((state) => {
    updateStatus(state);
  });

  try {
    const session = await joinRoom(roomCode);

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
