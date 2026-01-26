import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflare({
      configPath: "./wrangler.jsonc",
      persistState: true,
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  build: {
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
