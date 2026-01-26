import { Hono } from "hono";
import { routes } from "./routes";

interface Env {
  ROOM: DurableObjectNamespace;
  ASSETS?: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

app.route("/", routes);

app.get("*", async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.notFound();
});

export default app;

export { Room } from "./storage/room";
