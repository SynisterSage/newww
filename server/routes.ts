import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTeetimeSchema, insertOrderSchema, insertRoundSchema, insertUserSchema, insertCourseConditionsSchema, insertEventSchema, insertEventRegistrationSchema } from "@shared/schema";
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

  // Get user's tee time bookings (must come before /:date route)
  app.get("/api/teetimes/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userTeetimes = await storage.getTeetimes();
      const filteredTeetimes = userTeetimes.filter(teetime => 
        teetime.bookedBy?.includes(userId)
      );
      res.json(filteredTeetimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user tee times" });
    }
  });

  // Get tee times for a specific date (must come after /user/:userId route)
  app.get("/api/teetimes/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const teetimes = await storage.getTeetimes(date);
      res.json(teetimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tee times" });
    }
  });

  app.patch("/api/teetimes/:id/book", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, players } = req.body;
      
      const teetime = await storage.getTeetimeById(id);
      if (!teetime) {
        return res.status(404).json({ message: "Tee time not found" });
      }
      
      const currentPlayers = teetime.bookedBy?.length || 0;
      const availableSpots = teetime.maxPlayers - currentPlayers;
      
      if (players.length > availableSpots) {
        return res.status(400).json({ message: `Only ${availableSpots} spots available` });
      }
      
      // Check if user already booked this tee time
      if (teetime.bookedBy?.includes(userId)) {
        return res.status(400).json({ message: "You have already booked this tee time" });
      }
      
      // Add all players to the tee time - one booking entry for the member who books
      const newBookedBy = [...(teetime.bookedBy || [])];
      const newPlayerNames = [...(teetime.playerNames || [])];
      const newPlayerTypes = [...(teetime.playerTypes || [])];
      const newTransportModes = [...(teetime.transportModes || [])];
      const newHolesPlaying = [...(teetime.holesPlaying || [])];

      // Add each player to the arrays
      players.forEach((player: any) => {
        newBookedBy.push(userId); // All players are associated with the booking user
        newPlayerNames.push(player.name || 'Unknown');
        newPlayerTypes.push(player.type || 'member');
        newTransportModes.push(player.transportMode || 'riding');
        newHolesPlaying.push(player.holesPlaying || '18');
      });
      
      const updatedTeetime = await storage.updateTeetime(id, {
        bookedBy: newBookedBy,
        playerNames: newPlayerNames,
        playerTypes: newPlayerTypes,
        transportModes: newTransportModes,
        holesPlaying: newHolesPlaying
      });
      
      res.json(updatedTeetime);
    } catch (error: any) {
      console.error("Tee time booking error:", error);
      console.error("Error stack:", error.stack);
      console.error("Booking data:", { id, userId: req.body.userId, players: req.body.players });
      res.status(500).json({ message: "Failed to book tee time", error: error.message });
    }
  });

  // Cancel/leave a tee time booking for a specific user
  app.patch("/api/teetimes/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      const teetime = await storage.getTeetimeById(id);
      if (!teetime) {
        return res.status(404).json({ message: "Tee time not found" });
      }
      
      if (!teetime.bookedBy?.includes(userId)) {
        return res.status(400).json({ message: "You haven't booked this tee time" });
      }
      
      // Remove ALL players associated with this user (including their guests)
      const indicesToRemove: number[] = [];
      teetime.bookedBy.forEach((id, index) => {
        if (id === userId) {
          indicesToRemove.push(index);
        }
      });
      
      // Filter out all entries at the indices we found
      const newBookedBy = teetime.bookedBy.filter((_, index) => !indicesToRemove.includes(index));
      const newPlayerNames = teetime.playerNames?.filter((_, index) => !indicesToRemove.includes(index)) || [];
      const newPlayerTypes = teetime.playerTypes?.filter((_, index) => !indicesToRemove.includes(index)) || [];
      const newTransportModes = teetime.transportModes?.filter((_, index) => !indicesToRemove.includes(index)) || [];
      const newHolesPlaying = teetime.holesPlaying?.filter((_, index) => !indicesToRemove.includes(index)) || [];
      
      const updatedTeetime = await storage.updateTeetime(id, {
        bookedBy: newBookedBy,
        playerNames: newPlayerNames,
        playerTypes: newPlayerTypes,
        transportModes: newTransportModes,
        holesPlaying: newHolesPlaying
      });
      
      res.json(updatedTeetime);
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel tee time booking" });
    }
  });

  // General tee time update route
  app.patch("/api/teetimes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const teetime = await storage.getTeetimeById(id);
      if (!teetime) {
        return res.status(404).json({ message: "Tee time not found" });
      }
      
      const updatedTeetime = await storage.updateTeetime(id, updates);
      res.json(updatedTeetime);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tee time" });
    }
  });

  // Menu routes
  app.get("/api/menu", async (req, res) => {
    try {
      const { category } = req.query;
      
      // Determine which menu to show based on current time
      // Lunch: before 6:30 PM, Dinner: 6:30 PM and after
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeIn24 = currentHour + (currentMinute / 60);
      
      // 6:30 PM = 18.5 in 24-hour format
      const dinnerStartTime = 18.5;
      const mealType = currentTimeIn24 >= dinnerStartTime ? 'dinner' : 'lunch';
      
      const menuItems = await storage.getMenuItems(category as string, mealType);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  // Order routes  
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders(); // Get all orders
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

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
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      const session = await storage.createSession({
        userId: member.id,
        sessionToken,
        expiresAt,
        adminUserId: null
      });
      
      // Set session cookie for cross-domain access
      res.cookie('sessionToken', session.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // Required for cross-domain cookies
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        domain: process.env.NODE_ENV === 'production' ? '.railway.app' : undefined
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
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days for admin

      const session = await storage.createSession({
        adminUserId: adminUser.id,
        sessionToken,
        expiresAt,
        userId: null
      });
      
      // Set session cookie for cross-domain access
      res.cookie('sessionToken', session.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // Required for cross-domain cookies
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        domain: process.env.NODE_ENV === 'production' ? '.railway.app' : undefined
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
      // Check for session token in body or cookies
      const sessionToken = req.body.sessionToken || req.cookies.sessionToken;
      
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
      // Check for session token in body or cookies
      const sessionToken = req.body.sessionToken || req.cookies.sessionToken;
      
      if (sessionToken) {
        await storage.deleteSession(sessionToken);
      }
      
      // Clear the session cookie
      res.clearCookie('sessionToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        domain: process.env.NODE_ENV === 'production' ? '.railway.app' : undefined
      });
      
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

  // Removed admin approval routes - tee times are automatically booked

  // Admin member management routes
  app.patch("/api/admin/members/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Get the user first, then create a new user with updates
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      // For now, return the existing user - proper update implementation would need more work
      res.json(existingUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  app.patch("/api/admin/members/bulk", async (req, res) => {
    try {
      const { memberIds, status, handicap } = req.body;
      
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ message: "Member IDs are required" });
      }
      
      const updates: any = {};
      if (status) updates.memberStatus = status;
      if (handicap !== undefined) updates.handicap = handicap;
      
      const updatedMembers = [];
      for (const memberId of memberIds) {
        const existingMember = await storage.getUser(memberId);
        if (existingMember) {
          // For now, just return existing member - proper update would need more work
          updatedMembers.push(existingMember);
        }
      }
      
      res.json({ updated: updatedMembers.length, members: updatedMembers });
    } catch (error) {
      res.status(500).json({ message: "Failed to bulk update members" });
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

  // Admin order management routes
  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['pending', 'preparing', 'ready', 'delivered'].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }
      
      const order = await storage.updateOrder(id, { status });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
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

  // Admin reset test data route
  app.post("/api/admin/reset-test-data", async (req, res) => {
    try {
      // Reset tee time bookings - clear all playerNames and bookedBy arrays
      await storage.resetTeeTimeBookings();
      
      // Reset event registrations
      await storage.resetEventRegistrations();
      
      // Reset orders
      await storage.resetOrders();
      
      // Reset course notices (hazard notes and maintenance notes)
      await storage.resetCourseNotices();
      
      res.json({ message: "Test data reset successfully" });
    } catch (error) {
      console.error("Reset test data error:", error);
      res.status(500).json({ message: "Failed to reset test data" });
    }
  });

  // Course conditions routes
  app.get("/api/course/conditions", async (req, res) => {
    try {
      const conditions = await storage.getCourseConditions();
      res.json(conditions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course conditions" });
    }
  });

  app.patch("/api/course/conditions", async (req, res) => {
    try {
      const updateData = insertCourseConditionsSchema.partial().parse(req.body);
      const conditions = await storage.updateCourseConditions(updateData);
      res.json(conditions);
    } catch (error: any) {
      console.error("Course conditions validation error:", error);
      res.status(400).json({ message: "Invalid course conditions data", error: error.message });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      const { userId } = req.query;
      
      // Filter out past events
      const currentEvents = events.filter(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        return eventDateTime >= new Date();
      });
      
      // Add registration count and user registration status to each event
      const eventsWithMetadata = await Promise.all(
        currentEvents.map(async (event) => {
          const registrations = await storage.getEventRegistrations(event.id);
          const isRegistered = userId ? registrations.some(reg => reg.userId === userId) : false;
          
          return {
            ...event,
            registrationCount: registrations.length,
            isRegistered
          };
        })
      );
      
      res.json(eventsWithMetadata);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Admin endpoint to get all events including past ones
  app.get("/api/events/all", async (req, res) => {
    try {
      const events = await storage.getEvents();
      
      // Add registration count to each event (no filtering for admin)
      const eventsWithCounts = await Promise.all(
        events.map(async (event) => {
          const registrations = await storage.getEventRegistrations(event.id);
          return {
            ...event,
            registrationCount: registrations.length
          };
        })
      );
      
      res.json(eventsWithCounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getEventById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error: any) {
      console.error("Event validation error:", error);
      res.status(400).json({ message: "Invalid event data", error: error.message });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const event = await storage.updateEvent(id, updates);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
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

  // Event registration routes
  app.get("/api/events/:id/registrations", async (req, res) => {
    try {
      const { id } = req.params;
      const registrations = await storage.getEventRegistrations(id);
      
      // Get user details for each registration
      const registrationsWithUsers = await Promise.all(
        registrations.map(async (reg) => {
          const user = reg.userId ? await storage.getUser(reg.userId) : null;
          return {
            ...reg,
            user: user ? { 
              id: user.id, 
              firstName: user.firstName, 
              lastName: user.lastName, 
              email: user.email,
              memberNumber: user.memberNumber
            } : null
          };
        })
      );
      
      res.json(registrationsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event registrations" });
    }
  });

  app.post("/api/events/:id/register", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, notes } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Check if user is already registered
      const existingRegistrations = await storage.getEventRegistrations(id);
      const alreadyRegistered = existingRegistrations.some(reg => reg.userId === userId);
      
      if (alreadyRegistered) {
        return res.status(400).json({ message: "User is already registered for this event" });
      }
      
      // Check event capacity
      const event = await storage.getEventById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (existingRegistrations.length >= event.maxSignups) {
        return res.status(400).json({ message: "Event is full" });
      }
      
      const registrationData = {
        eventId: id,
        userId,
        notes: notes || null,
      };
      
      const registration = await storage.registerForEvent(registrationData);
      res.status(201).json(registration);
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.delete("/api/events/:id/register/:userId", async (req, res) => {
    try {
      const { id, userId } = req.params;
      
      await storage.unregisterFromEvent(id, userId);
      res.json({ message: "Successfully unregistered from event" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unregister from event" });
    }
  });

  app.get("/api/users/:userId/events", async (req, res) => {
    try {
      const { userId } = req.params;
      const registrations = await storage.getUserEventRegistrations(userId);
      
      // Get event details for each registration
      const registrationsWithEvents = await Promise.all(
        registrations.map(async (reg) => {
          const event = reg.eventId ? await storage.getEventById(reg.eventId) : null;
          return {
            ...reg,
            event
          };
        })
      );
      
      res.json(registrationsWithEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user event registrations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
