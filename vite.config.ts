import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

function roomRewrite(): Plugin {
  return {
    name: "room-rewrite",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith("/r/")) {
          req.url = "/room.html";
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), roomRewrite()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/ws": {
        target: "http://localhost:3000",
        ws: true,
      },
      "/create": {
        target: "http://localhost:3000",
      },
      "/join": {
        target: "http://localhost:3000",
      },
      "/about": {
        target: "http://localhost:3000",
      },
    },
  },
  build: {
    outDir: "dist/client",
    rollupOptions: {
      input: {
        lobby: path.resolve(__dirname, "src/pages/lobby.ts"),
        room: path.resolve(__dirname, "src/pages/room/init.ts"),
        noise: path.resolve(__dirname, "src/effects/noise.ts"),
        style: path.resolve(__dirname, "src/style.css"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
