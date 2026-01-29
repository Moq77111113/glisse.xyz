import "~/components";

import type { Session } from "~/webrtc";
import { connectionStateBus, joinRoom } from "~/webrtc";

import { setupPageLifecycle } from "~/webrtc/session/lifecycle";
import { setupReconnectStrategy } from "~/webrtc/session/reconnection";
import { setupChat } from "./chat";
import { setupFileTransfer } from "./files";
import { updateStatus } from "./status";

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
  let currentSession: Session | null = null;

  const connectionRetryer = setupReconnectStrategy(async () => {
    const session = await joinRoom(roomCode);
    setupChat(session);
    fileTransferController?.connectSession(session);
    currentSession = session;
  });

  connectionStateBus.subscribe((state) => {
    updateStatus(state);
    if (state === "disconnected" && currentSession) {
      connectionRetryer.onPeerDisconnected();
    }
  });

  setupPageLifecycle(() => {
    if (currentSession) {
      currentSession.close();
    }
  });

  try {
    const session = await joinRoom(roomCode);
    setupChat(session);
    fileTransferController?.connectSession(session);
    currentSession = session;
    return session;
  } catch {
    updateStatus("failed");
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initRoom();
});
