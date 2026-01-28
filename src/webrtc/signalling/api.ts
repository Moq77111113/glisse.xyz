
import type { SignallingContext } from "./types";

export function api(ctx: SignallingContext){
  return {
    dataChannel: ctx.dataChannel,
    peerConnection: ctx.pc,
    close() {
      ctx.dataChannel?.close();
      ctx.pc.close();
      ctx.ws.close();
    }
  };
}


export type SignallingAPI = ReturnType<typeof api>;