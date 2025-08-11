import 'dotenv/config'
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";


const app = express();
export default app;

// CORS middleware to allow Firebase deployment to access Replit backend
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://pgcapp-12fba.web.app',
    'https://pgcapp-12fba.firebaseapp.com',
    'http://localhost:5173',
    /\.replit\.dev$/,
    /\.vercel\.app$/
  ];
  
  const origin = req.headers.origin;
  
  if (origin && (
    allowedOrigins.includes(origin) ||
    allowedOrigins.some(allowed => allowed instanceof RegExp && allowed.test(origin))
  )) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

app.get('/api/ping', (_req, res) => res.json({ ok: true }));

export const ready = (async () => {
  const server = await registerRoutes(app);

  // Get storage instance to run cleanup
  const { storage } = (await import('./routes.js')) as any;

if (storage?.cleanupExpiredTeetimes) {
  try {
    const cleaned = await storage.cleanupExpiredTeetimes();
    if (cleaned > 0) log(`🧹 Cleaned ${cleaned} expired tee time bookings on startup`);
  } catch (error) {
    log(`Failed to clean expired tee times: ${error}`);
  }

  setInterval(async () => {
    try {
      const cleaned = await storage.cleanupExpiredTeetimes();
      if (cleaned > 0) log(`🧹 Cleaned ${cleaned} expired tee time bookings`);
    } catch (error) {
      log(`Failed to clean expired tee times: ${error}`);
    }
  }, 60 * 60 * 1000);
}

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // dev = Vite, prod = static
  if (app.get("env") === "development" && !process.env.VERCEL) {
    await setupVite(app, server);
  } else if (!process.env.VERCEL) {
    serveStatic(app);
  }

  // only listen locally (NOT on Vercel)
  if (!process.env.VERCEL) {
    const PORT = Number(process.env.PORT ?? 5000);
    const HOST = process.env.HOST ?? "127.0.0.1";
    app.listen(PORT, HOST, () => {
      console.log(`Server listening on http://${HOST}:${PORT}`);
    });
  }
})();