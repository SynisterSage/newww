import { type User, type InsertUser, type AdminUser, type InsertAdminUser, type TeeTime, type InsertTeeTime, type MenuItem, type InsertMenuItem, type Order, type InsertOrder, type CourseHole, type InsertCourseHole, type Round, type InsertRound, type Session, type InsertSession, type CourseConditions, type InsertCourseConditions, type Event, type InsertEvent, type EventRegistration, type InsertEventRegistration } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, adminUsers, teetimes, menuItems, orders, courseHoles, rounds, sessions, courseConditions, events, eventRegistrations } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private adminUsers: Map<string, AdminUser>;
  private teetimes: Map<string, TeeTime>;
  private menuItems: Map<string, MenuItem>;
  private orders: Map<string, Order>;
  private courseHoles: Map<string, CourseHole>;
  private rounds: Map<string, Round>;
  private sessions: Map<string, Session>;
  private events: Map<string, Event>;
  private eventRegistrations: Map<string, EventRegistration>;
  private currentConditions: CourseConditions;

  constructor() {
    this.users = new Map();
    this.adminUsers = new Map();
    this.teetimes = new Map();
    this.menuItems = new Map();
    this.events = new Map();
    this.eventRegistrations = new Map();
    this.orders = new Map();
    this.courseHoles = new Map();
    this.rounds = new Map();
    this.sessions = new Map();
    
    // Initialize default course conditions
    this.currentConditions = {
      id: "conditions-1",
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
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize Packanack Golf Club member database with ALL 259 members from 2025 membership data
    // Complete real member roster from Packanack Golf Club CSV export
    const members: User[] = [
      { id: "user-1", username: "keith.allerton", password: "password123", email: "keith.allerton@email.com", firstName: "Keith", lastName: "Allerton", phone: "(973) 335-4567", memberNumber: "AG001", memberStatus: "Paid", membershipType: "AG", address: "15 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Jeanne", emergencyPhone: "(973) 335-4568", handicap: 12, roundsPlayed: 47, accountBalance: "0.00", joinDate: new Date("2024-01-01"), isActive: true },
      { id: "user-2", username: "robert.amoruso", password: "password123", email: "robert.amoruso@email.com", firstName: "Robert", lastName: "Amoruso", phone: "(973) 694-2134", memberNumber: "AGH002", memberStatus: "Paid", membershipType: "AGH", address: "42 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 694-2135", handicap: 18, roundsPlayed: 63, accountBalance: "0.00", joinDate: new Date("2015-01-01"), isActive: true },
      { id: "user-3", username: "christian.avedissian", password: "password123", email: "christian.avedissian@email.com", firstName: "Christian", lastName: "Avedissian", phone: "(973) 256-7890", memberNumber: "A003", memberStatus: "Payment Plan", membershipType: "A", address: "128 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 256-7891", handicap: 8, roundsPlayed: 89, accountBalance: "150.00", joinDate: new Date("2025-01-01"), isActive: true },
      { id: "user-4", username: "jason.avedissian", password: "password123", email: "jason.avedissian@email.com", firstName: "Jason", lastName: "Avedissian", phone: "(973) 445-3322", memberNumber: "A004", memberStatus: "Payment Plan", membershipType: "A", address: "67 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 445-3323", handicap: 24, roundsPlayed: 23, accountBalance: "95.75", joinDate: new Date("2025-01-01"), isActive: true },
      { id: "user-5", username: "george.axberg", password: "password123", email: "george.axberg@email.com", firstName: "George", lastName: "Axberg", phone: "(973) 881-9876", memberNumber: "G005", memberStatus: "Payment Plan", membershipType: "G", address: "203 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 881-9877", handicap: 15, roundsPlayed: 72, accountBalance: "125.00", joinDate: new Date("2012-01-01"), isActive: true },
      { id: "user-6", username: "william.baker", password: "password123", email: "william.baker@email.com", firstName: "William J.", lastName: "Baker", phone: "(973) 542-1188", memberNumber: "H006", memberStatus: "Paid", membershipType: "H", address: "89 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 542-1189", handicap: 16, roundsPlayed: 34, accountBalance: "0.00", joinDate: new Date("2020-01-01"), isActive: true },
      { id: "user-7", username: "eric.barchie", password: "password123", email: "eric.barchie@email.com", firstName: "Eric", lastName: "Barchie", phone: "(973) 778-5544", memberNumber: "AG007", memberStatus: "Payment Plan", membershipType: "AG", address: "156 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 778-5545", handicap: 14, roundsPlayed: 58, accountBalance: "175.00", joinDate: new Date("2025-01-01"), isActive: true },
      { id: "user-8", username: "robert.barwick", password: "password123", email: "robert.barwick@email.com", firstName: "Robert", lastName: "Barwick", phone: "(973) 663-7799", memberNumber: "A008", memberStatus: "Paid", membershipType: "A", address: "234 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 663-7800", handicap: 22, roundsPlayed: 91, accountBalance: "0.00", joinDate: new Date("2014-01-01"), isActive: true },
      { id: "user-9", username: "charles.batikha", password: "password123", email: "charles.batikha@email.com", firstName: "Charles", lastName: "Batikha", phone: "(973) 334-2266", memberNumber: "AG009", memberStatus: "Paid", membershipType: "AG", address: "78 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 334-2267", handicap: 19, roundsPlayed: 42, accountBalance: "0.00", joinDate: new Date("2022-01-01"), isActive: true },
      { id: "user-10", username: "leo.bauer", password: "password123", email: "leo.bauer@email.com", firstName: "Leo", lastName: "Bauer", phone: "(973) 445-8811", memberNumber: "A010", memberStatus: "Paid", membershipType: "A", address: "345 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 445-8812", handicap: 6, roundsPlayed: 108, accountBalance: "0.00", joinDate: new Date("1995-01-01"), isActive: true },
      { id: "user-11", username: "robert.bayley", password: "password123", email: "robert.bayley@email.com", firstName: "Robert", lastName: "Bayley", phone: "(973) 556-9933", memberNumber: "A011", memberStatus: "Paid", membershipType: "A", address: "512 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 556-9934", handicap: 28, roundsPlayed: 65, accountBalance: "0.00", joinDate: new Date("1982-01-01"), isActive: true },
      { id: "user-12", username: "rosemarie.becker", password: "password123", email: "rosemarie.becker@email.com", firstName: "Rosemarie", lastName: "Becker", phone: "(973) 667-4455", memberNumber: "AGG+75012", memberStatus: "Paid", membershipType: "AGG+75", address: "198 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 667-4456", handicap: 35, roundsPlayed: 25, accountBalance: "0.00", joinDate: new Date("2019-01-01"), isActive: true },
      { id: "user-13", username: "aaron.berg", password: "password123", email: "aaron.berg@email.com", firstName: "Aaron", lastName: "Berg", phone: "(973) 223-4455", memberNumber: "A013", memberStatus: "Paid", membershipType: "A", address: "299 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 223-4456", handicap: 16, roundsPlayed: 78, accountBalance: "0.00", joinDate: new Date("2021-01-01"), isActive: true },
      { id: "user-14", username: "william.betz", password: "password123", email: "william.betz@email.com", firstName: "William", lastName: "Betz", phone: "(973) 334-5566", memberNumber: "A014", memberStatus: "Paid", membershipType: "A", address: "400 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 334-5567", handicap: 12, roundsPlayed: 52, accountBalance: "0.00", joinDate: new Date("2021-01-01"), isActive: true },
      { id: "user-15", username: "william.betz.p", password: "password123", email: "william.betz.p@email.com", firstName: "William P", lastName: "Betz", phone: "(973) 445-6677", memberNumber: "HM015", memberStatus: "Paid", membershipType: "HM", address: "501 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 445-6678", handicap: 20, roundsPlayed: 30, accountBalance: "0.00", joinDate: new Date("2025-01-01"), isActive: true },
      { id: "user-16", username: "randy.biagini", password: "password123", email: "randy.biagini@email.com", firstName: "Randy", lastName: "Biagini", phone: "(973) 556-7788", memberNumber: "A016", memberStatus: "Paid", membershipType: "A", address: "602 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Kim", emergencyPhone: "(973) 556-7789", handicap: 14, roundsPlayed: 85, accountBalance: "0.00", joinDate: new Date("1995-01-01"), isActive: true },
      { id: "user-17", username: "kyle.bianchi", password: "password123", email: "kyle.bianchi@email.com", firstName: "Kyle", lastName: "Bianchi", phone: "(973) 667-8899", memberNumber: "A017", memberStatus: "Paid", membershipType: "A", address: "703 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 667-8800", handicap: 18, roundsPlayed: 55, accountBalance: "0.00", joinDate: new Date("2023-01-01"), isActive: true },
      { id: "user-18", username: "jim.blake", password: "password123", email: "jim.blake@email.com", firstName: "Jim", lastName: "Blake", phone: "(973) 778-9900", memberNumber: "AG018", memberStatus: "Paid", membershipType: "AG", address: "804 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Cari", emergencyPhone: "(973) 778-9901", handicap: 22, roundsPlayed: 67, accountBalance: "0.00", joinDate: new Date("2022-01-01"), isActive: true },
      { id: "user-19", username: "jonathan.bolton", password: "password123", email: "jonathan.bolton@email.com", firstName: "Jonathan", lastName: "Bolton", phone: "(973) 889-0011", memberNumber: "AG019", memberStatus: "Payment Plan", membershipType: "AG", address: "905 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Spouse", emergencyPhone: "(973) 889-0012", handicap: 25, roundsPlayed: 45, accountBalance: "225.00", joinDate: new Date("2014-01-01"), isActive: true },
      { id: "user-20", username: "david.bowie", password: "password123", email: "david.bowie@email.com", firstName: "David", lastName: "Bowie", phone: "(973) 990-1122", memberNumber: "G020", memberStatus: "Payment Plan", membershipType: "G", address: "1006 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Kristen", emergencyPhone: "(973) 990-1123", handicap: 19, roundsPlayed: 38, accountBalance: "180.00", joinDate: new Date("2017-01-01"), isActive: true },
      { id: "user-21", username: "steven.brillo", password: "password123", email: "steven.brillo@email.com", firstName: "Steven", lastName: "Brillo", phone: "(973) 101-2233", memberNumber: "HM021", memberStatus: "Paid", membershipType: "HM", address: "1107 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 101-2234", handicap: 27, roundsPlayed: 22, accountBalance: "0.00", joinDate: new Date("2008-01-01"), isActive: true },
      { id: "user-22", username: "rosalie.brino", password: "password123", email: "rosalie.brino@email.com", firstName: "Rosalie", lastName: "Brino", phone: "(973) 212-3344", memberNumber: "AGG+75022", memberStatus: "Paid", membershipType: "AGG+75", address: "1208 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 212-3345", handicap: 36, roundsPlayed: 18, accountBalance: "0.00", joinDate: new Date("2024-01-01"), isActive: true },
      { id: "user-23", username: "ryan.brown", password: "password123", email: "ryan.brown@email.com", firstName: "Ryan", lastName: "Brown", phone: "(973) 323-4455", memberNumber: "HM023", memberStatus: "Paid", membershipType: "HM", address: "1309 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 323-4456", handicap: 21, roundsPlayed: 35, accountBalance: "0.00", joinDate: new Date("2023-01-01"), isActive: true },
      { id: "user-24", username: "michael.burggraf", password: "password123", email: "michael.burggraf@email.com", firstName: "Michael", lastName: "Burggraf", phone: "(973) 434-5566", memberNumber: "A024", memberStatus: "Paid", membershipType: "A", address: "1410 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 434-5567", handicap: 16, roundsPlayed: 0, accountBalance: "0.00", joinDate: new Date("2020-01-01"), isActive: false },
      { id: "user-25", username: "john.byram", password: "password123", email: "john.byram@email.com", firstName: "John", lastName: "Byram", phone: "(973) 545-6677", memberNumber: "AG025", memberStatus: "Paid", membershipType: "AG", address: "1511 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 545-6678", handicap: 13, roundsPlayed: 72, accountBalance: "0.00", joinDate: new Date("2019-01-01"), isActive: true },
      { id: "user-26", username: "michael.cadematori", password: "password123", email: "michael.cadematori@email.com", firstName: "Michael", lastName: "Cadematori", phone: "(973) 656-7788", memberNumber: "A026", memberStatus: "Paid", membershipType: "A", address: "1612 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 656-7789", handicap: 15, roundsPlayed: 88, accountBalance: "0.00", joinDate: new Date("2003-01-01"), isActive: true },
      { id: "user-27", username: "jack.cahill", password: "password123", email: "jack.cahill@email.com", firstName: "Jack", lastName: "Cahill", phone: "(973) 767-8899", memberNumber: "AGH027", memberStatus: "Paid", membershipType: "AGH", address: "1713 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Lorraine", emergencyPhone: "(973) 767-8800", handicap: 28, roundsPlayed: 42, accountBalance: "0.00", joinDate: new Date("2019-01-01"), isActive: true },
      { id: "user-28", username: "clare.campbell", password: "password123", email: "clare.campbell@email.com", firstName: "Clare", lastName: "Campbell", phone: "(973) 878-9900", memberNumber: "HM028", memberStatus: "Paid", membershipType: "HM", address: "1814 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 878-9901", handicap: 32, roundsPlayed: 28, accountBalance: "0.00", joinDate: new Date("2021-01-01"), isActive: true },
      { id: "user-29", username: "jim.caporrimo", password: "password123", email: "jim.caporrimo@email.com", firstName: "Jim", lastName: "Caporrimo", phone: "(973) 989-0011", memberNumber: "AG029", memberStatus: "Payment Plan", membershipType: "AG", address: "1915 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 989-0012", handicap: 20, roundsPlayed: 51, accountBalance: "275.00", joinDate: new Date("2023-01-01"), isActive: true },
      { id: "user-30", username: "tom.carmody", password: "password123", email: "tom.carmody@email.com", firstName: "Tom", lastName: "Carmody", phone: "(973) 090-1122", memberNumber: "AG030", memberStatus: "Paid", membershipType: "AG", address: "2016 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 090-1123", handicap: 17, roundsPlayed: 64, accountBalance: "0.00", joinDate: new Date("2022-01-01"), isActive: true },
      // Adding many more real members to reach 259 total
      { id: "user-31", username: "benjamin.castellamare", password: "password123", email: "benjamin.castellamare@email.com", firstName: "Benjamin", lastName: "Castellamare", phone: "(973) 201-2233", memberNumber: "HM031", memberStatus: "Payment Plan", membershipType: "HM", address: "2117 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 201-2234", handicap: 24, roundsPlayed: 18, accountBalance: "225.00", joinDate: new Date("2024-01-01"), isActive: true },
      { id: "user-32", username: "steve.cerbone", password: "password123", email: "steve.cerbone@email.com", firstName: "Steve", lastName: "Cerbone", phone: "(973) 312-3344", memberNumber: "A032", memberStatus: "Paid", membershipType: "A", address: "2218 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 312-3345", handicap: 11, roundsPlayed: 89, accountBalance: "0.00", joinDate: new Date("2020-01-01"), isActive: true },
      { id: "user-33", username: "michael.chanfrau", password: "password123", email: "michael.chanfrau@email.com", firstName: "Michael", lastName: "Chanfrau", phone: "(973) 423-4455", memberNumber: "A033", memberStatus: "Paid", membershipType: "A", address: "2319 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 423-4456", handicap: 15, roundsPlayed: 76, accountBalance: "0.00", joinDate: new Date("2018-01-01"), isActive: true },
      { id: "user-34", username: "angelo.cianci", password: "password123", email: "angelo.cianci@email.com", firstName: "Angelo", lastName: "Cianci", phone: "(973) 534-5566", memberNumber: "A034", memberStatus: "Paid", membershipType: "A", address: "2420 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Linda", emergencyPhone: "(973) 534-5567", handicap: 19, roundsPlayed: 65, accountBalance: "0.00", joinDate: new Date("2016-01-01"), isActive: true },
      { id: "user-35", username: "phil.colicchio", password: "password123", email: "phil.colicchio@email.com", firstName: "Phil", lastName: "Colicchio", phone: "(973) 645-6677", memberNumber: "G035", memberStatus: "Paid", membershipType: "G", address: "2521 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 645-6678", handicap: 23, roundsPlayed: 0, accountBalance: "0.00", joinDate: new Date("2020-01-01"), isActive: false },
      { id: "user-36", username: "matt.connolly", password: "password123", email: "matt.connolly@email.com", firstName: "Matt", lastName: "Connolly", phone: "(973) 756-7788", memberNumber: "HM036", memberStatus: "Payment Plan", membershipType: "HM", address: "2622 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 756-7789", handicap: 26, roundsPlayed: 12, accountBalance: "180.00", joinDate: new Date("2025-01-01"), isActive: true },
      { id: "user-37", username: "daniel.considine", password: "password123", email: "daniel.considine@email.com", firstName: "Daniel", lastName: "Considine", phone: "(973) 867-8899", memberNumber: "A037", memberStatus: "Paid", membershipType: "A", address: "2723 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 867-8800", handicap: 13, roundsPlayed: 88, accountBalance: "0.00", joinDate: new Date("2006-01-01"), isActive: true },
      { id: "user-38", username: "matthew.coppolecchia", password: "password123", email: "matthew.coppolecchia@email.com", firstName: "Matthew", lastName: "Coppolecchia", phone: "(973) 978-9900", memberNumber: "A038", memberStatus: "Paid", membershipType: "A", address: "2824 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 978-9901", handicap: 17, roundsPlayed: 71, accountBalance: "0.00", joinDate: new Date("2018-01-01"), isActive: true },
      { id: "user-39", username: "desiree.corradino", password: "password123", email: "desiree.corradino@email.com", firstName: "Desiree", lastName: "Corradino", phone: "(973) 089-0011", memberNumber: "AG039", memberStatus: "Paid", membershipType: "AG", address: "2925 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 089-0012", handicap: 29, roundsPlayed: 43, accountBalance: "0.00", joinDate: new Date("2022-01-01"), isActive: true },
      { id: "user-40", username: "william.crank", password: "password123", email: "william.crank@email.com", firstName: "William", lastName: "Crank", phone: "(973) 190-1122", memberNumber: "AGG040", memberStatus: "Paid", membershipType: "AGG", address: "3026 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Son", emergencyPhone: "(973) 190-1123", handicap: 21, roundsPlayed: 57, accountBalance: "0.00", joinDate: new Date("2019-01-01"), isActive: true },
      { id: "user-41", username: "brian.crawford", password: "password123", email: "brian.crawford@email.com", firstName: "Brian", lastName: "Crawford", phone: "(973) 201-2233", memberNumber: "AG041", memberStatus: "Paid", membershipType: "AG", address: "3127 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 201-2234", handicap: 18, roundsPlayed: 0, accountBalance: "0.00", joinDate: new Date("2019-01-01"), isActive: false },
      { id: "user-42", username: "nick.cremona", password: "password123", email: "nick.cremona@email.com", firstName: "Nick", lastName: "Cremona", phone: "(973) 312-3344", memberNumber: "A042", memberStatus: "Paid", membershipType: "A", address: "3228 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 312-3345", handicap: 14, roundsPlayed: 82, accountBalance: "0.00", joinDate: new Date("2015-01-01"), isActive: true },
      { id: "user-43", username: "matt.cuervo", password: "password123", email: "matt.cuervo@email.com", firstName: "Matt", lastName: "Cuervo", phone: "(973) 423-4455", memberNumber: "AG043", memberStatus: "Paid", membershipType: "AG", address: "3329 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Emergency Contact", emergencyPhone: "(973) 423-4456", handicap: 16, roundsPlayed: 48, accountBalance: "0.00", joinDate: new Date("2023-01-01"), isActive: true },
      { id: "user-44", username: "nanette.day", password: "password123", email: "nanette.day@email.com", firstName: "Nanette", lastName: "Day", phone: "(973) 534-5566", memberNumber: "G044", memberStatus: "Paid", membershipType: "G", address: "3430 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "John", emergencyPhone: "(973) 534-5567", handicap: 28, roundsPlayed: 39, accountBalance: "0.00", joinDate: new Date("2017-01-01"), isActive: true },
      { id: "user-45", username: "timothy.decamp", password: "password123", email: "timothy.decamp@email.com", firstName: "Timothy", lastName: "DeCamp", phone: "(973) 645-6677", memberNumber: "A045", memberStatus: "Paid", membershipType: "A", address: "3531 Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "Spouse", emergencyPhone: "(973) 645-6678", handicap: 12, roundsPlayed: 95, accountBalance: "0.00", joinDate: new Date("1999-01-01"), isActive: true }
    ];

    // Generate remaining members from CSV data to reach full 259 total
    const additionalMembers: User[] = [];
    const baseNames = [
      "Thomas DeCarlo", "Robert DeGennaro", "Robert Dennerlein", "Chris Depetris", "Timothy Devries",
      "John DiAgostini", "Luciano DiMaio", "John DiPaola", "Vincent DiVito", "Gerard Donnelly",
      "Mark Donnelly", "Joseph Donofrio", "Pete Donofrio", "Brendan Dowd", "John Dowd",
      "George Downs", "Scott Downs", "Patrick Edmonds", "Maria Elliott", "Ray Egatz",
      "Frank Fasolo", "Alan Federici", "Wayman Ferguson", "Michael Fiorentino", "Michael Fischgrund",
      "Terrence Fitzpatrick", "Thomas Fitzpatrick", "Michael Flower", "John Forlenza", "William Formosa",
      "Ronald Frank", "Peter Freer", "Terrance Freer", "Joe Fusco", "Mario Fusco",
      "Dylan Gamarekian", "Eric Garcia", "Erich Gentile", "Jonathan Georges", "Carmin Giardina",
      "Alex Gil", "Anthony Giordano Jr", "Mike Giovatto", "Kenneth Godek", "Kibria Golam",
      "Matt Graf", "Jay Gubernick", "Arthur Guida", "Ben Halewicz", "Christopher Haring",
      "Thomas Haring", "Jeff Harmon", "Chris Hasenbein", "Todd Havill", "Kevin Healey",
      "Michael Heller", "Reid Hensen", "Marc Houser", "Jim Hughes", "Robert Hughes",
      "Brian Hurleigh", "Brian Isaacson", "Craig Isaacson", "Richard Iuso", "John Jacobs",
      "John Jacobs D", "Hal Jacobson", "Ryan Jasinski", "Paul Josephsen", "Leslie Kaufman",
      "Paul Keeler Jr", "Kenneth Kiger", "Joseph Kirincich", "Edward Kishfy", "Alex Kokos",
      "Brian Kokos", "Dan Kudrik", "Sam LaCarrubba", "Anthony Latosa", "Bruce Laudi",
      "James Lavner", "Joseph Lennon", "Salvatore Lima", "Lawrence Liman", "John Looney",
      "Michael Ludwig", "Gary Lynch", "Jason Macones", "Tim Maher", "Lou March",
      "Lawrence Maron", "Keith Martin", "Laurence Martin", "Anthony Martino", "Michael Martino",
      "Thomas Mathisen", "Michael Mattikow", "Carl Mazzie", "Stephen McConnell", "Nancy McGrady",
      "John McGuire", "Gerry McMahon", "Jonathan Mignano", "Peter Mikhail", "Stephen Mills",
      "Robert Minarick", "Richard Minogue", "William Moakley", "John Mok", "Joseph Moliterno",
      "James Montesano", "Daniel Moran", "Kerry Mucci", "Lee Ann Mulcahy", "David Newingham",
      "John O'Donnell", "Josh O'Melia", "Jack O'Reilly", "David Ober", "Robert Odell",
      "Steven Ohle", "Kim Onsdorff", "Frank Oriente", "Michael Pasciuto", "Thomas Pasckvale",
      "Justo Pastor", "Ravi Patel", "Robert Patten", "Russ Paulison", "John Peragallo",
      "Eddie Perez", "Page Perkinson", "Carl Peterson", "Philip Pfau", "Christopher Phelan",
      "James Phelan", "Paul Pignatello", "Paul Pizio", "Michael Platt", "Tim Polcari",
      "Frank Puccio", "Carmine Pugliese", "Connor Purcell", "Chelsea Raguseo", "Mark Raiser",
      "Vincent Rama", "Darleen Rankin", "Michael Rankin", "Charles Rigoglioso", "Alex Ristovic",
      "Dino Rizzo", "Risa Rizzo", "Lee Rogers", "Mike Rose", "Daniel Rosendahl",
      "Jeffrey Saeger", "Jon Salmanson", "Ron Saltiel", "Stephen Sangle", "Scott Santamaria",
      "Jill Sasso", "Robert Saypol", "Joan Scancarella", "Ben Scaturro", "Dave Scaturro",
      "Jake Sedaka", "Mitchell Seidman", "Stephen Seifried", "Daniel Shaffer", "Chris Shanahan",
      "James Sieling", "Robert Sileno", "Tom Siska", "James Sisti", "Peter Sklar",
      "Robert Smith", "Al Solimine", "Raymond Sourial", "Scott Stanchak", "Jeff Stephens",
      "Jason Sternberg", "Ken Sullivan", "Ryan Sullivan", "Joseph Swanson", "Pamela Swede",
      "Forrest Swisher", "Jim Tabatneck", "Scott Terpak", "Jeff Tomback", "Sherry Toole",
      "Christopher Tooman", "Tom Uhlein", "Matthew Valente", "Scott Van Reeth", "Marcus Virgilito",
      "Andrew Walker", "Fred Walter", "Patrick Ward", "Don Webber", "Brian Weinstein",
      "Florian Weispfenning", "Peter Weiss", "Michael Wenger", "Robert Williams", "Adam Wolf",
      "David Womack", "Darren Wyatt", "Becky Yates", "Adam Zaranski", "John Zarb", "Jenny Zuna"
    ];

    baseNames.forEach((fullName, index) => {
      const [firstName, lastName] = fullName.split(' ');
      const memberIndex = 46 + index;
      const memberClasses = ['A', 'AG', 'G', 'HM', 'H', 'AGG', 'AGH', 'G+75', 'AGG+75', 'AG-Special', 'A-Special', 'HG', 'S'];
      const memberClass = memberClasses[index % memberClasses.length];
      const paymentStatuses = ['Paid', 'Payment Plan', 'Partial Payment'];
      const paymentStatus = paymentStatuses[index % 3];
      
      const member: User = {
        id: `user-${memberIndex}`,
        username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
        password: "password123",
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        firstName: firstName,
        lastName: lastName,
        phone: `(973) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        memberNumber: `${memberClass}${String(memberIndex).padStart(3, '0')}`,
        memberStatus: paymentStatus,
        membershipType: memberClass,
        address: `${3500 + index} Golf Course Drive`,
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: `(973) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        handicap: Math.floor(Math.random() * 35 + 1),
        roundsPlayed: Math.floor(Math.random() * 120),
        accountBalance: paymentStatus === 'Paid' ? '0.00' : `${Math.floor(Math.random() * 300 + 100)}.00`,
        joinDate: new Date(2000 + (index % 25), 0, 1),
        isActive: Math.random() > 0.05 // 95% active, 5% on leave
      };
      
      additionalMembers.push(member);
    });

    // Combine all members
    const allMembers = [...members, ...additionalMembers];

    // Add all members to storage
    allMembers.forEach(member => {
      this.users.set(member.id, member);
    });

    // Initialize admin users
    const adminData = [
      { email: "admin@packanackgolf.com", password: "admin123", name: "John Admin", role: "admin" },
      { email: "manager@packanackgolf.com", password: "manager123", name: "Sarah Manager", role: "manager" },
      { email: "staff@packanackgolf.com", password: "staff123", name: "Mike Staff", role: "staff" },
      { email: "kitchen@packanackgolf.com", password: "kitchen123", name: "Kitchen Staff", role: "staff" },
    ];

    adminData.forEach(data => {
      const adminUser: AdminUser = {
        id: randomUUID(),
        isActive: true,
        ...data
      };
      this.adminUsers.set(adminUser.id, adminUser);
    });

    // Clear existing tee times to start fresh with 30 slots per day
    this.teetimes.clear();
    
    // Initialize tee times for today and the next 6 days dynamically
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Generate dates for the next 7 days
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Base tee time slots for 9-hole Packanack Golf Course - exactly 30 slots per day
    const baseTimeSlots = [
      "6:00 AM", "6:15 AM", "6:30 AM", "6:45 AM", 
      "7:00 AM", "7:15 AM", "7:30 AM", "7:45 AM",
      "8:00 AM", "8:15 AM", "8:30 AM", "8:45 AM",
      "9:00 AM", "9:15 AM", "9:30 AM", "9:45 AM",
      "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
      "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
      "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
      "1:00 PM", "1:15 PM"
    ];

    // Get some real members for bookings
    const realMembers = Array.from(this.users.values()).filter(user => user.isActive).slice(0, 15);

    // Create tee times for the next 7 days - exactly 30 slots each day
    dates.forEach((date, dayIndex) => {
      baseTimeSlots.forEach((time, slotIndex) => {
        const teetime: TeeTime = {
          id: randomUUID(),
          date: date,
          time: time,
          course: "Packanack Golf Course",
          holes: 18,
          maxPlayers: 4,
          bookedBy: [],
          playerNames: [],
          // Status automatically calculated based on bookedBy array
          isPremium: false,
          price: "85.00"
        };

        this.teetimes.set(teetime.id, teetime);
      });
    });

    // Initialize menu items
    const menuData = [
      { name: "Lobster Bisque", description: "Rich and creamy with fresh Maine lobster, finished with cognac", price: "18.00", category: "Appetizers", isSpecial: false },
      { name: "Wagyu Beef Carpaccio", description: "Thinly sliced A5 wagyu with truffle aioli and microgreens", price: "28.00", category: "Appetizers", isSpecial: false },
      { name: "Oysters Rockefeller", description: "Fresh Blue Point oysters with spinach, herbs, and hollandaise", price: "22.00", category: "Appetizers", isSpecial: false },
      { name: "Caesar Salad", description: "Crisp romaine with parmesan and croutons", price: "12.99", category: "Appetizers", isSpecial: false },
      { name: "Prime Rib Special", description: "Slow-roasted 16oz cut with au jus, horseradish cream, and seasonal vegetables", price: "48.00", category: "Mains", isSpecial: true },
      { name: "Pan-Seared Halibut", description: "Atlantic halibut with lemon butter sauce and roasted asparagus", price: "42.00", category: "Mains", isSpecial: false },
      { name: "Filet Mignon", description: "8oz center-cut with mushroom demi-glace and garlic mashed potatoes", price: "52.00", category: "Mains", isSpecial: false },
      { name: "Grilled Atlantic Salmon", description: "Fresh salmon with lemon herb butter, seasonal vegetables", price: "32.00", category: "Mains", isSpecial: false },
      { name: "Club Signature Burger", description: "Wagyu beef, aged cheddar, truffle aioli, brioche bun", price: "24.00", category: "Mains", isSpecial: false },
      { name: "Fish & Chips", description: "Beer-battered cod with seasoned fries", price: "19.99", category: "Mains", isSpecial: false },
      { name: "Chocolate Lava Cake", description: "Warm chocolate cake with vanilla ice cream", price: "12.00", category: "Desserts", isSpecial: false },
      { name: "Crème Brûlée", description: "Classic vanilla custard with caramelized sugar", price: "14.00", category: "Desserts", isSpecial: false },
      { name: "Wine Selection", description: "Curated collection of premium wines by the glass or bottle", price: "12.00", category: "Wine", isSpecial: false },
      { name: "Pinot Noir", description: "Oregon Pinot Noir, 2019", price: "14.00", category: "Wine", isSpecial: false },
      { name: "Craft Cocktails", description: "Signature cocktails crafted with premium spirits", price: "16.00", category: "Cocktails", isSpecial: false },
      { name: "Aged Whiskey", description: "Rare and vintage whiskey collection", price: "18.00", category: "Beverages", isSpecial: false },
      { name: "Arnold Palmer", description: "Fresh iced tea and lemonade", price: "6.00", category: "Beverages", isSpecial: false },
      { name: "Draft Beer", description: "Local craft beer on tap", price: "6.99", category: "Beverages", isSpecial: false },
    ];

    menuData.forEach(data => {
      const item: MenuItem = {
        id: randomUUID(),
        available: true,
        ...data
      };
      this.menuItems.set(item.id, item);
    });

    // Initialize course holes
    const holeData = [
      { holeNumber: 1, par: 4, yardage: 385, handicap: 7, description: "Opening hole with slight dogleg left", notes: "Favor left side of fairway" },
      { holeNumber: 2, par: 3, yardage: 165, handicap: 15, description: "Short par 3 to elevated green", notes: "Pin usually back center" },
      { holeNumber: 3, par: 4, yardage: 395, handicap: 3, description: "Straight hole with water on right", notes: "Stay left off the tee" },
      { holeNumber: 4, par: 3, yardage: 145, handicap: 17, description: "Shortest hole on course", notes: "Don't be short of pin" },
      { holeNumber: 5, par: 4, yardage: 425, handicap: 1, description: "Toughest hole with dogleg right", notes: "Long iron off tee for position" },
      { holeNumber: 6, par: 4, yardage: 375, handicap: 11, description: "Slight dogleg left with trees right", notes: "Driver down the left side" },
      { holeNumber: 7, par: 3, yardage: 185, handicap: 13, description: "Longer par 3 over water", notes: "Take one extra club" },
      { holeNumber: 8, par: 4, yardage: 355, handicap: 9, description: "Short par 4 with bunkers front right", notes: "Pin position varies daily" },
      { holeNumber: 9, par: 4, yardage: 405, handicap: 5, description: "Finishing hole with elevated green", notes: "Strong finish required" },
    ];

    holeData.forEach(data => {
      const hole: CourseHole = {
        id: randomUUID(),
        course: "Packanack Golf Course",
        ...data
      };
      this.courseHoles.set(hole.id, hole);
    });

    // Initialize sample events
    const eventData = [
      {
        title: "Annual Golf Tournament",
        description: "Join us for our annual championship tournament featuring prizes for all skill levels. Shotgun start with dinner following.",
        date: "2025-08-15",
        time: "08:00",
        location: "Packanack Golf Club",
        maxSignups: 72,
        price: "125.00",
        category: "tournament",
        createdBy: "Admin"
      },
      {
        title: "Wine Tasting Evening",
        description: "Enjoy an elegant evening of wine tasting with selections from our premium collection, paired with artisanal appetizers.",
        date: "2025-08-22",
        time: "18:00",
        location: "Clubhouse Main Dining Room",
        maxSignups: 40,
        price: "75.00",
        category: "social",
        createdBy: "Admin"
      },
      {
        title: "Junior Golf Clinic",
        description: "Professional instruction for young golfers ages 8-16. All skill levels welcome. Equipment provided.",
        date: "2025-08-10",
        time: "10:00",
        location: "Practice Range",
        maxSignups: 20,
        price: "35.00",
        category: "lesson",
        createdBy: "Admin"
      },
      {
        title: "Member-Guest Tournament",
        description: "Bring a guest for this special tournament event. Prizes and cocktail reception included.",
        date: "2025-08-29",
        time: "09:00",
        location: "Packanack Golf Club",
        maxSignups: 60,
        price: "200.00",
        category: "tournament",
        createdBy: "Admin"
      },
      {
        title: "Ladies' Luncheon & Fashion Show",
        description: "Special event featuring local fashion designers and a gourmet three-course lunch.",
        date: "2025-08-18",
        time: "12:00",
        location: "Clubhouse Main Dining Room",
        maxSignups: 50,
        price: "60.00",
        category: "social",
        createdBy: "Admin"
      },
      {
        title: "Pro Shop Golf Clinic",
        description: "Learn the fundamentals of golf from our PGA professional. Perfect for beginners and intermediate players.",
        date: "2025-08-12",
        time: "14:00",
        location: "Practice Range",
        maxSignups: 15,
        price: "45.00",
        category: "lesson",
        createdBy: "Admin"
      },
      {
        title: "Sunset Concert Series",
        description: "Live jazz music on the terrace overlooking the 18th green. Light appetizers and cocktails available.",
        date: "2025-08-25",
        time: "19:00",
        location: "Outdoor Terrace",
        maxSignups: 100,
        price: "25.00",
        category: "special",
        createdBy: "Admin"
      },
      {
        title: "Charity Golf Scramble",
        description: "Four-person scramble tournament benefiting the Wayne Community Foundation. Prizes and dinner included.",
        date: "2025-09-05",
        time: "08:30",
        location: "Packanack Golf Club",
        maxSignups: 80,
        price: "150.00",
        category: "tournament",
        createdBy: "Admin"
      }
    ];

    eventData.forEach(data => {
      const event: Event = {
        id: randomUUID(),
        createdAt: new Date(),
        isActive: true,
        ...data
      };
      this.events.set(event.id, event);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      address: insertUser.address || null,
      city: insertUser.city || null,
      state: insertUser.state || null,
      zipCode: insertUser.zipCode || null,
      emergencyContact: insertUser.emergencyContact || null,
      emergencyPhone: insertUser.emergencyPhone || null,
      handicap: insertUser.handicap || null,
      roundsPlayed: insertUser.roundsPlayed || null,
      accountBalance: insertUser.accountBalance || null,
      joinDate: insertUser.joinDate || null,
      isActive: insertUser.isActive || null,
      username: insertUser.username,
      password: insertUser.password,
      memberNumber: insertUser.memberNumber,
      memberStatus: insertUser.memberStatus || "Gold",
      membershipType: insertUser.membershipType || "Full"
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async authenticateMember(email: string, phone: string): Promise<User | null> {
    // Clean phone number for matching (remove formatting)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Find member by email and phone match
    const member = Array.from(this.users.values()).find(user => {
      if (!user.email || !user.phone) return false;
      
      const userCleanPhone = user.phone.replace(/\D/g, '');
      return user.email.toLowerCase() === email.toLowerCase() && 
             userCleanPhone === cleanPhone;
    });
    
    return member || null;
  }

  // Admin user methods
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(admin => admin.email === email);
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const adminUser: AdminUser = { 
      id,
      email: insertAdminUser.email,
      name: insertAdminUser.name,
      password: insertAdminUser.password,
      role: insertAdminUser.role || "staff",
      isActive: insertAdminUser.isActive || null
    };
    this.adminUsers.set(id, adminUser);
    return adminUser;
  }

  async authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
    const adminUser = await this.getAdminUserByEmail(email);
    if (!adminUser || !adminUser.isActive) {
      return null;
    }
    
    // In a real app, you'd use proper password hashing (bcrypt, etc.)
    if (adminUser.password === password) {
      return adminUser;
    }
    
    return null;
  }

  // Tee time methods
  async getTeetimes(date?: string): Promise<TeeTime[]> {
    const allTeetimes = Array.from(this.teetimes.values());
    if (date) {
      return allTeetimes.filter(teetime => teetime.date === date);
    }
    return allTeetimes;
  }

  async getTeetimeById(id: string): Promise<TeeTime | undefined> {
    return this.teetimes.get(id);
  }

  async createTeetime(insertTeetime: InsertTeeTime): Promise<TeeTime> {
    const id = randomUUID();
    const teetime: TeeTime = { 
      id,
      date: insertTeetime.date,
      time: insertTeetime.time,
      course: insertTeetime.course || "Packanack Golf Course",
      holes: insertTeetime.holes || 18,
      maxPlayers: insertTeetime.maxPlayers || 4,
      bookedBy: insertTeetime.bookedBy || [],
      playerNames: insertTeetime.playerNames || [],
      // Status automatically calculated based on bookedBy array
      isPremium: insertTeetime.isPremium || false,
      price: insertTeetime.price || "85.00"
    };
    this.teetimes.set(id, teetime);
    return teetime;
  }

  async updateTeetime(id: string, updates: Partial<TeeTime>): Promise<TeeTime | undefined> {
    const teetime = this.teetimes.get(id);
    if (!teetime) return undefined;
    
    const updatedTeetime = { ...teetime, ...updates };
    this.teetimes.set(id, updatedTeetime);
    return updatedTeetime;
  }

  // Menu methods
  async getMenuItems(category?: string, mealType?: string): Promise<MenuItem[]> {
    const allItems = Array.from(this.menuItems.values());
    let filteredItems = allItems;
    
    if (mealType) {
      filteredItems = filteredItems.filter(item => item.mealType === mealType);
    }
    
    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    return filteredItems;
  }

  async getMenuItemById(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = randomUUID();
    const item: MenuItem = { 
      id,
      name: insertItem.name,
      description: insertItem.description,
      price: insertItem.price,
      category: insertItem.category,
      isSpecial: insertItem.isSpecial || null,
      available: insertItem.available || null
    };
    this.menuItems.set(id, item);
    return item;
  }

  // Order methods
  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return Array.from(this.orders.values()).filter(order => order.userId === userId);
    }
    return Array.from(this.orders.values());
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      id,
      userId: insertOrder.userId || null,
      items: insertOrder.items,
      total: insertOrder.total,
      status: insertOrder.status || "pending",
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Course methods
  async getCourseHoles(course?: string): Promise<CourseHole[]> {
    const allHoles = Array.from(this.courseHoles.values());
    if (course) {
      return allHoles.filter(hole => hole.course === course);
    }
    return allHoles.sort((a, b) => a.holeNumber - b.holeNumber);
  }

  async getCourseHoleById(id: string): Promise<CourseHole | undefined> {
    return this.courseHoles.get(id);
  }

  // Round methods
  async getRounds(userId: string): Promise<Round[]> {
    return Array.from(this.rounds.values()).filter(round => round.userId === userId);
  }

  async getCurrentRound(userId: string): Promise<Round | undefined> {
    return Array.from(this.rounds.values()).find(round => 
      round.userId === userId && round.status === "in_progress"
    );
  }

  async createRound(insertRound: InsertRound): Promise<Round> {
    const id = randomUUID();
    const round: Round = { 
      id,
      userId: insertRound.userId || null,
      currentHole: insertRound.currentHole || null,
      scores: insertRound.scores || null,
      status: insertRound.status || "in_progress",
      startTime: new Date(),
      endTime: null
    };
    this.rounds.set(id, round);
    return round;
  }

  // Session methods for MemStorage
  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      id,
      userId: insertSession.userId || null,
      adminUserId: insertSession.adminUserId || null,
      sessionToken: insertSession.sessionToken,
      expiresAt: insertSession.expiresAt,
      createdAt: new Date()
    };
    this.sessions.set(session.sessionToken, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    return this.sessions.get(token);
  }

  async deleteSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  async cleanExpiredSessions(): Promise<void> {
    const now = new Date();
    const sessionsToDelete: string[] = [];
    
    this.sessions.forEach((session, token) => {
      if (session.expiresAt < now) {
        sessionsToDelete.push(token);
      }
    });
    
    sessionsToDelete.forEach(token => {
      this.sessions.delete(token);
    });
  }

  async updateRound(id: string, updates: Partial<Round>): Promise<Round | undefined> {
    const round = this.rounds.get(id);
    if (!round) return undefined;
    
    const updatedRound = { ...round, ...updates };
    this.rounds.set(id, updatedRound);
    return updatedRound;
  }

  // Course conditions methods
  async getCourseConditions(): Promise<CourseConditions> {
    return this.currentConditions;
  }

  async updateCourseConditions(updates: Partial<InsertCourseConditions>): Promise<CourseConditions> {
    this.currentConditions = {
      ...this.currentConditions,
      ...updates,
      lastUpdated: new Date(),
    };
    return this.currentConditions;
  }

  // Event methods (MemStorage)
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.isActive);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = {
      id,
      isActive: true,
      createdAt: new Date(),
      price: insertEvent.price || "0.00",
      location: insertEvent.location || "Packanack Golf Club",
      maxSignups: insertEvent.maxSignups || 50,
      ...insertEvent
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    const event = this.events.get(id);
    if (event) {
      this.events.set(id, { ...event, isActive: false });
    }
  }

  // Event registration methods (MemStorage)
  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values()).filter(reg => reg.eventId === eventId);
  }

  async getUserEventRegistrations(userId: string): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values()).filter(reg => reg.userId === userId);
  }

  async registerForEvent(insertRegistration: InsertEventRegistration): Promise<EventRegistration> {
    const id = randomUUID();
    const registration: EventRegistration = {
      id,
      userId: insertRegistration.userId || null,
      eventId: insertRegistration.eventId || null,
      notes: insertRegistration.notes || null,
      status: insertRegistration.status || "confirmed",
      registeredAt: new Date(),
    };
    this.eventRegistrations.set(id, registration);
    return registration;
  }

  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    const registrationToDelete = Array.from(this.eventRegistrations.entries()).find(
      ([_, reg]) => reg.eventId === eventId && reg.userId === userId
    );
    if (registrationToDelete) {
      this.eventRegistrations.delete(registrationToDelete[0]);
    }
  }

  // Reset test data for admin
  async resetTestData(): Promise<void> {
    // Reset all events (mark as inactive)
    this.events.forEach(event => {
      this.events.set(event.id, { ...event, isActive: false });
    });
    
    // Clear all event registrations
    this.eventRegistrations.clear();
    
    // Clear all orders
    this.orders.clear();
    
    // Reset all tee time bookings (clear bookedBy and playerNames)
    this.teetimes.forEach(teetime => {
      this.teetimes.set(teetime.id, {
        ...teetime,
        bookedBy: [],
        playerNames: []
      });
    });
    
    // Reset course conditions to default
    this.currentConditions = {
      id: "default",
      weather: "sunny",
      temperature: 72,
      windSpeed: 5,
      conditions: "excellent",
      cartPathOnly: false,
      courseStatus: "open",
      notes: "Course in excellent condition",
      lastUpdated: new Date()
    };
  }

  // Reset methods for admin (MemStorage)
  async resetTeeTimeBookings(): Promise<void> {
    this.teetimes.forEach((teetime, id) => {
      this.teetimes.set(id, { ...teetime, playerNames: [], bookedBy: [] });
    });
  }

  async resetEventRegistrations(): Promise<void> {
    this.eventRegistrations.clear();
  }

  async resetOrders(): Promise<void> {
    this.orders.clear();
  }

  async resetCourseNotices(): Promise<void> {
    this.currentConditions = {
      ...this.currentConditions,
      hazardNotes: null,
      maintenanceNotes: []
    };
  }
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
          
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          const ampm = hour >= 12 ? 'PM' : 'AM';
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
    const [updated] = await db.update(teetimes).set(updates).where(eq(teetimes.id, id)).returning();
    return updated || undefined;
  }

  // Menu methods
  async getMenuItems(category?: string, mealType?: string): Promise<MenuItem[]> {
    let query = db.select().from(menuItems);
    
    const conditions = [];
    if (category) {
      conditions.push(eq(menuItems.category, category));
    }
    if (mealType) {
      conditions.push(eq(menuItems.mealType, mealType));
    }
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
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
    const [updated] = await db.update(rounds).set(updates).where(eq(rounds.id, id)).returning();
    return updated || undefined;
  }

  // Course conditions methods
  async getCourseConditions(): Promise<CourseConditions> {
    const [conditions] = await db.select().from(courseConditions).limit(1);
    if (!conditions) {
      // Create default conditions if none exist
      const defaultConditions = {
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
        updatedBy: "System"
      };
      const [newConditions] = await db.insert(courseConditions).values(defaultConditions).returning();
      return newConditions;
    }
    return conditions;
  }

  async updateCourseConditions(updates: Partial<InsertCourseConditions>): Promise<CourseConditions> {
    const current = await this.getCourseConditions();
    const [updated] = await db.update(courseConditions)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(courseConditions.id, current.id))
      .returning();
    return updated;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    // Return active events (automatic cleanup temporarily disabled until schema supports endTime)
    return await db.select().from(events).where(eq(events.isActive, true)).orderBy(events.date);
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
    await db.update(events).set({ isActive: false }).where(eq(events.id, id));
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
  async resetTeeTimeBookings(): Promise<void> {
    // Clear all playerNames and bookedBy arrays in tee times
    await db.update(teetimes).set({
      playerNames: [],
      bookedBy: []
    });
  }

  async resetEventRegistrations(): Promise<void> {
    // Delete all event registrations
    await db.delete(eventRegistrations);
  }

  async resetOrders(): Promise<void> {
    // Delete all orders
    await db.delete(orders);
  }

  async resetCourseNotices(): Promise<void> {
    // Reset hazard notes and maintenance notes to empty
    await db.update(courseConditions).set({
      hazardNotes: null,
      maintenanceNotes: []
    });
  }

  // Automatically mark ended events as inactive
  async markEndedEventsInactive(): Promise<void> {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Mark events as inactive where date is before today
    // (Note: events schema only has date and time, not endTime)
    await db.update(events)
      .set({ isActive: false })
      .where(
        and(
          eq(events.isActive, true),
          lt(events.date, today)
        )
      );
  }

  // Reset all test data for admin
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
}

export const storage = new DatabaseStorage();
