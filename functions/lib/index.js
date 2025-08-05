"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express_1 = require("express");
const serverless_1 = require("@neondatabase/serverless");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const ws_1 = require("ws");
const drizzle_orm_1 = require("drizzle-orm");
// Import your schema
const schema_1 = require("./schema");
// Initialize Firebase Admin
admin.initializeApp();
// Initialize Neon Database
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
}
const pool = new serverless_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, neon_serverless_1.drizzle)({ client: pool, schema: {
        users: schema_1.users, adminUsers: schema_1.adminUsers, teetimes: schema_1.teetimes, menuItems: schema_1.menuItems, orders: schema_1.orders, courseHoles: schema_1.courseHoles,
        rounds: schema_1.rounds, courseConditions: schema_1.courseConditions, events: schema_1.events, eventRegistrations: schema_1.eventRegistrations, sessions: schema_1.sessions
    } });
// Create Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Add CORS middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    }
    else {
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
        const usersWithEmail = await db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email.toLowerCase()));
        const user = usersWithEmail.find((u) => {
            if (!u.phone)
                return false;
            const userCleanPhone = u.phone.replace(/\D/g, "");
            return userCleanPhone === cleanPhone;
        });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Create session
        const sessionToken = generateRandomId();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await db.insert(schema_1.sessions).values({
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
    }
    catch (error) {
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
        const [session] = await db.select().from(schema_1.sessions).where((0, drizzle_orm_1.eq)(schema_1.sessions.sessionToken, sessionToken));
        if (!session || session.expiresAt < new Date()) {
            return res.status(401).json({ error: "Invalid or expired session" });
        }
        if (session.userId) {
            const [user] = await db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, session.userId));
            if (user) {
                return res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName });
            }
        }
        if (session.adminUserId) {
            const [admin] = await db.select().from(schema_1.adminUsers).where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, session.adminUserId));
            if (admin) {
                return res.json({ id: admin.id, name: admin.name, role: admin.role });
            }
        }
        res.status(401).json({ error: "User not found" });
    }
    catch (error) {
        console.error("Session verification error:", error);
        res.status(500).json({ error: "Session verification failed" });
    }
});
// Tee times routes
app.get("/teetimes/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const result = await db.select().from(schema_1.teetimes).where((0, drizzle_orm_1.eq)(schema_1.teetimes.date, date));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch tee times" });
    }
});
// Events routes
app.get("/events", async (req, res) => {
    try {
        const result = await db.select().from(schema_1.events).where((0, drizzle_orm_1.eq)(schema_1.events.isActive, true));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch events" });
    }
});
app.get("/events/all", async (req, res) => {
    try {
        const result = await db.select().from(schema_1.events).orderBy((0, drizzle_orm_1.desc)(schema_1.events.createdAt));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch all events" });
    }
});
app.post("/events", async (req, res) => {
    try {
        const eventData = schema_1.insertEventSchema.parse(req.body);
        const [newEvent] = await db.insert(schema_1.events).values(eventData).returning();
        res.status(201).json(newEvent);
    }
    catch (error) {
        res.status(400).json({ message: "Invalid event data", error: error.message });
    }
});
app.delete("/events/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(schema_1.events).where((0, drizzle_orm_1.eq)(schema_1.events.id, id));
        res.json({ message: "Event deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete event" });
    }
});
// Orders routes
app.get("/orders", async (req, res) => {
    try {
        const result = await db.select().from(schema_1.orders).orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});
// Menu routes
app.get("/menu", async (req, res) => {
    try {
        const result = await db.select().from(schema_1.menuItems);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch menu" });
    }
});
// Course conditions routes
app.get("/course/conditions", async (req, res) => {
    try {
        const [conditions] = await db.select().from(schema_1.courseConditions).orderBy((0, drizzle_orm_1.desc)(schema_1.courseConditions.lastUpdated)).limit(1);
        res.json(conditions);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch course conditions" });
    }
});
// Generate random ID function
function generateRandomId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map