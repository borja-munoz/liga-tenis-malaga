import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
// Self-hosted fonts (bundled, so they also work offline in the PWA)
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./style.css";

import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>
);