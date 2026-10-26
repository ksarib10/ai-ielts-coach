import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    host: "127.0.0.1",
    // Keep Vite's installed default deny rules and exclude review/private content.
    fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/docs/**"] },
  },
  preview: { host: "127.0.0.1" },
});
