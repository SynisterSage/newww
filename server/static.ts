import path from "node:path";
import express from "express";

export function serveStatic(app: express.Express) {
  const base = (process as any).pkg
    ? path.dirname(process.execPath)
    : path.resolve(__dirname, "..");
  const clientDist = path.join(base, "public");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

export function log(...args: any[]) { console.log(...args); }
