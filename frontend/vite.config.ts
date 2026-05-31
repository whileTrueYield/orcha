import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "/",
  plugins: [react(), viteTsconfigPaths()],
  resolve: {
    // Tiptap (@tiptap/pm) and Milkdown/Crepe both depend on ProseMirror. Without
    // forcing a single copy, Vite can resolve `prosemirror-state` to two module
    // instances. ProseMirror keys unnamed plugins off a module-global counter,
    // so plugins created against two instances collide under the same key and
    // the editor throws "Adding different instances of a keyed plugin". Deduping
    // collapses every `prosemirror-*` import (Tiptap's and Milkdown's) to one
    // copy, removing the collision at the source.
    //
    // Only the core, well-behaved-ESM packages are listed. Do NOT add
    // `prosemirror-tables` or `@milkdown/prose` — their `export *` re-exports
    // break esbuild's pre-bundling ("No matching export ... findTable").
    dedupe: [
      "prosemirror-state",
      "prosemirror-view",
      "prosemirror-model",
      "prosemirror-transform",
      "prosemirror-keymap",
    ],
  },
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
