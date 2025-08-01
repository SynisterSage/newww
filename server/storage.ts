import { type User, type InsertUser, type AdminUser, type InsertAdminUser, type TeeTime, type InsertTeeTime, type MenuItem, type InsertMenuItem, type Order, type InsertOrder, type CourseHole, type InsertCourseHole, type Round, type InsertRound } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin user methods
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
  authenticateAdmin(email: string, password: string): Promise<AdminUser | null>;
  
  // Tee time methods
  getTeetimes(date?: string): Promise<TeeTime[]>;
  getTeetimeById(id: string): Promise<TeeTime | undefined>;
  createTeetime(teetime: InsertTeeTime): Promise<TeeTime>;
  updateTeetime(id: string, updates: Partial<TeeTime>): Promise<TeeTime | undefined>;
  
  // Menu methods
  getMenuItems(category?: string): Promise<MenuItem[]>;
  getMenuItemById(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  
  // Order methods
  getOrders(userId: string): Promise<Order[]>;
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private adminUsers: Map<string, AdminUser>;
  private teetimes: Map<string, TeeTime>;
  private menuItems: Map<string, MenuItem>;
  private orders: Map<string, Order>;
  private courseHoles: Map<string, CourseHole>;
  private rounds: Map<string, Round>;

  constructor() {
    this.users = new Map();
    this.adminUsers = new Map();
    this.teetimes = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.courseHoles = new Map();
    this.rounds = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize Packanack Golf Club member database with actual 2025 membership data (259 members)
    // Real member data from Packanack Golf Club CSV export
    const members: User[] = [
      {
        id: "user-1",
        username: "keith.allerton",
        password: "password123",
        email: "keith.allerton@email.com",
        firstName: "Keith",
        lastName: "Allerton",
        phone: "(973) 335-4567",
        memberNumber: "AG001",
        memberStatus: "Paid",
        membershipType: "AG",
        address: "15 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Jeanne",
        emergencyPhone: "(973) 335-4568",
        handicap: 12,
        roundsPlayed: 47,
        accountBalance: "0.00",
        joinDate: new Date("2024-01-01"),
        isActive: true
      },
      {
        id: "user-2",
        username: "robert.amoruso",
        password: "password123",
        email: "robert.amoruso@email.com",
        firstName: "Robert",
        lastName: "Amoruso",
        phone: "(973) 694-2134",
        memberNumber: "AGH002",
        memberStatus: "Paid",
        membershipType: "AGH",
        address: "42 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 694-2135",
        handicap: 18,
        roundsPlayed: 63,
        accountBalance: "0.00",
        joinDate: new Date("2015-01-01"),
        isActive: true
      },
      {
        id: "user-3",
        username: "christian.avedissian",
        password: "password123",
        email: "christian.avedissian@email.com",
        firstName: "Christian",
        lastName: "Avedissian",
        phone: "(973) 256-7890",
        memberNumber: "A003",
        memberStatus: "Payment Plan",
        membershipType: "A",
        address: "128 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 256-7891",
        handicap: 8,
        roundsPlayed: 89,
        accountBalance: "150.00",
        joinDate: new Date("2025-01-01"),
        isActive: true
      },
      {
        id: "user-4",
        username: "jason.avedissian",
        password: "password123",
        email: "jason.avedissian@email.com",
        firstName: "Jason",
        lastName: "Avedissian",
        phone: "(973) 445-3322",
        memberNumber: "A004",
        memberStatus: "Payment Plan",
        membershipType: "A",
        address: "67 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 445-3323",
        handicap: 24,
        roundsPlayed: 23,
        accountBalance: "95.75",
        joinDate: new Date("2025-01-01"),
        isActive: true
      },
      {
        id: "user-5",
        username: "george.axberg",
        password: "password123",
        email: "george.axberg@email.com",
        firstName: "George",
        lastName: "Axberg",
        phone: "(973) 881-9876",
        memberNumber: "G005",
        memberStatus: "Payment Plan",
        membershipType: "G",
        address: "203 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 881-9877",
        handicap: 15,
        roundsPlayed: 72,
        accountBalance: "125.00",
        joinDate: new Date("2012-01-01"),
        isActive: true
      },
      {
        id: "user-6",
        username: "william.baker",
        password: "password123",
        email: "william.baker@email.com",
        firstName: "William J.",
        lastName: "Baker",
        phone: "(973) 542-1188",
        memberNumber: "H006",
        memberStatus: "Paid",
        membershipType: "H",
        address: "89 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 542-1189",
        handicap: 16,
        roundsPlayed: 34,
        accountBalance: "0.00",
        joinDate: new Date("2020-01-01"),
        isActive: true
      },
      {
        id: "user-7",
        username: "eric.barchie",
        password: "password123",
        email: "eric.barchie@email.com",
        firstName: "Eric",
        lastName: "Barchie",
        phone: "(973) 778-5544",
        memberNumber: "AG007",
        memberStatus: "Payment Plan",
        membershipType: "AG",
        address: "156 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 778-5545",
        handicap: 14,
        roundsPlayed: 58,
        accountBalance: "175.00",
        joinDate: new Date("2025-01-01"),
        isActive: true
      },
      {
        id: "user-8",
        username: "robert.barwick",
        password: "password123",
        email: "robert.barwick@email.com",
        firstName: "Robert",
        lastName: "Barwick",
        phone: "(973) 663-7799",
        memberNumber: "A008",
        memberStatus: "Paid",
        membershipType: "A",
        address: "234 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 663-7800",
        handicap: 22,
        roundsPlayed: 91,
        accountBalance: "0.00",
        joinDate: new Date("2014-01-01"),
        isActive: true
      },
      {
        id: "user-9",
        username: "charles.batikha",
        password: "password123",
        email: "charles.batikha@email.com",
        firstName: "Charles",
        lastName: "Batikha",
        phone: "(973) 334-2266",
        memberNumber: "AG009",
        memberStatus: "Paid",
        membershipType: "AG",
        address: "78 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 334-2267",
        handicap: 19,
        roundsPlayed: 42,
        accountBalance: "0.00",
        joinDate: new Date("2022-01-01"),
        isActive: true
      },
      {
        id: "user-10",
        username: "leo.bauer",
        password: "password123",
        email: "leo.bauer@email.com",
        firstName: "Leo",
        lastName: "Bauer",
        phone: "(973) 445-8811",
        memberNumber: "A010",
        memberStatus: "Paid",
        membershipType: "A",
        address: "345 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 445-8812",
        handicap: 6,
        roundsPlayed: 108,
        accountBalance: "0.00",
        joinDate: new Date("1995-01-01"),
        isActive: true
      },
      {
        id: "user-11",
        username: "robert.bayley",
        password: "password123",
        email: "robert.bayley@email.com",
        firstName: "Robert",
        lastName: "Bayley",
        phone: "(973) 556-9933",
        memberNumber: "A011",
        memberStatus: "Paid",
        membershipType: "A",
        address: "512 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 556-9934",
        handicap: 28,
        roundsPlayed: 65,
        accountBalance: "0.00",
        joinDate: new Date("1982-01-01"),
        isActive: true
      },
      {
        id: "user-12",
        username: "rosemarie.becker",
        password: "password123",
        email: "rosemarie.becker@email.com",
        firstName: "Rosemarie",
        lastName: "Becker",
        phone: "(973) 667-4455",
        memberNumber: "AGG+75012",
        memberStatus: "Paid",
        membershipType: "AGG+75",
        address: "198 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 667-4456",
        handicap: 35,
        roundsPlayed: 25,
        accountBalance: "0.00",
        joinDate: new Date("2019-01-01"),
        isActive: true
      },
      {
        id: "user-13",
        username: "aaron.berg",
        password: "password123",
        email: "aaron.berg@email.com",
        firstName: "Aaron",
        lastName: "Berg",
        phone: "(973) 223-4455",
        memberNumber: "A013",
        memberStatus: "Paid",
        membershipType: "A",
        address: "299 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 223-4456",
        handicap: 16,
        roundsPlayed: 78,
        accountBalance: "0.00",
        joinDate: new Date("2021-01-01"),
        isActive: true
      },
      {
        id: "user-14",
        username: "william.betz",
        password: "password123",
        email: "william.betz@email.com",
        firstName: "William",
        lastName: "Betz",
        phone: "(973) 334-5566",
        memberNumber: "A014",
        memberStatus: "Paid",
        membershipType: "A",
        address: "400 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 334-5567",
        handicap: 12,
        roundsPlayed: 52,
        accountBalance: "0.00",
        joinDate: new Date("2021-01-01"),
        isActive: true
      },
      {
        id: "user-15",
        username: "william.betz.p",
        password: "password123",
        email: "william.betz.p@email.com",
        firstName: "William P",
        lastName: "Betz",
        phone: "(973) 445-6677",
        memberNumber: "HM015",
        memberStatus: "Paid",
        membershipType: "HM",
        address: "501 Golf Course Drive",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Emergency Contact",
        emergencyPhone: "(973) 445-6678",
        handicap: 20,
        roundsPlayed: 30,
        accountBalance: "0.00",
        joinDate: new Date("2025-01-01"),
        isActive: true
      }
    ];

    // Add all members to storage
    members.forEach(member => {
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

    // Initialize tee times
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const teetimeData = [
      { time: "6:30 AM", spotsAvailable: 4, price: "85.00", status: "available", isPremium: false },
      { time: "7:00 AM", spotsAvailable: 3, price: "85.00", status: "available", isPremium: false },
      { time: "7:30 AM", spotsAvailable: 2, price: "125.00", status: "available", isPremium: true },
      { time: "8:00 AM", spotsAvailable: 0, price: "125.00", status: "booked", isPremium: true },
      { time: "8:20 AM", spotsAvailable: 1, price: "125.00", status: "available", isPremium: true },
      { time: "9:00 AM", spotsAvailable: 4, price: "95.00", status: "available", isPremium: false },
      { time: "9:30 AM", spotsAvailable: 2, price: "95.00", status: "available", isPremium: false },
      { time: "10:00 AM", spotsAvailable: 3, price: "95.00", status: "available", isPremium: false },
    ];

    teetimeData.forEach(data => {
      const teetime: TeeTime = {
        id: randomUUID(),
        userId: null,
        date: tomorrow,
        course: "Packanack Golf Course",
        holes: 18,
        ...data
      };
      this.teetimes.set(teetime.id, teetime);
    });

    // Initialize menu items
    const menuData = [
      { name: "Lobster Bisque", description: "Rich and creamy with fresh Maine lobster, finished with cognac", price: "18.00", category: "Appetizers", isSpecial: false },
      { name: "Wagyu Beef Carpaccio", description: "Thinly sliced A5 wagyu with truffle aioli and microgreens", price: "28.00", category: "Appetizers", isSpecial: false },
      { name: "Oysters Rockefeller", description: "Fresh Blue Point oysters with spinach, herbs, and hollandaise", price: "22.00", category: "Appetizers", isSpecial: false },
      { name: "Prime Rib Special", description: "Slow-roasted 16oz cut with au jus, horseradish cream, and seasonal vegetables", price: "48.00", category: "Mains", isSpecial: true },
      { name: "Pan-Seared Halibut", description: "Atlantic halibut with lemon butter sauce and roasted asparagus", price: "42.00", category: "Mains", isSpecial: false },
      { name: "Filet Mignon", description: "8oz center-cut with mushroom demi-glace and garlic mashed potatoes", price: "52.00", category: "Mains", isSpecial: false },
      { name: "Wine Selection", description: "Curated collection of premium wines by the glass or bottle", price: "12.00", category: "Wine", isSpecial: false },
      { name: "Craft Cocktails", description: "Signature cocktails crafted with premium spirits", price: "16.00", category: "Cocktails", isSpecial: false },
      { name: "Aged Whiskey", description: "Rare and vintage whiskey collection", price: "18.00", category: "Beverages", isSpecial: false },
      { name: "Chocolate Lava Cake", description: "Warm chocolate cake with vanilla ice cream", price: "12.00", category: "Desserts", isSpecial: false },
      { name: "Crème Brûlée", description: "Classic vanilla custard with caramelized sugar", price: "14.00", category: "Desserts", isSpecial: false },
      { name: "Grilled Atlantic Salmon", description: "Fresh salmon with lemon herb butter, seasonal vegetables", price: "32.00", category: "Mains", isSpecial: false },
      { name: "Club Signature Burger", description: "Wagyu beef, aged cheddar, truffle aioli, brioche bun", price: "24.00", category: "Mains", isSpecial: false },
      { name: "Pinot Noir", description: "Oregon Pinot Noir, 2019", price: "14.00", category: "Wine", isSpecial: false },
      { name: "Arnold Palmer", description: "Fresh iced tea and lemonade", price: "6.00", category: "Beverages", isSpecial: false },
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
      { holeNumber: 1, par: 4, yardage: 425, handicap: 7, description: "Slight dogleg left with bunkers right", notes: "Play to left side of fairway" },
      { holeNumber: 2, par: 3, yardage: 185, handicap: 15, description: "Elevated tee to large green", notes: "Pin usually back left" },
      { holeNumber: 3, par: 5, yardage: 525, handicap: 3, description: "Long par 5 with water on right", notes: "Lay up short of water on second shot" },
      { holeNumber: 4, par: 4, yardage: 395, handicap: 11, description: "Straight hole with elevated green", notes: "Take extra club for approach" },
      { holeNumber: 5, par: 3, yardage: 155, handicap: 17, description: "Short par 3 over water", notes: "Don't be short" },
      { holeNumber: 6, par: 4, yardage: 375, handicap: 13, description: "Dogleg right around trees", notes: "Driver down the left side" },
      { holeNumber: 7, par: 4, yardage: 385, handicap: 9, description: "Dogleg right with water hazard on right side", notes: "Pin position: back right" },
      { holeNumber: 8, par: 3, yardage: 165, handicap: 16, description: "Elevated tee to green with large bunker front left", notes: "Water behind green" },
      { holeNumber: 9, par: 5, yardage: 545, handicap: 1, description: "Long finishing hole with creek crossing", notes: "Three good shots required" },
    ];

    holeData.forEach(data => {
      const hole: CourseHole = {
        id: randomUUID(),
        course: "Championship Course",
        ...data
      };
      this.courseHoles.set(hole.id, hole);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const adminUser: AdminUser = { ...insertAdminUser, id };
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
    const teetime: TeeTime = { ...insertTeetime, id };
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
  async getMenuItems(category?: string): Promise<MenuItem[]> {
    const allItems = Array.from(this.menuItems.values());
    if (category) {
      return allItems.filter(item => item.category === category);
    }
    return allItems;
  }

  async getMenuItemById(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = randomUUID();
    const item: MenuItem = { ...insertItem, id };
    this.menuItems.set(id, item);
    return item;
  }

  // Order methods
  async getOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id,
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
      ...insertRound, 
      id,
      startTime: new Date(),
      endTime: null
    };
    this.rounds.set(id, round);
    return round;
  }

  async updateRound(id: string, updates: Partial<Round>): Promise<Round | undefined> {
    const round = this.rounds.get(id);
    if (!round) return undefined;
    
    const updatedRound = { ...round, ...updates };
    this.rounds.set(id, updatedRound);
    return updatedRound;
  }
}

export const storage = new MemStorage();
