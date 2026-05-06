import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, reportWebVitals } from "./lib/register-sw";

createRoot(document.getElementById("root")!).render(<App />);

registerServiceWorker();
reportWebVitals();
