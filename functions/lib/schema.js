"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSessionSchema = exports.insertEventRegistrationSchema = exports.insertEventSchema = exports.insertCourseConditionsSchema = exports.insertOrderSchema = exports.insertMenuItemSchema = exports.insertTeetimeSchema = exports.insertAdminUserSchema = exports.insertUserSchema = exports.sessions = exports.eventRegistrations = exports.events = exports.courseConditions = exports.rounds = exports.courseHoles = exports.orders = exports.menuItems = exports.teetimes = exports.adminUsers = exports.users = void 0;
// Copy of your schema for Firebase Functions
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    email: (0, pg_core_1.text)("email"),
    firstName: (0, pg_core_1.text)("first_name"),
    lastName: (0, pg_core_1.text)("last_name"),
    phone: (0, pg_core_1.text)("phone"),
    memberNumber: (0, pg_core_1.text)("member_number").notNull(),
    memberStatus: (0, pg_core_1.text)("member_status").notNull().default("Gold"),
    membershipType: (0, pg_core_1.text)("membership_type").default("Full"),
    address: (0, pg_core_1.text)("address"),
    city: (0, pg_core_1.text)("city"),
    state: (0, pg_core_1.text)("state"),
    zipCode: (0, pg_core_1.text)("zip_code"),
    emergencyContact: (0, pg_core_1.text)("emergency_contact"),
    emergencyPhone: (0, pg_core_1.text)("emergency_phone"),
    handicap: (0, pg_core_1.integer)("handicap").default(18),
    roundsPlayed: (0, pg_core_1.integer)("rounds_played").default(0),
    accountBalance: (0, pg_core_1.decimal)("account_balance", { precision: 10, scale: 2 }).default("285.00"),
    joinDate: (0, pg_core_1.timestamp)("join_date").defaultNow(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    paymentStatus: (0, pg_core_1.text)("payment_status"),
    membershipClass: (0, pg_core_1.text)("membership_class"),
    status: (0, pg_core_1.text)("status").default("Active"),
    yearJoined: (0, pg_core_1.integer)("year_joined"),
    birthday: (0, pg_core_1.text)("birthday"),
    spouse: (0, pg_core_1.text)("spouse"),
    lockers: (0, pg_core_1.text)("lockers"),
    spouseLocker: (0, pg_core_1.boolean)("spouse_locker").default(false),
    bagStorage: (0, pg_core_1.boolean)("bag_storage").default(false),
    food: (0, pg_core_1.text)("food"),
    extraHandicap: (0, pg_core_1.text)("extra_handicap"),
    restrictedAssessment: (0, pg_core_1.text)("restricted_assessment"),
    specialConsiderations: (0, pg_core_1.text)("special_considerations"),
    lotteryEligible: (0, pg_core_1.text)("lottery_eligible")
});
exports.adminUsers = (0, pg_core_1.pgTable)("admin_users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    role: (0, pg_core_1.text)("role").notNull().default("staff"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true)
});
exports.teetimes = (0, pg_core_1.pgTable)("teetimes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    date: (0, pg_core_1.text)("date").notNull(),
    time: (0, pg_core_1.text)("time").notNull(),
    course: (0, pg_core_1.text)("course").notNull().default("Packanack Golf Course"),
    holes: (0, pg_core_1.integer)("holes").notNull().default(18),
    maxPlayers: (0, pg_core_1.integer)("max_players").notNull().default(4),
    bookedBy: (0, pg_core_1.text)("booked_by").array().default([]),
    playerNames: (0, pg_core_1.text)("player_names").array().default([]),
    playerTypes: (0, pg_core_1.text)("player_types").array().default([]),
    transportModes: (0, pg_core_1.text)("transport_modes").array().default([]),
    holesPlaying: (0, pg_core_1.text)("holes_playing").array().default([]),
    isPremium: (0, pg_core_1.boolean)("is_premium").default(false),
    price: (0, pg_core_1.decimal)("price", { precision: 8, scale: 2 }).notNull().default("85.00")
});
exports.menuItems = (0, pg_core_1.pgTable)("menu_items", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    price: (0, pg_core_1.decimal)("price", { precision: 8, scale: 2 }).notNull(),
    category: (0, pg_core_1.text)("category").notNull(),
    mealType: (0, pg_core_1.text)("meal_type").notNull(),
    isSpecial: (0, pg_core_1.boolean)("is_special").default(false),
    available: (0, pg_core_1.boolean)("available").default(true),
    availableSettings: (0, pg_core_1.text)("available_settings")
});
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    items: (0, pg_core_1.text)("items").array().notNull(),
    total: (0, pg_core_1.decimal)("total", { precision: 10, scale: 2 }).notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("pending"),
    deliveryOption: (0, pg_core_1.text)("delivery_option").default("Clubhouse Pickup"),
    deliveryLocation: (0, pg_core_1.text)("delivery_location"),
    specialRequests: (0, pg_core_1.text)("special_requests"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
exports.courseHoles = (0, pg_core_1.pgTable)("course_holes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    holeNumber: (0, pg_core_1.integer)("hole_number").notNull(),
    par: (0, pg_core_1.integer)("par").notNull(),
    yardage: (0, pg_core_1.integer)("yardage").notNull(),
    handicap: (0, pg_core_1.integer)("handicap").notNull(),
    description: (0, pg_core_1.text)("description"),
    notes: (0, pg_core_1.text)("notes"),
    course: (0, pg_core_1.text)("course").notNull().default("Championship Course")
});
exports.rounds = (0, pg_core_1.pgTable)("rounds", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    currentHole: (0, pg_core_1.integer)("current_hole").default(1),
    scores: (0, pg_core_1.text)("scores").array(),
    startTime: (0, pg_core_1.timestamp)("start_time").defaultNow(),
    endTime: (0, pg_core_1.timestamp)("end_time"),
    status: (0, pg_core_1.text)("status").notNull().default("in_progress")
});
exports.courseConditions = (0, pg_core_1.pgTable)("course_conditions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    weather: (0, pg_core_1.text)("weather").notNull(),
    temperature: (0, pg_core_1.integer)("temperature").notNull(),
    windSpeed: (0, pg_core_1.integer)("wind_speed").notNull(),
    humidity: (0, pg_core_1.integer)("humidity").notNull(),
    courseStatus: (0, pg_core_1.text)("course_status").notNull(),
    cartPathOnly: (0, pg_core_1.boolean)("cart_path_only").notNull(),
    greensCondition: (0, pg_core_1.text)("greens_condition").notNull(),
    fairwaysCondition: (0, pg_core_1.text)("fairways_condition").notNull(),
    hazardNotes: (0, pg_core_1.text)("hazard_notes"),
    maintenanceNotes: (0, pg_core_1.text)("maintenance_notes").array().default([]),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").defaultNow(),
    updatedBy: (0, pg_core_1.text)("updated_by").notNull()
});
exports.events = (0, pg_core_1.pgTable)("events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    date: (0, pg_core_1.date)("date").notNull(),
    time: (0, pg_core_1.text)("time").notNull(),
    location: (0, pg_core_1.text)("location").notNull().default("Packanack Golf Club"),
    maxSignups: (0, pg_core_1.integer)("max_signups").notNull().default(50),
    price: (0, pg_core_1.decimal)("price", { precision: 8, scale: 2 }).default("0.00"),
    category: (0, pg_core_1.text)("category").notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    createdBy: (0, pg_core_1.text)("created_by").notNull()
});
exports.eventRegistrations = (0, pg_core_1.pgTable)("event_registrations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    eventId: (0, pg_core_1.varchar)("event_id").references(() => exports.events.id),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    registeredAt: (0, pg_core_1.timestamp)("registered_at").defaultNow(),
    notes: (0, pg_core_1.text)("notes"),
    status: (0, pg_core_1.text)("status").notNull().default("confirmed")
});
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    adminUserId: (0, pg_core_1.varchar)("admin_user_id").references(() => exports.adminUsers.id),
    sessionToken: (0, pg_core_1.text)("session_token").notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// Schema exports
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({ id: true });
exports.insertAdminUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.adminUsers).omit({ id: true });
exports.insertTeetimeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.teetimes).omit({ id: true });
exports.insertMenuItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.menuItems).omit({ id: true });
exports.insertOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orders).omit({ id: true, createdAt: true });
exports.insertCourseConditionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.courseConditions).omit({ id: true, lastUpdated: true });
exports.insertEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.events).omit({ id: true, createdAt: true });
exports.insertEventRegistrationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.eventRegistrations).omit({ id: true, registeredAt: true });
exports.insertSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sessions).omit({ id: true, createdAt: true });
//# sourceMappingURL=schema.js.map