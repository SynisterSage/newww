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
  getCourseHoles(): Promise<CourseHole[]>;
  getCourseHoleById(id: string): Promise<CourseHole | undefined>;
  createCourseHole(hole: InsertCourseHole): Promise<CourseHole>;
  
  // Round methods
  getRounds(userId?: string): Promise<Round[]>;
  getRoundById(id: string): Promise<Round | undefined>;
  createRound(round: InsertRound): Promise<Round>;
  updateRound(id: string, updates: Partial<Round>): Promise<Round | undefined>;
  
  // Course conditions methods
  getCourseConditions(): Promise<CourseConditions | undefined>;
  updateCourseConditions(updates: Partial<CourseConditions>): Promise<CourseConditions | undefined>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;
  
  // Event registration methods
  getEventRegistrations(eventId?: string, userId?: string): Promise<EventRegistration[]>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  deleteEventRegistration(eventId: string, userId: string): Promise<void>;
  
  // Test data management methods
  resetTestData(): Promise<void>;
  resetTeeTimeBookings(): Promise<void>;
  resetEventRegistrations(): Promise<void>;
  resetOrders(): Promise<void>;
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
      const teetimesForDate = await db.select().from(teetimes)
        .where(eq(teetimes.date, date))
        .orderBy(teetimes.time);
      
      // If no tee times exist for this date, generate them
      if (teetimesForDate.length === 0) {
        await this.generateTeetimesForDate(date);
        return await db.select().from(teetimes)
          .where(eq(teetimes.date, date))
          .orderBy(teetimes.time);
      }
      
      return teetimesForDate;
    }
    
    return await db.select().from(teetimes).orderBy(teetimes.date, teetimes.time);
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
    const [updated] = await db.update(teetimes).set(updates).where(eq(teetimes.id, id)).returning();
    return updated || undefined;
  }

  // Generate tee times for a specific date
  async generateTeetimesForDate(date: string): Promise<void> {
    const startHour = 6; // 6:00 AM
    const endHour = 13; // 1:00 PM (13:00)
    const intervalMinutes = 15;
    
    const teetimesToCreate: InsertTeeTime[] = [];
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        if (hour === endHour && minute > 15) break; // Stop at 1:15 PM
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        teetimesToCreate.push({
          id: randomUUID(),
          date,
          time: timeString,
          maxPlayers: 4,
          bookedBy: [],
          playerNames: [],
          isAvailable: true
        });
      }
    }
    
    if (teetimesToCreate.length > 0) {
      await db.insert(teetimes).values(teetimesToCreate);
    }
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
    const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return updated || undefined;
  }

  // Course methods
  async getCourseHoles(): Promise<CourseHole[]> {
    return await db.select().from(courseHoles);
  }

  async getCourseHoleById(id: string): Promise<CourseHole | undefined> {
    const [hole] = await db.select().from(courseHoles).where(eq(courseHoles.id, id));
    return hole || undefined;
  }

  async createCourseHole(hole: InsertCourseHole): Promise<CourseHole> {
    const [newHole] = await db.insert(courseHoles).values(hole).returning();
    return newHole;
  }

  // Round methods
  async getRounds(userId?: string): Promise<Round[]> {
    if (userId) {
      return await db.select().from(rounds).where(eq(rounds.userId, userId));
    }
    return await db.select().from(rounds);
  }

  async getRoundById(id: string): Promise<Round | undefined> {
    const [round] = await db.select().from(rounds).where(eq(rounds.id, id));
    return round || undefined;
  }

  async createRound(round: InsertRound): Promise<Round> {
    const [newRound] = await db.insert(rounds).values(round).returning();
    return newRound;
  }

  async updateRound(id: string, updates: Partial<Round>): Promise<Round | undefined> {
    const [updated] = await db.update(rounds).set(updates).where(eq(rounds.id, id)).returning();
    return updated || undefined;
  }

  // Course conditions methods
  async getCourseConditions(): Promise<CourseConditions | undefined> {
    const [conditions] = await db.select().from(courseConditions);
    return conditions || undefined;
  }

  async updateCourseConditions(updates: Partial<CourseConditions>): Promise<CourseConditions | undefined> {
    const existing = await this.getCourseConditions();
    if (!existing) {
      // Create default conditions if none exist
      const defaultConditions: InsertCourseConditions = {
        id: randomUUID(),
        weather: "sunny",
        temperature: 72,
        windSpeed: 5,
        conditions: "excellent",
        cartPathOnly: false,
        courseStatus: "open",
        notes: "Course in excellent condition",
        lastUpdated: new Date()
      };
      const [newConditions] = await db.insert(courseConditions).values(defaultConditions).returning();
      return newConditions;
    }
    
    const [updated] = await db.update(courseConditions)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(courseConditions.id, existing.id))
      .returning();
    return updated || undefined;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.isActive, true));
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
    const [updated] = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return updated || undefined;
  }

  async deleteEvent(id: string): Promise<void> {
    // First delete all registrations for this event
    await db.delete(eventRegistrations).where(eq(eventRegistrations.eventId, id));
    // Then delete the event itself
    await db.delete(events).where(eq(events.id, id));
  }

  // Event registration methods
  async getEventRegistrations(eventId?: string, userId?: string): Promise<EventRegistration[]> {
    let query = db.select().from(eventRegistrations);
    
    if (eventId && userId) {
      query = query.where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)));
    } else if (eventId) {
      query = query.where(eq(eventRegistrations.eventId, eventId));
    } else if (userId) {
      query = query.where(eq(eventRegistrations.userId, userId));
    }
    
    return await query;
  }

  async createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [newRegistration] = await db.insert(eventRegistrations).values(registration).returning();
    return newRegistration;
  }

  async deleteEventRegistration(eventId: string, userId: string): Promise<void> {
    await db.delete(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)));
  }

  // Test data management methods
  async resetTestData(): Promise<void> {
    // Reset all events (mark as inactive)
    await db.update(events).set({ isActive: false });
    
    // Clear all event registrations
    await db.delete(eventRegistrations);
    
    // Clear all orders
    await db.delete(orders);
    
    // Reset all tee time bookings (clear bookedBy and playerNames)
    await db.update(teetimes).set({
      bookedBy: [],
      playerNames: [],
      isAvailable: true
    });
    
    // Reset course conditions to default
    await db.delete(courseConditions);
    const defaultConditions: InsertCourseConditions = {
      id: randomUUID(),
      weather: "sunny",
      temperature: 72,
      windSpeed: 5,
      conditions: "excellent",
      cartPathOnly: false,
      courseStatus: "open",
      notes: "Course in excellent condition",
      lastUpdated: new Date()
    };
    await db.insert(courseConditions).values(defaultConditions);
  }

  async resetTeeTimeBookings(): Promise<void> {
    await db.update(teetimes).set({
      bookedBy: [],
      playerNames: [],
      isAvailable: true
    });
  }

  async resetEventRegistrations(): Promise<void> {
    await db.delete(eventRegistrations);
  }

  async resetOrders(): Promise<void> {
    await db.delete(orders);
  }

  async resetCourseNotices(): Promise<void> {
    const existing = await this.getCourseConditions();
    if (existing) {
      await db.update(courseConditions).set({
        notes: "Course in excellent condition"
      }).where(eq(courseConditions.id, existing.id));
    }
  }
}

export const storage = new DatabaseStorage();