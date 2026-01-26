import type { SignallingAPI } from "./api";
import { api } from "./api";
import { handleMessage } from "./handler";
import { parseSignallingMessage, signalingMessage } from "./schema";
import type { SignallingContext } from "./types";
import { createWsConnection } from "./ws";
import { connectionStateBus } from "../session/events";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

function getSignallingUrl(): { url: string; protocol: "ws" | "wss" } {
  const isSecure = window.location.protocol === "https:";
  const protocol = isSecure ? "wss" : "ws";
  const url = `${window.location.protocol}//${window.location.host}`;
  return { url, protocol };
}

export async function createSignallingApi(
  roomCode: string,
): Promise<SignallingAPI> {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  const { url, protocol } = getSignallingUrl();
  const ws = createWsConnection({
    roomId: roomCode,
    signallingServerUrl: url,
    protocol,
  });

  const ctx: SignallingContext = {
    pc,
    ws,
    role: "responder",
  };

  return new Promise<SignallingAPI>((resolve) => {
    ws.onmessage = async (event) => {
      const msg = parseSignallingMessage(event.data);
      await handleMessage(msg, ctx, resolve);
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        ws.send(
          signalingMessage({
            type: "ice-candidate",
            candidate: JSON.stringify(e.candidate),
            peerId: "self",
          }),
        );
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        connectionStateBus.emit("connected");
      } else if (state === "disconnected") {
        connectionStateBus.emit("disconnected");
      } else if (state === "failed") {
        connectionStateBus.emit("failed");
      } else if (state === "connecting" || state === "new") {
        connectionStateBus.emit("connecting");
      }
    };

    pc.ondatachannel = (e) => {
      ctx.dataChannel = e.channel;

      const checkAndResolve = () => {
        if (e.channel.readyState === "open") {
          resolve(api(ctx));
        }
      };

      e.channel.onopen = checkAndResolve;
      checkAndResolve();
    };
  });
}
