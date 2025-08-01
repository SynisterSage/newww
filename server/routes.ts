import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTeetimeSchema, insertOrderSchema, insertRoundSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tee time routes
  app.get("/api/teetimes", async (req, res) => {
    try {
      const { date } = req.query;
      const teetimes = await storage.getTeetimes(date as string);
      res.json(teetimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tee times" });
    }
  });

  app.post("/api/teetimes", async (req, res) => {
    try {
      const teetimeData = insertTeetimeSchema.parse(req.body);
      const teetime = await storage.createTeetime(teetimeData);
      res.status(201).json(teetime);
    } catch (error) {
      res.status(400).json({ message: "Invalid tee time data" });
    }
  });

  app.patch("/api/teetimes/:id/book", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      const teetime = await storage.getTeetimeById(id);
      if (!teetime) {
        return res.status(404).json({ message: "Tee time not found" });
      }
      
      if (teetime.spotsAvailable <= 0) {
        return res.status(400).json({ message: "No spots available" });
      }
      
      const updatedTeetime = await storage.updateTeetime(id, {
        userId,
        spotsAvailable: teetime.spotsAvailable - 1,
        status: teetime.spotsAvailable === 1 ? "booked" : "available"
      });
      
      res.json(updatedTeetime);
    } catch (error) {
      res.status(500).json({ message: "Failed to book tee time" });
    }
  });

  // Menu routes
  app.get("/api/menu", async (req, res) => {
    try {
      const { category } = req.query;
      const menuItems = await storage.getMenuItems(category as string);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  // Order routes
  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  // Course routes
  app.get("/api/course/holes", async (req, res) => {
    try {
      const { course } = req.query;
      const holes = await storage.getCourseHoles(course as string);
      res.json(holes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course holes" });
    }
  });

  // Round routes
  app.get("/api/rounds/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const rounds = await storage.getRounds(userId);
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rounds" });
    }
  });

  app.get("/api/rounds/:userId/current", async (req, res) => {
    try {
      const { userId } = req.params;
      const round = await storage.getCurrentRound(userId);
      res.json(round);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current round" });
    }
  });

  app.post("/api/rounds", async (req, res) => {
    try {
      const roundData = insertRoundSchema.parse(req.body);
      const round = await storage.createRound(roundData);
      res.status(201).json(round);
    } catch (error) {
      res.status(400).json({ message: "Invalid round data" });
    }
  });

  app.patch("/api/rounds/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const round = await storage.updateRound(id, updates);
      
      if (!round) {
        return res.status(404).json({ message: "Round not found" });
      }
      
      res.json(round);
    } catch (error) {
      res.status(500).json({ message: "Failed to update round" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin authentication routes
  const adminLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  app.post("/api/admin/auth", async (req, res) => {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);
      const adminUser = await storage.authenticateAdmin(email, password);
      
      if (!adminUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Return admin user without password
      const { password: _, ...adminData } = adminUser;
      res.json(adminData);
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.get("/api/admin/verify/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const adminUser = await storage.getAdminUser(id);
      
      if (!adminUser || !adminUser.isActive) {
        return res.status(404).json({ message: "Admin not found" });
      }
      
      // Return admin user without password
      const { password: _, ...adminData } = adminUser;
      res.json(adminData);
    } catch (error) {
      res.status(500).json({ message: "Failed to verify admin" });
    }
  });

  // Admin management endpoints
  app.get("/api/admin/teetimes", async (req, res) => {
    try {
      const teeTimes = await storage.getAllTeeTimesForAdmin();
      res.json(teeTimes);
    } catch (error) {
      console.error("Error fetching admin tee times:", error);
      res.status(500).json({ message: "Failed to fetch tee times" });
    }
  });

  app.patch("/api/admin/teetimes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedTeeTime = await storage.updateTeeTimeStatus(id, updates);
      res.json(updatedTeeTime);
    } catch (error) {
      console.error("Error updating tee time:", error);
      res.status(500).json({ message: "Failed to update tee time" });
    }
  });

  app.get("/api/admin/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrdersForAdmin();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedOrder = await storage.updateOrderStatus(id, updates);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.get("/api/admin/members", async (req, res) => {
    try {
      const members = await storage.getAllMembersForAdmin();
      res.json(members);
    } catch (error) {
      console.error("Error fetching admin members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.patch("/api/admin/members/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedMember = await storage.updateMember(id, updates);
      res.json(updatedMember);
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  app.get("/api/admin/events", async (req, res) => {
    try {
      const events = await storage.getAllEventsForAdmin();
      res.json(events);
    } catch (error) {
      console.error("Error fetching admin events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.patch("/api/admin/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedEvent = await storage.updateEvent(id, updates);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.patch("/api/admin/events/:eventId/registrations/:registrationId", async (req, res) => {
    try {
      const { eventId, registrationId } = req.params;
      const updates = req.body;
      const updatedRegistration = await storage.updateEventRegistration(eventId, registrationId, updates);
      res.json(updatedRegistration);
    } catch (error) {
      console.error("Error updating event registration:", error);
      res.status(500).json({ message: "Failed to update registration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
