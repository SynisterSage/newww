import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// CORS middleware to allow Firebase deployment to access Replit backend
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://pgcapp-12fba.web.app',
    'https://pgcapp-12fba.firebaseapp.com',
    'http://localhost:5173',
    /\.replit\.dev$/
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

// Daily reset function to clear all tee time bookings at end of day
const resetDailyTeeTimesAtMidnight = async () => {
  try {
    const { DatabaseStorage } = await import('./storage');
    const storage = new DatabaseStorage();
    
    console.log('Starting daily tee time reset...');
    
    // Get all tee times and clear their bookings
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Clear bookings for yesterday's tee times
    const yesterdayTeetimes = await storage.getTeetimes(yesterday);
    for (const teetime of yesterdayTeetimes) {
      if (teetime.bookedBy && teetime.bookedBy.length > 0) {
        await storage.updateTeetime(teetime.id, {
          bookedBy: [],
          playerNames: [],
          playerTypes: [],
          transportModes: [],
          holesPlaying: [],
        });
      }
    }
    
    console.log(`Daily reset complete - cleared ${yesterdayTeetimes.length} tee times from ${yesterday}`);
  } catch (error) {
    console.error('Error during daily tee time reset:', error);
  }
};

// Schedule daily reset at midnight (00:00)
const scheduleNightlyReset = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Next midnight
  
  const timeUntilMidnight = midnight.getTime() - now.getTime();
  
  setTimeout(() => {
    resetDailyTeeTimesAtMidnight();
    // Schedule next reset (every 24 hours)
    setInterval(resetDailyTeeTimesAtMidnight, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
  
  console.log(`Scheduled daily tee time reset in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes`);
};

(async () => {
  const server = await registerRoutes(app);
  
  // Start the daily reset scheduler
  scheduleNightlyReset();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
