// Copy of your schema for Firebase Functions
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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
  membershipType: text("membership_type").default("Full"),
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
  paymentStatus: text("payment_status"),
  membershipClass: text("membership_class"),
  status: text("status").default("Active"),
  yearJoined: integer("year_joined"),
  birthday: text("birthday"),
  spouse: text("spouse"),
  lockers: text("lockers"),
  spouseLocker: boolean("spouse_locker").default(false),
  bagStorage: boolean("bag_storage").default(false),
  food: text("food"),
  extraHandicap: text("extra_handicap"),
  restrictedAssessment: text("restricted_assessment"),
  specialConsiderations: text("special_considerations"),
  lotteryEligible: text("lottery_eligible")
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("staff"),
  isActive: boolean("is_active").default(true)
});

export const teetimes = pgTable("teetimes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  time: text("time").notNull(),
  course: text("course").notNull().default("Packanack Golf Course"),
  holes: integer("holes").notNull().default(18),
  maxPlayers: integer("max_players").notNull().default(4),
  bookedBy: text("booked_by").array().default([]),
  playerNames: text("player_names").array().default([]),
  playerTypes: text("player_types").array().default([]),
  transportModes: text("transport_modes").array().default([]),
  holesPlaying: text("holes_playing").array().default([]),
  isPremium: boolean("is_premium").default(false),
  price: decimal("price", { precision: 8, scale: 2 }).notNull().default("85.00")
});

export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  category: text("category").notNull(),
  mealType: text("meal_type").notNull(),
  isSpecial: boolean("is_special").default(false),
  available: boolean("available").default(true),
  availableSettings: text("available_settings")
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  items: text("items").array().notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  deliveryOption: text("delivery_option").default("Clubhouse Pickup"),
  deliveryLocation: text("delivery_location"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow()
});

export const courseHoles = pgTable("course_holes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  holeNumber: integer("hole_number").notNull(),
  par: integer("par").notNull(),
  yardage: integer("yardage").notNull(),
  handicap: integer("handicap").notNull(),
  description: text("description"),
  notes: text("notes"),
  course: text("course").notNull().default("Championship Course")
});

export const rounds = pgTable("rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  currentHole: integer("current_hole").default(1),
  scores: text("scores").array(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("in_progress")
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
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by").notNull()
});

export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  userId: varchar("user_id").references(() => users.id),
  registeredAt: timestamp("registered_at").defaultNow(),
  notes: text("notes"),
  status: text("status").notNull().default("confirmed")
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  adminUserId: varchar("admin_user_id").references(() => adminUsers.id),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true });
export const insertTeetimeSchema = createInsertSchema(teetimes).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertCourseConditionsSchema = createInsertSchema(courseConditions).omit({ id: true, lastUpdated: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({ id: true, registeredAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });