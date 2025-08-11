import { db } from "./db.js";
import { users, adminUsers, menuItems, teetimes } from "@shared/schema.js";

// Seed the database with member data from CSV
async function seedMembers() {
  console.log("Seeding members from CSV data...");
  
  const members = [
    { username: "keith.allerton", password: "password123", email: "keith.allerton@email.com", firstName: "Keith", lastName: "Allerton", phone: "(973) 335-4567", memberNumber: "AG001", memberStatus: "Paid", membershipType: "AG" },
    { username: "robert.amoruso", password: "password123", email: "robert.amoruso@email.com", firstName: "Robert", lastName: "Amoruso", phone: "(973) 694-2134", memberNumber: "AGH002", memberStatus: "Paid", membershipType: "AGH" },
    { username: "randy.biagini", password: "password123", email: "randy.biagini@email.com", firstName: "Randy", lastName: "Biagini", phone: "(973) 556-7788", memberNumber: "A016", memberStatus: "Paid", membershipType: "A" },
    { username: "christian.avedissian", password: "password123", email: "christian.avedissian@email.com", firstName: "Christian", lastName: "Avedissian", phone: "(973) 256-7890", memberNumber: "A003", memberStatus: "Payment Plan", membershipType: "A" },
    { username: "jason.avedissian", password: "password123", email: "jason.avedissian@email.com", firstName: "Jason", lastName: "Avedissian", phone: "(973) 445-3322", memberNumber: "A004", memberStatus: "Payment Plan", membershipType: "A" }
  ];

  // Insert members
  for (const member of members) {
    try {
      await db.insert(users).values(member).onConflictDoNothing();
      console.log(`Added member: ${member.firstName} ${member.lastName}`);
    } catch (error) {
      console.log(`Member ${member.firstName} ${member.lastName} already exists`);
    }
  }

  // Add sample admin user
  try {
    await db.insert(adminUsers).values({
      email: "admin@packanackgolf.com",
      password: "admin123",
      name: "Golf Club Admin",
      role: "admin"
    }).onConflictDoNothing();
    console.log("Added admin user");
  } catch (error) {
    console.log("Admin user already exists");
  }

  // Add sample menu items
  const menuItemsData = [
    { name: "Classic Burger", description: "Beef patty with lettuce, tomato, and cheese", price: "16.99", category: "main_course" },
    { name: "Caesar Salad", description: "Crisp romaine with parmesan and croutons", price: "12.99", category: "appetizers" },
    { name: "Fish & Chips", description: "Beer-battered cod with seasoned fries", price: "19.99", category: "main_course" },
    { name: "Draft Beer", description: "Local craft beer on tap", price: "6.99", category: "beverages" }
  ];

  for (const item of menuItemsData) {
    try {
      await db.insert(menuItems).values(item).onConflictDoNothing();
      console.log(`Added menu item: ${item.name}`);
    } catch (error) {
      console.log(`Menu item ${item.name} already exists`);
    }
  }

  // Add sample tee times
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const teeTimesData = [
    { date: tomorrow.toISOString().split('T')[0], time: "08:00", price: "85.00" },
    { date: tomorrow.toISOString().split('T')[0], time: "08:15", price: "85.00" },
    { date: tomorrow.toISOString().split('T')[0], time: "08:30", price: "85.00" },
    { date: tomorrow.toISOString().split('T')[0], time: "09:00", price: "85.00" }
  ];

  for (const teetime of teeTimesData) {
    try {
      await db.insert(teetimes).values(teetime).onConflictDoNothing();
      console.log(`Added tee time: ${teetime.date} at ${teetime.time}`);
    } catch (error) {
      console.log(`Tee time ${teetime.date} ${teetime.time} already exists`);
    }
  }

  console.log("Database seeding completed!");
}

seedMembers().catch(console.error);