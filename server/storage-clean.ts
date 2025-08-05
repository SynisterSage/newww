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
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  // Tee time methods
  async getTeetimes(date?: string): Promise<TeeTime[]> {
    let query = db.select().from(teetimes);
    
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query = query.where(
        and(
          sql`${teetimes.date}::date = ${targetDate.toISOString().split('T')[0]}::date`
        )
      );
      
      // Check if tee times exist for this date
      const existingTeetimes = await query;
      const expectedSlots = 30; // 6:00 AM to 1:15 PM in 15-minute intervals
      
      // If no tee times exist or there are fewer than expected, generate them
      if (existingTeetimes.length < expectedSlots) {
        await this.generateTeetimesForDate(date);
        // Fetch the newly created tee times
        return await db.select().from(teetimes).where(
          sql`${teetimes.date}::date = ${targetDate.toISOString().split('T')[0]}::date`
        );
      }
      
      return existingTeetimes;
    }
    
    return await query;
  }

  private async generateTeetimesForDate(date: string): Promise<void> {
    const targetDate = new Date(date);
    const timeSlots = [];
    
    // Generate time slots from 6:00 AM to 1:15 PM in 15-minute intervals
    for (let hour = 6; hour <= 13; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 13 && minute > 15) break; // Stop at 1:15 PM
        
        const slotTime = new Date(targetDate);
        slotTime.setHours(hour, minute, 0, 0);
        
        timeSlots.push({
          id: randomUUID(),
          date: slotTime,
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          playerNames: [],
          bookedBy: [],
          isAvailable: true
        });
      }
    }
    
    // Insert the time slots
    if (timeSlots.length > 0) {
      await db.insert(teetimes).values(timeSlots);
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
    let query = db.select().from(orders);
    
    if (userId) {
      query = query.where(eq(orders.userId, userId));
    }
    
    return await query;
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
    let query = db.select().from(courseHoles);
    
    if (course) {
      query = query.where(eq(courseHoles.course, course));
    }
    
    return await query;
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
      .where(and(eq(rounds.userId, userId), eq(rounds.isCompleted, false)));
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
        hazardNotes: null,
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
    const [updated] = await db.update(courseConditions)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(courseConditions.id, existing.id))
      .returning();
    return updated;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.isActive, true));
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
    // Reset all event registrations
    await db.delete(eventRegistrations);
    
    // Reset all orders
    await db.delete(orders);
    
    // Reset tee time bookings
    await db.update(teetimes).set({
      bookedBy: [],
      playerNames: []
    });
    
    // Reset course conditions to default
    await db.update(courseConditions).set({
      weather: "sunny",
      temperature: 72,
      windSpeed: 5,
      conditions: "excellent",
      cartPathOnly: false,
      courseStatus: "open",
      notes: "Course in excellent condition",
      lastUpdated: new Date()
    });
  }

  async resetCourseNotices(): Promise<void> {
    await db.update(courseConditions).set({
      hazardNotes: null,
      maintenanceNotes: []
    });
  }
}

export const storage = new DatabaseStorage();