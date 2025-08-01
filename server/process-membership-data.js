import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Read the Excel file
const workbook = XLSX.readFile('attached_assets/2025_Membership List_Working_1754067075004.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Processing membership data...');
console.log('Total rows:', data.length);
console.log('Sample row:', data[0]);

// Convert to TypeScript user objects
const members = data.map((row, index) => {
  const member = {
    id: `user-${index + 1}`,
    username: row['Member Number'] || row['Member #'] || `member_${index + 1}`,
    password: 'password123',
    email: row['Email'] || row['Email Address'] || '',
    firstName: row['First Name'] || row['FirstName'] || '',
    lastName: row['Last Name'] || row['LastName'] || '',
    phone: row['Phone'] || row['Phone Number'] || '',
    memberNumber: row['Member Number'] || row['Member #'] || `M${1000 + index}`,
    memberStatus: row['Member Status'] || row['Status'] || 'Gold',
    membershipType: row['Membership Type'] || row['Type'] || 'Full',
    address: row['Address'] || '',
    city: row['City'] || '',
    state: row['State'] || '',
    zipCode: row['Zip Code'] || row['ZIP'] || '',
    emergencyContact: row['Emergency Contact'] || '',
    emergencyPhone: row['Emergency Phone'] || '',
    handicap: parseInt(row['Handicap']) || 18,
    roundsPlayed: parseInt(row['Rounds Played']) || 0,
    accountBalance: row['Account Balance'] || '285.00',
    joinDate: new Date(),
    isActive: true
  };
  return member;
});

// Generate TypeScript code for storage initialization
const membersCode = `
  private initializeData() {
    // Initialize members from actual membership data
    const members: User[] = ${JSON.stringify(members, null, 6)};

    // Add all members to storage
    members.forEach(member => {
      this.users.set(member.id, member);
    });
`;

console.log('Generated code for', members.length, 'members');
console.log('Saving to file...');

// Save the generated code
fs.writeFileSync('membership-data-output.ts', membersCode);

console.log('Done! Check membership-data-output.ts');