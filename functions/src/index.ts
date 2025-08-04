import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";

const app = express();
app.use(cors({ origin: true }));

// Proxy all API requests to your existing Replit server
app.use("*", (req, res) => {
  // For now, just redirect to your Replit backend
  // You can customize this to proxy requests if needed
  res.json({ message: "API endpoint - configure to proxy to your backend" });
});

export const api = functions.https.onRequest(app);