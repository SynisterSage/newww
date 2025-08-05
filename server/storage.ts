import { type User, type InsertUser, type AdminUser, type InsertAdminUser, type TeeTime, type InsertTeeTime, type MenuItem, type InsertMenuItem, type Order, type InsertOrder, type CourseHole, type InsertCourseHole, type Round, type InsertRound, type Session, type InsertSession, type CourseConditions, type InsertCourseConditions, type Event, type InsertEvent, type EventRegistration, type InsertEventRegistration } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, adminUsers, teetimes, menuItems, orders, courseHoles, rounds, sessions, courseConditions, events, eventRegistrations } from "@shared/schema";
import { eq, and, sql, lt } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  authenticateMember(email: string, phone: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin user methods
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
  authenticateAdmin(email: string, password: string): Promise<AdminUser | null>;
  
  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  cleanExpiredSessions(): Promise<void>;
  
  // Tee time methods
  getTeetimes(date?: string): Promise<TeeTime[]>;
  getTeetimeById(id: string): Promise<TeeTime | undefined>;
  createTeetime(teetime: InsertTeeTime): Promise<TeeTime>;
  updateTeetime(id: string, updates: Partial<TeeTime>): Promise<TeeTime | undefined>;
  
  // Menu methods
  getMenuItems(category?: string, mealType?: string): Promise<MenuItem[]>;
  getMenuItemById(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  
  // Order methods
  getOrders(userId?: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  
  // Course methods
  getCourseHoles(course?: string): Promise<CourseHole[]>;
  getCourseHoleById(id: string): Promise<CourseHole | undefined>;
  
  // Round methods
  getRounds(userId: string): Promise<Round[]>;
  getCurrentRound(userId: string): Promise<Round | undefined>;
  createRound(round: InsertRound): Promise<Round>;
  updateRound(id: string, updates: Partial<Round>): Promise<Round | undefined>;
  
  // Course conditions methods
  getCourseConditions(): Promise<CourseConditions>;
  updateCourseConditions(updates: Partial<InsertCourseConditions>): Promise<CourseConditions>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;
  
  // Event registration methods
  getEventRegistrations(eventId: string): Promise<EventRegistration[]>;
  getUserEventRegistrations(userId: string): Promise<EventRegistration[]>;
  registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration>;
  unregisterFromEvent(eventId: string, userId: string): Promise<void>;
  
  // Reset methods for admin
  resetTestData(): Promise<void>;
  resetCourseNotices(): Promise<void>;
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async authenticateMember(email: string, phone: string): Promise<User | null> {
    // Clean phone number for matching (remove formatting)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Get all users with matching email first
    const usersWithEmail = await db.select().from(users)
      .where(eq(users.email, email.toLowerCase()));
    
    // Find user with matching cleaned phone number
    const user = usersWithEmail.find(u => {
      if (!u.phone) return false;
      const userCleanPhone = u.phone.replace(/\D/g, '');
      return userCleanPhone === cleanPhone;
    });
    
    return user || null;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Admin user methods
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin || undefined;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || undefined;
  }

  async createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser> {
    const [newAdmin] = await db.insert(adminUsers).values(adminUser).returning();
    return newAdmin;
  }

  async authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
    const [admin] = await db.select().from(adminUsers)
      .where(and(eq(adminUsers.email, email), eq(adminUsers.password, password)));
    return admin || null;
  }

  // Session methods
  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.sessionToken, token));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.sessionToken, token));
  }

  async cleanExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(sql`expires_at < NOW()`);
  }

  // Tee time methods
  async getTeetimes(date?: string): Promise<TeeTime[]> {
    if (date) {
      // Check if tee times exist for the requested date
      const existingTeetimes = await db.select().from(teetimes).where(eq(teetimes.date, date));
      
      // Calculate expected number of 16-minute intervals from 7AM to 7PM
      const totalMinutes = (19 - 7) * 60; // 12 hours * 60 minutes = 720 minutes
      const expectedSlots = Math.floor(totalMinutes / 16) + 1; // +1 for the starting 7:00 AM slot
      
      // If no tee times exist or there are fewer than expected, generate them
      if (existingTeetimes.length < expectedSlots) {
        await this.generateTeetimesForDate(date);
        // Fetch the newly created tee times
        return await db.select().from(teetimes).where(eq(teetimes.date, date));
      }
      
      return existingTeetimes;
    }
    return await db.select().from(teetimes);
  }

  // Helper method to generate tee times for a specific date
  private async generateTeetimesForDate(date: string): Promise<void> {
    const requestedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only generate tee times for today and tomorrow (2 days max advance booking)
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 1);
    
    if (requestedDate <= maxDate) {
      // Generate time slots from 7:00 AM to 7:00 PM with 16-minute intervals
      const baseTimeSlots = [];
      const startHour = 7; // 7 AM
      const endHour = 19; // 7 PM
      const intervalMinutes = 16;
      
      for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
          // Stop at 7:00 PM exactly, don't go beyond
          if (hour === endHour && minute > 0) break;
          
          // Fix hour display logic: 12-hour format conversion
          let displayHour = hour;
          let ampm = 'AM';
          
          if (hour === 0) {
            displayHour = 12; // Midnight is 12:XX AM
          } else if (hour < 12) {
            displayHour = hour; // 1-11 AM
            ampm = 'AM';
          } else if (hour === 12) {
            displayHour = 12; // Noon is 12:XX PM
            ampm = 'PM';
          } else {
            displayHour = hour - 12; // 1-11 PM
            ampm = 'PM';
          }
          
          const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
          baseTimeSlots.push(timeString);
        }
      }

      // Get existing times to avoid duplicates
      const existingTimes = await db.select().from(teetimes).where(eq(teetimes.date, date));
      const existingTimeSlots = existingTimes.map(t => t.time);
      
      // Only create tee times for slots that don't already exist
      const newTimeSlots = baseTimeSlots.filter(time => !existingTimeSlots.includes(time));
      
      if (newTimeSlots.length > 0) {
        const teetimesToInsert = newTimeSlots.map(time => ({
          id: randomUUID(),
          date: date,
          time: time,
          course: "Packanack Golf Course",
          holes: 18,
          maxPlayers: 4,
          bookedBy: [],
          playerNames: [],
          playerTypes: [],
          transportModes: [],
          holesPlaying: [],
          isPremium: false,
          price: "85.00"
        }));

        // Insert new tee times in a single transaction
        await db.insert(teetimes).values(teetimesToInsert);
      }
    }
  }

  async getTeetimeById(id: string): Promise<TeeTime | undefined> {
    const [teetime] = await db.select().from(teetimes).where(eq(teetimes.id, id));
    return teetime || undefined;
  }

  async createTeetime(teetime: InsertTeeTime): Promise<TeeTime> {
    const [newTeetime] = await db.insert(teetimes).values(teetime).returning();
    return newTeetime;
  }

  async updateTeetime(id: string, updates: Partial<TeeTime>): Promise<TeeTime | undefined> {
    const [updatedTeetime] = await db.update(teetimes)
      .set(updates)
      .where(eq(teetimes.id, id))
      .returning();
    return updatedTeetime || undefined;
  }

  // Menu methods
  async getMenuItems(category?: string, mealType?: string): Promise<MenuItem[]> {
    let query = db.select().from(menuItems);
    
    if (category && mealType) {
      query = query.where(and(eq(menuItems.category, category), eq(menuItems.mealType, mealType)));
    } else if (category) {
      query = query.where(eq(menuItems.category, category));
    } else if (mealType) {
      query = query.where(eq(menuItems.mealType, mealType));
    }
    
    return await query;
  }

  async getMenuItemById(id: string): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item || undefined;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  // Order methods
  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return await db.select().from(orders).where(eq(orders.userId, userId));
    }
    return await db.select().from(orders);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const [updatedOrder] = await db.update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  // Course methods
  async getCourseHoles(course?: string): Promise<CourseHole[]> {
    if (course) {
      return await db.select().from(courseHoles).where(eq(courseHoles.course, course));
    }
    return await db.select().from(courseHoles);
  }

  async getCourseHoleById(id: string): Promise<CourseHole | undefined> {
    const [hole] = await db.select().from(courseHoles).where(eq(courseHoles.id, id));
    return hole || undefined;
  }

  // Round methods
  async getRounds(userId: string): Promise<Round[]> {
    return await db.select().from(rounds).where(eq(rounds.userId, userId));
  }

  async getCurrentRound(userId: string): Promise<Round | undefined> {
    const [round] = await db.select().from(rounds)
      .where(and(eq(rounds.userId, userId), eq(rounds.status, "in_progress")));
    return round || undefined;
  }

  async createRound(round: InsertRound): Promise<Round> {
    const [newRound] = await db.insert(rounds).values(round).returning();
    return newRound;
  }

  async updateRound(id: string, updates: Partial<Round>): Promise<Round | undefined> {
    const [updatedRound] = await db.update(rounds)
      .set(updates)
      .where(eq(rounds.id, id))
      .returning();
    return updatedRound || undefined;
  }

  // Course conditions methods
  async getCourseConditions(): Promise<CourseConditions> {
    const [conditions] = await db.select().from(courseConditions).limit(1);
    if (!conditions) {
      // Create default conditions if none exist
      const defaultConditions = {
        id: randomUUID(),
        weather: "sunny",
        temperature: 72,
        windSpeed: 5,
        humidity: 45,
        courseStatus: "open",
        cartPathOnly: false,
        greensCondition: "excellent",
        fairwaysCondition: "good",
        hazardNotes: "",
        maintenanceNotes: [],
        lastUpdated: new Date(),
        updatedBy: "System"
      };
      const [newConditions] = await db.insert(courseConditions).values(defaultConditions).returning();
      return newConditions;
    }
    return conditions;
  }

  async updateCourseConditions(updates: Partial<InsertCourseConditions>): Promise<CourseConditions> {
    const existing = await this.getCourseConditions();
    const [updatedConditions] = await db.update(courseConditions)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(courseConditions.id, existing.id))
      .returning();
    return updatedConditions;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    // Only return active events from today or future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db.select().from(events)
      .where(and(eq(events.isActive, true), sql`date >= ${today.toISOString().split('T')[0]}`));
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db.update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent || undefined;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Event registration methods
  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return await db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
  }

  async getUserEventRegistrations(userId: string): Promise<EventRegistration[]> {
    return await db.select().from(eventRegistrations).where(eq(eventRegistrations.userId, userId));
  }

  async registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [newRegistration] = await db.insert(eventRegistrations).values(registration).returning();
    return newRegistration;
  }

  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    await db.delete(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)));
  }

  // Reset methods for admin
  async resetTestData(): Promise<void> {
    // Mark all events as inactive
    await db.update(events).set({ isActive: false });
    
    // Clear all event registrations
    await db.delete(eventRegistrations);
    
    // Clear all orders
    await db.delete(orders);
    
    // Reset all tee time bookings
    await db.update(teetimes).set({
      bookedBy: [],
      playerNames: [],
      playerTypes: [],
      transportModes: [],
      holesPlaying: []
    });
  }

  async resetCourseNotices(): Promise<void> {
    const conditions = await this.getCourseConditions();
    await db.update(courseConditions)
      .set({
        hazardNotes: "",
        maintenanceNotes: [],
        lastUpdated: new Date()
      })
      .where(eq(courseConditions.id, conditions.id));
  }
}

export const storage = new DatabaseStorage();