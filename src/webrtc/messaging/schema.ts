import { z } from "zod";

const dataChannelMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({
    type: z.literal("file-start"),
    id: z.string(),
    name: z.string(),
    size: z.number(),
  }),
  z.object({ type: z.literal("file-end"), id: z.string() }),
]);

export type DataChannelMessage = z.infer<typeof dataChannelMessageSchema>;

export function parseDataChannelMessage(data: unknown) {
  if (typeof data !== "string") {
    throw new Error("Invalid data channel message format");
  }
  const parsed = JSON.parse(data);

  return dataChannelMessageSchema.parse(parsed) satisfies DataChannelMessage;
}

export function dataChannelMessage(message: DataChannelMessage): string {
  return JSON.stringify(message);
}
