import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./style.css";

import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>
);