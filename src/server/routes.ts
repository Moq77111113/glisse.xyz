import { Hono } from "hono";
import indexHtmlRaw from "../../public/index.html?raw";
import roomHtmlRaw from "../../public/room.html?raw";

interface Env {
  ROOM: DurableObjectNamespace;
}

export const routes = new Hono<{ Bindings: Env }>();

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => chars[byte % chars.length])
    .join("");
}

function transformHtml(html: string): string {
  if (import.meta.env.PROD) {
    return html
      .replace(/\/src\/style\.css/g, "/assets/style.css")
      .replace(/\/src\/effects\/noise\.ts/g, "/assets/noise.js")
      .replace(/\/src\/pages\/lobby\.ts/g, "/assets/lobby.js")
      .replace(/\/src\/pages\/room\/init\.ts/g, "/assets/room.js");
  }
  return html;
}

const indexHtml = transformHtml(indexHtmlRaw);
const roomHtml = transformHtml(roomHtmlRaw);

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

routes.get("/ws/:roomCode", async (c) => {
  const roomCode = c.req.param("roomCode");
  const id = c.env.ROOM.idFromName(roomCode);
  const stub = c.env.ROOM.get(id);
  return stub.fetch(c.req.raw);
});
