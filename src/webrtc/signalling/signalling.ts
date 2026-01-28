import { connectionStateBus } from "../session/events";
import type { SignallingAPI } from "./api";
import { api } from "./api";
import { handleMessage } from "./handler";
import { parseSignallingMessage, signalingMessage } from "./schema";
import type { SignallingContext } from "./types";
import { createWsConnection } from "./ws";

const DEFAULT_STUN_SERVERS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
];

const cachedStunServers = new Set<string>();

async function fetchStunServers(): Promise<string[]> {
  if (cachedStunServers.size > 0) {
    return Promise.resolve(Array.from(cachedStunServers));
  }
  try {
    const response = await fetch("/api/config");
    const data = await response.json();

    cachedStunServers.clear();
    for (const server of data.stunServers ?? DEFAULT_STUN_SERVERS) {
      cachedStunServers.add(server);
    }
    return Array.from(cachedStunServers);
  } catch (e) {
    return DEFAULT_STUN_SERVERS;
  }
}

async function getIceServers(): Promise<RTCIceServer[]> {
  const stunServers = await fetchStunServers();
  return stunServers.map((urls) => ({ urls }));
}

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
        }
      };

      e.channel.onopen = checkAndResolve;
      e.channel.onclose = () => connectionStateBus.emit("disconnected");
      e.channel.onerror = () => connectionStateBus.emit("failed");
      checkAndResolve();
    };
  };

  const createPc = async () => {
    const iceServers = await getIceServers();
    const pc = new RTCPeerConnection({ iceServers });
    setupPcHandlers(pc);
    return pc;
  };

  const ctx: SignallingContext = {
    pc: await createPc(),
    ws,
    role: "responder",
    createPc,
    pendingIceCandidates: [],
  };

  return new Promise<SignallingAPI>((resolve) => {
    resolveApi = resolve;

    ws.onmessage = async (event) => {
      const msg = parseSignallingMessage(event.data);
      await handleMessage(msg, ctx, resolve);
    };
  });
}
