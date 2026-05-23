import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "/",
  plugins: [react(), viteTsconfigPaths()],
  server: {
    host: "0.0.0.0",
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000
    port: 3000,
  },
  build: {
    // this sets the output directory to build
    outDir: "build",
  },
});
