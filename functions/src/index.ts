import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { eq, and, sql, gte, lte, desc } from "drizzle-orm";

// Import your schema
import {
  users,
  adminUsers,
  teetimes,
  menuItems,
  orders,
  courseHoles,
  rounds,
  courseConditions,
  events,
  eventRegistrations,
  sessions,
  insertUserSchema,
  insertAdminUserSchema,
  insertTeetimeSchema,
  insertMenuItemSchema,
  insertOrderSchema,
  insertCourseConditionsSchema,
  insertEventSchema,
  insertEventRegistrationSchema,
  insertSessionSchema
} from "./schema";

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Neon Database
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { 
  users, adminUsers, teetimes, menuItems, orders, courseHoles, 
  rounds, courseConditions, events, eventRegistrations, sessions 
}});

// Create Express app
const app = express();
app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Authentication routes
app.post("/auth/member", async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    if (!email || !phone) {
      return res.status(400).json({ error: "Email and phone are required" });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const usersWithEmail = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    
    const user = usersWithEmail.find((u) => {
      if (!u.phone) return false;
      const userCleanPhone = u.phone.replace(/\D/g, "");
      return userCleanPhone === cleanPhone;
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create session
    const sessionToken = generateRandomId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessions).values({
      userId: user.id,
      sessionToken,
      expiresAt
    });

    res.json({ 
      id: user.id,
      sessionToken,
      firstName: user.firstName,
      lastName: user.lastName,
      memberNumber: user.memberNumber 
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Session verification
app.post("/auth/verify", async (req, res) => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken) {
      return res.status(401).json({ error: "Session token required" });
    }

    const [session] = await db.select().from(sessions).where(eq(sessions.sessionToken, sessionToken));
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (session.userId) {
      const [user] = await db.select().from(users).where(eq(users.id, session.userId));
      if (user) {
        return res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName });
      }
    }

    if (session.adminUserId) {
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, session.adminUserId));
      if (admin) {
        return res.json({ id: admin.id, name: admin.name, role: admin.role });
      }
    }

    res.status(401).json({ error: "User not found" });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(500).json({ error: "Session verification failed" });
  }
});

// Tee times routes
app.get("/teetimes/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const result = await db.select().from(teetimes).where(eq(teetimes.date, date));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tee times" });
  }
});

// Events routes
app.get("/events", async (req, res) => {
  try {
    const result = await db.select().from(events).where(eq(events.isActive, true));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

app.get("/events/all", async (req, res) => {
  try {
    const result = await db.select().from(events).orderBy(desc(events.createdAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all events" });
  }
});

app.post("/events", async (req, res) => {
  try {
    const eventData = insertEventSchema.parse(req.body);
    const [newEvent] = await db.insert(events).values(eventData).returning();
    res.status(201).json(newEvent);
  } catch (error: any) {
    res.status(400).json({ message: "Invalid event data", error: error.message });
  }
});

app.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(events).where(eq(events.id, id));
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// Orders routes
app.get("/orders", async (req, res) => {
  try {
    const result = await db.select().from(orders).orderBy(desc(orders.createdAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Menu routes
app.get("/menu", async (req, res) => {
  try {
    const result = await db.select().from(menuItems);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch menu" });
  }
});

// Course conditions routes
app.get("/course/conditions", async (req, res) => {
  try {
    const [conditions] = await db.select().from(courseConditions).orderBy(desc(courseConditions.lastUpdated)).limit(1);
    res.json(conditions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course conditions" });
  }
});

// Generate random ID function
function generateRandomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);