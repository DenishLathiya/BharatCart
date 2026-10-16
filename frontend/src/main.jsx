import { StrictMode } from "react";
import { createRoot }  from "react-dom/client";
import App from "./App.jsx";
import { registerSW } from "virtual:pwa-register";
import "./styles.css";

// Auto-update service worker when new version is available
const updateSW = registerSW({
  onNeedRefresh() {
    // Silently update — or you can show a toast here
    updateSW(true);
  },
  onOfflineReady() {
    console.log("✅ BharatCart is ready to work offline!");
  },
  onRegisteredSW(swUrl, registration) {
    console.log("✅ Service Worker registered:", swUrl);
    // Check for updates every 30 minutes
    if (registration) {
      setInterval(() => registration.update(), 30 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error("❌ SW registration failed:", error);
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);