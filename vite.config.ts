import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

function privateDataDevPlugin(): Plugin {
  const localOutputsDir = path.resolve(process.cwd(), "Learning-data-preprocessing-automation/OUTPUTS");
  const onedriveFallback = "C:/Users/ksari/OneDrive/Desktop/Learning-data-preprocessing-automation/OUTPUTS";
  const outputsDir = fs.existsSync(localOutputsDir) ? localOutputsDir : onedriveFallback;
  const subsetsDir = path.join(outputsDir, "03_subsets");
  const handoffDir = path.join(outputsDir, "04_handoff");

  return {
    name: "private-data-dev-endpoint",
    apply: "serve", // Dev server only; excluded from production build
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/private-data/")) {
          return next();
        }

        const rawPath = req.url.slice("/api/private-data/".length).split("?")[0];
        const cleanPath = decodeURIComponent(rawPath).replace(/^\/+/, "");

        // Default-deny quarantined resources
        if (cleanPath.includes("quarantine") || cleanPath.includes("idioms_grouped")) {
          res.statusCode = 403;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Forbidden: Quarantined dataset access is strictly blocked." }));
          return;
        }

        const candHandoff = path.join(handoffDir, cleanPath);
        const candSubsets = path.join(subsetsDir, cleanPath);
        const targetFile = fs.existsSync(candHandoff)
          ? candHandoff
          : fs.existsSync(candSubsets)
          ? candSubsets
          : null;

        if (!targetFile || !fs.statSync(targetFile).isFile()) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: `Not found: ${cleanPath}` }));
          return;
        }

        try {
          const content = fs.readFileSync(targetFile);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.end(content);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), privateDataDevPlugin()],
  base: "/",
  server: {
    host: "127.0.0.1",
    // Keep Vite's installed default deny rules and exclude review/private content.
    fs: {
      deny: [
        ".env",
        ".env.*",
        "*.{crt,pem}",
        "**/.git/**",
        "**/docs/**",
        "**/Learning-data-preprocessing-automation/**"
      ]
    },
  },
  preview: { host: "127.0.0.1" },
});
