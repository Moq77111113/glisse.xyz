import type { Server } from "bun";
import { Hono } from "hono";
import { dirname, join } from "path";
import { config } from "./config";

type WebSocketData = {
  roomCode: string;
};

export const routes = new Hono<{
  Bindings: { server: Server<WebSocketData> };
}>();

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => chars[byte % chars.length])
    .join("");
}

const rootDir = join(dirname(import.meta.path), "../..");

const indexHtml = await Bun.file(join(rootDir, "index.html")).text();
const roomHtml = await Bun.file(join(rootDir, "room.html")).text();
const about = await Bun.file(join(rootDir, "about.html")).text();

routes.get("/", (c) => {
  return c.html(indexHtml);
});

routes.post("/create", (c) => {
  const roomCode = generateRoomCode();
  return c.redirect(`/r/${roomCode}`);
});

routes.get("/join", (c) => {
  const code = c.req.query("code")?.toUpperCase();
  if (code && /^[A-Z0-9]{4}$/.test(code)) {
    return c.redirect(`/r/${code}`);
  }
  return c.redirect("/");
});

routes.get("/r/:roomCode", (c) => {
  const roomCode = c.req.param("roomCode");
  const html = roomHtml.replace(/\{\{ROOM_CODE\}\}/g, roomCode);
  return c.html(html);
});

routes.get("/about", (c) => {
  return c.html(about);
});

routes.get("/api/config", (c) => {
  return c.json({ stunServers: config.stunServers });
});

routes.get("/ws/:roomCode", async (c) => {
  const roomCode = c.req.param("roomCode");
  const upgradeHeader = c.req.header("Upgrade");

  if (upgradeHeader !== "websocket") {
    return c.text("Expected WebSocket upgrade", 426);
  }

  const server = c.env?.server;
  if (!server || typeof server.upgrade !== "function") {
    return c.text("WebSocket upgrade not available", 500);
  }

  const upgraded = server.upgrade(c.req.raw, {
    data: { roomCode },
  });

  if (!upgraded) {
    return c.text("Failed to upgrade to WebSocket", 500);
  }

  return new Response(null);
});
