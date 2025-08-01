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
    // Initialize comprehensive member database
    const members: User[] = [
      {
        id: "user-1",
        username: "john.wellington",
        password: "password123",
        email: "john.wellington@email.com",
        firstName: "John",
        lastName: "Wellington",
        phone: "(555) 123-4567",
        memberNumber: "0847",
        memberStatus: "Gold",
        membershipType: "Full",
        address: "123 Oak Street",
        city: "Westfield",
        state: "NJ",
        zipCode: "07090",
        emergencyContact: "Sarah Wellington",
        emergencyPhone: "(555) 123-4568",
        handicap: 18,
        roundsPlayed: 47,
        accountBalance: "285.00",
        joinDate: new Date("2020-03-15"),
        isActive: true
      },
      {
        id: "user-2",
        username: "robert.chen",
        password: "password123",
        email: "robert.chen@email.com",
        firstName: "Robert",
        lastName: "Chen",
        phone: "(555) 234-5678",
        memberNumber: "1024",
        memberStatus: "Silver",
        membershipType: "Associate",
        address: "456 Maple Avenue",
        city: "Wayne",
        state: "NJ",
        zipCode: "07470",
        emergencyContact: "Lisa Chen",
        emergencyPhone: "(555) 234-5679",
        handicap: 12,
        roundsPlayed: 63,
        accountBalance: "142.50",
        joinDate: new Date("2019-07-22"),
        isActive: true
      },
      {
        id: "user-3",
        username: "maria.rodriguez",
        password: "password123",
        email: "maria.rodriguez@email.com",
        firstName: "Maria",
        lastName: "Rodriguez",
        phone: "(555) 345-6789",
        memberNumber: "1156",
        memberStatus: "Gold",
        membershipType: "Full",
        address: "789 Pine Road",
        city: "Parsippany",
        state: "NJ",
        zipCode: "07054",
        emergencyContact: "Carlos Rodriguez",
        emergencyPhone: "(555) 345-6790",
        handicap: 8,
        roundsPlayed: 89,
        accountBalance: "476.25",
        joinDate: new Date("2018-01-10"),
        isActive: true
      },
      {
        id: "user-4",
        username: "david.thompson",
        password: "password123",
        email: "david.thompson@email.com",
        firstName: "David",
        lastName: "Thompson",
        phone: "(555) 456-7890",
        memberNumber: "0923",
        memberStatus: "Bronze",
        membershipType: "Junior",
        address: "321 Birch Lane",
        city: "Morristown",
        state: "NJ",
        zipCode: "07960",
        emergencyContact: "Patricia Thompson",
        emergencyPhone: "(555) 456-7891",
        handicap: 24,
        roundsPlayed: 23,
        accountBalance: "95.75",
        joinDate: new Date("2023-05-18"),
        isActive: true
      },
      {
        id: "user-5",
        username: "sarah.johnson",
        password: "password123",
        email: "sarah.johnson@email.com",
        firstName: "Sarah",
        lastName: "Johnson",
        phone: "(555) 567-8901",
        memberNumber: "1387",
        memberStatus: "Gold",
        membershipType: "Corporate",
        address: "654 Cedar Court",
        city: "Summit",
        state: "NJ",
        zipCode: "07901",
        emergencyContact: "Michael Johnson",
        emergencyPhone: "(555) 567-8902",
        handicap: 15,
        roundsPlayed: 72,
        accountBalance: "338.90",
        joinDate: new Date("2021-09-03"),
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
