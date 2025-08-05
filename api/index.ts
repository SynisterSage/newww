import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { storage } from '../server/storage';
import {
  insertTeetimeSchema,
  insertOrderSchema,
  insertUserSchema,
  insertCourseConditionsSchema,
  insertEventSchema,
  insertEventRegistrationSchema,
} from '../shared/schema';
import { z } from 'zod';

const app = express();

// CORS middleware for Firebase
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://pgcapp-12fba.web.app',
    'https://pgcapp-12fba.firebaseapp.com',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Core API routes for Vercel
app.post("/api/auth/member", async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return res.status(400).json({ error: "Email and phone are required" });
    }
    const user = await storage.authenticateMember(email, phone);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await storage.createSession({ userId: user.id, sessionToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    res.json({ id: user.id, sessionToken, firstName: user.firstName, lastName: user.lastName, memberNumber: user.memberNumber });
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
});

app.post("/api/auth/verify", async (req, res) => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken) {
      return res.status(401).json({ error: "Session token required" });
    }
    const session = await storage.getSessionByToken(sessionToken);
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Invalid session" });
    }
    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, memberNumber: user.memberNumber });
  } catch (error) {
    res.status(500).json({ error: "Session verification failed" });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const events = await storage.getEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

app.get("/api/events/all", async (req, res) => {
  try {
    const events = await storage.getEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all events" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const eventData = insertEventSchema.parse(req.body);
    const event = await storage.createEvent(eventData);
    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ message: "Invalid event data", error: error.message });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteEvent(id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await storage.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get("/api/menu", async (req, res) => {
  try {
    const menu = await storage.getMenuItems();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch menu" });
  }
});

app.get("/api/teetimes/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const teetimes = await storage.getTeetimes(date);
    res.json(teetimes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tee times" });
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}