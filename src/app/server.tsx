import { Hono } from "hono";
import { Lobby } from "../components/Lobby";
import { Room } from "../components/Room";
import { renderer } from "./middlewares/renderer";

interface Env {
  ROOM: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

app.use(renderer);

function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => chars[byte % chars.length])
    .join("");
}

app.get("/", (c) => {
  return c.render(<Lobby />);
});

app.post("/create", (c) => {
  const roomCode = generateRoomCode();
  return c.redirect(`/r/${roomCode}`);
});

app.get("/join", (c) => {
  const code = c.req.query("code")?.toUpperCase();
  if (code && /^[A-Z0-9]{4}$/.test(code)) {
    return c.redirect(`/r/${code}`);
  }
  return c.redirect("/");
});

app.get("/r/:roomCode", (c) => {
  const roomCode = c.req.param("roomCode");
  return c.render(<Room roomCode={roomCode} />);
});

app.get("/ws/:roomCode", async (c) => {
  const roomCode = c.req.param("roomCode");
  const id = c.env.ROOM.idFromName(roomCode);
  const stub = c.env.ROOM.get(id);
  return stub.fetch(c.req.raw);
});

export default app;

export { Room } from "./storage/room";
