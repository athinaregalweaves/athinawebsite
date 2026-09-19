import { createRoot } from "react-dom/client";
import { migrateLegacyAuthFromLocalStorage } from "./lib/authStorage";
import App from "./App.tsx";
import "./index.css";

migrateLegacyAuthFromLocalStorage();

createRoot(document.getElementById("root")!).render(<App />);
