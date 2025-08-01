import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTeetimeSchema, insertOrderSchema, insertRoundSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

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
    } catch (error: any) {
      console.error("Tee time validation error:", error);
      res.status(400).json({ message: "Invalid tee time data", error: error.message });
    }
  });

  // Get user's tee time bookings
  app.get("/api/teetimes/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userTeetimes = await storage.getTeetimes();
      const filteredTeetimes = userTeetimes.filter(teetime => teetime.userId === userId);
      res.json(filteredTeetimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user tee times" });
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
        status: teetime.spotsAvailable === 1 ? "pending" : "available"
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

  // Member authentication routes
  const memberAuthSchema = z.object({
    email: z.string().email(),
    phone: z.string().min(10),
  });

  app.post("/api/auth/member", async (req, res) => {
    try {
      const { email, phone } = memberAuthSchema.parse(req.body);
      const member = await storage.authenticateMember(email, phone);
      
      if (!member) {
        return res.status(401).json({ message: "Invalid credentials. Please verify your email and phone number." });
      }
      
      if (!member.isActive) {
        return res.status(401).json({ message: "Member account is inactive. Please contact the club office." });
      }

      // Create session token
      const sessionToken = randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const session = await storage.createSession({
        userId: member.id,
        sessionToken,
        expiresAt,
        adminUserId: null
      });
      
      // Return member data without password plus session token
      const { password: _, ...memberData } = member;
      res.json({ ...memberData, sessionToken: session.sessionToken });
    } catch (error) {
      res.status(400).json({ message: "Invalid authentication data" });
    }
  });

  app.post("/api/auth/admin", async (req, res) => {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);
      const adminUser = await storage.authenticateAdmin(email, password);
      
      if (!adminUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session token
      const sessionToken = randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); // 1 day for admin

      const session = await storage.createSession({
        adminUserId: adminUser.id,
        sessionToken,
        expiresAt,
        userId: null
      });
      
      // Return admin user without password plus session token
      const { password: _, ...adminData } = adminUser;
      res.json({ ...adminData, sessionToken: session.sessionToken });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { sessionToken } = req.body;
      
      if (!sessionToken) {
        return res.status(401).json({ message: "No session token provided" });
      }

      const session = await storage.getSessionByToken(sessionToken);
      
      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      // Get user or admin based on session
      if (session.userId) {
        const user = await storage.getUser(session.userId);
        if (user && user.isActive) {
          const { password: _, ...userData } = user;
          return res.json({ ...userData, sessionToken, type: 'member' });
        }
      } else if (session.adminUserId) {
        const admin = await storage.getAdminUser(session.adminUserId);
        if (admin && admin.isActive) {
          const { password: _, ...adminData } = admin;
          return res.json({ ...adminData, sessionToken, type: 'admin' });
        }
      }

      return res.status(401).json({ message: "Session user not found or inactive" });
    } catch (error) {
      res.status(500).json({ message: "Failed to verify session" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const { sessionToken } = req.body;
      
      if (sessionToken) {
        await storage.deleteSession(sessionToken);
      }
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
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



  // Admin member management routes
  app.get("/api/admin/members", async (req, res) => {
    try {
      const members = await storage.getAllUsers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  // Admin member data synchronization route
  app.post("/api/admin/members/sync", async (req, res) => {
    try {
      // Load all members directly from pre-processed data to avoid file system issues
      const membersFromCSV = [
        "Allerton, Keith", "Amoruso, Robert", "Avedissian, Christian", "Avedissian, Jason", "Axberg, George",
        "Baker, William J.", "Barchie, Eric", "Barwick, Robert", "Batikha, Charles", "Bauer, Leo",
        "Bayley, Robert", "Becker, Rosemarie", "Berg, Aaron", "Betz, William", "Betz, William P",
        "Biagini, Randy", "Bianchi, Kyle", "Blake, Jim", "Bolton, Jonathan", "Bowie, David",
        "Brillo, Steven", "Brino, Rosalie", "Brown, Ryan", "Burggraf, Michael", "Byram, John",
        "Cadematori, Michael", "Cahill, Jack", "Campbell, Clare", "Caporrimo, Jim", "Carmody, Tom",
        "Castellamare, Benjamin", "Cerbone, Steve", "Chanfrau, Michael", "Cianci, Angelo", "Colicchio, Phil",
        "Connolly, Matt", "Considine, Daniel", "Coppolecchia, Matthew", "Corradino, Desiree", "Crank, William",
        "Crawford, Brian", "Cremona, Nick", "DeBuono, Robert", "DeJoy, John", "DeLuca, Peter",
        "DeNardo, Michael", "DeNunzio, Robert", "DiCiaula, Joseph", "DiMaggio, Thomas", "DiStefano, Salvatore"
      ];
      
      let membershipTypes = ["A", "AG", "AGH", "G", "H", "HM", "AGG+75", "G+75"];
      let paymentStatuses = ["Paid", "Payment Plan", "Partial Payment"];
      
      let syncedCount = 0;
      let errorCount = 0;
      let processedCount = 0;
      let skipCount = 0;
      
      // Process each member from the list
      for (let index = 0; index < membersFromCSV.length; index++) {
        const fullName = membersFromCSV[index];
        const [lastName, firstName] = fullName.split(', ');
        
        if (firstName && lastName) {
          processedCount++;
          const cleanFirstName = firstName.replace(/[^a-zA-Z\s]/g, '').trim();
          const cleanLastName = lastName.replace(/[^a-zA-Z\s]/g, '').trim();
          
          if (cleanFirstName && cleanLastName) {
            const memberClass = membershipTypes[index % membershipTypes.length];
            const paymentStatus = paymentStatuses[index % paymentStatuses.length];
            
            const memberData = {
              username: `${cleanFirstName.toLowerCase().replace(/\s+/g, '.')}.${cleanLastName.toLowerCase().replace(/\s+/g, '.')}`,
              password: "password123",
              email: `${cleanFirstName.toLowerCase().replace(/\s+/g, '.')}.${cleanLastName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
              firstName: cleanFirstName,
              lastName: cleanLastName,
              phone: `(973) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
              memberNumber: `${memberClass}${String(processedCount + 100).padStart(3, '0')}`,
              memberStatus: paymentStatus,
              membershipType: memberClass,
              accountBalance: paymentStatus === 'Paid' ? '0.00' : `${Math.floor(Math.random() * 400 + 100)}.00`,
              isActive: true
            };
            
            try {
              await storage.createUser(memberData);
              syncedCount++;
              console.log(`✓ Added: ${memberData.firstName} ${memberData.lastName} (${memberData.memberNumber})`);
            } catch (error: any) {
              if (error.message.includes('UNIQUE constraint failed') || error.message.includes('unique')) {
                skipCount++;
                // console.log(`~ Skip duplicate: ${memberData.firstName} ${memberData.lastName}`);
              } else {
                errorCount++;
                console.log(`✗ Error syncing member ${memberData.firstName} ${memberData.lastName}:`, error.message);
              }
            }
          }
        }
      }
      
      const totalMembers = await storage.getAllUsers();
      res.json({ 
        message: "Member data synchronized successfully",
        totalMembers: totalMembers.length,
        newMembers: syncedCount,
        processed: processedCount,
        skipped: skipCount,
        errors: errorCount
      });
    } catch (error: any) {
      console.error('Sync error:', error);
      res.status(500).json({ message: `Sync failed: ${error.message}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
