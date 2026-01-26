import { z } from "zod";

const signallingMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("peer-joined"), peerId: z.string() }),
  z.object({ type: z.literal("offer"), sdp: z.string(), peerId: z.string() }),
  z.object({ type: z.literal("answer"), sdp: z.string(), peerId: z.string() }),
  z.object({
    type: z.literal("ice-candidate"),
    candidate: z.string(),
    peerId: z.string(),
  }),
]);

export type SignallingMessage = z.infer<typeof signallingMessageSchema>;

export function parseSignallingMessage(data: unknown) {
  if (typeof data !== "string") {
    throw new Error("Invalid signalling message format");
  }
  const parsed = JSON.parse(data);

  return signallingMessageSchema.parse(parsed) satisfies SignallingMessage;
}

export function signalingMessage(message: SignallingMessage): string {
  return JSON.stringify(message);
}
