import React from "react";
import {createRoot} from "react-dom/client";
import App from "./App";
import "./styles.css";
import { AppearanceProvider } from "./features/appearance/hooks/AppearanceProvider";
import { applyAppearance, initialAppearance } from "./features/appearance/services/preference";
// Keep legacy hash links while allowing Vercel direct paths and refreshes.
if (!window.location.hash && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
  window.history.replaceState(null, '', '/#' + window.location.pathname + window.location.search);
}
try { document.documentElement.classList.toggle('large-text', localStorage.getItem('ielts-large-text') === 'true'); } catch { /* Preferences are optional when storage is unavailable. */ }
applyAppearance(initialAppearance(), window.matchMedia("(prefers-color-scheme: dark)").matches);
createRoot(document.getElementById("root")!).render(<React.StrictMode><AppearanceProvider><App/></AppearanceProvider></React.StrictMode>);
import "./prototype.css";


import "./foundation.css";
