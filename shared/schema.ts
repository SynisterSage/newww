import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  memberNumber: text("member_number").notNull(),
  memberStatus: text("member_status").notNull().default("Gold"),
  membershipType: text("membership_type").default("Full"), // Full, Associate, Junior, Corporate
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  handicap: integer("handicap").default(18),
  roundsPlayed: integer("rounds_played").default(0),
  accountBalance: decimal("account_balance", { precision: 10, scale: 2 }).default("285.00"),
  joinDate: timestamp("join_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  // New columns from membership list
  paymentStatus: text("payment_status"), // "Paid", "Payment Plan", "Partial Payment"
  membershipClass: text("membership_class"), // "A", "AG", "G", "H", "HM", etc.
  status: text("status").default("Active"), // "Active", "Leave"
  yearJoined: integer("year_joined"),
  birthday: text("birthday"),
  spouse: text("spouse"),
  lockers: text("lockers"), // "TRUE", "FALSE", "BOARD"
  spouseLocker: boolean("spouse_locker").default(false),
  bagStorage: boolean("bag_storage").default(false),
  food: text("food"), // Amount like "533.00" or "None"
  extraHandicap: text("extra_handicap"),
  restrictedAssessment: text("restricted_assessment"),
  specialConsiderations: text("special_considerations"),
  lotteryEligible: text("lottery_eligible"),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("staff"), // staff, manager, admin
  isActive: boolean("is_active").default(true),
});

export const teetimes = pgTable("teetimes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  time: text("time").notNull(),
  course: text("course").notNull().default("Packanack Golf Course"),
  holes: integer("holes").notNull().default(18), // 18-hole course
  maxPlayers: integer("max_players").notNull().default(4),
  bookedBy: text("booked_by").array().default([]), // Array of user IDs who booked this slot
  playerNames: text("player_names").array().default([]), // Array of player names for display
  // Status is automatically calculated based on bookedBy array length
  isPremium: boolean("is_premium").default(false),
  price: decimal("price", { precision: 8, scale: 2 }).notNull().default("85.00"),
});

export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  category: text("category").notNull(), // appetizers, main_course, beverages, desserts
  mealType: text("meal_type").notNull(), // lunch, dinner
  isSpecial: boolean("is_special").default(false),
  available: boolean("available").default(true),
  availableSettings: text("available_settings"), // For customization options
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  items: text("items").array().notNull(), // Array of serialized order items
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, preparing, ready, delivered
  deliveryOption: text("delivery_option").default("Clubhouse Pickup"), // "Clubhouse Pickup", "Deliver on Course"
  deliveryLocation: text("delivery_location"), // e.g., "Hole 5" for on-course delivery
  specialRequests: text("special_requests"), // Allergens, special instructions, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseHoles = pgTable("course_holes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  holeNumber: integer("hole_number").notNull(),
  par: integer("par").notNull(),
  yardage: integer("yardage").notNull(),
  handicap: integer("handicap").notNull(),
  description: text("description"),
  notes: text("notes"),
  course: text("course").notNull().default("Championship Course"),
});

export const rounds = pgTable("rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  currentHole: integer("current_hole").default(1),
  scores: text("scores").array(), // Array of scores for each hole
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("in_progress"), // in_progress, completed
});

export const courseConditions = pgTable("course_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weather: text("weather").notNull(),
  temperature: integer("temperature").notNull(),
  windSpeed: integer("wind_speed").notNull(),
  humidity: integer("humidity").notNull(),
  courseStatus: text("course_status").notNull(),
  cartPathOnly: boolean("cart_path_only").notNull(),
  greensCondition: text("greens_condition").notNull(),
  fairwaysCondition: text("fairways_condition").notNull(),
  hazardNotes: text("hazard_notes"),
  maintenanceNotes: text("maintenance_notes").array().default([]), 
  lastUpdated: timestamp("last_updated").defaultNow(),
  updatedBy: text("updated_by").notNull()
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull().default("Packanack Golf Club"),
  maxSignups: integer("max_signups").notNull().default(50),
  price: decimal("price", { precision: 8, scale: 2 }).default("0.00"),
  category: text("category").notNull(), // tournament, social, lesson, special
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by").notNull(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  userId: varchar("user_id").references(() => users.id),
  registeredAt: timestamp("registered_at").defaultNow(),
  notes: text("notes"), // Special requests or notes from member
  status: text("status").notNull().default("confirmed"), // confirmed, waitlist, cancelled
});

// Sessions table for persistent login
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  adminUserId: varchar("admin_user_id").references(() => adminUsers.id),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
});

export const insertTeetimeSchema = createInsertSchema(teetimes).omit({
  id: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertCourseHoleSchema = createInsertSchema(courseHoles).omit({
  id: true,
});

export const insertRoundSchema = createInsertSchema(rounds).omit({
  id: true,
  startTime: true,
  endTime: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const insertCourseConditionsSchema = createInsertSchema(courseConditions).omit({
  id: true,
  lastUpdated: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  registeredAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type TeeTime = typeof teetimes.$inferSelect;
export type InsertTeeTime = z.infer<typeof insertTeetimeSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type CourseHole = typeof courseHoles.$inferSelect;
export type InsertCourseHole = z.infer<typeof insertCourseHoleSchema>;
export type Round = typeof rounds.$inferSelect;
export type InsertRound = z.infer<typeof insertRoundSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type CourseConditions = typeof courseConditions.$inferSelect;
export type InsertCourseConditions = z.infer<typeof insertCourseConditionsSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
