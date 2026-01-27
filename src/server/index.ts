import type { Server, ServerWebSocket } from "bun";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { routes } from "./routes";
import { roomManager } from "./storage/room-manager";

type WebSocketData = {
  roomCode: string;
  peerId?: string;
};

const app = new Hono<{ Bindings: { server: Server<WebSocketData> } }>();

app.route("/", routes);

app.use("*", serveStatic({ root: "./dist/client" }));

export default {
  port: Number(process.env.PORT || 3000),
  fetch(req: Request, server: Server<WebSocketData>) {
    return app.fetch(req, { server });
  },
  websocket: {
    open(ws: ServerWebSocket<WebSocketData>) {
      const { roomCode } = ws.data;

      const result = roomManager.addPeer(roomCode, ws);

      if (!result.ok) {
        ws.close(1008, result.error);
        return;
      }

      ws.data.peerId = result.peerId;
    },
    message(ws: ServerWebSocket<WebSocketData>, message: string | ArrayBuffer) {
      if (typeof message !== "string") return;

      const { roomCode, peerId } = ws.data;
      if (!peerId) return;

      roomManager.handleMessage(roomCode, peerId, message);
    },
    close(ws: ServerWebSocket<WebSocketData>) {
      const { roomCode, peerId } = ws.data;
      if (!peerId) return;

      roomManager.removePeer(roomCode, peerId);
    },
    error(ws: ServerWebSocket<WebSocketData>, error: Error) {
      console.error("WebSocket error:", error);

      const { roomCode, peerId } = ws.data;
      if (!peerId) return;

      roomManager.removePeer(roomCode, peerId);
    },
  },
};
