import { api, type SignallingAPI } from "./api";
import { signalingMessage, type SignallingMessage } from "./schema";
import type { SignallingContext } from "./types";

export async function handleMessage(
  msg: SignallingMessage,
  ctx: SignallingContext,
  resolve: (api: SignallingAPI) => void,
) {
  const { pc, ws } = ctx;

  switch (msg.type) {
    case "peer-joined":
      ctx.role = "initiator";
      ctx.dataChannel = pc.createDataChannel("data");

      const checkAndResolve = () => {
        if (ctx.dataChannel?.readyState === "open") {
          resolve(api(ctx));
        }
      };

      ctx.dataChannel.onopen = checkAndResolve;
      checkAndResolve();

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
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

    case "offer":
      await pc.setRemoteDescription({ type: "offer", sdp: msg.sdp });

      const answer = await pc.createAnswer();
      if (!answer.sdp) {
        throw new Error("Failed to create answer SDP");
      }
      await pc.setLocalDescription(answer);

      ws.send(
        signalingMessage({
          type: "answer",
          sdp: answer.sdp,
          peerId: msg.peerId,
        }),
      );
      break;

    case "answer":
      await pc.setRemoteDescription({ type: "answer", sdp: msg.sdp });
      break;

    case "ice-candidate":
      await pc.addIceCandidate(JSON.parse(msg.candidate));
      break;
  }
}
