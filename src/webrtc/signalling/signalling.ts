import { connectionStateBus } from "../session/events";
import type { SignallingAPI } from "./api";
import { api } from "./api";
import { handleMessage } from "./handler";
import { parseSignallingMessage, signalingMessage } from "./schema";
import type { SignallingContext } from "./types";
import { createWsConnection } from "./ws";

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
  const { url, protocol } = getSignallingUrl();
  const ws = createWsConnection({
    roomId: roomCode,
    signallingServerUrl: url,
    protocol,
  });

  let resolveApi: (api: SignallingAPI) => void;

  const setupPcHandlers = (pc: RTCPeerConnection) => {
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
      const handlers = {
        connected: () => connectionStateBus.emit("connected"),
        disconnected: () => connectionStateBus.emit("disconnected"),
        failed: () => connectionStateBus.emit("failed"),
        connecting: () => connectionStateBus.emit("connecting"),
        new: () => connectionStateBus.emit("connecting"),
        closed: () => connectionStateBus.emit("disconnected"),
      } satisfies Record<RTCPeerConnectionState, () => void>;
      handlers[state]?.();
    };

    pc.ondatachannel = (e) => {
      ctx.dataChannel = e.channel;

      const checkAndResolve = () => {
        if (e.channel.readyState === "open") {
          resolveApi(api(ctx));
          connectionStateBus.emit("peer-to-peer");
          ctx.ws.close();
        }
      };

      e.channel.onopen = checkAndResolve;
      e.channel.onclose = () => connectionStateBus.emit("disconnected");
      e.channel.onerror = () => connectionStateBus.emit("failed");
      checkAndResolve();
    };
  };

  const createPc = () => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    setupPcHandlers(pc);
    return pc;
  };

  const ctx: SignallingContext = {
    pc: createPc(),
    ws,
    role: "responder",
    createPc,
  };

  return new Promise<SignallingAPI>((resolve) => {
    resolveApi = resolve;

    ws.onmessage = async (event) => {
      const msg = parseSignallingMessage(event.data);
      await handleMessage(msg, ctx, resolve);
    };
  });
}
