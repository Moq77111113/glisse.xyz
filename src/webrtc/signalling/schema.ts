import { z } from "zod";

const signalPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("offer"), sdp: z.string(), peerId: z.string() }),
  z.object({ type: z.literal("answer"), sdp: z.string(), peerId: z.string() }),
  z.object({
    type: z.literal("ice-candidate"),
    candidate: z.string(),
    peerId: z.string(),
  }),
]);

const signallingMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("peer-joined"), peerId: z.string() }),
  z.object({ type: z.literal("peer-left"), peerId: z.string() }),
  z.object({ type: z.literal("signal"), payload: signalPayloadSchema }),
]);

export type SignalPayload = z.infer<typeof signalPayloadSchema>;
export type SignallingMessage = z.infer<typeof signallingMessageSchema>;

export function parseSignallingMessage(data: unknown): SignallingMessage {
  if (typeof data !== "string") {
    throw new Error("Invalid signalling message format");
  }
  const parsed = JSON.parse(data);

  return signallingMessageSchema.parse(parsed);
}

export function signalingMessage(message: SignalPayload): string {
  return JSON.stringify(message);
}
