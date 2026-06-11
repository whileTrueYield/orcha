import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "/",
  plugins: [react(), viteTsconfigPaths()],
  resolve: {
    // Crepe (Milkdown) is the only ProseMirror consumer left, but several of its
    // sub-packages (prosemirror-tables, prosemirror-drop-indicator,
    // @milkdown/prose, …) each install their own nested copy of the SAME
    // prosemirror-model/state/view version. Vite's dep pre-bundler will inline
    // every physical copy it resolves, producing multiple `Fragment` /
    // `Decoration` classes in one bundle. Cross-instance `instanceof` then fails,
    // which surfaces as "multiple versions of prosemirror-model were loaded" and
    // the `DecorationGroup.locals` → "reading 'localsInner' of undefined" crash on
    // the first plugin-driven interaction (focus, slash menu, selection toolbar).
    //
    // Forcing every prosemirror-* specifier to a single resolved copy collapses
    // them to one instance. This is needed IN ADDITION to keeping one version in
    // the lockfile (the old @tiptap/pm exact `prosemirror-model@1.19.4` pin, which
    // used to add a second version, is gone now that the frontend is Tiptap-free).
    dedupe: [
      "prosemirror-model",
      "prosemirror-state",
      "prosemirror-view",
      "prosemirror-transform",
      "prosemirror-keymap",
      "prosemirror-commands",
      "prosemirror-history",
      "prosemirror-inputrules",
      "prosemirror-gapcursor",
      "prosemirror-schema-list",
      "prosemirror-tables",
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
