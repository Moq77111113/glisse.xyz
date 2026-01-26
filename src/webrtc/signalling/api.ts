
import type { SignallingContext } from "./types";

export function api(ctx: SignallingContext){
  return {
    dataChannel: ctx.dataChannel,
    close() {
      ctx.pc.close();
      ctx.ws.close();
    }
  };
}


export type SignallingAPI = ReturnType<typeof api>;