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
  userId: varchar("user_id").references(() => users.id),
  date: text("date").notNull(),
  time: text("time").notNull(),
  course: text("course").notNull().default("Packanack Golf Course"),
  holes: integer("holes").notNull().default(9), // 9-hole course
  spotsAvailable: integer("spots_available").notNull().default(4),
  status: text("status").notNull().default("available"), // available, booked, pending
  isPremium: boolean("is_premium").default(false),
});

export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  category: text("category").notNull(), // appetizers, main_course, beverages, desserts
  isSpecial: boolean("is_special").default(false),
  available: boolean("available").default(true),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  items: text("items").array().notNull(), // JSON array of item IDs and quantities
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, preparing, ready, delivered
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
  maintenanceNotes: text("maintenance_notes"), 
  lastUpdated: timestamp("last_updated").defaultNow(),
  updatedBy: text("updated_by").notNull()
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
