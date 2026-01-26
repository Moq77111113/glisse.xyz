import { raw } from "hono/html";
import { jsxRenderer } from "hono/jsx-renderer";
import { Layout } from "../../components/layout";

export const renderer = jsxRenderer(({ children }, c) => {
  const path = c.req.path;
  const isLobby = path === "/";
  const isRoom = path.startsWith("/r/");

  return (
    <>
      {raw("<!DOCTYPE html>")}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link href="/src/style.css" rel="stylesheet" />
          <script type="module" src="/src/app/effects/noise.ts" />
          {isLobby && <script type="module" src="/src/app/client/lobby.ts" />}
          {isRoom && <script type="module" src="/src/app/client/room.ts" />}
        </head>
        <body>
          <Layout>{children}</Layout>
        </body>
      </html>
    </>
  );
});
