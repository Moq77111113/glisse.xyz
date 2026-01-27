import { connectionStateBus } from "../session/events";
import { api, type SignallingAPI } from "./api";
import {
  signalingMessage,
  type SignallingMessage,
  type SignalPayload,
} from "./schema";
import type { SignallingContext } from "./types";

async function handleSignalPayload(
  payload: SignalPayload,
  ctx: SignallingContext,
) {
  const { pc, ws } = ctx;

  if (pc.connectionState === "closed") {
    return;
  }

  switch (payload.type) {
    case "offer":
      await pc.setRemoteDescription({ type: "offer", sdp: payload.sdp });

      const answer = await pc.createAnswer();
      if (!answer.sdp) {
        throw new Error("Failed to create answer SDP");
      }
      await pc.setLocalDescription(answer);

      ws.send(
        signalingMessage({
          type: "answer",
          sdp: answer.sdp,
          peerId: payload.peerId,
        }),
      );
      break;

    case "answer":
      await pc.setRemoteDescription({ type: "answer", sdp: payload.sdp });
      break;

    case "ice-candidate":
      await pc.addIceCandidate(JSON.parse(payload.candidate));
      break;
  }
}

export async function handleMessage(
  msg: SignallingMessage,
  ctx: SignallingContext,
  resolve: (api: SignallingAPI) => void,
) {
  const { pc, ws } = ctx;

  switch (msg.type) {
    case "peer-joined":
      if (pc.connectionState === "closed") {
        ctx.pc = ctx.createPc();
      }
      ctx.role = "initiator";
      ctx.dataChannel = ctx.pc.createDataChannel("data");

      const checkAndResolve = () => {
        if (ctx.dataChannel?.readyState === "open") {
          resolve(api(ctx));
        }
      };

      ctx.dataChannel.onopen = checkAndResolve;
      ctx.dataChannel.onclose = () => connectionStateBus.emit("disconnected");
      ctx.dataChannel.onerror = () => connectionStateBus.emit("failed");
      checkAndResolve();

      const offer = await ctx.pc.createOffer();
      await ctx.pc.setLocalDescription(offer);
      if (!offer.sdp) {
        break;
      }
      ws.send(
        signalingMessage({
          type: "offer",
          sdp: offer.sdp,
          peerId: msg.peerId,
        }),
      );
      break;

    case "peer-left":
      connectionStateBus.emit("disconnected");
      ctx.pc.close();
      break;

    case "signal":
      await handleSignalPayload(msg.payload, ctx);
      break;
  }
}
