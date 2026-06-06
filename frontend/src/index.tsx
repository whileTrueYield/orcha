// import React from "react";
// Crepe's theme must be bundled BEFORE Tailwind: its `.milkdown * { margin: 0;
// padding: 0 }` reset ties on specificity with utility classes (both 0,1,0), so
// source order decides the winner. Loading it first lets Tailwind-styled React
// embeds inside the editor keep their spacing, while Crepe's own editor styling
// is unaffected (it targets `.milkdown .ProseMirror …`, which wins on
// specificity alone).
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/nord.css";
import "./index.css";
// import ReactDOM from "react-dom";
import App from "./App";
// import * as serviceWorker from "./serviceWorker";

// ReactDOM.render(<App />, document.getElementById("root"));

import { createRoot } from "react-dom/client";
const container = document.getElementById("root");
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
